// Конфигурация лаунчера: %APPDATA%/ValheimRouge/config.json.
// Чтение устойчиво к битому JSON: при любой ошибке возвращается дефолт.

use serde::{Deserialize, Serialize};
use std::path::PathBuf;

/// Игровой сервер по умолчанию (VPS, порт UDP игры).
pub fn default_server_address() -> String {
    "85.198.70.143:2456".to_string()
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct LauncherConfig {
    #[serde(default)]
    pub game_path: String,
    #[serde(default = "default_server_address")]
    pub server_address: String,
    #[serde(default)]
    pub username: String,
}

impl Default for LauncherConfig {
    fn default() -> Self {
        Self {
            game_path: String::new(),
            server_address: default_server_address(),
            username: String::new(),
        }
    }
}

fn env_home() -> Option<PathBuf> {
    if cfg!(windows) {
        std::env::var("USERPROFILE").ok().map(PathBuf::from)
    } else {
        std::env::var("HOME").ok().map(PathBuf::from)
    }
}

/// Корень данных приложения: на Windows это %APPDATA%\ValheimRouge.
pub fn app_data_dir() -> PathBuf {
    let base = if cfg!(windows) {
        std::env::var("APPDATA")
            .map(PathBuf::from)
            .unwrap_or_else(|_| env_home().unwrap_or_else(|| PathBuf::from(".")))
    } else if cfg!(target_os = "macos") {
        env_home()
            .map(|h| h.join("Library/Application Support"))
            .unwrap_or_else(|| PathBuf::from("."))
    } else {
        std::env::var("XDG_CONFIG_HOME")
            .map(PathBuf::from)
            .unwrap_or_else(|_| {
                env_home()
                    .map(|h| h.join(".config"))
                    .unwrap_or_else(|| PathBuf::from("."))
            })
    };
    base.join("ValheimRouge")
}

pub fn config_path() -> PathBuf {
    app_data_dir().join("config.json")
}

pub fn load_config() -> LauncherConfig {
    match std::fs::read_to_string(config_path()) {
        Ok(raw) => serde_json::from_str::<LauncherConfig>(&raw).unwrap_or_default(),
        Err(_) => LauncherConfig::default(),
    }
}

pub fn save_config(cfg: &LauncherConfig) -> Result<(), String> {
    let dir = app_data_dir();
    std::fs::create_dir_all(&dir)
        .map_err(|e| format!("Не удалось создать каталог {}: {e}", dir.display()))?;
    let raw = serde_json::to_string_pretty(cfg)
        .map_err(|e| format!("Сериализация конфига не удалась: {e}"))?;
    std::fs::write(config_path(), raw).map_err(|e| format!("Запись конфига не удалась: {e}"))
}
