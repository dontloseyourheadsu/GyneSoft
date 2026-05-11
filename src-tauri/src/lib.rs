mod commands;
mod db;
mod models;

use crate::db::init_db;
use crate::models::DbState;
use std::sync::Mutex;
use tauri::Manager;

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    tauri::Builder::default()
        .plugin(tauri_plugin_opener::init())
        .setup(|app| {
            let conn = init_db(app.handle());
            app.manage(DbState(Mutex::new(conn)));
            Ok(())
        })
        .invoke_handler(tauri::generate_handler![
            commands::get_all_notes,
            commands::get_note,
            commands::create_note,
            commands::update_note,
            commands::delete_note,
            commands::setup_stk1160_linux,
            commands::list_linux_video_devices,
            commands::save_capture_image,
            commands::list_recent_captures,
            // patients / histories / notes
            commands::create_patient,
            commands::get_patient,
            commands::list_patients,
            commands::create_clinical_history,
            commands::get_clinical_history,
            commands::list_clinical_histories_for_patient,
            commands::create_medical_note,
            commands::list_medical_notes_for_patient,
            commands::get_medical_note,
            commands::create_colposcopy,
            commands::list_colposcopies_for_patient
        ])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
