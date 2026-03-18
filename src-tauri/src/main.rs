// ============================================================
// PANDOCAPP — TAURI BACKEND
// Handles: Pandoc invocation, file I/O, error reporting,
//          user preferences via persistent store
// ============================================================

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
    template_path: Option<String>,
    use_template: bool,
    metadata_title: Option<String>,
    metadata_author: Option<String>,
    metadata_language: Option<String>,
    find_text: Option<String>,
    replace_text: Option<String>,
    strip_frontmatter: bool,
    inject_frontmatter: bool,
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

    // Read source file for pre-processing
    let mut source_content = std::fs::read_to_string(&input_path)
        .map_err(|e| format!("Failed to read input file: {}", e))?;

    // Apply find-and-replace before conversion
    if let (Some(ref find), Some(ref replace)) = (&find_text, &replace_text) {
        if !find.is_empty() {
            source_content = source_content.replace(find.as_str(), replace.as_str());
        }
    }

    // Strip YAML frontmatter if requested
    if strip_frontmatter {
        source_content = strip_yaml_frontmatter(&source_content);
    }

    // Write pre-processed content to a temp file
    let temp_path = format!("{}.pandocapp_tmp", input_path);
    std::fs::write(&temp_path, &source_content)
        .map_err(|e| format!("Failed to write temp file: {}", e))?;

    let mut cmd = Command::new(&pandoc_path);
    cmd.arg(&temp_path)
       .arg("--output")
       .arg(&output_path)
       .arg("--to")
       .arg(pandoc_format)
       .arg("--wrap=none")
       .arg("--strip-comments");

    // For DOCX: only use --standalone when a title block is wanted
    // (i.e. when metadata is present) or when a template is in use.
    // For HTML and MD: always use --standalone for complete documents.
    if output_format != "docx" {
        cmd.arg("--standalone");
    } else if use_template
        || metadata_title.as_deref().map_or(false, |t| !t.is_empty())
        || metadata_author.as_deref().map_or(false, |a| !a.is_empty())
    {
        cmd.arg("--standalone");
    }

    // Reference DOCX template
    if output_format == "docx" && use_template {
        if let Some(ref tpl) = template_path {
            if !tpl.is_empty() {
                cmd.arg(format!("--reference-doc={}", tpl));
            }
        }
    }

    // Metadata — always passed to document properties
    if let Some(ref title) = metadata_title {
        if !title.is_empty() {
            cmd.arg(format!("--metadata=title:{}", title));
        }
    }
    if let Some(ref author) = metadata_author {
        if !author.is_empty() {
            cmd.arg(format!("--metadata=author:{}", author));
        }
    }
    if let Some(ref lang) = metadata_language {
        if !lang.is_empty() {
            cmd.arg(format!("--metadata=lang:{}", lang));
        }
    }

    // Markdown output options
    if output_format == "md" {
        cmd.arg("--markdown-headings=atx");
        if let Some(ref dir) = media_dir {
            cmd.arg(format!("--extract-media={}", dir));
        }
    }

    let output = cmd.output()
        .map_err(|e| format!("Failed to run Pandoc: {}", e))?;

    // Clean up temp file
    let _ = std::fs::remove_file(&temp_path);

    if !output.status.success() {
        let stderr = String::from_utf8_lossy(&output.stderr);
        return Err(format!("Pandoc error: {}", stderr));
    }

    // Inject YAML frontmatter if requested (MD output only)
    if output_format == "md" && inject_frontmatter {
        inject_yaml_frontmatter(
            &output_path,
            metadata_title.as_deref(),
            metadata_author.as_deref(),
            metadata_language.as_deref(),
        )?;
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
// strip_yaml_frontmatter
// Removes YAML frontmatter (--- ... ---) from Markdown source
// ------------------------------------------------------------
fn strip_yaml_frontmatter(content: &str) -> String {
    let trimmed = content.trim_start();
    if !trimmed.starts_with("---") {
        return content.to_string();
    }
    let after_open = &trimmed[3..];
    if let Some(close_pos) = after_open.find("\n---") {
        let after_close = &after_open[close_pos + 4..];
        return after_close.trim_start().to_string();
    }
    content.to_string()
}

// ------------------------------------------------------------
// inject_yaml_frontmatter
// Prepends YAML frontmatter to a Markdown output file
// ------------------------------------------------------------
fn inject_yaml_frontmatter(
    output_path: &str,
    title: Option<&str>,
    author: Option<&str>,
    language: Option<&str>,
) -> Result<(), String> {
    let existing = std::fs::read_to_string(output_path)
        .map_err(|e| format!("Failed to read MD for frontmatter injection: {}", e))?;

    let mut frontmatter = String::from("---\n");

    if let Some(t) = title {
        if !t.is_empty() {
            frontmatter.push_str(&format!("title: \"{}\"\n", t));
        }
    }
    if let Some(a) = author {
        if !a.is_empty() {
            frontmatter.push_str(&format!("author: \"{}\"\n", a));
        }
    }
    if let Some(l) = language {
        if !l.is_empty() {
            frontmatter.push_str(&format!("lang: \"{}\"\n", l));
        }
    }

    frontmatter.push_str("---\n\n");

    let with_frontmatter = format!("{}{}", frontmatter, existing);

    std::fs::write(output_path, with_frontmatter)
        .map_err(|e| format!("Failed to write MD with frontmatter: {}", e))?;

    Ok(())
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
// ------------------------------------------------------------
fn fix_markdown_image_paths(output_path: &str) -> Result<(), String> {
    let content = std::fs::read_to_string(output_path)
        .map_err(|e| format!("Failed to read MD output: {}", e))?;

    let output_dir = std::path::Path::new(output_path)
        .parent()
        .and_then(|p| p.to_str())
        .unwrap_or("")
        .to_string();

    if output_dir.is_empty() {
        return Ok(());
    }

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
// Searches common install locations on macOS and Windows
// ------------------------------------------------------------
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
        .plugin(tauri_plugin_store::Builder::default().build())
        .invoke_handler(tauri::generate_handler![convert_document])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}