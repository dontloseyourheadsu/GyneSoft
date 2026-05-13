use crate::models::{DbState, Patient, ClinicalHistory, MedicalNote, ColposcopyEntry};
use rusqlite::params;
use tauri::Manager;

#[tauri::command]
pub fn create_patient(state: tauri::State<DbState>, patient: Patient) -> Result<i64, String> {
    let conn = state.0.lock().unwrap();
    let nombre = patient.nombre.trim().to_string();
    if nombre.is_empty() {
        return Err("El nombre es obligatorio".to_string());
    }

    let exists: i64 = conn
        .query_row(
            "SELECT COUNT(1) FROM patients WHERE lower(nombre) = lower(?)",
            [nombre.as_str()],
            |row| row.get(0),
        )
        .map_err(|e| e.to_string())?;
    if exists > 0 {
        return Err("Ya existe una paciente con ese nombre".to_string());
    }
    conn.execute(
        "INSERT INTO patients (nombre, fecha, sexo, edad, estado_civil, escolaridad, ocupacion, fecha_nacimiento, direccion, telefono) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)",
        params![
            nombre,
            patient.fecha,
            patient.sexo,
            patient.edad,
            patient.estado_civil,
            patient.escolaridad,
            patient.ocupacion,
            patient.fecha_nacimiento,
            patient.direccion,
            patient.telefono
        ],
    )
    .map_err(|e| e.to_string())?;
    Ok(conn.last_insert_rowid())
}

#[tauri::command]
pub fn get_patient(state: tauri::State<DbState>, id: i32) -> Result<Patient, String> {
    let conn = state.0.lock().unwrap();
    let mut stmt = conn
        .prepare("SELECT id, nombre, fecha, sexo, edad, estado_civil, escolaridad, ocupacion, fecha_nacimiento, direccion, telefono FROM patients WHERE id = ?")
        .map_err(|e| e.to_string())?;
    let patient = stmt
        .query_row([id], |row| {
            Ok(Patient {
                id: Some(row.get(0)?),
                nombre: row.get(1)?,
                fecha: row.get(2)?,
                sexo: row.get(3)?,
                edad: row.get(4)?,
                estado_civil: row.get(5)?,
                escolaridad: row.get(6)?,
                ocupacion: row.get(7)?,
                fecha_nacimiento: row.get(8)?,
                direccion: row.get(9)?,
                telefono: row.get(10)?,
            })
        })
        .map_err(|e| e.to_string())?;
    Ok(patient)
}

#[tauri::command]
pub fn list_patients(state: tauri::State<DbState>) -> Result<Vec<Patient>, String> {
    let conn = state.0.lock().unwrap();
    let mut stmt = conn
        .prepare("SELECT id, nombre, fecha, sexo, edad, estado_civil, escolaridad, ocupacion, fecha_nacimiento, direccion, telefono FROM patients ORDER BY nombre")
        .map_err(|e| e.to_string())?;
    let iter = stmt
        .query_map([], |row| {
            Ok(Patient {
                id: Some(row.get(0)?),
                nombre: row.get(1)?,
                fecha: row.get(2)?,
                sexo: row.get(3)?,
                edad: row.get(4)?,
                estado_civil: row.get(5)?,
                escolaridad: row.get(6)?,
                ocupacion: row.get(7)?,
                fecha_nacimiento: row.get(8)?,
                direccion: row.get(9)?,
                telefono: row.get(10)?,
            })
        })
        .map_err(|e| e.to_string())?;

    let mut patients = Vec::new();
    for p in iter {
        patients.push(p.map_err(|e| e.to_string())?);
    }
    Ok(patients)
}

#[tauri::command]
pub fn get_config(state: tauri::State<DbState>) -> Result<std::collections::HashMap<String, String>, String> {
    let conn = state.0.lock().unwrap();
    let mut stmt = conn.prepare("SELECT key, value FROM config").map_err(|e| e.to_string())?;
    let rows = stmt.query_map([], |row| {
        Ok((row.get::<_, String>(0)?, row.get::<_, String>(1)?))
    }).map_err(|e| e.to_string())?;

    let mut map = std::collections::HashMap::new();
    for r in rows {
        let (k, v) = r.map_err(|e| e.to_string())?;
        map.insert(k, v);
    }
    Ok(map)
}

