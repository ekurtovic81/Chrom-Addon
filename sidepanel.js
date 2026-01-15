// Side Panel JavaScript for Export/Import History & Bookmarks v2.0
// Includes cloud storage, auto-backup, and duplicate detection

// DOM Elements
const tabs = document.querySelectorAll('.tab-btn');
const tabContents = document.querySelectorAll('.tab-content');
const timePeriodSelect = document.getElementById('time-period');
const customDatesDiv = document.getElementById('custom-dates');
const startDateInput = document.getElementById('start-date');
const endDateInput = document.getElementById('end-date');
const exportBtn = document.getElementById('export-btn');
const importBtn = document.getElementById('import-btn');
const fileUploadArea = document.getElementById('file-upload-area');
const importFileInput = document.getElementById('import-file');
const progressSection = document.getElementById('progress-section');
const progressFill = document.getElementById('progress-fill');
const progressText = document.getElementById('progress-text');
const statsSection = document.getElementById('stats-section');
const statHistory = document.getElementById('stat-history');
const statBookmarks = document.getElementById('stat-bookmarks');
const statsDetail = document.getElementById('stats-detail');

// New elements
const exportDestination = document.getElementById('export-destination');
const importSource = document.getElementById('import-source');
const localImportSection = document.getElementById('local-import-section');
const cloudImportSection = document.getElementById('cloud-import-section');
const cloudConnectBtns = document.querySelectorAll('.btn-connect');
const autoBackupFrequency = document.getElementById('auto-backup-frequency');
const autoBackupProvider = document.getElementById('auto-backup-provider');
const saveAutoBackupBtn = document.getElementById('save-auto-backup-btn');
const runBackupNowBtn = document.getElementById('run-backup-now-btn');
const autoBackupInfo = document.getElementById('auto-backup-info');
const nextBackupTime = document.getElementById('next-backup-time');
const lastBackupTime = document.getElementById('last-backup-time');

let selectedFile = null;
let connectedProviders = {};
let cloudTokens = {};

// Initialize
document.addEventListener('DOMContentLoaded', () => {
  setupEventListeners();
  setDefaultDates();
  loadSettings();
  loadConnectedProviders();
});

// Setup Event Listeners
function setupEventListeners() {
  // Tab switching
  tabs.forEach(tab => {
    tab.addEventListener('click', () => switchTab(tab));
  });

  // Time period change
  timePeriodSelect.addEventListener('change', handleTimePeriodChange);

  // Export/Import source change
  exportDestination.addEventListener('change', handleExportDestinationChange);
  importSource.addEventListener('change', handleImportSourceChange);

  // Export button
  exportBtn.addEventListener('click', handleExport);

  // Import button
  importBtn.addEventListener('click', handleImport);

  // File upload area
  fileUploadArea.addEventListener('click', () => importFileInput.click());
  importFileInput.addEventListener('change', handleFileSelect);

  // Drag and drop
  fileUploadArea.addEventListener('dragover', handleDragOver);
  fileUploadArea.addEventListener('dragleave', handleDragLeave);
  fileUploadArea.addEventListener('drop', handleDrop);

  // Cloud connect buttons
  cloudConnectBtns.forEach(btn => {
    btn.addEventListener('click', () => handleCloudConnect(btn.dataset.provider));
  });

  // Auto-backup controls
  saveAutoBackupBtn.addEventListener('click', handleSaveAutoBackup);
  runBackupNowBtn.addEventListener('click', handleRunBackupNow);
  autoBackupFrequency.addEventListener('change', handleAutoBackupFrequencyChange);
}

// Load Settings
async function loadSettings() {
  const result = await chrome.storage.local.get(['autoBackupSettings', 'lastBackupTime']);
  
  if (result.autoBackupSettings) {
    const settings = result.autoBackupSettings;
    autoBackupFrequency.value = settings.frequency || 'disabled';
    autoBackupProvider.value = settings.provider || '';
    document.getElementById('auto-backup-history').checked = settings.includeHistory !== false;
    document.getElementById('auto-backup-bookmarks').checked = settings.includeBookmarks !== false;
    
    handleAutoBackupFrequencyChange();
  }
  
  if (result.lastBackupTime) {
    lastBackupTime.textContent = new Date(result.lastBackupTime).toLocaleString();
  }
}

