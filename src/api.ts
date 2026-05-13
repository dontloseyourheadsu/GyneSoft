import { invoke } from "@tauri-apps/api/core";
import type { Patient, ClinicalHistory, MedicalNote, ColposcopyEntry } from "./types";

export const api = {
  listPatients: () => invoke<Patient[]>("list_patients"),
  createPatient: (p: Patient) => invoke<number>("create_patient", { patient: p }),
  getPatient: (id: number) => invoke<Patient>("get_patient", { id }),

  getConfig: () => invoke<Record<string, string>>("get_config"),
  setConfig: (key: string, value: string) => invoke<void>("set_config", { key, value }),
  uploadLogo: (base64Data: string) => invoke<string>("upload_logo", { base64Data }),

  createClinicalHistory: (h: ClinicalHistory) => invoke<number>("create_clinical_history", { h }),
  updateClinicalHistory: (id: number, h: ClinicalHistory) => invoke<void>("update_clinical_history", { id, h }),
  listClinicalHistoriesForPatient: (patientId: number) => invoke<ClinicalHistory[]>("list_clinical_histories_for_patient", { patientId }),
  getClinicalHistory: (id: number) => invoke<ClinicalHistory>("get_clinical_history", { id }),

  createMedicalNote: (n: MedicalNote) => invoke<number>("create_medical_note", { n }),
  updateMedicalNote: (id: number, n: MedicalNote) => invoke<void>("update_medical_note", { id, n }),
  deleteMedicalNote: (id: number) => invoke<void>("delete_medical_note", { id }),
  listMedicalNotesForPatient: (patientId: number) => invoke<MedicalNote[]>("list_medical_notes_for_patient", { patientId }),
  getMedicalNote: (id: number) => invoke<MedicalNote>("get_medical_note", { id }),

  createColposcopy: (c: ColposcopyEntry) => invoke<number>("create_colposcopy", { c }),
  updateColposcopy: (id: number, c: ColposcopyEntry) => invoke<void>("update_colposcopy", { id, c }),
  deleteColposcopy: (id: number) => invoke<void>("delete_colposcopy", { id }),
  getColposcopy: (id: number) => invoke<ColposcopyEntry>("get_colposcopy", { id }),
  listColposcopiesForPatient: (patientId: number) => invoke<ColposcopyEntry[]>("list_colposcopies_for_patient", { patientId }),

  // Video Commands
  listLinuxVideoDevices: () => invoke<any[]>("list_linux_video_devices"),
  listAllCameras: () => invoke<any[]>("list_all_cameras"),
  testCameraCapture: (path: string) => invoke<string>("test_camera_capture", { path }),
  setupStk1160Linux: (devicePath: string) => invoke<string>("setup_stk1160_linux", { devicePath }),
  saveCaptureImage: (base64Data: string) => invoke<string>("save_capture_image", { base64Data }),
  listRecentCaptures: (limit?: number) => invoke<string[]>("list_recent_captures", { limit }),
};
