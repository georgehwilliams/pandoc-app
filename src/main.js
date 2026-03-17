// ============================================================
// PANDOCAPP — FRONTEND LOGIC (v2)
// Uses Tauri native dialog for file selection
// ============================================================

import { invoke } from '@tauri-apps/api/core';
import { open } from '@tauri-apps/plugin-dialog';

// ------------------------------------------------------------
// State
// ------------------------------------------------------------
let selectedFilePath = null;
let selectedFileName = null;

// ------------------------------------------------------------
// Element References
// ------------------------------------------------------------
const dropZone = document.getElementById('drop-zone');
const selectedFileDisplay = document.getElementById('selected-file');
const outputFormat = document.getElementById('output-format');
const outputFilename = document.getElementById('output-filename');
const convertBtn = document.getElementById('convert-btn');
const statusDisplay = document.getElementById('status-display');

// ------------------------------------------------------------
// Supported Format Pairs
// ------------------------------------------------------------
const SUPPORTED_CONVERSIONS = {
  md:       ['docx', 'html'],
  markdown: ['docx', 'html'],
  docx:     ['md', 'html'],
  html:     ['md', 'docx'],
  htm:      ['md', 'docx'],
};

// ------------------------------------------------------------
// Utilities
// ------------------------------------------------------------
function getExtension(filename) {
  return filename.split('.').pop().toLowerCase();
}

function getFilename(filepath) {
  return filepath.split('/').pop().split('\\').pop();
}

function generateOutputFilename(inputFilename, targetFormat) {
  const stem = inputFilename.replace(/\.[^/.]+$/, '');
  const ext = targetFormat === 'md' ? 'md' : targetFormat;
  return `${stem}_converted.${ext}`;
}

function setStatus(message, type = 'ready') {
  const classes = {
    ready:   'status-ready',
    working: 'status-working',
    success: 'status-success',
    error:   'status-error',
  };
  statusDisplay.innerHTML = `<p class="${classes[type] || 'status-ready'}">${message}</p>`;
}

function updateConvertButton() {
  const hasFile = selectedFilePath !== null;
  const hasFormat = outputFormat.value !== '';
  convertBtn.disabled = !(hasFile && hasFormat);
}

function updateFormatOptions(inputExt) {
  const validFormats = SUPPORTED_CONVERSIONS[inputExt] || [];
  const options = outputFormat.querySelectorAll('option[value]');
  options.forEach(option => {
    if (option.value === '') return;
    option.disabled = !validFormats.includes(option.value);
  });
  if (outputFormat.value && !validFormats.includes(outputFormat.value)) {
    outputFormat.value = '';
  }
}

// ------------------------------------------------------------
// Handle file selection
// ------------------------------------------------------------
function handleFilePath(filePath) {
  if (!filePath) return;

  const filename = getFilename(filePath);
  const ext = getExtension(filename);

  if (!SUPPORTED_CONVERSIONS[ext]) {
    setStatus(`Unsupported file type: .${ext}. Supported: .md, .docx, .html`, 'error');
    return;
  }

  selectedFilePath = filePath;
  selectedFileName = filename;

  selectedFileDisplay.textContent = filename;
  selectedFileDisplay.classList.add('has-file');

  updateFormatOptions(ext);

  if (outputFormat.value) {
    outputFilename.placeholder = generateOutputFilename(filename, outputFormat.value);
  } else {
    outputFilename.placeholder = 'Choose an output format first';
  }

  setStatus(`File selected: ${filename}`, 'ready');
  updateConvertButton();
}

// ------------------------------------------------------------
// Drop Zone: open native file dialog on click or keyboard
// ------------------------------------------------------------
async function openFileDialog() {
  const filePath = await open({
    multiple: false,
    filters: [{
      name: 'Supported Documents',
      extensions: ['md', 'markdown', 'docx', 'html', 'htm']
    }]
  });

  if (filePath) {
    handleFilePath(filePath);
  }
}

dropZone.addEventListener('click', openFileDialog);

dropZone.addEventListener('keydown', (e) => {
  if (e.key === 'Enter' || e.key === ' ') {
    e.preventDefault();
    openFileDialog();
  }
});

// ------------------------------------------------------------
// Drag and drop
// ------------------------------------------------------------
dropZone.addEventListener('dragover', (e) => {
  e.preventDefault();
  dropZone.classList.add('drag-over');
});

dropZone.addEventListener('dragleave', () => {
  dropZone.classList.remove('drag-over');
});

dropZone.addEventListener('drop', async (e) => {
  e.preventDefault();
  dropZone.classList.remove('drag-over');

  const items = e.dataTransfer.items;
  if (items && items.length > 0) {
    for (const item of items) {
      if (item.kind === 'file') {
        const entry = await item.getAsFileSystemHandle();
        if (entry && entry.kind === 'file') {
          // Use Tauri's path resolution for dropped files
          const file = await entry.getFile();
          // Tauri patches File to include path
          if (file.path) {
            handleFilePath(file.path);
          } else {
            // Fallback: prompt user to use the dialog
            setStatus('Could not read dropped file path. Please use click-to-browse instead.', 'error');
          }
          break;
        }
      }
    }
  }
});

// ------------------------------------------------------------
// Format selector
// ------------------------------------------------------------
outputFormat.addEventListener('change', () => {
  if (selectedFileName && outputFormat.value) {
    outputFilename.placeholder = generateOutputFilename(selectedFileName, outputFormat.value);
  }
  updateConvertButton();
});

// ------------------------------------------------------------
// Convert
// ------------------------------------------------------------
convertBtn.addEventListener('click', async () => {
  if (!selectedFilePath || !outputFormat.value) return;

  const targetFormat = outputFormat.value;
  const customName = outputFilename.value.trim();
  const outputName = customName || generateOutputFilename(selectedFileName, targetFormat);
  const inputDir = selectedFilePath.substring(0, selectedFilePath.lastIndexOf('/'));
  const outputPath = `${inputDir}/${outputName}`;

  convertBtn.disabled = true;
  setStatus('Converting…', 'working');

  try {
    await invoke('convert_document', {
      inputPath: selectedFilePath,
      outputPath,
      outputFormat: targetFormat,
    });

    setStatus(`✓ Converted successfully: ${outputName}`, 'success');
    outputFilename.value = '';

  } catch (error) {
    setStatus(`✗ Conversion failed: ${error}`, 'error');
  } finally {
    updateConvertButton();
  }
});

// ------------------------------------------------------------
// Init
// ------------------------------------------------------------
updateConvertButton();