#[tauri::command]
pub fn set_config(state: tauri::State<DbState>, key: String, value: String) -> Result<(), String> {
    let conn = state.0.lock().unwrap();
    conn.execute(
        "INSERT INTO config (key, value) VALUES (?, ?) ON CONFLICT(key) DO UPDATE SET value = excluded.value",
        [key, value],
    ).map_err(|e| e.to_string())?;
    Ok(())
}

#[tauri::command]
pub fn upload_logo(app: tauri::AppHandle, base64_data: String) -> Result<String, String> {
    let app_dir = app.path().app_data_dir().map_err(|e| e.to_string())?;
    std::fs::create_dir_all(&app_dir).map_err(|e| e.to_string())?;
    
    let path = app_dir.join("clinic_logo.jpg");
    
    let raw_data = base64_data
        .split_once(',')
        .map(|(_, payload)| payload)
        .unwrap_or(base64_data.as_str());

    use base64::Engine;
    let bytes = base64::engine::general_purpose::STANDARD
        .decode(raw_data)
        .map_err(|e| format!("Imagen invalida: {e}"))?;

    std::fs::write(&path, bytes).map_err(|e| e.to_string())?;
    
    Ok(path.to_string_lossy().to_string())
}

#[tauri::command]
pub fn create_clinical_history(
    state: tauri::State<DbState>,
    h: ClinicalHistory,
) -> Result<i64, String> {
    let conn = state.0.lock().unwrap();
    conn.execute(
        "INSERT INTO clinical_histories (
            patient_id, fecha, diabetes, hipertension, cancer, otros_heredo,
            higiene_personal, calidad_alimentacion, tabaquismo, alcoholismo, grupo_sanguineo_rh, otros_no_patologicos,
            alergias, quirurgicos, traumaticos, transfusionales, medicos,
            menarca, telarca, pubarca, ritmo, dismenorrea, ivsa, numero_parejas, metodo_anticonceptivo, gesta, para, cesareas, abortos, productos, fup, doc, fur, fpp, padecimiento_actual,
            peso, talla, imc, ta, fc, fr, temp, so2,
            habitus_exterior, cabeza, torax, abdomen, genitales, extremidades,
            estudios_lab, diagnostico, tratamiento, comentarios
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)",
        params![
            h.patient_id, h.fecha, h.diabetes, h.hipertension, h.cancer, h.otros_heredo,
            h.higiene_personal, h.calidad_alimentacion, h.tabaquismo, h.alcoholismo, h.grupo_sanguineo_rh, h.otros_no_patologicos,
            h.alergias, h.quirurgicos, h.traumaticos, h.transfusionales, h.medicos,
            h.menarca, h.telarca, h.pubarca, h.ritmo, h.dismenorrea, h.ivsa, h.numero_parejas, h.metodo_anticonceptivo, h.gesta, h.para, h.cesareas, h.abortos, h.productos, h.fup, h.doc, h.fur, h.fpp, h.padecimiento_actual,
            h.peso, h.talla, h.imc, h.ta, h.fc, h.fr, h.temp, h.so2,
            h.habitus_exterior, h.cabeza, h.torax, h.abdomen, h.genitales, h.extremidades,
            h.estudios_lab, h.diagnostico, h.tratamiento, h.comentarios
        ],
    )
    .map_err(|e| e.to_string())?;
    Ok(conn.last_insert_rowid())
}

