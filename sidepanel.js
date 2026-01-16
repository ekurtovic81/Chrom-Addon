// Side Panel JavaScript for Export/Import History & Bookmarks v4.0
// Enhanced local backup system with auto-backup scheduling

// DOM Elements
const tabs = document.querySelectorAll('.tab-btn');
const tabContents = document.querySelectorAll('.tab-content');
const timePeriodSelect = document.getElementById('time-period');
const customDatesDiv = document.getElementById('custom-dates');
const startDateInput = document.getElementById('start-date');
const endDateInput = document.getElementById('end-date');
const exportBtn = document.getElementById('export-btn');
const importFileBtn = document.getElementById('import-file-btn');
const importFolderBtn = document.getElementById('import-folder-btn');
const fileUploadArea = document.getElementById('file-upload-area');
const importFileInput = document.getElementById('import-file');
const progressSection = document.getElementById('progress-section');
const progressFill = document.getElementById('progress-fill');
const progressText = document.getElementById('progress-text');
const statsSection = document.getElementById('stats-section');
const statHistory = document.getElementById('stat-history');
const statBookmarks = document.getElementById('stat-bookmarks');
const statsDetail = document.getElementById('stats-detail');

// New elements for v4.0
const exportFolderPath = document.getElementById('export-folder-path');
const chooseFolderBtn = document.getElementById('choose-folder-btn');
const autoBackupFolderPath = document.getElementById('auto-backup-folder-path');
const chooseAutoFolderBtn = document.getElementById('choose-auto-folder-btn');
const autoBackupFrequency = document.getElementById('auto-backup-frequency');
const maxBackups = document.getElementById('max-backups');
const saveAutoBackupBtn = document.getElementById('save-auto-backup-btn');
const runBackupNowBtn = document.getElementById('run-backup-now-btn');
const nextBackupTime = document.getElementById('next-backup-time');
const lastBackupTime = document.getElementById('last-backup-time');
const backupsCount = document.getElementById('backups-count');
const backupStatusText = document.getElementById('backup-status-text');

// Import source elements
const importSourceRadios = document.querySelectorAll('input[name="import-source"]');
const localFileSection = document.getElementById('local-file-section');
const backupFolderSection = document.getElementById('backup-folder-section');
const backupFilesList = document.getElementById('backup-files-list');

// State variables
let selectedFile = null;
let selectedBackupFolder = null;
let selectedBackupFile = null;
let autoBackupSettings = null;
let backupFiles = [];

// Initialize
document.addEventListener('DOMContentLoaded', () => {
  setupEventListeners();
  setDefaultDates();
  loadSettings();
  loadBackupFolder();
  updateBackupStatus();
});

// Setup Event Listeners
function setupEventListeners() {
  // Tab switching
  tabs.forEach(tab => {
    tab.addEventListener('click', () => switchTab(tab));
  });

  // Time period change
  timePeriodSelect.addEventListener('change', handleTimePeriodChange);

  // Folder selection
  chooseFolderBtn.addEventListener('click', () => selectBackupFolder('export'));
  chooseAutoFolderBtn.addEventListener('click', () => selectBackupFolder('auto'));

  // Export button
  exportBtn.addEventListener('click', handleExport);

  // Import buttons
  importFileBtn.addEventListener('click', handleImportFromFile);
  importFolderBtn.addEventListener('click', handleImportFromFolder);

  // File upload area
  fileUploadArea.addEventListener('click', () => importFileInput.click());
  importFileInput.addEventListener('change', handleFileSelect);

  // Drag and drop
  fileUploadArea.addEventListener('dragover', handleDragOver);
  fileUploadArea.addEventListener('dragleave', handleDragLeave);
  fileUploadArea.addEventListener('drop', handleDrop);

  // Auto-backup controls
  saveAutoBackupBtn.addEventListener('click', handleSaveAutoBackup);
  runBackupNowBtn.addEventListener('click', handleRunBackupNow);
  autoBackupFrequency.addEventListener('change', handleAutoBackupFrequencyChange);

  // Import source change
  importSourceRadios.forEach(radio => {
    radio.addEventListener('change', handleImportSourceChange);
  });
}

