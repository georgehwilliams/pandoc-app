// ============================================================
// PANDOCAPP — FRONTEND LOGIC (v5)
// Uses Tauri native dialog for file selection
// Uses Tauri window API for drag-and-drop path resolution
// Uses Tauri store for persistent preferences
// ============================================================

import { invoke } from '@tauri-apps/api/core';
import { open } from '@tauri-apps/plugin-dialog';
import { getCurrentWindow } from '@tauri-apps/api/window';
import { load } from '@tauri-apps/plugin-store';

// ------------------------------------------------------------
// Store — persistent preferences
// ------------------------------------------------------------
let store = null;

async function initStore() {
  store = await load('preferences.json', { autoSave: true });
  await loadSavedPreferences();
}

async function loadSavedPreferences() {
  if (!store) return;

  const savedTemplate = await store.get('templatePath');
  const savedTemplateEnabled = await store.get('templateEnabled');

  if (savedTemplate) {
    templatePath = savedTemplate;
    templateFilenameEl.textContent = getFilename(savedTemplate);
    templateDisplay.classList.add('has-template');
    templateClearBtn.disabled = false;
    templateEnabledCheckbox.disabled = false;
  }

  if (savedTemplateEnabled !== null && savedTemplateEnabled !== undefined) {
    templateEnabledCheckbox.checked = savedTemplateEnabled;
  }
}

// ------------------------------------------------------------
// State
// ------------------------------------------------------------
let selectedFilePath = null;
let selectedFileName = null;
let templatePath = null;

// ------------------------------------------------------------
// Element References — Convert Tab
// ------------------------------------------------------------
const dropZone = document.getElementById('drop-zone');
const selectedFileDisplay = document.getElementById('selected-file');
const outputFormat = document.getElementById('output-format');
const outputFilename = document.getElementById('output-filename');
const convertBtn = document.getElementById('convert-btn');
const resetBtn = document.getElementById('reset-btn');
const statusDisplay = document.getElementById('status-display');

// ------------------------------------------------------------
// Element References — Options Tab
// ------------------------------------------------------------
const templateDisplay = document.getElementById('template-display');
const templateFilenameEl = document.getElementById('template-filename');
const templatePickBtn = document.getElementById('template-pick-btn');
const templateClearBtn = document.getElementById('template-clear-btn');
const templateEnabledCheckbox = document.getElementById('template-enabled');

const metaTitle = document.getElementById('meta-title');
const metaAuthor = document.getElementById('meta-author');
const metaLanguage = document.getElementById('meta-language');
const includeTitleBlock = document.getElementById('include-title-block');

const frontmatterControls = document.getElementById('frontmatter-controls');
const stripFrontmatter = document.getElementById('strip-frontmatter');
const injectFrontmatter = document.getElementById('inject-frontmatter');

const findText = document.getElementById('find-text');
const replaceText = document.getElementById('replace-text');

// ------------------------------------------------------------
// Element References — Tabs
// ------------------------------------------------------------
const tabConvert = document.getElementById('tab-convert');
const tabOptions = document.getElementById('tab-options');
const panelConvert = document.getElementById('tabpanel-convert');
const panelOptions = document.getElementById('tabpanel-options');

// ------------------------------------------------------------
// Collapsible triggers
// ------------------------------------------------------------
const metadataTrigger = document.getElementById('metadata-trigger');
const metadataPanel = document.getElementById('metadata-panel');
const findreplaceTrigger = document.getElementById('findreplace-trigger');
const findreplacePanel = document.getElementById('findreplace-panel');

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

function updateFrontmatterVisibility() {
  const inputExt = selectedFileName ? getExtension(selectedFileName) : '';
  const outputExt = outputFormat.value;
  const mdInvolved = inputExt === 'md' ||
                     inputExt === 'markdown' ||
                     outputExt === 'md';
  if (mdInvolved) {
    frontmatterControls.removeAttribute('hidden');
  } else {
    frontmatterControls.setAttribute('hidden', '');
  }
}

// ------------------------------------------------------------
// Tab Navigation (ARIA keyboard pattern)
// ------------------------------------------------------------
function activateTab(tab) {
  const allTabs = [tabConvert, tabOptions];
  const allPanels = [panelConvert, panelOptions];

  allTabs.forEach(t => {
    t.setAttribute('aria-selected', 'false');
    t.setAttribute('tabindex', '-1');
    t.classList.remove('tab-btn--active');
  });

  allPanels.forEach(p => {
    p.classList.add('tab-panel--hidden');
  });

  tab.setAttribute('aria-selected', 'true');
  tab.setAttribute('tabindex', '0');
  tab.classList.add('tab-btn--active');

  const panelId = tab.getAttribute('aria-controls');
  document.getElementById(panelId).classList.remove('tab-panel--hidden');
}

tabConvert.addEventListener('click', () => activateTab(tabConvert));
tabOptions.addEventListener('click', () => activateTab(tabOptions));

// Arrow key navigation between tabs
[tabConvert, tabOptions].forEach((tab, index, tabs) => {
  tab.addEventListener('keydown', (e) => {
    let target = null;
    if (e.key === 'ArrowRight') {
      target = tabs[(index + 1) % tabs.length];
    } else if (e.key === 'ArrowLeft') {
      target = tabs[(index - 1 + tabs.length) % tabs.length];
    }
    if (target) {
      e.preventDefault();
      target.focus();
      activateTab(target);
    }
  });
});