#[tauri::command]
pub fn update_clinical_history(
    state: tauri::State<DbState>,
    id: i32,
    h: ClinicalHistory,
) -> Result<(), String> {
    let conn = state.0.lock().unwrap();
    conn.execute(
        "UPDATE clinical_histories SET 
            fecha = ?, diabetes = ?, hipertension = ?, cancer = ?, otros_heredo = ?,
            higiene_personal = ?, calidad_alimentacion = ?, tabaquismo = ?, alcoholismo = ?, grupo_sanguineo_rh = ?, otros_no_patologicos = ?,
            alergias = ?, quirurgicos = ?, traumaticos = ?, transfusionales = ?, medicos = ?,
            menarca = ?, telarca = ?, pubarca = ?, ritmo = ?, dismenorrea = ?, ivsa = ?, numero_parejas = ?, metodo_anticonceptivo = ?, gesta = ?, para = ?, cesareas = ?, abortos = ?, productos = ?, fup = ?, doc = ?, fur = ?, fpp = ?, padecimiento_actual = ?,
            peso = ?, talla = ?, imc = ?, ta = ?, fc = ?, fr = ?, temp = ?, so2 = ?,
            habitus_exterior = ?, cabeza = ?, torax = ?, abdomen = ?, genitales = ?, extremidades = ?,
            estudios_lab = ?, diagnostico = ?, tratamiento = ?, comentarios = ?
        WHERE id = ?",
        params![
            h.fecha, h.diabetes, h.hipertension, h.cancer, h.otros_heredo,
            h.higiene_personal, h.calidad_alimentacion, h.tabaquismo, h.alcoholismo, h.grupo_sanguineo_rh, h.otros_no_patologicos,
            h.alergias, h.quirurgicos, h.traumaticos, h.transfusionales, h.medicos,
            h.menarca, h.telarca, h.pubarca, h.ritmo, h.dismenorrea, h.ivsa, h.numero_parejas, h.metodo_anticonceptivo, h.gesta, h.para, h.cesareas, h.abortos, h.productos, h.fup, h.doc, h.fur, h.fpp, h.padecimiento_actual,
            h.peso, h.talla, h.imc, h.ta, h.fc, h.fr, h.temp, h.so2,
            h.habitus_exterior, h.cabeza, h.torax, h.abdomen, h.genitales, h.extremidades,
            h.estudios_lab, h.diagnostico, h.tratamiento, h.comentarios,
            id
        ],
    )
    .map_err(|e| e.to_string())?;
    Ok(())
}

#[tauri::command]
pub fn get_clinical_history(
    state: tauri::State<DbState>,
    id: i32,
) -> Result<ClinicalHistory, String> {
    let conn = state.0.lock().unwrap();
    let mut stmt = conn
        .prepare("SELECT * FROM clinical_histories WHERE id = ?")
        .map_err(|e| e.to_string())?;
    let history = stmt
        .query_row([id], |row| {
            Ok(ClinicalHistory {
                id: Some(row.get(0)?),
                patient_id: row.get(1)?,
                fecha: row.get(2)?,
                diabetes: row.get(3)?,
                hipertension: row.get(4)?,
                cancer: row.get(5)?,
                otros_heredo: row.get(6)?,
                higiene_personal: row.get(7)?,
                calidad_alimentacion: row.get(8)?,
                tabaquismo: row.get(9)?,
                alcoholismo: row.get(10)?,
                grupo_sanguineo_rh: row.get(11)?,
                otros_no_patologicos: row.get(12)?,
                alergias: row.get(13)?,
                quirurgicos: row.get(14)?,
                traumaticos: row.get(15)?,
                transfusionales: row.get(16)?,
                medicos: row.get(17)?,
                menarca: row.get(18)?,
                telarca: row.get(19)?,
                pubarca: row.get(20)?,
                ritmo: row.get(21)?,
                dismenorrea: row.get(22)?,
                ivsa: row.get(23)?,
                numero_parejas: row.get(24)?,
                metodo_anticonceptivo: row.get(25)?,
                gesta: row.get(26)?,
                para: row.get(27)?,
                cesareas: row.get(28)?,
                abortos: row.get(29)?,
                productos: row.get(30)?,
                fup: row.get(31)?,
                doc: row.get(32)?,
                fur: row.get(33)?,
                fpp: row.get(34)?,
                padecimiento_actual: row.get(35)?,
                peso: row.get(36)?,
                talla: row.get(37)?,
                imc: row.get(38)?,
                ta: row.get(39)?,
                fc: row.get(40)?,
                fr: row.get(41)?,
                temp: row.get(42)?,
                so2: row.get(43)?,
                habitus_exterior: row.get(44)?,
                cabeza: row.get(45)?,
                torax: row.get(46)?,
                abdomen: row.get(47)?,
                genitales: row.get(48)?,
                extremidades: row.get(49)?,
                estudios_lab: row.get(50)?,
                diagnostico: row.get(51)?,
                tratamiento: row.get(52)?,
                comentarios: row.get(53)?,
            })
        })
        .map_err(|e| e.to_string())?;
    Ok(history)
}