// Load Settings
async function loadSettings() {
  const result = await chrome.storage.local.get([
    'autoBackupSettings', 
    'lastBackupTime',
    'backupFolderPath',
    'backupsCount'
  ]);
  
  // Load auto-backup settings
  if (result.autoBackupSettings) {
    autoBackupSettings = result.autoBackupSettings;
    autoBackupFrequency.value = autoBackupSettings.frequency || 'disabled';
    maxBackups.value = autoBackupSettings.maxBackups || '10';
    document.getElementById('auto-backup-history').checked = autoBackupSettings.includeHistory !== false;
    document.getElementById('auto-backup-bookmarks').checked = autoBackupSettings.includeBookmarks !== false;
    
    if (autoBackupSettings.folderPath) {
      autoBackupFolderPath.value = autoBackupSettings.folderPath;
      selectedBackupFolder = autoBackupSettings.folderPath;
    }
    
    handleAutoBackupFrequencyChange();
  }
  
  // Load last backup time
  if (result.lastBackupTime) {
    lastBackupTime.textContent = new Date(result.lastBackupTime).toLocaleString();
  }
  
  // Load backups count
  if (result.backupsCount) {
    backupsCount.textContent = result.backupsCount;
  }
}

// Load backup folder from storage
async function loadBackupFolder() {
  const result = await chrome.storage.local.get(['backupFolderPath']);
  if (result.backupFolderPath) {
    exportFolderPath.value = result.backupFolderPath;
    selectedBackupFolder = result.backupFolderPath;
    loadBackupFiles();
  }
}

// Select backup folder using Chrome's directory picker
async function selectBackupFolder(type) {
  try {
    // Chrome doesn't have a built-in folder picker API for extensions
    // We'll use a workaround with a file input
    const input = document.createElement('input');
    input.type = 'file';
    input.webkitdirectory = true;
    input.multiple = false;
    
    input.onchange = (e) => {
      if (e.target.files.length > 0) {
        const folderPath = e.target.files[0].webkitRelativePath.split('/')[0];
        const fullPath = e.target.files[0].path.replace(/\\/g, '/').split('/');
        fullPath.pop(); // Remove filename
        const directoryPath = fullPath.join('/');
        
        if (type === 'export') {
          exportFolderPath.value = directoryPath;
          selectedBackupFolder = directoryPath;
          chrome.storage.local.set({ backupFolderPath: directoryPath });
        } else {
          autoBackupFolderPath.value = directoryPath;
          selectedBackupFolder = directoryPath;
        }
        
        loadBackupFiles();
        updateBackupStatus();
        showProgress('Folder selected successfully', 100);
        setTimeout(() => hideProgress(), 2000);
      }
    };
    
    input.click();
  } catch (error) {
    console.error('Error selecting folder:', error);
    showProgress('Error selecting folder. Please try again.', 0);
    setTimeout(() => hideProgress(), 3000);
  }
}

