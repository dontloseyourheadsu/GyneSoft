use base64::Engine;
use rusqlite::{params, Connection};
use serde::{Deserialize, Serialize};
use std::process::Command;
use std::sync::Mutex;
use std::time::{SystemTime, UNIX_EPOCH};
use tauri::{AppHandle, Manager};

#[derive(Serialize, Deserialize, Debug, Clone)]
pub struct PatientNote {
    pub id: Option<i32>,
    pub date: Option<String>,
    pub name: String,
    pub age: Option<String>,
    pub civil_status: Option<String>,
    pub education: Option<String>,
    pub occupation: Option<String>,
    pub address: Option<String>,
    pub phone: Option<String>,
    pub bg_heredo_fam: Option<String>,
    pub bg_personal_non_path: Option<String>,
    pub bg_personal_path: Option<String>,
    pub allergies: Option<String>,
    pub surgeries: Option<String>,
    pub transfusions: Option<String>,
    pub trauma: Option<String>,
    pub menarche: Option<String>,
    pub rhythm: Option<String>,
    pub ivsa: Option<String>,
    pub partners: Option<String>,
    pub gestations: Option<String>,
    pub parity: Option<String>,
    pub c_sections: Option<String>,
    pub abortions: Option<String>,
    pub contraception: Option<String>,
    pub last_pap: Option<String>,
    pub last_period_date: Option<String>,
    pub due_date: Option<String>,
    pub weight: Option<String>,
    pub height: Option<String>,
    pub bmi: Option<String>,
    pub blood_pressure: Option<String>,
    pub heart_rate: Option<String>,
    pub respiratory_rate: Option<String>,
    pub temperature: Option<String>,
    pub habitus_exterior: Option<String>,
    pub head: Option<String>,
    pub thorax: Option<String>,
    pub abdomen: Option<String>,
    pub genitals: Option<String>,
    pub extremities: Option<String>,
    pub labs_studies: Option<String>,
    pub diagnosis: Option<String>,
    pub treatment: Option<String>,
    pub general_notes: Option<String>,
}

pub struct DbState(pub Mutex<Connection>);

#[derive(Serialize, Deserialize, Debug, Clone)]
pub struct VideoDevice {
    pub label: String,
    pub path: String,
}

#[tauri::command]
fn get_all_notes(state: tauri::State<DbState>) -> Result<Vec<PatientNote>, String> {
    let conn = state.0.lock().unwrap();
    let mut stmt = conn
        .prepare("SELECT id, name, date FROM patient_notes ORDER BY date DESC")
        .map_err(|e| e.to_string())?;
    let note_iter = stmt
        .query_map([], |row| {
            Ok(PatientNote {
                id: Some(row.get(0)?),
                name: row.get(1)?,
                date: Some(row.get(2)?),
                age: None,
                civil_status: None,
                education: None,
                occupation: None,
                address: None,
                phone: None,
                bg_heredo_fam: None,
                bg_personal_non_path: None,
                bg_personal_path: None,
                allergies: None,
                surgeries: None,
                transfusions: None,
                trauma: None,
                menarche: None,
                rhythm: None,
                ivsa: None,
                partners: None,
                gestations: None,
                parity: None,
                c_sections: None,
                abortions: None,
                contraception: None,
                last_pap: None,
                last_period_date: None,
                due_date: None,
                weight: None,
                height: None,
                bmi: None,
                blood_pressure: None,
                heart_rate: None,
                respiratory_rate: None,
                temperature: None,
                habitus_exterior: None,
                head: None,
                thorax: None,
                abdomen: None,
                genitals: None,
                extremities: None,
                labs_studies: None,
                diagnosis: None,
                treatment: None,
                general_notes: None,
            })
        })
        .map_err(|e| e.to_string())?;

    let mut notes = Vec::new();
    for note in note_iter {
        notes.push(note.map_err(|e| e.to_string())?);
    }
    Ok(notes)
}