#[tauri::command]
pub fn list_clinical_histories_for_patient(
    state: tauri::State<DbState>,
    patient_id: i32,
) -> Result<Vec<ClinicalHistory>, String> {
    let conn = state.0.lock().unwrap();
    let mut stmt = conn
        .prepare("SELECT * FROM clinical_histories WHERE patient_id = ? ORDER BY fecha DESC")
        .map_err(|e| e.to_string())?;
    let rows = stmt
        .query_map([patient_id], |row| {
            Ok(ClinicalHistory {
                id: Some(row.get(0)?),
                patient_id: row.get(1)?,
                fecha: row.get(2)?,
                diabetes: row.get(3)?,
                hipertension: row.get(4)?,
                cancer: row.get(5)?,
                otros_heredo: row.get(6)?,
                higiene_personal: row.get(7)?,
                calidad_alimentacion: row.get(8)?,
                tabaquismo: row.get(9)?,
                alcoholismo: row.get(10)?,
                grupo_sanguineo_rh: row.get(11)?,
                otros_no_patologicos: row.get(12)?,
                alergias: row.get(13)?,
                quirurgicos: row.get(14)?,
                traumaticos: row.get(15)?,
                transfusionales: row.get(16)?,
                medicos: row.get(17)?,
                menarca: row.get(18)?,
                telarca: row.get(19)?,
                pubarca: row.get(20)?,
                ritmo: row.get(21)?,
                dismenorrea: row.get(22)?,
                ivsa: row.get(23)?,
                numero_parejas: row.get(24)?,
                metodo_anticonceptivo: row.get(25)?,
                gesta: row.get(26)?,
                para: row.get(27)?,
                cesareas: row.get(28)?,
                abortos: row.get(29)?,
                productos: row.get(30)?,
                fup: row.get(31)?,
                doc: row.get(32)?,
                fur: row.get(33)?,
                fpp: row.get(34)?,
                padecimiento_actual: row.get(35)?,
                peso: row.get(36)?,
                talla: row.get(37)?,
                imc: row.get(38)?,
                ta: row.get(39)?,
                fc: row.get(40)?,
                fr: row.get(41)?,
                temp: row.get(42)?,
                so2: row.get(43)?,
                habitus_exterior: row.get(44)?,
                cabeza: row.get(45)?,
                torax: row.get(46)?,
                abdomen: row.get(47)?,
                genitales: row.get(48)?,
                extremidades: row.get(49)?,
                estudios_lab: row.get(50)?,
                diagnostico: row.get(51)?,
                tratamiento: row.get(52)?,
                comentarios: row.get(53)?,
            })
        })
        .map_err(|e| e.to_string())?;

    let mut out = Vec::new();
    for r in rows {
        out.push(r.map_err(|e| e.to_string())?);
    }
    Ok(out)
}

#[tauri::command]
pub fn create_medical_note(state: tauri::State<DbState>, n: MedicalNote) -> Result<i64, String> {
    let conn = state.0.lock().unwrap();
    conn.execute(
        "INSERT INTO medical_notes (patient_id, fecha_hora, notas, peso, talla, ta, fc, fr, temp, dx, plan, firma, especialidad, cedula_prof, cedula_especialidad) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)",
        params![
            n.patient_id, n.fecha_hora, n.notas, n.peso, n.talla, n.ta, n.fc, n.fr, n.temp, n.dx, n.plan, n.firma, n.especialidad, n.cedula_prof, n.cedula_especialidad
        ],
    )
    .map_err(|e| e.to_string())?;
    Ok(conn.last_insert_rowid())
}

#[tauri::command]
pub fn update_medical_note(
    state: tauri::State<DbState>,
    id: i32,
    n: MedicalNote,
) -> Result<(), String> {
    let conn = state.0.lock().unwrap();
    conn.execute(
        "UPDATE medical_notes SET 
            fecha_hora = ?, notas = ?, peso = ?, talla = ?, ta = ?, fc = ?, fr = ?, temp = ?, dx = ?, plan = ?, firma = ?, especialidad = ?, cedula_prof = ?, cedula_especialidad = ?
        WHERE id = ?",
        params![
            n.fecha_hora, n.notas, n.peso, n.talla, n.ta, n.fc, n.fr, n.temp, n.dx, n.plan, n.firma, n.especialidad, n.cedula_prof, n.cedula_especialidad,
            id
        ],
    )
    .map_err(|e| e.to_string())?;
    Ok(())
}