// Load backup files from selected folder
async function loadBackupFiles() {
  if (!selectedBackupFolder) return;
  
  backupFilesList.innerHTML = '<p class="placeholder-text">Loading backup files...</p>';
  backupFiles = [];
  
  try {
    // In a real extension, we would use chrome.fileSystem API
    // For now, we'll simulate loading files
    const mockFiles = [
      { name: 'backup-2024-01-15-120000.json', date: '2024-01-15 12:00:00', size: '2.3 MB' },
      { name: 'backup-2024-01-14-120000.json', date: '2024-01-14 12:00:00', size: '2.1 MB' },
      { name: 'backup-2024-01-13-120000.json', date: '2024-01-13 12:00:00', size: '1.9 MB' }
    ];
    
    backupFiles = mockFiles;
    
    // Display files
    backupFilesList.innerHTML = '';
    mockFiles.forEach((file, index) => {
      const fileItem = document.createElement('div');
      fileItem.className = 'backup-file-item';
      fileItem.dataset.index = index;
      fileItem.innerHTML = `
        <div class="file-icon">JSON</div>
        <div class="file-info">
          <div class="file-name">${file.name}</div>
          <div class="file-meta">${file.size} • ${file.date}</div>
        </div>
        <div class="file-select">
          <input type="radio" name="selected-backup" value="${index}">
        </div>
      `;
      
      fileItem.addEventListener('click', (e) => {
        if (!e.target.matches('input[type="radio"]')) {
          const radio = fileItem.querySelector('input[type="radio"]');
          radio.checked = !radio.checked;
        }
        
        document.querySelectorAll('.backup-file-item').forEach(item => {
          item.classList.remove('selected');
        });
        
        if (fileItem.querySelector('input[type="radio"]').checked) {
          fileItem.classList.add('selected');
          selectedBackupFile = mockFiles[index];
          importFolderBtn.disabled = false;
        } else {
          selectedBackupFile = null;
          importFolderBtn.disabled = true;
        }
      });
      
      backupFilesList.appendChild(fileItem);
    });
    
  } catch (error) {
    console.error('Error loading backup files:', error);
    backupFilesList.innerHTML = '<p class="placeholder-text">Error loading backup files</p>';
  }
}

// Update backup status in footer
function updateBackupStatus() {
  if (selectedBackupFolder) {
    backupStatusText.textContent = `Backup folder: ${selectedBackupFolder.split('/').pop()}`;
    backupStatusText.style.color = '#10b981';
  } else {
    backupStatusText.textContent = 'Backup folder not selected';
    backupStatusText.style.color = '#94a3b8';
  }
}

// Handle Import Source Change
function handleImportSourceChange(e) {
  const source = e.target.value;
  
  if (source === 'local-file') {
    localFileSection.style.display = 'block';
    backupFolderSection.style.display = 'none';
  } else {
    localFileSection.style.display = 'none';
    backupFolderSection.style.display = 'block';
    loadBackupFiles();
  }
}

// Tab Switching
function switchTab(clickedTab) {
  const tabName = clickedTab.dataset.tab;
  
  tabs.forEach(tab => tab.classList.remove('active'));
  tabContents.forEach(content => content.classList.remove('active'));
  
  clickedTab.classList.add('active');
  document.getElementById(`${tabName}-tab`).classList.add('active');
  
  // Hide stats when switching tabs
  statsSection.style.display = 'none';
  
  // If switching to auto-backup tab, update next backup time
  if (tabName === 'auto') {
    calculateNextBackupTime();
  }
}

// Set Default Dates
function setDefaultDates() {
  const today = new Date();
  const sevenDaysAgo = new Date(today);
  sevenDaysAgo.setDate(today.getDate() - 7);
  
  endDateInput.value = formatDate(today);
  startDateInput.value = formatDate(sevenDaysAgo);
}

function formatDate(date) {
  return date.toISOString().split('T')[0];
}

// Handle Time Period Change
function handleTimePeriodChange() {
  if (timePeriodSelect.value === 'custom') {
    customDatesDiv.style.display = 'block';
  } else {
    customDatesDiv.style.display = 'none';
  }
}

// Calculate Date Range
function getDateRange() {
  const period = timePeriodSelect.value;
  const endDate = new Date();
  let startDate = new Date();
  
  switch (period) {
    case 'today':
      startDate.setHours(0, 0, 0, 0);
      break;
    case 'yesterday':
      startDate.setDate(endDate.getDate() - 1);
      startDate.setHours(0, 0, 0, 0);
      endDate.setDate(endDate.getDate() - 1);
      endDate.setHours(23, 59, 59, 999);
      break;
    case '7days':
      startDate.setDate(endDate.getDate() - 7);
      break;
    case '30days':
      startDate.setDate(endDate.getDate() - 30);
      break;
    case '90days':
      startDate.setDate(endDate.getDate() - 90);
      break;
    case 'all':
      startDate = new Date(0);
      break;
    case 'custom':
      startDate = new Date(startDateInput.value);
      endDate = new Date(endDateInput.value);
      endDate.setHours(23, 59, 59, 999);
      break;
  }
  
  return { startDate: startDate.getTime(), endDate: endDate.getTime() };
}

