use serde::{Deserialize, Serialize};
use std::sync::Mutex;

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

pub struct DbState(pub Mutex<rusqlite::Connection>);

#[derive(Serialize, Deserialize, Debug, Clone)]
pub struct Patient {
    pub id: Option<i32>,
    pub nombre: String,
    pub fecha: Option<String>,
    pub sexo: Option<String>,
    pub edad: Option<String>,
    pub estado_civil: Option<String>,
    pub escolaridad: Option<String>,
    pub ocupacion: Option<String>,
    pub fecha_nacimiento: Option<String>,
    pub direccion: Option<String>,
    pub telefono: Option<String>,
}

#[derive(Serialize, Deserialize, Debug, Clone)]
pub struct ClinicalHistory {
    pub id: Option<i32>,
    pub patient_id: i32,
    pub fecha: Option<String>,

    // Antecedentes heredofamiliares
    pub diabetes: Option<String>,
    pub hipertension: Option<String>,
    pub cancer: Option<String>,
    pub otros_heredo: Option<String>,

    // Personales no patológicos
    pub higiene_personal: Option<String>,
    pub calidad_alimentacion: Option<String>,
    pub tabaquismo: Option<String>,
    pub alcoholismo: Option<String>,
    pub grupo_sanguineo_rh: Option<String>,
    pub otros_no_patologicos: Option<String>,

    // Personales patológicos
    pub alergias: Option<String>,
    pub quirurgicos: Option<String>,
    pub traumaticos: Option<String>,
    pub transfusionales: Option<String>,
    pub medicos: Option<String>,

    // Gineco-obstetricos
    pub menarca: Option<String>,
    pub telarca: Option<String>,
    pub pubarca: Option<String>,
    pub ritmo: Option<String>,
    pub dismenorrea: Option<String>,
    pub ivsa: Option<String>,
    pub numero_parejas: Option<String>,
    pub metodo_anticonceptivo: Option<String>,
    pub gesta: Option<String>,
    pub para: Option<String>,
    pub cesareas: Option<String>,
    pub abortos: Option<String>,
    pub productos: Option<String>,
    pub fup: Option<String>,
    pub doc: Option<String>,
    pub fur: Option<String>,
    pub fpp: Option<String>,
    pub padecimiento_actual: Option<String>,

    // Signos vitales
    pub peso: Option<String>,
    pub talla: Option<String>,
    pub imc: Option<String>,
    pub ta: Option<String>,
    pub fc: Option<String>,
    pub fr: Option<String>,
    pub temp: Option<String>,
    pub so2: Option<String>,

    // Revision por sistemas
    pub habitus_exterior: Option<String>,
    pub cabeza: Option<String>,
    pub torax: Option<String>,
    pub abdomen: Option<String>,
    pub genitales: Option<String>,
    pub extremidades: Option<String>,

    // Conclusion medica
    pub estudios_lab: Option<String>,
    pub diagnostico: Option<String>,
    pub tratamiento: Option<String>,
    pub comentarios: Option<String>,
}

#[derive(Serialize, Deserialize, Debug, Clone)]
pub struct MedicalNote {
    pub id: Option<i32>,
    pub patient_id: i32,
    pub fecha_hora: Option<String>,
    pub notas: Option<String>,

    // Signos vitales panel lateral
    pub peso: Option<String>,
    pub talla: Option<String>,
    pub ta: Option<String>,
    pub fc: Option<String>,
    pub fr: Option<String>,
    pub temp: Option<String>,

    // Final dentro de notas
    pub dx: Option<String>,
    pub plan: Option<String>,
    pub firma: Option<String>,
    pub especialidad: Option<String>,
    pub cedula_prof: Option<String>,
    pub cedula_especialidad: Option<String>,
}

#[derive(Serialize, Deserialize, Debug, Clone)]
pub struct ColposcopyEntry {
    pub id: Option<i32>,
    pub patient_id: i32,
    pub fecha_hora: Option<String>,
    
    // Identificación / Envío
    pub envio: Option<String>,

    // Datos G-O (muchos vienen del historial pero se pueden sobreescribir para el estudio)
    pub menarca: Option<String>,
    pub ritmo: Option<String>,
    pub mpf: Option<String>,
    pub ivsa: Option<String>,
    pub gestas: Option<String>,
    pub partos: Option<String>,
    pub abortos: Option<String>,
    pub cesareas: Option<String>,
    pub fum: Option<String>,
    pub ultimo_pap: Option<String>,

    // Datos Colposcópicos
    pub vulva_vagina: Option<String>,
    pub colposcopia_tipo: Option<String>, // Satisfactoria / No satisfactoria
    pub cervix: Option<String>,           // Eutrófico / Otros
    pub zona_transformacion: Option<String>,
    pub superficie: Option<String>,
    pub bordes: Option<String>,
    pub epitelio_acetoblanco: Option<String>,
    pub prueba_schiller: Option<String>,

    // Observaciones
    pub patron_vascular_velloso: Option<String>,
    pub vasos_atipicos: Option<String>,
    pub puntilleo: Option<String>,
    pub mosaico: Option<String>,

    // Conclusión
    pub diagnostico_colposcopico: Option<String>,
    pub otras_observaciones: Option<String>,
    pub plan_tratamiento: Option<String>,

    // Imágenes (Rutas locales o nombres de archivo)
    pub diagrama_genitales_path: Option<String>,
    pub diagrama_cuadrantes_path: Option<String>,
    pub captures: Option<Vec<String>>,
}

#[derive(Serialize, Deserialize, Debug, Clone)]
pub struct VideoDevice {
    pub label: String,
    pub path: String,
}