#[tauri::command]
pub fn delete_medical_note(state: tauri::State<DbState>, id: i32) -> Result<(), String> {
    let conn = state.0.lock().unwrap();
    conn.execute("DELETE FROM medical_notes WHERE id = ?", [id])
        .map_err(|e| e.to_string())?;
    Ok(())
}

#[tauri::command]
pub fn list_medical_notes_for_patient(
    state: tauri::State<DbState>,
    patient_id: i32,
) -> Result<Vec<MedicalNote>, String> {
    let conn = state.0.lock().unwrap();
    let mut stmt = conn
        .prepare("SELECT id, patient_id, fecha_hora, notas, peso, talla, ta, fc, fr, temp, dx, plan, firma, especialidad, cedula_prof, cedula_especialidad FROM medical_notes WHERE patient_id = ? ORDER BY fecha_hora DESC")
        .map_err(|e| e.to_string())?;
    let rows = stmt
        .query_map([patient_id], |row| {
            Ok(MedicalNote {
                id: Some(row.get(0)?),
                patient_id: row.get(1)?,
                fecha_hora: row.get(2)?,
                notas: row.get(3)?,
                peso: row.get(4)?,
                talla: row.get(5)?,
                ta: row.get(6)?,
                fc: row.get(7)?,
                fr: row.get(8)?,
                temp: row.get(9)?,
                dx: row.get(10)?,
                plan: row.get(11)?,
                firma: row.get(12)?,
                especialidad: row.get(13)?,
                cedula_prof: row.get(14)?,
                cedula_especialidad: row.get(15)?,
            })
        })
        .map_err(|e| e.to_string())?;

    let mut out = Vec::new();
    for r in rows {
        out.push(r.map_err(|e| e.to_string())?);
    }
    Ok(out)
}

#[tauri::command]
pub fn get_medical_note(state: tauri::State<DbState>, id: i32) -> Result<MedicalNote, String> {
    let conn = state.0.lock().unwrap();
    let mut stmt = conn
        .prepare("SELECT id, patient_id, fecha_hora, notas, peso, talla, ta, fc, fr, temp, dx, plan, firma, especialidad, cedula_prof, cedula_especialidad FROM medical_notes WHERE id = ?")
        .map_err(|e| e.to_string())?;
    let note = stmt
        .query_row([id], |row| {
            Ok(MedicalNote {
                id: Some(row.get(0)?),
                patient_id: row.get(1)?,
                fecha_hora: row.get(2)?,
                notas: row.get(3)?,
                peso: row.get(4)?,
                talla: row.get(5)?,
                ta: row.get(6)?,
                fc: row.get(7)?,
                fr: row.get(8)?,
                temp: row.get(9)?,
                dx: row.get(10)?,
                plan: row.get(11)?,
                firma: row.get(12)?,
                especialidad: row.get(13)?,
                cedula_prof: row.get(14)?,
                cedula_especialidad: row.get(15)?,
            })
        })
        .map_err(|e| e.to_string())?;
    Ok(note)
}

#[tauri::command]
pub fn create_colposcopy(state: tauri::State<DbState>, c: ColposcopyEntry) -> Result<i64, String> {
    let mut conn = state.0.lock().unwrap();
    let tx = conn.transaction().map_err(|e| e.to_string())?;

    tx.execute(
        "INSERT INTO colposcopies (
            patient_id, fecha_hora, envio,
            menarca, ritmo, mpf, ivsa, gestas, partos, abortos, cesareas, fum, ultimo_pap,
            vulva_vagina, colposcopia_tipo, cervix, zona_transformacion, superficie, bordes, epitelio_acetoblanco, prueba_schiller,
            patron_vascular_velloso, vasos_atipicos, puntilleo, mosaico,
            diagnostico_colposcopico, otras_observaciones, plan_tratamiento,
            diagrama_genitales_path, diagrama_cuadrantes_path
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)",
        params![
            c.patient_id, c.fecha_hora, c.envio,
            c.menarca, c.ritmo, c.mpf, c.ivsa, c.gestas, c.partos, c.abortos, c.cesareas, c.fum, c.ultimo_pap,
            c.vulva_vagina, c.colposcopia_tipo, c.cervix, c.zona_transformacion, c.superficie, c.bordes, c.epitelio_acetoblanco, c.prueba_schiller,
            c.patron_vascular_velloso, c.vasos_atipicos, c.puntilleo, c.mosaico,
            c.diagnostico_colposcopico, c.otras_observaciones, c.plan_tratamiento,
            c.diagrama_genitales_path, c.diagrama_cuadrantes_path
        ],
    )
    .map_err(|e| e.to_string())?;

    let col_id = tx.last_insert_rowid();

    if let Some(caps) = c.captures {
        for (i, path) in caps.iter().enumerate() {
            tx.execute(
                "INSERT INTO colposcopy_images (colposcopy_id, path, position) VALUES (?, ?, ?)",
                params![col_id, path, i as i32],
            )
            .map_err(|e| e.to_string())?;
        }
    }

    tx.commit().map_err(|e| e.to_string())?;
    Ok(col_id)
}