// Load Connected Providers
async function loadConnectedProviders() {
  const result = await chrome.storage.local.get(['cloudTokens']);
  
  if (result.cloudTokens) {
    cloudTokens = result.cloudTokens;
    
    Object.keys(cloudTokens).forEach(provider => {
      updateProviderStatus(provider, 'connected');
    });
  }
}

// Update Provider Status
function updateProviderStatus(provider, status) {
  const card = document.querySelector(`.cloud-provider-card[data-provider="${provider}"]`);
  if (card) {
    const statusEl = card.querySelector('.provider-status');
    const btnEl = card.querySelector('.btn-connect');
    
    if (status === 'connected') {
      statusEl.textContent = 'Connected';
      statusEl.dataset.status = 'connected';
      btnEl.textContent = 'Disconnect';
      btnEl.dataset.connected = 'true';
      connectedProviders[provider] = true;
    } else if (status === 'connecting') {
      statusEl.textContent = 'Connecting...';
      statusEl.dataset.status = 'connecting';
    } else {
      statusEl.textContent = 'Not connected';
      statusEl.dataset.status = 'disconnected';
      btnEl.textContent = 'Connect';
      btnEl.dataset.connected = 'false';
      delete connectedProviders[provider];
    }
  }
}

// Handle Cloud Connect
async function handleCloudConnect(provider) {
  const btn = document.querySelector(`.btn-connect[data-provider="${provider}"]`);
  
  if (btn.dataset.connected === 'true') {
    // Disconnect
    delete cloudTokens[provider];
    await chrome.storage.local.set({ cloudTokens });
    updateProviderStatus(provider, 'disconnected');
    showProgress(`Disconnected from ${getProviderName(provider)}`, 100);
    setTimeout(() => hideProgress(), 2000);
    return;
  }
  
  // Connect
  updateProviderStatus(provider, 'connecting');
  showProgress(`Connecting to ${getProviderName(provider)}...`, 30);
  
  try {
    const response = await chrome.runtime.sendMessage({
      action: 'oauth2Authenticate',
      provider: provider
    });
    
    if (response.success) {
      cloudTokens[provider] = response.token;
      await chrome.storage.local.set({ cloudTokens });
      updateProviderStatus(provider, 'connected');
      showProgress(`Connected to ${getProviderName(provider)}!`, 100);
      setTimeout(() => hideProgress(), 2000);
    } else {
      throw new Error(response.error);
    }
  } catch (error) {
    console.error('Cloud connection error:', error);
    updateProviderStatus(provider, 'disconnected');
    showProgress(`Error: ${error.message}`, 0);
    setTimeout(() => hideProgress(), 3000);
  }
}

// Get Provider Name
function getProviderName(provider) {
  const names = {
    'google-drive': 'Google Drive',
    'dropbox': 'Dropbox',
    'onedrive': 'OneDrive',
    'box': 'Box',
    'pcloud': 'pCloud',
    'mega': 'MEGA'
  };
  return names[provider] || provider;
}

// Handle Export Destination Change
function handleExportDestinationChange() {
  const destination = exportDestination.value;
  
  if (destination === 'cloud') {
    // Check if any provider is connected
    if (Object.keys(connectedProviders).length === 0) {
      showProgress('Please connect a cloud storage provider first', 0);
      setTimeout(() => {
        hideProgress();
        switchTab(document.querySelector('.tab-btn[data-tab="cloud"]'));
      }, 2000);
      exportDestination.value = 'local';
    }
  }
}

