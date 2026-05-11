use rusqlite::Connection;
use tauri::{AppHandle, Manager};

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
    )
    .expect("failed to create table");

    // Patients table (identification)
    conn.execute(
        "CREATE TABLE IF NOT EXISTS patients (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                nombre TEXT NOT NULL,
                fecha TEXT,
                sexo TEXT,
                edad TEXT,
                estado_civil TEXT,
                escolaridad TEXT,
                ocupacion TEXT,
                fecha_nacimiento TEXT,
                direccion TEXT,
                telefono TEXT
            )",
        [],
    )
    .expect("failed to create patients table");

    // Clinical histories table
    conn.execute(
        "CREATE TABLE IF NOT EXISTS clinical_histories (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                patient_id INTEGER NOT NULL,
                fecha TEXT,

                diabetes TEXT,
                hipertension TEXT,
                cancer TEXT,
                otros_heredo TEXT,

                higiene_personal TEXT,
                calidad_alimentacion TEXT,
                tabaquismo TEXT,
                alcoholismo TEXT,
                grupo_sanguineo_rh TEXT,
                otros_no_patologicos TEXT,

                alergias TEXT,
                quirurgicos TEXT,
                traumaticos TEXT,
                transfusionales TEXT,
                medicos TEXT,

                menarca TEXT,
                telarca TEXT,
                pubarca TEXT,
                ritmo TEXT,
                dismenorrea TEXT,
                ivsa TEXT,
                numero_parejas TEXT,
                metodo_anticonceptivo TEXT,
                gesta TEXT,
                para TEXT,
                cesareas TEXT,
                abortos TEXT,
                productos TEXT,
                fup TEXT,
                doc TEXT,
                fur TEXT,
                fpp TEXT,
                padecimiento_actual TEXT,

                peso TEXT,
                talla TEXT,
                imc TEXT,
                ta TEXT,
                fc TEXT,
                fr TEXT,
                temp TEXT,
                so2 TEXT,

                habitus_exterior TEXT,
                cabeza TEXT,
                torax TEXT,
                abdomen TEXT,
                genitales TEXT,
                extremidades TEXT,

                estudios_lab TEXT,
                diagnostico TEXT,
                tratamiento TEXT,
                comentarios TEXT,

                FOREIGN KEY(patient_id) REFERENCES patients(id)
            )",
        [],
    )
    .expect("failed to create clinical_histories table");

    // Medical notes table (seguimiento)
    conn.execute(
        "CREATE TABLE IF NOT EXISTS medical_notes (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                patient_id INTEGER NOT NULL,
                fecha_hora TEXT,
                notas TEXT,

                peso TEXT,
                talla TEXT,
                ta TEXT,
                fc TEXT,
                fr TEXT,
                temp TEXT,

                dx TEXT,
                plan TEXT,
                firma TEXT,
                especialidad TEXT,
                cedula_prof TEXT,
                cedula_especialidad TEXT,

                FOREIGN KEY(patient_id) REFERENCES patients(id)
            )",
        [],
    )
    .expect("failed to create medical_notes table");

    // Colposcopy captures table
    conn.execute(
        "CREATE TABLE IF NOT EXISTS colposcopies (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                patient_id INTEGER NOT NULL,
                fecha_hora TEXT,
                file_path TEXT,

                FOREIGN KEY(patient_id) REFERENCES patients(id)
            )",
        [],
    )
    .expect("failed to create colposcopies table");

    // Configuration table (Doctor and Clinic info)
    conn.execute(
        "CREATE TABLE IF NOT EXISTS config (
                key TEXT PRIMARY KEY,
                value TEXT
            )",
        [],
    )
    .expect("failed to create config table");

    // Initialize default config if not exists
    let defaults = [
        ("clinic_name", "Mi Clínica"),
        ("doctor_name", "Dr. Nombre Apellido"),
        ("doctor_specialty", "Ginecología y Obstetricia"),
        ("cedula_prof", ""),
        ("cedula_esp", ""),
        ("logo_path", ""),
    ];

    for (k, v) in defaults {
        conn.execute(
            "INSERT OR IGNORE INTO config (key, value) VALUES (?, ?)",
            [k, v],
        ).ok();
    }

    conn
}