// ------------------------------------------------------------
// Collapsible Panels
// ------------------------------------------------------------
function setupCollapsible(trigger, panel) {
  trigger.addEventListener('click', () => {
    const isExpanded = trigger.getAttribute('aria-expanded') === 'true';
    trigger.setAttribute('aria-expanded', String(!isExpanded));
    const icon = trigger.querySelector('.collapsible-icon');
    if (isExpanded) {
      panel.classList.add('collapsible-panel--hidden');
      if (icon) icon.textContent = '▸';
    } else {
      panel.classList.remove('collapsible-panel--hidden');
      if (icon) icon.textContent = '▾';
    }
  });
}

setupCollapsible(metadataTrigger, metadataPanel);
setupCollapsible(findreplaceTrigger, findreplacePanel);

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
  updateFrontmatterVisibility();

  if (outputFormat.value) {
    outputFilename.placeholder = generateOutputFilename(filename, outputFormat.value);
  } else {
    outputFilename.placeholder = 'Choose an output format first';
  }

  setStatus(`File selected: ${filename}`, 'ready');
  updateConvertButton();
}

// ------------------------------------------------------------
// File Dialog
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
  if (e.key === 'Enter' || e.key === ' ' || e.key === 'Return') {
    e.preventDefault();
    openFileDialog();
  }
});

// ------------------------------------------------------------
// Drag and Drop
// ------------------------------------------------------------
dropZone.addEventListener('dragover', (e) => {
  e.preventDefault();
  dropZone.classList.add('drag-over');
});

dropZone.addEventListener('dragleave', () => {
  dropZone.classList.remove('drag-over');
});

dropZone.addEventListener('drop', (e) => {
  e.preventDefault();
  dropZone.classList.remove('drag-over');
});

getCurrentWindow().onDragDropEvent((event) => {
  if (event.payload.type === 'over') {
    dropZone.classList.add('drag-over');
  } else if (event.payload.type === 'cancelled') {
    dropZone.classList.remove('drag-over');
  } else if (event.payload.type === 'drop') {
    dropZone.classList.remove('drag-over');
    const paths = event.payload.paths;
    if (paths && paths.length > 0) {
      handleFilePath(paths[0]);
    }
  }
});

// ------------------------------------------------------------
// Format Selector
// ------------------------------------------------------------
outputFormat.addEventListener('change', () => {
  if (selectedFileName && outputFormat.value) {
    outputFilename.placeholder = generateOutputFilename(selectedFileName, outputFormat.value);
  }
  updateFrontmatterVisibility();
  updateConvertButton();
});

// ------------------------------------------------------------
// Template Picker
// ------------------------------------------------------------
templatePickBtn.addEventListener('click', async () => {
  const filePath = await open({
    multiple: false,
    filters: [{
      name: 'Word Document',
      extensions: ['docx']
    }]
  });

  if (filePath) {
    templatePath = filePath;
    templateFilenameEl.textContent = getFilename(filePath);
    templateDisplay.classList.add('has-template');
    templateClearBtn.disabled = false;
    templateEnabledCheckbox.disabled = false;
    templateEnabledCheckbox.checked = true;

    if (store) {
      await store.set('templatePath', filePath);
      await store.set('templateEnabled', true);
    }
  }
});

templateClearBtn.addEventListener('click', async () => {
  templatePath = null;
  templateFilenameEl.textContent = 'No template selected';
  templateDisplay.classList.remove('has-template');
  templateClearBtn.disabled = true;
  templateEnabledCheckbox.disabled = true;
  templateEnabledCheckbox.checked = true;

  if (store) {
    await store.delete('templatePath');
    await store.set('templateEnabled', true);
  }
});

templateEnabledCheckbox.addEventListener('change', async () => {
  if (store) {
    await store.set('templateEnabled', templateEnabledCheckbox.checked);
  }
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
      templatePath: templatePath,
      useTemplate: templateEnabledCheckbox.checked && templatePath !== null,
      metadataTitle: metaTitle.value.trim() || null,
      metadataAuthor: metaAuthor.value.trim() || null,
      metadataLanguage: metaLanguage.value.trim() || null,
      findText: findText.value || null,
      replaceText: replaceText.value || null,
      stripFrontmatter: stripFrontmatter.checked,
      injectFrontmatter: injectFrontmatter.checked,
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
// Reset
// ------------------------------------------------------------
function resetApp() {
  selectedFilePath = null;
  selectedFileName = null;

  selectedFileDisplay.textContent = 'No file selected';
  selectedFileDisplay.classList.remove('has-file');

  outputFormat.value = '';
  outputFilename.value = '';
  outputFilename.placeholder = 'Auto-generated from input filename';

  const options = outputFormat.querySelectorAll('option[value]');
  options.forEach(option => {
    option.disabled = false;
  });

  stripFrontmatter.checked = false;
  injectFrontmatter.checked = false;
  includeTitleBlock.checked = false;
  frontmatterControls.setAttribute('hidden', '');

  setStatus('Ready. Select a file to begin.', 'ready');
  updateConvertButton();
}

resetBtn.addEventListener('click', resetApp);

// ------------------------------------------------------------
// Init
// ------------------------------------------------------------
updateConvertButton();
initStore();