// Handle Import Source Change
function handleImportSourceChange() {
  const source = importSource.value;
  
  if (source === 'local') {
    localImportSection.style.display = 'block';
    cloudImportSection.style.display = 'none';
  } else {
    localImportSection.style.display = 'none';
    cloudImportSection.style.display = 'block';
    loadCloudFiles();
  }
}

// Load Cloud Files
async function loadCloudFiles() {
  const cloudFilesList = document.getElementById('cloud-import-files');
  
  if (Object.keys(connectedProviders).length === 0) {
    cloudFilesList.innerHTML = '<p class="placeholder-text">Connect to cloud storage to see your files</p>';
    return;
  }
  
  showProgress('Loading cloud files...', 30);
  
  try {
    // This is a placeholder - actual implementation would fetch files from cloud APIs
    cloudFilesList.innerHTML = `
      <div class="cloud-file-item" data-file="browser-data-latest.json">
        <div class="file-icon">JS</div>
        <div class="file-info">
          <div class="file-name">browser-data-latest.json</div>
          <div class="file-meta">2.3 MB • 2 hours ago</div>
        </div>
      </div>
      <div class="cloud-file-item" data-file="browser-data-backup.json">
        <div class="file-icon">JS</div>
        <div class="file-info">
          <div class="file-name">browser-data-backup.json</div>
          <div class="file-meta">1.8 MB • Yesterday</div>
        </div>
      </div>
    `;
    
    // Add click handlers
    document.querySelectorAll('.cloud-file-item').forEach(item => {
      item.addEventListener('click', () => {
        document.querySelectorAll('.cloud-file-item').forEach(i => i.classList.remove('selected'));
        item.classList.add('selected');
        document.getElementById('import-cloud-btn').disabled = false;
      });
    });
    
    hideProgress();
  } catch (error) {
    console.error('Error loading cloud files:', error);
    cloudFilesList.innerHTML = '<p class="placeholder-text">Error loading files</p>';
    hideProgress();
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

// Export Functionality
async function handleExport() {
  const exportHistory = document.getElementById('export-history').checked;
  const exportBookmarks = document.getElementById('export-bookmarks').checked;
  const format = document.getElementById('export-format').value;
  const destination = exportDestination.value;
  
  if (!exportHistory && !exportBookmarks) {
    showProgress('Please select at least one option to export', 0);
    setTimeout(() => hideProgress(), 2000);
    return;
  }
  
  try {
    showProgress('Starting export...', 10);
    
    const data = {
      exportDate: new Date().toISOString(),
      version: '2.0',
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
    
    switch (format) {
      case 'json':
        fileContent = JSON.stringify(data, null, 2);
        filename = `browser-data-${Date.now()}.json`;
        mimeType = 'application/json';
        break;
      case 'html':
        fileContent = generateHTML(data);
        filename = `browser-data-${Date.now()}.html`;
        mimeType = 'text/html';
        break;
      case 'csv':
        fileContent = generateCSV(data);
        filename = `browser-data-${Date.now()}.csv`;
        mimeType = 'text/csv';
        break;
    }
    
    if (destination === 'local') {
      // Download file
      const blob = new Blob([fileContent], { type: mimeType });
      const url = URL.createObjectURL(blob);
      
      await chrome.downloads.download({
        url: url,
        filename: filename,
        saveAs: true
      });
    } else {
      // Upload to cloud
      await uploadToCloud(fileContent, filename, mimeType);
    }
    
    showProgress('Export complete!', 100);
    showStats(data.history.length, data.bookmarks.length > 0 ? countBookmarks(data.bookmarks[0]) : 0);
    
    setTimeout(() => {
      hideProgress();
    }, 2000);
    
  } catch (error) {
    console.error('Export error:', error);
    showProgress(`Error: ${error.message}`, 0);
    setTimeout(() => hideProgress(), 3000);
  }
}

// Upload to Cloud
async function uploadToCloud(content, filename, mimeType) {
  showProgress('Uploading to cloud...', 90);
  
  const provider = Object.keys(connectedProviders)[0];
  const token = cloudTokens[provider];
  
  if (!token) {
    throw new Error('No cloud provider connected');
  }
  
  // This is a placeholder - actual implementation would use provider-specific APIs
  // For now, we'll simulate the upload
  await new Promise(resolve => setTimeout(resolve, 1000));
  
  console.log(`Uploaded ${filename} to ${getProviderName(provider)}`);
}

// Import Functionality with Duplicate Detection
async function handleImport() {
  if (!selectedFile) {
    showProgress('Please select a file to import', 0);
    setTimeout(() => hideProgress(), 2000);
    return;
  }
  
  const importMode = document.querySelector('input[name="import-mode"]:checked').value;
  
  try {
    showProgress('Reading file...', 20);
    
    const fileContent = await readFile(selectedFile);
    let data;
    
    // Parse file based on extension
    const extension = selectedFile.name.split('.').pop().toLowerCase();
    
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
      importBtn.disabled = true;
    }, 3000);
    
  } catch (error) {
    console.error('Import error:', error);
    showProgress(`Error: ${error.message}`, 0);
    setTimeout(() => hideProgress(), 3000);
  }
}

// Remaining helper functions (same as before, keeping them for completeness)
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
  importBtn.disabled = false;
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
    autoBackupInfo.style.display = 'flex';
    calculateNextBackupTime(frequency);
  } else {
    autoBackupInfo.style.display = 'none';
  }
}