#[tauri::command]
fn get_note(state: tauri::State<DbState>, id: i32) -> Result<PatientNote, String> {
    let conn = state.0.lock().unwrap();
    let mut stmt = conn
        .prepare("SELECT * FROM patient_notes WHERE id = ?")
        .map_err(|e| e.to_string())?;
    let note = stmt
        .query_row([id], |row| {
            Ok(PatientNote {
                id: Some(row.get(0)?),
                date: Some(row.get(1)?),
                name: row.get(2)?,
                age: row.get(3)?,
                civil_status: row.get(4)?,
                education: row.get(5)?,
                occupation: row.get(6)?,
                address: row.get(7)?,
                phone: row.get(8)?,
                bg_heredo_fam: row.get(9)?,
                bg_personal_non_path: row.get(10)?,
                bg_personal_path: row.get(11)?,
                allergies: row.get(12)?,
                surgeries: row.get(13)?,
                transfusions: row.get(14)?,
                trauma: row.get(15)?,
                menarche: row.get(16)?,
                rhythm: row.get(17)?,
                ivsa: row.get(18)?,
                partners: row.get(19)?,
                gestations: row.get(20)?,
                parity: row.get(21)?,
                c_sections: row.get(22)?,
                abortions: row.get(23)?,
                contraception: row.get(24)?,
                last_pap: row.get(25)?,
                last_period_date: row.get(26)?,
                due_date: row.get(27)?,
                weight: row.get(28)?,
                height: row.get(29)?,
                bmi: row.get(30)?,
                blood_pressure: row.get(31)?,
                heart_rate: row.get(32)?,
                respiratory_rate: row.get(33)?,
                temperature: row.get(34)?,
                habitus_exterior: row.get(35)?,
                head: row.get(36)?,
                thorax: row.get(37)?,
                abdomen: row.get(38)?,
                genitals: row.get(39)?,
                extremities: row.get(40)?,
                labs_studies: row.get(41)?,
                diagnosis: row.get(42)?,
                treatment: row.get(43)?,
                general_notes: row.get(44)?,
            })
        })
        .map_err(|e| e.to_string())?;
    Ok(note)
}

#[tauri::command]
fn create_note(state: tauri::State<DbState>, note: PatientNote) -> Result<i64, String> {
    let conn = state.0.lock().unwrap();
    conn.execute(
        "INSERT INTO patient_notes (
            name, age, civil_status, education, occupation, address, phone,
            bg_heredo_fam, bg_personal_non_path, bg_personal_path, allergies, surgeries, transfusions, trauma,
            menarche, rhythm, ivsa, partners, gestations, parity, c_sections, abortions, contraception, last_pap, last_period_date, due_date,
            weight, height, bmi, blood_pressure, heart_rate, respiratory_rate, temperature,
            habitus_exterior, head, thorax, abdomen, genitals, extremities, labs_studies, diagnosis, treatment, general_notes
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)",
        params![
            note.name, note.age, note.civil_status, note.education, note.occupation, note.address, note.phone,
            note.bg_heredo_fam, note.bg_personal_non_path, note.bg_personal_path, note.allergies, note.surgeries, note.transfusions, note.trauma,
            note.menarche, note.rhythm, note.ivsa, note.partners, note.gestations, note.parity, note.c_sections, note.abortions, note.contraception, note.last_pap, note.last_period_date, note.due_date,
            note.weight, note.height, note.bmi, note.blood_pressure, note.heart_rate, note.respiratory_rate, note.temperature,
            note.habitus_exterior, note.head, note.thorax, note.abdomen, note.genitals, note.extremities, note.labs_studies, note.diagnosis, note.treatment, note.general_notes
        ],
    ).map_err(|e| e.to_string())?;
    Ok(conn.last_insert_rowid())
}

