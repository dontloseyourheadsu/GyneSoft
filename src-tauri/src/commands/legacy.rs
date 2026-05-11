use crate::models::{DbState, PatientNote};
use rusqlite::params;

#[tauri::command]
pub fn get_all_notes(state: tauri::State<DbState>) -> Result<Vec<PatientNote>, String> {
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
pub fn get_note(state: tauri::State<DbState>, id: i32) -> Result<PatientNote, String> {
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
pub fn create_note(state: tauri::State<DbState>, note: PatientNote) -> Result<i64, String> {
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
    )
    .map_err(|e| e.to_string())?;
    Ok(conn.last_insert_rowid())
}

#[tauri::command]
pub fn update_note(state: tauri::State<DbState>, id: i32, note: PatientNote) -> Result<(), String> {
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
    )
    .map_err(|e| e.to_string())?;
    Ok(())
}

#[tauri::command]
pub fn delete_note(state: tauri::State<DbState>, id: i32) -> Result<(), String> {
    let conn = state.0.lock().unwrap();
    conn.execute("DELETE FROM patient_notes WHERE id = ?", [id])
        .map_err(|e| e.to_string())?;
    Ok(())
}