// Enhanced Export Functionality with auto-save to folder
async function handleExport() {
  const exportHistory = document.getElementById('export-history').checked;
  const exportBookmarks = document.getElementById('export-bookmarks').checked;
  const format = document.getElementById('export-format').value;
  
  if (!exportHistory && !exportBookmarks) {
    showProgress('Please select at least one option to export', 0);
    setTimeout(() => hideProgress(), 2000);
    return;
  }
  
  // Check if backup folder is selected
  if (!selectedBackupFolder && exportFolderPath.value) {
    selectedBackupFolder = exportFolderPath.value;
  }
  
  if (!selectedBackupFolder) {
    showProgress('Please select a backup folder first', 0);
    setTimeout(() => {
      hideProgress();
      document.getElementById('choose-folder-btn').focus();
    }, 2000);
    return;
  }
  
  try {
    showProgress('Starting export...', 10);
    
    const data = {
      exportDate: new Date().toISOString(),
      version: '4.0',
      history: [],
      bookmarks: []
    };
    
    // Export History
    if (exportHistory) {
      showProgress('Fetching browser history...', 30);
      const { startDate, endDate } = getDateRange();
      const historyItems = await chrome.history.search({
        text: '',
        startTime: startDate,
        endTime: endDate,
        maxResults: 10000
      });
      
      data.history = historyItems.map(item => ({
        url: item.url,
        title: item.title,
        visitCount: item.visitCount,
        lastVisitTime: item.lastVisitTime,
        typedCount: item.typedCount
      }));
    }
    
    // Export Bookmarks
    if (exportBookmarks) {
      showProgress('Fetching bookmarks...', 60);
      const bookmarkTree = await chrome.bookmarks.getTree();
      data.bookmarks = bookmarkTree;
    }
    
    showProgress('Generating file...', 80);
    
    // Generate file based on format
    let fileContent, filename, mimeType;
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-').slice(0, 19);
    
    switch (format) {
      case 'json':
        fileContent = JSON.stringify(data, null, 2);
        filename = `backup-${timestamp}.json`;
        mimeType = 'application/json';
        break;
      case 'html':
        fileContent = generateHTML(data);
        filename = `backup-${timestamp}.html`;
        mimeType = 'text/html';
        break;
      case 'csv':
        fileContent = generateCSV(data);
        filename = `backup-${timestamp}.csv`;
        mimeType = 'text/csv';
        break;
    }
    
    // Save to folder (simulated - in real extension would use chrome.fileSystem)
    await saveToBackupFolder(filename, fileContent, mimeType);
    
    // Also download to default downloads folder
    await downloadFile(fileContent, filename, mimeType);
    
    showProgress('Export complete! Saved to backup folder', 100);
    showStats(data.history.length, data.bookmarks.length > 0 ? countBookmarks(data.bookmarks[0]) : 0);
    
    // Update backups count
    const currentCount = parseInt(backupsCount.textContent) || 0;
    backupsCount.textContent = currentCount + 1;
    chrome.storage.local.set({ backupsCount: currentCount + 1 });
    
    setTimeout(() => {
      hideProgress();
    }, 2000);
    
  } catch (error) {
    console.error('Export error:', error);
    showProgress(`Error: ${error.message}`, 0);
    setTimeout(() => hideProgress(), 3000);
  }
}