#[tauri::command]
fn update_note(state: tauri::State<DbState>, id: i32, note: PatientNote) -> Result<(), String> {
    let conn = state.0.lock().unwrap();
    conn.execute(
        "UPDATE patient_notes SET 
            name = ?, age = ?, civil_status = ?, education = ?, occupation = ?, address = ?, phone = ?,
            bg_heredo_fam = ?, bg_personal_non_path = ?, bg_personal_path = ?, allergies = ?, surgeries = ?, transfusions = ?, trauma = ?,
            menarche = ?, rhythm = ?, ivsa = ?, partners = ?, gestations = ?, parity = ?, c_sections = ?, abortions = ?, contraception = ?, last_pap = ?, last_period_date = ?, due_date = ?,
            weight = ?, height = ?, bmi = ?, blood_pressure = ?, heart_rate = ?, respiratory_rate = ?, temperature = ?,
            habitus_exterior = ?, head = ?, thorax = ?, abdomen = ?, genitals = ?, extremities = ?, labs_studies = ?, diagnosis = ?, treatment = ?, general_notes = ?
        WHERE id = ?",
        params![
            note.name, note.age, note.civil_status, note.education, note.occupation, note.address, note.phone,
            note.bg_heredo_fam, note.bg_personal_non_path, note.bg_personal_path, note.allergies, note.surgeries, note.transfusions, note.trauma,
            note.menarche, note.rhythm, note.ivsa, note.partners, note.gestations, note.parity, note.c_sections, note.abortions, note.contraception, note.last_pap, note.last_period_date, note.due_date,
            note.weight, note.height, note.bmi, note.blood_pressure, note.heart_rate, note.respiratory_rate, note.temperature,
            note.habitus_exterior, note.head, note.thorax, note.abdomen, note.genitals, note.extremities, note.labs_studies, note.diagnosis, note.treatment, note.general_notes,
            id
        ],
    ).map_err(|e| e.to_string())?;
    Ok(())
}

#[tauri::command]
fn delete_note(state: tauri::State<DbState>, id: i32) -> Result<(), String> {
    let conn = state.0.lock().unwrap();
    conn.execute("DELETE FROM patient_notes WHERE id = ?", [id])
        .map_err(|e| e.to_string())?;
    Ok(())
}

#[tauri::command]
fn setup_stk1160_linux(device_path: String) -> Result<String, String> {
    if cfg!(target_os = "linux") {
        let output_i = Command::new("v4l2-ctl")
            .args(["-d", &device_path, "-i", "0"])
            .output()
            .map_err(|e| e.to_string())?;

        let output_std = Command::new("v4l2-ctl")
            .args(["-d", &device_path, "--set-standard=NTSC"])
            .output()
            .map_err(|e| e.to_string())?;

        if output_i.status.success() && output_std.status.success() {
            Ok(format!(
                "Successfully configured {} for NTSC and Input 0",
                device_path
            ))
        } else {
            Err(format!(
                "Error configuring device. Input success: {}, Standard success: {}",
                output_i.status.success(),
                output_std.status.success()
            ))
        }
    } else {
        Ok("Non-linux OS, skipping v4l2-ctl configuration".into())
    }
}

#[tauri::command]
fn list_linux_video_devices() -> Result<Vec<VideoDevice>, String> {
    if !cfg!(target_os = "linux") {
        return Ok(Vec::new());
    }

    let output = Command::new("v4l2-ctl")
        .arg("--list-devices")
        .output()
        .map_err(|e| format!("No se pudo ejecutar v4l2-ctl: {e}"))?;

    if !output.status.success() {
        return Err("No se pudieron obtener dispositivos con v4l2-ctl".to_string());
    }

    let text = String::from_utf8_lossy(&output.stdout);
    let mut current_label: Option<String> = None;
    let mut devices = Vec::new();

    for raw_line in text.lines() {
        let line = raw_line.trim_end();

        if line.trim().is_empty() {
            current_label = None;
            continue;
        }

        if !line.starts_with('\t') && !line.starts_with(' ') {
            current_label = Some(line.trim_end_matches(':').trim().to_string());
            continue;
        }

        let trimmed = line.trim();
        if trimmed.starts_with("/dev/video") {
            devices.push(VideoDevice {
                label: current_label
                    .clone()
                    .unwrap_or_else(|| "Video Device".to_string()),
                path: trimmed.to_string(),
            });
        }
    }

    Ok(devices)
}

