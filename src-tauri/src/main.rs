// ============================================================
// PANDOCAPP — TAURI BACKEND
// Handles: Pandoc invocation, file I/O, error reporting
// ============================================================

// Prevents a Windows console window from opening on launch
#![cfg_attr(not(debug_assertions), windows_subsystem = "windows")]

use std::process::Command;
use tauri::command;

// ------------------------------------------------------------
// convert_document
// Called from frontend via invoke('convert_document', {...})
// ------------------------------------------------------------
#[command]
fn convert_document(
    input_path: String,
    output_path: String,
    output_format: String,
) -> Result<String, String> {

    let pandoc_format = match output_format.as_str() {
        "docx" => "docx",
        "md"   => "gfm",
        "html" => "html5",
        _      => return Err(format!("Unsupported output format: {}", output_format)),
    };

    let pandoc_path = find_pandoc()?;

    // Derive media extraction path for markdown output
    let media_dir = if output_format == "md" {
        let base = output_path.replace(".md", "_media");
        Some(base)
    } else {
        None
    };

    let mut cmd = Command::new(&pandoc_path);
    cmd.arg(&input_path)
       .arg("--output")
       .arg(&output_path)
       .arg("--to")
       .arg(pandoc_format)
       .arg("--standalone")
       .arg("--wrap=none")
       .arg("--strip-comments");

    // For markdown output: ATX headings and media extraction
    if output_format == "md" {
        cmd.arg("--markdown-headings=atx");
        if let Some(ref dir) = media_dir {
            cmd.arg(format!("--extract-media={}", dir));
        }
    }

    let output = cmd.output()
        .map_err(|e| format!("Failed to run Pandoc: {}", e))?;

    if !output.status.success() {
        let stderr = String::from_utf8_lossy(&output.stderr);
        return Err(format!("Pandoc error: {}", stderr));
    }

    // Post-process HTML output to fix table styling
    if output_format == "html" {
        fix_html_table_styles(&output_path)?;
    }

    // Post-process MD output to fix absolute image paths
    if output_format == "md" {
        fix_markdown_image_paths(&output_path)?;
    }

    Ok(format!("Converted to {}", output_path))
}

// ------------------------------------------------------------
// fix_html_table_styles
// Injects CSS fixes into Pandoc HTML output:
// - Adds visible cell borders
// - Forces vertical-align: top
// - Forces text-align: left on all cells
// ------------------------------------------------------------
fn fix_html_table_styles(output_path: &str) -> Result<(), String> {
    let content = std::fs::read_to_string(output_path)
        .map_err(|e| format!("Failed to read HTML output: {}", e))?;

    let table_css = r#"
    /* PandocApp table fixes */
    table {
      border-collapse: collapse;
      width: 100%;
    }
    th, td {
      border: 1px solid #d1d5db;
      padding: 0.5em 0.75em;
      vertical-align: top;
      text-align: left;
    }
    th {
      background-color: #f5f5f5;
      font-weight: 600;
    }
    "#;

    let fixed = content.replace(
        "</style>",
        &format!("{}\n</style>", table_css)
    );

    std::fs::write(output_path, fixed)
        .map_err(|e| format!("Failed to write fixed HTML: {}", e))?;

    Ok(())
}

// ------------------------------------------------------------
// fix_markdown_image_paths
// Rewrites absolute image paths in MD output to relative ones
// so that Markdown previewers can resolve them correctly,
// as long as the _media folder stays alongside the .md file.
// ------------------------------------------------------------
fn fix_markdown_image_paths(output_path: &str) -> Result<(), String> {
    let content = std::fs::read_to_string(output_path)
        .map_err(|e| format!("Failed to read MD output: {}", e))?;

    // Get the directory containing the output file
    let output_dir = std::path::Path::new(output_path)
        .parent()
        .and_then(|p| p.to_str())
        .unwrap_or("")
        .to_string();

    if output_dir.is_empty() {
        return Ok(());
    }

    // Replace absolute paths rooted in the output directory with relative paths
    let fixed = content.replace(
        &format!("src=\"{}/", output_dir),
        "src=\"./"
    ).replace(
        &format!("src=\"{}", output_dir),
        "src=\"."
    );

    std::fs::write(output_path, fixed)
        .map_err(|e| format!("Failed to write fixed MD: {}", e))?;

    Ok(())
}

// ------------------------------------------------------------
// find_pandoc
// Searches common install locations on macOS and Windows.
// Returns the path string or an error message.
// ------------------------------------------------------------
fn find_pandoc() -> Result<String, String> {
    let candidates = vec![
        // Homebrew (Apple Silicon)
        "/opt/homebrew/bin/pandoc",
        // Homebrew (Intel Mac)
        "/usr/local/bin/pandoc",
        // Direct install on macOS
        "/usr/bin/pandoc",
        // Windows common paths
        "C:\\Program Files\\Pandoc\\pandoc.exe",
        "C:\\Program Files (x86)\\Pandoc\\pandoc.exe",
        // Fallback: assume it's on PATH
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

    Err(
        "Pandoc not found. Please install Pandoc from https://pandoc.org/installing.html"
            .to_string()
    )
}

// ------------------------------------------------------------
// Main entry point
// ------------------------------------------------------------
fn main() {
    tauri::Builder::default()
        .plugin(tauri_plugin_dialog::init())
        .plugin(tauri_plugin_fs::init())
        .plugin(tauri_plugin_shell::init())
        .invoke_handler(tauri::generate_handler![convert_document])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}