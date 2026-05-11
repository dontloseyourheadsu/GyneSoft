import { invoke } from "@tauri-apps/api/core";
import type { Patient, ClinicalHistory, MedicalNote, ColposcopyEntry } from "./types";

export const api = {
  listPatients: () => invoke<Patient[]>("list_patients"),
  createPatient: (p: Patient) => invoke<number>("create_patient", { patient: p }),
  getPatient: (id: number) => invoke<Patient>("get_patient", { id }),

  createClinicalHistory: (h: ClinicalHistory) => invoke<number>("create_clinical_history", { h }),
  listClinicalHistoriesForPatient: (patient_id: number) => invoke<ClinicalHistory[]>("list_clinical_histories_for_patient", { patient_id }),
  getClinicalHistory: (id: number) => invoke<ClinicalHistory>("get_clinical_history", { id }),

  createMedicalNote: (n: MedicalNote) => invoke<number>("create_medical_note", { n }),
  listMedicalNotesForPatient: (patient_id: number) => invoke<MedicalNote[]>("list_medical_notes_for_patient", { patient_id }),
  getMedicalNote: (id: number) => invoke<MedicalNote>("get_medical_note", { id }),

  createColposcopy: (c: ColposcopyEntry) => invoke<number>("create_colposcopy", { c }),
  listColposcopiesForPatient: (patient_id: number) => invoke<ColposcopyEntry[]>("list_colposcopies_for_patient", { patient_id }),
};