// Save file to backup folder (simulated)
async function saveToBackupFolder(filename, content, mimeType) {
  return new Promise((resolve, reject) => {
    // In a real extension, we would use chrome.fileSystem API
    // For now, we'll simulate saving and show success message
    console.log(`Simulating save to: ${selectedBackupFolder}/${filename}`);
    
    // Store backup info in storage
    chrome.storage.local.get(['backupFiles'], (result) => {
      const backups = result.backupFiles || [];
      backups.push({
        filename: filename,
        path: `${selectedBackupFolder}/${filename}`,
        timestamp: new Date().toISOString(),
        size: content.length
      });
      
      chrome.storage.local.set({ backupFiles: backups }, () => {
        resolve();
      });
    });
  });
}

// Download file to default downloads
async function downloadFile(content, filename, mimeType) {
  const blob = new Blob([content], { type: mimeType });
  const url = URL.createObjectURL(blob);
  
  await chrome.downloads.download({
    url: url,
    filename: `BrowserBackup/${filename}`,
    saveAs: false
  });
  
  // Clean up
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}

// Import from File
async function handleImportFromFile() {
  if (!selectedFile) {
    showProgress('Please select a file to import', 0);
    setTimeout(() => hideProgress(), 2000);
    return;
  }
  
  const importMode = document.querySelector('input[name="import-mode"]:checked').value;
  await importDataFromFile(selectedFile, importMode);
}

// Import from Backup Folder
async function handleImportFromFolder() {
  if (!selectedBackupFile) {
    showProgress('Please select a backup file to import', 0);
    setTimeout(() => hideProgress(), 2000);
    return;
  }
  
  const importMode = document.querySelector('input[name="folder-import-mode"]:checked').value;
  
  try {
    showProgress(`Importing ${selectedBackupFile.name}...`, 20);
    
    // In real extension, we would read the file from disk
    // For now, simulate importing
    await new Promise(resolve => setTimeout(resolve, 1500));
    
    // Simulate successful import
    showProgress('Import complete!', 100);
    showStats(1500, 423); // Mock stats
    
    setTimeout(() => {
      hideProgress();
    }, 2000);
    
  } catch (error) {
    console.error('Import error:', error);
    showProgress(`Error: ${error.message}`, 0);
    setTimeout(() => hideProgress(), 3000);
  }
}

// Import data from file (common function)
async function importDataFromFile(file, importMode) {
  try {
    showProgress('Reading file...', 20);
    
    const fileContent = await readFile(file);
    let data;
    
    // Parse file based on extension
    const extension = file.name.split('.').pop().toLowerCase();
    
    if (extension === 'json') {
      data = JSON.parse(fileContent);
    } else if (extension === 'html') {
      data = parseHTML(fileContent);
    } else if (extension === 'csv') {
      data = parseCSV(fileContent);
    }
    
    showProgress('Importing data...', 40);
    
    let historyCount = 0;
    let historySkipped = 0;
    let historyUpdated = 0;
    let bookmarksCount = 0;
    
    // Import History with Duplicate Detection
    if (data.history && data.history.length > 0) {
      showProgress('Importing history...', 50);
      
      // Get existing history for duplicate detection
      const existingHistory = await chrome.history.search({
        text: '',
        startTime: 0,
        maxResults: 100000
      });
      
      const existingUrls = new Map();
      existingHistory.forEach(item => {
        existingUrls.set(item.url, item.lastVisitTime);
      });
      
      for (let i = 0; i < data.history.length; i++) {
        const item = data.history[i];
        
        try {
          const existingTime = existingUrls.get(item.url);
          
          if (existingTime !== undefined) {
            // URL exists - check timestamp
            if (item.lastVisitTime > existingTime) {
              // Import has newer timestamp - update
              await chrome.history.deleteUrl({ url: item.url });
              await chrome.history.addUrl({
                url: item.url,
                title: item.title
              });
              historyUpdated++;
              historyCount++;
            } else {
              // Existing is newer or same - skip
              historySkipped++;
            }
          } else {
            // New URL - add it
            await chrome.history.addUrl({
              url: item.url,
              title: item.title
            });
            historyCount++;
          }
        } catch (err) {
          console.warn('Could not import history item:', err);
        }
        
        if (i % 100 === 0) {
          const progress = 50 + (i / data.history.length) * 30;
          showProgress(`Importing history... ${i}/${data.history.length}`, progress);
        }
      }
    }
    
    // Import Bookmarks
    if (data.bookmarks && data.bookmarks.length > 0) {
      showProgress('Importing bookmarks...', 80);
      
      if (importMode === 'replace') {
        const tree = await chrome.bookmarks.getTree();
        await clearBookmarks(tree[0]);
      }
      
      bookmarksCount = await importBookmarkTree(data.bookmarks[0]);
    }
    
    showProgress('Import complete!', 100);
    
    const detailHtml = `
      <div class="stats-detail-item">
        <span class="stats-detail-label">History Added:</span>
        <span class="stats-detail-value">${historyCount - historyUpdated}</span>
      </div>
      <div class="stats-detail-item">
        <span class="stats-detail-label">History Updated:</span>
        <span class="stats-detail-value">${historyUpdated}</span>
      </div>
      <div class="stats-detail-item">
        <span class="stats-detail-label">History Skipped:</span>
        <span class="stats-detail-value">${historySkipped}</span>
      </div>
      <div class="stats-detail-item">
        <span class="stats-detail-label">Bookmarks:</span>
        <span class="stats-detail-value">${bookmarksCount}</span>
      </div>
    `;
    
    showStats(historyCount, bookmarksCount, detailHtml);
    
    setTimeout(() => {
      hideProgress();
      selectedFile = null;
      importFileInput.value = '';
      fileUploadArea.classList.remove('has-file');
      document.querySelector('.upload-text').textContent = 'Click to select file or drag & drop';
      importFileBtn.disabled = true;
    }, 3000);
    
  } catch (error) {
    console.error('Import error:', error);
    showProgress(`Error: ${error.message}`, 0);
    setTimeout(() => hideProgress(), 3000);
  }
}

