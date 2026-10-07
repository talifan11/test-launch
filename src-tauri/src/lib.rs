// Ядро приложения: регистрация плагинов и всех invoke-команд.

mod commands;
mod config;
mod network;

use tauri::Manager;

pub fn run() {
    let app = tauri::Builder::default()
        // shell и dialog регистрируются ровно по одному разу
        .plugin(tauri_plugin_shell::init())
        .plugin(tauri_plugin_dialog::init())
        .setup(|app| {
            // один токен отмены на всё приложение
            app.manage(network::DownloadState::default());
            Ok(())
        })
        .invoke_handler(tauri::generate_handler![
            commands::get_config,
            commands::save_config,
            commands::ping_server,
            commands::launch_game,
            network::fetch_manifest,
            network::check_files,
            network::download_batch,
            network::cancel_download,
            network::resolve_download_path,
            network::unpack_zip,
            network::get_installed_version,
            network::set_installed_version,
            network::check_launcher_update
        ])
        .build(tauri::generate_context!());

    match app {
        Ok(built) => built.run(|_app_handle, _event| {}),
        Err(err) => {
            // fatal-ошибка запуска: пишем в stderr и выходим с ненулевым кодом,
            // молча завершаться нельзя — пользователь не увидит причину
            eprintln!("Valheim Rouge Launcher: не удалось запустить приложение: {err}");
            std::process::exit(1);
        }
    }
}

