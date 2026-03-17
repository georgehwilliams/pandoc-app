#![cfg_attr(not(debug_assertions), windows_subsystem = "windows")]

use std::process::Command;
use tauri::command;

#[command]
fn convert_document(
    input_path: String,
    output_path: String,
    output_format: String,
) -> Result<String, String> {

    let pandoc_format = match output_format.as_str() {
        "docx" => "docx",
        "md"   => "markdown",
        "html" => "html5",
        _      => return Err(format!("Unsupported output format: {}", output_format)),
    };

    let pandoc_path = find_pandoc()?;

    let output = Command::new(&pandoc_path)
        .arg(&input_path)
        .arg("--output")
        .arg(&output_path)
        .arg("--to")
        .arg(pandoc_format)
        .arg("--standalone")
        .output()
        .map_err(|e| format!("Failed to run Pandoc: {}", e))?;

    if !output.status.success() {
        let stderr = String::from_utf8_lossy(&output.stderr);
        return Err(format!("Pandoc error: {}", stderr));
    }

    Ok(format!("Converted to {}", output_path))
}

fn find_pandoc() -> Result<String, String> {
    let candidates = vec![
        "/opt/homebrew/bin/pandoc",
        "/usr/local/bin/pandoc",
        "/usr/bin/pandoc",
        "C:\\Program Files\\Pandoc\\pandoc.exe",
        "C:\\Program Files (x86)\\Pandoc\\pandoc.exe",
        "pandoc",
    ];

    for candidate in &candidates {
        let result = Command::new(candidate)
            .arg("--version")
            .output();

        if result.is_ok() {
            return Ok(candidate.to_string());
        }
    }

    Err("Pandoc not found. Please install Pandoc from https://pandoc.org/installing.html".to_string())
}

fn main() {
    tauri::Builder::default()
        .plugin(tauri_plugin_dialog::init())
        .plugin(tauri_plugin_fs::init())
        .plugin(tauri_plugin_shell::init())
        .invoke_handler(tauri::generate_handler![convert_document])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}