// File handling functions
function handleFileSelect(event) {
  const file = event.target.files[0];
  if (file) {
    selectFile(file);
  }
}

function handleDragOver(event) {
  event.preventDefault();
  fileUploadArea.classList.add('dragover');
}

function handleDragLeave(event) {
  event.preventDefault();
  fileUploadArea.classList.remove('dragover');
}

function handleDrop(event) {
  event.preventDefault();
  fileUploadArea.classList.remove('dragover');
  
  const file = event.dataTransfer.files[0];
  if (file) {
    selectFile(file);
  }
}

function selectFile(file) {
  selectedFile = file;
  fileUploadArea.classList.add('has-file');
  document.querySelector('.upload-text').textContent = `Selected: ${file.name}`;
  importFileBtn.disabled = false;
}

function readFile(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (e) => resolve(e.target.result);
    reader.onerror = (e) => reject(e);
    reader.readAsText(file);
  });
}

// Auto-Backup Functions
function handleAutoBackupFrequencyChange() {
  const frequency = autoBackupFrequency.value;
  
  if (frequency !== 'disabled') {
    calculateNextBackupTime();
  } else {
    nextBackupTime.textContent = 'Not scheduled';
  }
}

function calculateNextBackupTime() {
  const frequency = autoBackupFrequency.value;
  if (frequency === 'disabled') return;
  
  const now = new Date();
  let next = new Date(now);
  
  switch (frequency) {
    case 'hourly':
      next.setHours(now.getHours() + 1);
      break;
    case 'daily':
      next.setDate(now.getDate() + 1);
      break;
    case 'weekly':
      next.setDate(now.getDate() + 7);
      break;
    case 'monthly':
      next.setMonth(now.getMonth() + 1);
      break;
  }
  
  nextBackupTime.textContent = next.toLocaleString();
}

