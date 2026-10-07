// Команды лаунчера: конфиг, статус сервера, запуск игры.

use crate::config::{self, LauncherConfig};
use std::io::Read;
use tauri::Manager;
use std::net::{TcpStream, ToSocketAddrs};
use std::process::{Command, Stdio};
use std::time::Duration;

const SERVER_EXE: &str = "valheim_server.exe";
const VPS_SSH_PORT: u16 = 22;

/// Возвращает текущий конфиг из %APPDATA%/ValheimRouge/config.json.
#[tauri::command]
pub fn get_config() -> Result<LauncherConfig, String> {
    Ok(config::load_config())
}

/// Сохраняет конфиг целиком (используется экраном настроек).
#[tauri::command]
pub fn save_config(cfg: LauncherConfig) -> Result<LauncherConfig, String> {
    config::save_config(&cfg)?;
    Ok(cfg)
}

/// Трёхуровневая проверка состояния сервера.
/// "online"  - игровой сервер запущен локально (мы на том же ПК);
/// "active"  - процесс не найден, но VPS отвечает по SSH-порту:
///             сервер за WireGuard-туннелем, игра доступна извне;
/// "offline" - ни процесс, ни VPS не отвечают.
#[tauri::command]
pub fn ping_server(address: String) -> Result<String, String> {
    if server_process_running() {
        return Ok("online".to_string());
    }
    let host = address
        .split(':')
        .next()
        .filter(|s| !s.is_empty())
        .unwrap_or(address.as_str())
        .to_string();
    if vps_reachable(&host) {
        return Ok("active".to_string());
    }
    Ok("offline".to_string())
}

/// Ищет valheim_server.exe в списке процессов ОС.
fn server_process_running() -> bool {
    #[cfg(windows)]
    {
        Command::new("tasklist")
            .args(["/FI", &format!("IMAGENAME eq {SERVER_EXE}")])
            .stdout(Stdio::piped())
            .spawn()
            .and_then(|mut child| {
                let mut out = String::new();
                child.stdout.take().and_then(|mut pipe| {
                    pipe.read_to_string(&mut out).ok()
                })?;
                Ok(out.contains(SERVER_EXE))
            })
            .unwrap_or(false)
    }
    #[cfg(not(windows))]
    {
        false
    }
}

/// TCP-пинг хоста VPS на порт SSH с таймаутом 1.5 секунды.
fn vps_reachable(host: &str) -> bool {
    let addr = match (host, VPS_SSH_PORT).to_socket_addrs() {
        Ok(mut list) => match list.next() {
            Some(a) => a,
            None => return false,
        },
        Err(_) => return false,
    };
    TcpStream::connect_timeout(&addr, Duration::from_millis(1500)).is_ok()
}

/// Запускает valheim.exe из game_path с current_dir и сворачивает окно.
/// Клиент — сборка с OnlineFix (EmulateTicket=false), логика проверена.
#[tauri::command]
pub fn launch_game(app: tauri::AppHandle, game_path: String) -> Result<(), String> {
    if game_path.trim().is_empty() {
        return Err("Путь к игре не задан. Укажите его в настройках.".to_string());
    }
    let exe = std::path::Path::new(&game_path).join("valheim.exe");
    if !exe.exists() {
        return Err(format!("Не найден {} — сначала установите игру.", exe.display()));
    }
    let _ = app.get_webview_window("main").map(|w| w.minimize());
    Command::new(&exe)
        .current_dir(&game_path)
        .spawn()
        .map_err(|e| format!("Запуск игры не удался: {e}"))?;
    Ok(())
}
