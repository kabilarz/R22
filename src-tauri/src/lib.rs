mod ollama;
mod python_manager;

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
  tauri::Builder::default()
    .plugin(tauri_plugin_fs::init())
    .plugin(tauri_plugin_dialog::init())
    .plugin(tauri_plugin_shell::init())
    .invoke_handler(tauri::generate_handler![
      ollama::get_hardware_info,
      ollama::check_ollama_status,
      ollama::start_ollama,
      ollama::download_model,
      ollama::query_ollama,
      ollama::list_installed_models,
      ollama::get_model_recommendations,
      ollama::setup_bundled_ollama,
      python_manager::check_python_status,
      python_manager::setup_embedded_python,
      python_manager::get_python_path
    ])
    .setup(|app| {
      if cfg!(debug_assertions) {
        app.handle().plugin(
          tauri_plugin_log::Builder::default()
            .level(log::LevelFilter::Info)
            .build(),
        )?;
      }
      Ok(())
    })
    .run(tauri::generate_context!())
    .expect("error while running tauri application");
}