#[tauri::command]
pub fn update_colposcopy(
    state: tauri::State<DbState>,
    id: i32,
    c: ColposcopyEntry,
) -> Result<(), String> {
    let mut conn = state.0.lock().unwrap();
    let tx = conn.transaction().map_err(|e| e.to_string())?;

    tx.execute(
        "UPDATE colposcopies SET 
            fecha_hora = ?, envio = ?,
            menarca = ?, ritmo = ?, mpf = ?, ivsa = ?, gestas = ?, partos = ?, abortos = ?, cesareas = ?, fum = ?, ultimo_pap = ?,
            vulva_vagina = ?, colposcopia_tipo = ?, cervix = ?, zona_transformacion = ?, superficie = ?, bordes = ?, epitelio_acetoblanco = ?, prueba_schiller = ?,
            patron_vascular_velloso = ?, vasos_atipicos = ?, puntilleo = ?, mosaico = ?,
            diagnostico_colposcopico = ?, otras_observaciones = ?, plan_tratamiento = ?,
            diagrama_genitales_path = ?, diagrama_cuadrantes_path = ?
        WHERE id = ?",
        params![
            c.fecha_hora, c.envio,
            c.menarca, c.ritmo, c.mpf, c.ivsa, c.gestas, c.partos, c.abortos, c.cesareas, c.fum, c.ultimo_pap,
            c.vulva_vagina, c.colposcopia_tipo, c.cervix, c.zona_transformacion, c.superficie, c.bordes, c.epitelio_acetoblanco, c.prueba_schiller,
            c.patron_vascular_velloso, c.vasos_atipicos, c.puntilleo, c.mosaico,
            c.diagnostico_colposcopico, c.otras_observaciones, c.plan_tratamiento,
            c.diagrama_genitales_path, c.diagrama_cuadrantes_path,
            id
        ],
    )
    .map_err(|e| e.to_string())?;

    // Clear old images and insert new ones to maintain order
    tx.execute("DELETE FROM colposcopy_images WHERE colposcopy_id = ?", [id])
        .map_err(|e| e.to_string())?;

    if let Some(caps) = c.captures {
        for (i, path) in caps.iter().enumerate() {
            tx.execute(
                "INSERT INTO colposcopy_images (colposcopy_id, path, position) VALUES (?, ?, ?)",
                params![id, path, i as i32],
            )
            .map_err(|e| e.to_string())?;
        }
    }

    tx.commit().map_err(|e| e.to_string())?;
    Ok(())
}

#[tauri::command]
pub fn delete_colposcopy(state: tauri::State<DbState>, id: i32) -> Result<(), String> {
    let conn = state.0.lock().unwrap();
    conn.execute("DELETE FROM colposcopies WHERE id = ?", [id])
        .map_err(|e| e.to_string())?;
    Ok(())
}