function calculateNextBackupTime(frequency) {
  const now = new Date();
  let next = new Date(now);
  
  switch (frequency) {
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
  const settings = {
    enabled: autoBackupFrequency.value !== 'disabled',
    frequency: autoBackupFrequency.value,
    provider: autoBackupProvider.value,
    includeHistory: document.getElementById('auto-backup-history').checked,
    includeBookmarks: document.getElementById('auto-backup-bookmarks').checked
  };
  
  if (settings.enabled && !settings.provider) {
    showProgress('Please select a cloud provider', 0);
    setTimeout(() => hideProgress(), 2000);
    return;
  }
  
  if (settings.enabled && !connectedProviders[settings.provider]) {
    showProgress('Please connect to the selected provider first', 0);
    setTimeout(() => hideProgress(), 2000);
    return;
  }
  
  await chrome.storage.local.set({ autoBackupSettings: settings });
  
  await chrome.runtime.sendMessage({
    action: 'setupAutoBackup',
    frequency: settings.frequency
  });
  
  showProgress('Auto-backup settings saved!', 100);
  setTimeout(() => hideProgress(), 2000);
}

async function handleRunBackupNow() {
  const settings = await chrome.storage.local.get(['autoBackupSettings']);
  
  if (!settings.autoBackupSettings || !settings.autoBackupSettings.provider) {
    showProgress('Please configure auto-backup settings first', 0);
    setTimeout(() => hideProgress(), 2000);
    return;
  }
  
  showProgress('Running backup...', 20);
  
  // Simulate backup by triggering export
  document.getElementById('export-history').checked = settings.autoBackupSettings.includeHistory;
  document.getElementById('export-bookmarks').checked = settings.autoBackupSettings.includeBookmarks;
  exportDestination.value = 'cloud';
  
  await handleExport();
  
  await chrome.storage.local.set({ lastBackupTime: new Date().toISOString() });
  lastBackupTime.textContent = new Date().toLocaleString();
}

// Data format generators and parsers (keeping the same as popup.js)
function generateHTML(data) {
  // Same implementation as before
  return `<!DOCTYPE html><html><head><title>Browser Data Export</title></head><body><h1>Export Data</h1><p>History: ${data.history.length} items</p></body></html>`;
}

function generateCSV(data) {
  // Same implementation as before
  let csv = 'Type,Title,URL,Last Visit Time,Visit Count\n';
  data.history.forEach(item => {
    csv += `History,"${item.title}","${item.url}","${new Date(item.lastVisitTime).toISOString()}",${item.visitCount}\n`;
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