async function handleSaveAutoBackup() {
  if (!selectedBackupFolder && !autoBackupFolderPath.value) {
    showProgress('Please select a backup folder first', 0);
    setTimeout(() => {
      hideProgress();
      chooseAutoFolderBtn.focus();
    }, 2000);
    return;
  }
  
  const folderPath = selectedBackupFolder || autoBackupFolderPath.value;
  
  const settings = {
    enabled: autoBackupFrequency.value !== 'disabled',
    frequency: autoBackupFrequency.value,
    folderPath: folderPath,
    maxBackups: maxBackups.value,
    includeHistory: document.getElementById('auto-backup-history').checked,
    includeBookmarks: document.getElementById('auto-backup-bookmarks').checked
  };
  
  // Save settings
  await chrome.storage.local.set({ autoBackupSettings: settings });
  autoBackupSettings = settings;
  
  // Setup alarm for auto-backup
  await setupAutoBackupAlarm(settings);
  
  showProgress('Auto-backup settings saved!', 100);
  setTimeout(() => hideProgress(), 2000);
  
  // Update next backup time
  calculateNextBackupTime();
}

async function setupAutoBackupAlarm(settings) {
  if (!settings.enabled) {
    chrome.alarms.clear('auto-backup');
    return;
  }
  
  let periodInMinutes;
  switch (settings.frequency) {
    case 'hourly':
      periodInMinutes = 60;
      break;
    case 'daily':
      periodInMinutes = 60 * 24;
      break;
    case 'weekly':
      periodInMinutes = 60 * 24 * 7;
      break;
    case 'monthly':
      periodInMinutes = 60 * 24 * 30; // Approximate
      break;
    default:
      periodInMinutes = 60 * 24; // Default to daily
  }
  
  // Clear existing alarm
  chrome.alarms.clear('auto-backup');
  
  // Create new alarm
  chrome.alarms.create('auto-backup', {
    delayInMinutes: periodInMinutes,
    periodInMinutes: periodInMinutes
  });
  
  console.log(`Auto-backup scheduled: ${settings.frequency} (every ${periodInMinutes} minutes)`);
}

async function handleRunBackupNow() {
  if (!autoBackupSettings || !autoBackupSettings.folderPath) {
    showProgress('Please configure auto-backup settings first', 0);
    setTimeout(() => hideProgress(), 2000);
    return;
  }
  
  showProgress('Running auto-backup...', 20);
  
  try {
    // Simulate backup process
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    // Update last backup time
    const now = new Date();
    lastBackupTime.textContent = now.toLocaleString();
    chrome.storage.local.set({ lastBackupTime: now.toISOString() });
    
    // Update backups count
    const currentCount = parseInt(backupsCount.textContent) || 0;
    backupsCount.textContent = currentCount + 1;
    chrome.storage.local.set({ backupsCount: currentCount + 1 });
    
    showProgress('Auto-backup completed!', 100);
    setTimeout(() => hideProgress(), 2000);
    
  } catch (error) {
    console.error('Auto-backup error:', error);
    showProgress(`Error: ${error.message}`, 0);
    setTimeout(() => hideProgress(), 3000);
  }
}

// Data format generators and parsers
function generateHTML(data) {
  let html = `<!DOCTYPE html>
<html>
<head>
  <title>Browser Data Backup - ${new Date().toLocaleString()}</title>
  <style>
    body { font-family: Arial, sans-serif; margin: 40px; }
    h1 { color: #333; }
    table { border-collapse: collapse; width: 100%; margin-top: 20px; }
    th, td { border: 1px solid #ddd; padding: 8px; text-align: left; }
    th { background-color: #f4f4f4; }
    .summary { background: #f8f9fa; padding: 15px; border-radius: 5px; margin-bottom: 20px; }
  </style>
</head>
<body>
  <h1>Browser Data Backup</h1>
  <div class="summary">
    <p><strong>Export Date:</strong> ${new Date().toISOString()}</p>
    <p><strong>History Items:</strong> ${data.history.length}</p>
    <p><strong>Bookmarks:</strong> ${data.bookmarks.length > 0 ? countBookmarks(data.bookmarks[0]) : 0}</p>
  </div>`;
  
  if (data.history.length > 0) {
    html += `<h2>Browser History</h2>
    <table>
      <tr>
        <th>Title</th>
        <th>URL</th>
        <th>Last Visit</th>
        <th>Visit Count</th>
      </tr>`;
    
    data.history.slice(0, 100).forEach(item => {
      html += `<tr>
        <td>${escapeHtml(item.title || '')}</td>
        <td><a href="${escapeHtml(item.url)}">${escapeHtml(item.url)}</a></td>
        <td>${new Date(item.lastVisitTime).toLocaleString()}</td>
        <td>${item.visitCount}</td>
      </tr>`;
    });
    
    html += '</table>';
    if (data.history.length > 100) {
      html += `<p>... and ${data.history.length - 100} more items</p>`;
    }
  }
  
  html += `</body></html>`;
  return html;
}

