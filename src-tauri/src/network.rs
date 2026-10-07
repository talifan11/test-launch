// Сеть и файловая машина обновлений: манифест, загрузка, SHA-256,
// распаковка ZIP, учёт установленной версии, обновление лаунчера.

use crate::config::app_data_dir;
use serde::{Deserialize, Serialize};
use sha2::{Digest, Sha256};
use std::io::{Read, Write};
use std::path::PathBuf;
use std::sync::atomic::{AtomicBool, Ordering};
use std::sync::Arc;
use tauri::{AppHandle, Emitter, Manager};
use zip::ZipArchive;

pub const BASE_URL: &str = "http://62.217.178.72";
const MANIFEST_URL: &str = "http://62.217.178.72/manifest.json";
const LAUNCHER_VERSION_URL: &str = "http://62.217.178.72/launcher-version.json";
const CHUNK: usize = 64 * 1024;

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct ManifestFile {
    pub path: String,
    pub url: String,
    #[serde(default)]
    pub size: u64,
    #[serde(default)]
    pub sha256: String,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct Manifest {
    pub version: String,
    #[serde(default)]
    pub files: Vec<ManifestFile>,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct FileStatus {
    pub path: String,
    pub expected_size: u64,
    pub actual_size: u64,
    pub ok: bool,
}

#[derive(Debug, Clone, Serialize)]
pub struct ProgressEvent {
    pub file: String,
    pub received: u64,
    pub total: u64,
    pub done_files: usize,
    pub total_files: usize,
    pub speed_bps: u64,
}

/// Токен отмены активной загрузки, общий для всех потоков.
#[derive(Default)]
pub struct DownloadState {
    pub cancel: Arc<AtomicBool>,
}

fn http_get(url: &str) -> Result<reqwest::blocking::Response, String> {
    reqwest::blocking::Client::builder()
        .timeout(std::time::Duration::from_secs(30))
        .build()
        .map_err(|e| format!("Не удалось создать HTTP-клиент: {e}"))?
        .get(url)
        .send()
        .map_err(|e| format!("Запрос {url} не удался: {e}"))
}

/// Загружает manifest.json со статического сервера.
#[tauri::command]
pub fn fetch_manifest() -> Result<Manifest, String> {
    let resp = http_get(MANIFEST_URL)?;
    if !resp.status().is_success() {
        return Err(format!("Манифест недоступен: HTTP {}", resp.status()));
    }
    resp.json::<Manifest>()
        .map_err(|e| format!("Манифест повреждён: {e}"))
}

/// Сравнивает файлы на диске с ожиданиями манифеста (по размеру).
#[tauri::command]
pub fn check_files(game_path: String, files: Vec<ManifestFile>) -> Result<Vec<FileStatus>, String> {
    if game_path.trim().is_empty() {
        return Err("Путь к игре не задан".to_string());
    }
    let root = PathBuf::from(&game_path);
    Ok(files
        .iter()
        .map(|f| {
            let dest = root.join(&f.path);
            let actual = std::fs::metadata(&dest).map(|m| m.len()).unwrap_or(0);
            FileStatus {
                path: f.path.clone(),
                expected_size: f.size,
                actual_size: actual,
                ok: actual == f.size && f.size > 0,
            }
        })
        .collect())
}

/// Каталог временных загрузок: %APPDATA%/ValheimRouge/downloads.
pub fn downloads_dir() -> PathBuf {
    app_data_dir().join("downloads")
}

/// Полный локальный путь для элемента манифеста (ZIP лежит в downloads).
#[tauri::command]
pub fn resolve_download_path(file_path: String) -> Result<String, String> {
    let dir = downloads_dir();
    std::fs::create_dir_all(&dir)
        .map_err(|e| format!("Не удалось создать {}: {e}", dir.display()))?;
    let name = PathBuf::from(&file_path)
        .file_name()
        .map(|n| n.to_string_lossy().to_string())
        .ok_or_else(|| format!("Некорректный путь файла: {file_path}"))?;
    Ok(dir.join(name).to_string_lossy().to_string())
}

/// Скачивает список файлов поблочно, пишет .part, проверяет SHA-256,
/// шлёт события download-progress в окно. Отмена — через DownloadState.
#[tauri::command]
pub fn download_batch(
    app: AppHandle,
    state: tauri::State<'_, DownloadState>,
    files: Vec<ManifestFile>,
) -> Result<Vec<String>, String> {
    state.cancel.store(false, Ordering::SeqCst);
    let dir = downloads_dir();
    std::fs::create_dir_all(&dir)
        .map_err(|e| format!("Не удалось создать {}: {e}", dir.display()))?;

    let mut saved: Vec<String> = Vec::new();
    let total = files.len();
    for (idx, file) in files.iter().enumerate() {
        if state.cancel.load(Ordering::SeqCst) {
            return Err("Загрузка отменена пользователем".to_string());
        }
        let url = if file.url.starts_with("http://") || file.url.starts_with("https://") {
            file.url.clone()
        } else {
            format!("{BASE_URL}/{}", file.url.trim_start_matches('/'))
        };
        let local = resolve_local_path(&dir, &file.path)?;
        let part = local.with_extension("part");

        let mut resp = http_get(&url)?;
        if !resp.status().is_success() {
            return Err(format!("{}: HTTP {}", url, resp.status()));
        }
        let expected_len = resp.content_length().unwrap_or(file.size);

        let mut tmp = std::fs::File::create(&part)
            .map_err(|e| format!("Не удалось создать {}: {e}", part.display()))?;
        let mut hasher = Sha256::new();
        let mut received: u64 = 0;
        let started = std::time::Instant::now();
        let mut buf = vec![0u8; CHUNK];

        loop {
            if state.cancel.load(Ordering::SeqCst) {
                drop(tmp);
                let _ = std::fs::remove_file(&part);
                return Err("Загрузка отменена пользователем".to_string());
            }
            let read = resp
                .read(&mut buf)
                .map_err(|e| format!("Чтение потока {url}: {e}"))?;
            if read == 0 {
                break;
            }
            hasher.update(&buf[..read]);
            tmp.write_all(&buf[..read])
                .map_err(|e| format!("Запись {}: {e}", part.display()))?;
            received += read as u64;
            let secs = started.elapsed().as_millis().max(1) as u64;
            let _ = app.emit(
                "download-progress",
                ProgressEvent {
                    file: file.path.clone(),
                    received,
                    total: expected_len,
                    done_files: idx,
                    total_files: total,
                    speed_bps: received * 1000 / secs,
                },
            );
        }
        tmp.flush().map_err(|e| format!("Flush {}: {e}", part.display()))?;
        drop(tmp);

        let digest = format!("{:x}", hasher.finalize());
        if !file.sha256.is_empty() && !digest.eq_ignore_ascii_case(&file.sha256) {
            let _ = std::fs::remove_file(&part);
            return Err(format!(
                "SHA-256 не совпал у {}: ожидался {}, получен {}",
                file.path, file.sha256, digest
            ));
        }
        std::fs::rename(&part, &local)
            .map_err(|e| format!("Перемещение {} не удалось: {e}", part.display()))?;
        saved.push(local.to_string_lossy().to_string());
    }
    Ok(saved)
}

fn resolve_local_path(dir: &PathBuf, rel: &str) -> Result<PathBuf, String> {
    let name = PathBuf::from(rel)
        .file_name()
        .map(|n| n.to_string_lossy().to_string())
        .ok_or_else(|| format!("Некорректный путь файла: {rel}"))?;
    Ok(dir.join(name))
}

/// Останавливает активную загрузку (флаг читается в цикле download_batch).
#[tauri::command]
pub fn cancel_download(state: tauri::State<'_, DownloadState>) -> Result<(), String> {
    state.cancel.store(true, Ordering::SeqCst);
    Ok(())
}

/// Распаковывает ZIP из downloads в game_path с защитой от zip-slip.
#[tauri::command]
pub fn unpack_zip(app: AppHandle, zip_path: String, game_path: String) -> Result<usize, String> {
    if game_path.trim().is_empty() {
        return Err("Путь к игре не задан".to_string());
    }
    let file = std::fs::File::open(&zip_path)
        .map_err(|e| format!("Не открыт {zip_path}: {e}"))?;
    let mut archive = ZipArchive::new(file).map_err(|e| format!("Битый ZIP: {e}"))?;
    let out_root = PathBuf::from(&game_path);
    std::fs::create_dir_all(&out_root)
        .map_err(|e| format!("Не удалось создать {}: {e}", out_root.display()))?;

    let count = archive.len();
    for i in 0..count {
        let mut entry = archive.by_index(i).map_err(|e| format!("Запись ZIP: {e}"))?;
        // enclosed_name отсекает пути вида ../ и абсолютные пути
        let rel = match entry.enclosed_name() {
            Some(p) => p.to_owned(),
            None => continue,
        };
        let dest = out_root.join(&rel);
        if entry.is_dir() {
            std::fs::create_dir_all(&dest)
                .map_err(|e| format!("Каталог {}: {e}", dest.display()))?;
            continue;
        }
        if let Some(parent) = dest.parent() {
            std::fs::create_dir_all(parent)
                .map_err(|e| format!("Каталог {}: {e}", parent.display()))?;
        }
        let mut out = std::fs::File::create(&dest)
            .map_err(|e| format!("Создание {}: {e}", dest.display()))?;
        std::io::copy(&mut entry, &mut out)
            .map_err(|e| format!("Распаковка {}: {e}", dest.display()))?;
        let _ = app.emit(
            "unpack-progress",
            ProgressEvent {
                file: rel.to_string_lossy().to_string(),
                received: (i + 1) as u64,
                total: count as u64,
                done_files: i + 1,
                total_files: count,
                speed_bps: 0,
            },
        );
    }
    Ok(count)
}

#[derive(Debug, Serialize, Deserialize)]
struct InstalledRecord {
    version: String,
}

fn installed_path() -> PathBuf {
    app_data_dir().join("installed.json")
}

/// Читает версию установленной игры (None, если установки нет).
#[tauri::command]
pub fn get_installed_version() -> Result<Option<String>, String> {
    match std::fs::read_to_string(installed_path()) {
        Ok(raw) => Ok(serde_json::from_str::<InstalledRecord>(&raw)
            .map(|r| r.version)
            .ok()),
        Err(_) => Ok(None),
    }
}

/// Фиксирует успешно установленную версию.
#[tauri::command]
pub fn set_installed_version(version: String) -> Result<(), String> {
    let dir = app_data_dir();
    std::fs::create_dir_all(&dir)
        .map_err(|e| format!("Каталог данных: {e}"))?;
    let raw = serde_json::to_string_pretty(&InstalledRecord { version })
        .map_err(|e| format!("Сериализация: {e}"))?;
    std::fs::write(installed_path(), raw).map_err(|e| format!("Запись installed.json: {e}"))
}

#[derive(Debug, Serialize, Deserialize)]
pub struct LauncherVersion {
    pub version: String,
    #[serde(default)]
    pub url: String,
    #[serde(default)]
    pub notes: String,
}

/// Сверяет CARGO_PKG_VERSION с launcher-version.json на сервере.
#[tauri::command]
pub fn check_launcher_update() -> Result<Option<LauncherVersion>, String> {
    let remote = http_get(LAUNCHER_VERSION_URL)
        .and_then(|r| {
            if !r.status().is_success() {
                return Err(format!("HTTP {}", r.status()));
            }
            r.json::<LauncherVersion>().map_err(|e| e.to_string())
        })
        .map_err(|e| format!("Проверка обновления лаунчера: {e}"))?;
    let current = env!("CARGO_PKG_VERSION");
    if version_is_newer(current, &remote.version) {
        Ok(Some(remote))
    } else {
        Ok(None)
    }
}

/// Численное сравнение semver по компонентам без внешних крейтов.
fn version_is_newer(current: &str, candidate: &str) -> bool {
    let parse = |v: &str| -> Vec<u64> {
        v.trim_start_matches('v')
            .split('.')
            .filter_map(|p| p.trim().parse::<u64>().ok())
            .collect()
    };
    let a = parse(current);
    let b = parse(candidate);
    for i in 0..a.len().max(b.len()) {
        let x = a.get(i).copied().unwrap_or(0);
        let y = b.get(i).copied().unwrap_or(0);
        if y != x {
            return y > x;
        }
    }
    false
}

// Помощник для получения состояния из AppHandle (используется в тестах
// и будущем автообновлении прямо внутри Rust).
#[allow(dead_code)]
pub(crate) fn state_of(app: &AppHandle) -> tauri::State<'_, DownloadState> {
    app.state::<DownloadState>()
}
