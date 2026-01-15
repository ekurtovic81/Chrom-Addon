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

let selectedFile = null;

// Initialize
document.addEventListener('DOMContentLoaded', () => {
  setupEventListeners();
  setDefaultDates();
});

// Setup Event Listeners
function setupEventListeners() {
  // Tab switching
  tabs.forEach(tab => {
    tab.addEventListener('click', () => switchTab(tab));
  });

  // Time period change
  timePeriodSelect.addEventListener('change', handleTimePeriodChange);

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
      startDate = new Date(0); // Unix epoch
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
  
  if (!exportHistory && !exportBookmarks) {
    showProgress('Please select at least one option to export', 0);
    setTimeout(() => hideProgress(), 2000);
    return;
  }
  
  try {
    showProgress('Starting export...', 10);
    
    const data = {
      exportDate: new Date().toISOString(),
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
    
    // Download file
    const blob = new Blob([fileContent], { type: mimeType });
    const url = URL.createObjectURL(blob);
    
    await chrome.downloads.download({
      url: url,
      filename: filename,
      saveAs: true
    });
    
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

// Import Functionality
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
    let bookmarksCount = 0;
    
    // Import History
    if (data.history && data.history.length > 0) {
      showProgress('Importing history...', 50);
      
      if (importMode === 'replace') {
        // Note: Chrome API doesn't allow deleting all history
        showProgress('Note: Chrome does not allow replacing history. Merging instead...', 60);
      }
      
      for (let i = 0; i < data.history.length; i++) {
        try {
          await chrome.history.addUrl({
            url: data.history[i].url,
            title: data.history[i].title
          });
          historyCount++;
        } catch (err) {
          console.warn('Could not import history item:', err);
        }
        
        if (i % 100 === 0) {
          const progress = 60 + (i / data.history.length) * 20;
          showProgress(`Importing history... ${i}/${data.history.length}`, progress);
        }
      }
    }
    
    // Import Bookmarks
    if (data.bookmarks && data.bookmarks.length > 0) {
      showProgress('Importing bookmarks...', 80);
      
      if (importMode === 'replace') {
        // Clear existing bookmarks (except built-in folders)
        const tree = await chrome.bookmarks.getTree();
        await clearBookmarks(tree[0]);
      }
      
      bookmarksCount = await importBookmarkTree(data.bookmarks[0]);
    }
    
    showProgress('Import complete!', 100);
    showStats(historyCount, bookmarksCount);
    
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

// File Handling
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

// Data Format Generators
function generateHTML(data) {
  let html = `<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <title>Browser Data Export</title>
  <style>
    body { font-family: Arial, sans-serif; padding: 20px; max-width: 1200px; margin: 0 auto; }
    h1 { color: #667eea; }
    h2 { color: #764ba2; margin-top: 30px; }
    .info { background: #f0f4f8; padding: 15px; border-radius: 8px; margin-bottom: 20px; }
    table { width: 100%; border-collapse: collapse; margin-top: 10px; }
    th { background: #667eea; color: white; padding: 10px; text-align: left; }
    td { padding: 10px; border-bottom: 1px solid #e2e8f0; }
    tr:hover { background: #f7fafc; }
    .folder { margin-left: 20px; }
    .bookmark { padding: 5px 0; }
    a { color: #667eea; text-decoration: none; }
    a:hover { text-decoration: underline; }
  </style>
</head>
<body>
  <h1>Browser Data Export</h1>
  <div class="info">
    <strong>Export Date:</strong> ${new Date(data.exportDate).toLocaleString()}<br>
    <strong>History Items:</strong> ${data.history.length}<br>
    <strong>Bookmarks:</strong> ${data.bookmarks.length > 0 ? countBookmarks(data.bookmarks[0]) : 0}
  </div>
`;

  if (data.history.length > 0) {
    html += `
  <h2>Browser History</h2>
  <table>
    <tr>
      <th>Title</th>
      <th>URL</th>
      <th>Last Visit</th>
      <th>Visit Count</th>
    </tr>
`;
    data.history.forEach(item => {
      html += `
    <tr>
      <td>${escapeHtml(item.title || 'Untitled')}</td>
      <td><a href="${escapeHtml(item.url)}" target="_blank">${escapeHtml(item.url)}</a></td>
      <td>${new Date(item.lastVisitTime).toLocaleString()}</td>
      <td>${item.visitCount}</td>
    </tr>
`;
    });
    html += `
  </table>
`;
  }

  if (data.bookmarks.length > 0) {
    html += `
  <h2>Bookmarks</h2>
  <div>
${generateBookmarkHTML(data.bookmarks[0])}
  </div>
`;
  }

  html += `
</body>
</html>`;

  return html;
}

function generateBookmarkHTML(node, level = 0) {
  let html = '';
  
  if (node.children) {
    if (node.title) {
      html += `<div class="folder" style="margin-left: ${level * 20}px"><strong>📁 ${escapeHtml(node.title)}</strong></div>`;
    }
    node.children.forEach(child => {
      html += generateBookmarkHTML(child, level + 1);
    });
  } else if (node.url) {
    html += `<div class="bookmark" style="margin-left: ${level * 20}px">🔖 <a href="${escapeHtml(node.url)}" target="_blank">${escapeHtml(node.title || 'Untitled')}</a></div>`;
  }
  
  return html;
}

function generateCSV(data) {
  let csv = 'Type,Title,URL,Last Visit Time,Visit Count,Folder Path\n';
  
  // Add history items
  data.history.forEach(item => {
    csv += `History,"${escapeCSV(item.title || 'Untitled')}","${escapeCSV(item.url)}","${new Date(item.lastVisitTime).toISOString()}",${item.visitCount},""\n`;
  });
  
  // Add bookmarks
  if (data.bookmarks.length > 0) {
    addBookmarksToCSV(data.bookmarks[0], '', csv => csv);
  }
  
  function addBookmarksToCSV(node, path, callback) {
    if (node.children) {
      const newPath = path ? `${path}/${node.title || 'Root'}` : (node.title || 'Root');
      node.children.forEach(child => addBookmarksToCSV(child, newPath, callback));
    } else if (node.url) {
      csv += `Bookmark,"${escapeCSV(node.title || 'Untitled')}","${escapeCSV(node.url)}","${new Date(node.dateAdded || Date.now()).toISOString()}",0,"${escapeCSV(path)}"\n`;
    }
  }
  
  return csv;
}

// Data Format Parsers
function parseHTML(html) {
  const parser = new DOMParser();
  const doc = parser.parseFromString(html, 'text/html');
  const data = { history: [], bookmarks: [] };
  
  // Try to parse history table
  const historyTable = doc.querySelector('table');
  if (historyTable) {
    const rows = historyTable.querySelectorAll('tr');
    for (let i = 1; i < rows.length; i++) {
      const cells = rows[i].querySelectorAll('td');
      if (cells.length >= 4) {
        data.history.push({
          title: cells[0].textContent,
          url: cells[1].querySelector('a')?.href || cells[1].textContent,
          lastVisitTime: new Date(cells[2].textContent).getTime(),
          visitCount: parseInt(cells[3].textContent) || 1
        });
      }
    }
  }
  
  return data;
}

function parseCSV(csv) {
  const data = { history: [], bookmarks: [] };
  const lines = csv.split('\n');
  
  for (let i = 1; i < lines.length; i++) {
    const line = lines[i].trim();
    if (!line) continue;
    
    const values = parseCSVLine(line);
    if (values.length < 4) continue;
    
    if (values[0] === 'History') {
      data.history.push({
        title: values[1],
        url: values[2],
        lastVisitTime: new Date(values[3]).getTime(),
        visitCount: parseInt(values[4]) || 1
      });
    }
  }
  
  return data;
}

function parseCSVLine(line) {
  const values = [];
  let current = '';
  let inQuotes = false;
  
  for (let i = 0; i < line.length; i++) {
    const char = line[i];
    
    if (char === '"') {
      inQuotes = !inQuotes;
    } else if (char === ',' && !inQuotes) {
      values.push(current);
      current = '';
    } else {
      current += char;
    }
  }
  
  values.push(current);
  return values;
}

// Helper Functions
function escapeHtml(text) {
  const div = document.createElement('div');
  div.textContent = text;
  return div.innerHTML;
}

function escapeCSV(text) {
  if (!text) return '';
  return text.replace(/"/g, '""');
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
        // Create folder
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
        // Create bookmark
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
      // Don't delete system folders (id 1 = Bookmarks Bar, id 2 = Other Bookmarks)
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

function showStats(historyCount, bookmarksCount) {
  statsSection.style.display = 'block';
  
  // Animate numbers
  animateNumber(statHistory, 0, historyCount, 1000);
  animateNumber(statBookmarks, 0, bookmarksCount, 1000);
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
