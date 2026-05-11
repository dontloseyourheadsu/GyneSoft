use crate::models::VideoDevice;
use base64::Engine;
use std::process::Command;
use std::time::{SystemTime, UNIX_EPOCH};
use tauri::AppHandle;
use tauri::Manager;

#[tauri::command]
pub fn setup_stk1160_linux(device_path: String) -> Result<String, String> {
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
pub fn list_linux_video_devices() -> Result<Vec<VideoDevice>, String> {
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
pub fn save_capture_image(app: AppHandle, base64_data: String) -> Result<String, String> {
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
        .map_err(|e| format!("Imagen base64 invalida: {e}"))?;

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
pub fn list_recent_captures(app: AppHandle, limit: Option<usize>) -> Result<Vec<String>, String> {
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
