export interface Patient {
  id?: number;
  nombre: string;
  fecha?: string | null;
  sexo?: string | null;
  edad?: string | null;
  estado_civil?: string | null;
  escolaridad?: string | null;
  ocupacion?: string | null;
  fecha_nacimiento?: string | null;
  direccion?: string | null;
  telefono?: string | null;
}

export interface ClinicalHistory {
  id?: number;
  patient_id: number;
  fecha?: string | null;
  diabetes?: string | null;
  hipertension?: string | null;
  cancer?: string | null;
  otros_heredo?: string | null;
  higiene_personal?: string | null;
  calidad_alimentacion?: string | null;
  tabaquismo?: string | null;
  alcoholismo?: string | null;
  grupo_sanguineo_rh?: string | null;
  otros_no_patologicos?: string | null;
  alergias?: string | null;
  quirurgicos?: string | null;
  traumaticos?: string | null;
  transfusionales?: string | null;
  medicos?: string | null;
  menarca?: string | null;
  telarca?: string | null;
  pubarca?: string | null;
  ritmo?: string | null;
  dismenorrea?: string | null;
  ivsa?: string | null;
  numero_parejas?: string | null;
  metodo_anticonceptivo?: string | null;
  gesta?: string | null;
  para?: string | null;
  cesareas?: string | null;
  abortos?: string | null;
  productos?: string | null;
  fup?: string | null;
  doc?: string | null;
  fur?: string | null;
  fpp?: string | null;
  padecimiento_actual?: string | null;
  peso?: string | null;
  talla?: string | null;
  imc?: string | null;
  ta?: string | null;
  fc?: string | null;
  fr?: string | null;
  temp?: string | null;
  so2?: string | null;
  habitus_exterior?: string | null;
  cabeza?: string | null;
  torax?: string | null;
  abdomen?: string | null;
  genitales?: string | null;
  extremidades?: string | null;
  estudios_lab?: string | null;
  diagnostico?: string | null;
  tratamiento?: string | null;
  comentarios?: string | null;
}

export interface MedicalNote {
  id?: number;
  patient_id: number;
  fecha_hora?: string | null;
  notas?: string | null;
  peso?: string | null;
  talla?: string | null;
  ta?: string | null;
  fc?: string | null;
  fr?: string | null;
  temp?: string | null;
  dx?: string | null;
  plan?: string | null;
  firma?: string | null;
  especialidad?: string | null;
  cedula_prof?: string | null;
  cedula_especialidad?: string | null;
}

export interface ColposcopyEntry {
  id?: number;
  patient_id: number;
  fecha_hora?: string | null;

  // Identificación
  envio?: string | null;

  // Datos G-O
  menarca?: string | null;
  ritmo?: string | null;
  mpf?: string | null;
  ivsa?: string | null;
  gestas?: string | null;
  partos?: string | null;
  abortos?: string | null;
  cesareas?: string | null;
  fum?: string | null;
  ultimo_pap?: string | null;

  // Datos Colposcópicos
  vulva_vagina?: string | null;
  colposcopia_tipo?: string | null;
  cervix?: string | null;
  zona_transformacion?: string | null;
  superficie?: string | null;
  bordes?: string | null;
  epitelio_acetoblanco?: string | null;
  prueba_schiller?: string | null;

  // Observaciones
  patron_vascular_velloso?: string | null;
  vasos_atipicos?: string | null;
  puntilleo?: string | null;
  mosaico?: string | null;

  // Conclusión
  diagnostico_colposcopico?: string | null;
  otras_observaciones?: string | null;
  plan_tratamiento?: string | null;

  // Imágenes
  diagrama_genitales_path?: string | null;
  diagrama_cuadrantes_path?: string | null;
  captures?: string[];
}

export {};