#[tauri::command]
pub fn get_colposcopy(state: tauri::State<DbState>, id: i32) -> Result<ColposcopyEntry, String> {
    let conn = state.0.lock().unwrap();
    let mut stmt = conn
        .prepare("SELECT * FROM colposcopies WHERE id = ?")
        .map_err(|e| e.to_string())?;
    
    let mut entry = stmt
        .query_row([id], |row| {
            Ok(ColposcopyEntry {
                id: Some(row.get(0)?),
                patient_id: row.get(1)?,
                fecha_hora: row.get(2)?,
                envio: row.get(3)?,
                menarca: row.get(4)?,
                ritmo: row.get(5)?,
                mpf: row.get(6)?,
                ivsa: row.get(7)?,
                gestas: row.get(8)?,
                partos: row.get(9)?,
                abortos: row.get(10)?,
                cesareas: row.get(11)?,
                fum: row.get(12)?,
                ultimo_pap: row.get(13)?,
                vulva_vagina: row.get(14)?,
                colposcopia_tipo: row.get(15)?,
                cervix: row.get(16)?,
                zona_transformacion: row.get(17)?,
                superficie: row.get(18)?,
                bordes: row.get(19)?,
                epitelio_acetoblanco: row.get(20)?,
                prueba_schiller: row.get(21)?,
                patron_vascular_velloso: row.get(22)?,
                vasos_atipicos: row.get(23)?,
                puntilleo: row.get(24)?,
                mosaico: row.get(25)?,
                diagnostico_colposcopico: row.get(26)?,
                otras_observaciones: row.get(27)?,
                plan_tratamiento: row.get(28)?,
                diagrama_genitales_path: row.get(29)?,
                diagrama_cuadrantes_path: row.get(30)?,
                captures: None,
            })
        })
        .map_err(|e| e.to_string())?;

    // Load captures
    let mut img_stmt = conn.prepare("SELECT path FROM colposcopy_images WHERE colposcopy_id = ? ORDER BY position")
        .map_err(|e| e.to_string())?;
    let img_iter = img_stmt.query_map([id], |row| row.get::<_, String>(0))
        .map_err(|e| e.to_string())?;
    
    let mut caps = Vec::new();
    for img in img_iter {
        caps.push(img.map_err(|e| e.to_string())?);
    }
    entry.captures = Some(caps);

    Ok(entry)
}

#[tauri::command]
pub fn list_colposcopies_for_patient(
    state: tauri::State<DbState>,
    patient_id: i32,
) -> Result<Vec<ColposcopyEntry>, String> {
    let conn = state.0.lock().unwrap();
    let mut stmt = conn
        .prepare("SELECT * FROM colposcopies WHERE patient_id = ? ORDER BY fecha_hora DESC")
        .map_err(|e| e.to_string())?;
    let rows = stmt
        .query_map([patient_id], |row| {
            Ok(ColposcopyEntry {
                id: Some(row.get(0)?),
                patient_id: row.get(1)?,
                fecha_hora: row.get(2)?,
                envio: row.get(3)?,
                menarca: row.get(4)?,
                ritmo: row.get(5)?,
                mpf: row.get(6)?,
                ivsa: row.get(7)?,
                gestas: row.get(8)?,
                partos: row.get(9)?,
                abortos: row.get(10)?,
                cesareas: row.get(11)?,
                fum: row.get(12)?,
                ultimo_pap: row.get(13)?,
                vulva_vagina: row.get(14)?,
                colposcopia_tipo: row.get(15)?,
                cervix: row.get(16)?,
                zona_transformacion: row.get(17)?,
                superficie: row.get(18)?,
                bordes: row.get(19)?,
                epitelio_acetoblanco: row.get(20)?,
                prueba_schiller: row.get(21)?,
                patron_vascular_velloso: row.get(22)?,
                vasos_atipicos: row.get(23)?,
                puntilleo: row.get(24)?,
                mosaico: row.get(25)?,
                diagnostico_colposcopico: row.get(26)?,
                otras_observaciones: row.get(27)?,
                plan_tratamiento: row.get(28)?,
                diagrama_genitales_path: row.get(29)?,
                diagrama_cuadrantes_path: row.get(30)?,
                captures: None,
            })
        })
        .map_err(|e| e.to_string())?;

    let mut out = Vec::new();
    for r in rows {
        let mut entry = r.map_err(|e| e.to_string())?;
        
        // Load captures for each entry in the list
        let mut img_stmt = conn.prepare("SELECT path FROM colposcopy_images WHERE colposcopy_id = ? ORDER BY position")
            .map_err(|e| e.to_string())?;
        let img_iter = img_stmt.query_map([entry.id.unwrap()], |row| row.get::<_, String>(0))
            .map_err(|e| e.to_string())?;
        
        let mut caps = Vec::new();
        for img in img_iter {
            caps.push(img.map_err(|e| e.to_string())?);
        }
        entry.captures = Some(caps);
        
        out.push(entry);
    }
    Ok(out)
}