#[tauri::command]
fn save_capture_image(app: AppHandle, base64_data: String) -> Result<String, String> {
    let app_dir = app
        .path()
        .app_data_dir()
        .map_err(|e| format!("No se pudo abrir directorio de app: {e}"))?;
    let captures_dir = app_dir.join("Captures");

    std::fs::create_dir_all(&captures_dir)
        .map_err(|e| format!("No se pudo crear directorio de capturas: {e}"))?;

    let raw_data = base64_data
        .split_once(',')
        .map(|(_, payload)| payload)
        .unwrap_or(base64_data.as_str());

    let bytes = base64::engine::general_purpose::STANDARD
        .decode(raw_data)
        .map_err(|e| format!("Imagen base64 inválida: {e}"))?;

    let timestamp = SystemTime::now()
        .duration_since(UNIX_EPOCH)
        .map_err(|e| format!("No se pudo obtener timestamp: {e}"))?
        .as_secs();
    let file_name = format!("Cap_{}.jpg", timestamp);
    let file_path = captures_dir.join(file_name);

    std::fs::write(&file_path, bytes).map_err(|e| format!("No se pudo guardar la captura: {e}"))?;

    Ok(file_path.to_string_lossy().to_string())
}

#[tauri::command]
fn list_recent_captures(app: AppHandle, limit: Option<usize>) -> Result<Vec<String>, String> {
    let app_dir = app
        .path()
        .app_data_dir()
        .map_err(|e| format!("No se pudo abrir directorio de app: {e}"))?;
    let captures_dir = app_dir.join("Captures");
    let max_items = limit.unwrap_or(12);

    if !captures_dir.exists() {
        return Ok(Vec::new());
    }

    let entries =
        std::fs::read_dir(captures_dir).map_err(|e| format!("No se pudo leer capturas: {e}"))?;

    let mut images: Vec<(SystemTime, String)> = entries
        .filter_map(|entry| entry.ok())
        .filter_map(|entry| {
            let path = entry.path();
            let is_jpg = path
                .extension()
                .map(|ext| ext.eq_ignore_ascii_case("jpg") || ext.eq_ignore_ascii_case("jpeg"))
                .unwrap_or(false);

            if !is_jpg {
                return None;
            }

            let modified = entry.metadata().ok()?.modified().ok()?;
            Some((modified, path.to_string_lossy().to_string()))
        })
        .collect();

    images.sort_by(|a, b| b.0.cmp(&a.0));

    Ok(images
        .into_iter()
        .take(max_items)
        .map(|(_, path)| path)
        .collect())
}

pub fn init_db(app: &AppHandle) -> Connection {
    let app_dir = app
        .path()
        .app_data_dir()
        .expect("failed to get app data dir");
    std::fs::create_dir_all(&app_dir).expect("failed to create app data dir");
    let db_path = app_dir.join("gynesoft.db");

    let conn = Connection::open(db_path).expect("failed to open database");

    conn.execute(
        "CREATE TABLE IF NOT EXISTS patient_notes (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            name TEXT NOT NULL,
            age TEXT, civil_status TEXT, education TEXT, occupation TEXT, address TEXT, phone TEXT,
            bg_heredo_fam TEXT, bg_personal_non_path TEXT, bg_personal_path TEXT, allergies TEXT, surgeries TEXT, transfusions TEXT, trauma TEXT,
            menarche TEXT, rhythm TEXT, ivsa TEXT, partners TEXT, gestations TEXT, parity TEXT, c_sections TEXT, abortions TEXT, contraception TEXT, last_pap TEXT, last_period_date TEXT, due_date TEXT,
            weight TEXT, height TEXT, bmi TEXT, blood_pressure TEXT, heart_rate TEXT, respiratory_rate TEXT, temperature TEXT,
            habitus_exterior TEXT, head TEXT, thorax TEXT, abdomen TEXT, genitals TEXT, extremities TEXT,
            labs_studies TEXT, diagnosis TEXT, treatment TEXT, general_notes TEXT
        )",
        [],
    ).expect("failed to create table");

    conn
}

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
            get_all_notes,
            get_note,
            create_note,
            update_note,
            delete_note,
            setup_stk1160_linux,
            list_linux_video_devices,
            save_capture_image,
            list_recent_captures
        ])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