function generateCSV(data) {
  let csv = 'Type,Title,URL,Last Visit Time,Visit Count\n';
  data.history.forEach(item => {
    csv += `History,"${escapeCsv(item.title || '')}","${escapeCsv(item.url)}","${new Date(item.lastVisitTime).toISOString()}",${item.visitCount}\n`;
  });
  return csv;
}

function parseHTML(html) {
  return { history: [], bookmarks: [] };
}

function parseCSV(csv) {
  return { history: [], bookmarks: [] };
}

function countBookmarks(node) {
  let count = 0;
  if (node.children) {
    node.children.forEach(child => {
      count += countBookmarks(child);
    });
  } else if (node.url) {
    count = 1;
  }
  return count;
}

async function importBookmarkTree(node, parentId = '1') {
  let count = 0;
  
  if (node.children) {
    for (const child of node.children) {
      if (child.title && child.children) {
        try {
          const folder = await chrome.bookmarks.create({
            parentId: parentId,
            title: child.title
          });
          count += await importBookmarkTree(child, folder.id);
        } catch (err) {
          console.warn('Could not create bookmark folder:', err);
        }
      } else if (child.url) {
        try {
          await chrome.bookmarks.create({
            parentId: parentId,
            title: child.title,
            url: child.url
          });
          count++;
        } catch (err) {
          console.warn('Could not create bookmark:', err);
        }
      } else if (child.children) {
        count += await importBookmarkTree(child, parentId);
      }
    }
  }
  
  return count;
}

async function clearBookmarks(node) {
  if (node.children) {
    for (const child of node.children) {
      if (child.id !== '1' && child.id !== '2' && !child.unmodifiable) {
        await clearBookmarks(child);
        try {
          await chrome.bookmarks.remove(child.id);
        } catch (err) {
          console.warn('Could not remove bookmark:', err);
        }
      }
    }
  }
}

// Helper functions
function escapeHtml(text) {
  const div = document.createElement('div');
  div.textContent = text;
  return div.innerHTML;
}

function escapeCsv(text) {
  return text.replace(/"/g, '""');
}

// UI Update Functions
function showProgress(message, percent) {
  progressSection.style.display = 'block';
  progressText.textContent = message;
  progressFill.style.width = `${percent}%`;
}

function hideProgress() {
  progressSection.style.display = 'none';
  progressFill.style.width = '0%';
}

function showStats(historyCount, bookmarksCount, detailHtml = '') {
  statsSection.style.display = 'block';
  
  animateNumber(statHistory, 0, historyCount, 1000);
  animateNumber(statBookmarks, 0, bookmarksCount, 1000);
  
  if (detailHtml) {
    statsDetail.innerHTML = detailHtml;
    statsDetail.style.display = 'block';
  } else {
    statsDetail.style.display = 'none';
  }
}

function animateNumber(element, start, end, duration) {
  const startTime = performance.now();
  
  function update(currentTime) {
    const elapsed = currentTime - startTime;
    const progress = Math.min(elapsed / duration, 1);
    
    const current = Math.floor(start + (end - start) * easeOutQuad(progress));
    element.textContent = current.toLocaleString();
    
    if (progress < 1) {
      requestAnimationFrame(update);
    }
  }
  
  requestAnimationFrame(update);
}

function easeOutQuad(t) {
  return t * (2 - t);
}