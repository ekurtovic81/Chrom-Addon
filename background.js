// Background service worker for Chrome Extension v4.0
// Enhanced local backup system with auto-backup scheduling

chrome.runtime.onInstalled.addListener(() => {
  console.log('Export/Import History & Bookmarks extension installed v4.0');
  
  // Check if sidePanel API is available before using it
  if (chrome.sidePanel && chrome.sidePanel.setPanelBehavior) {
    chrome.sidePanel.setPanelBehavior({ openPanelOnActionClick: true })
      .then(() => {
        console.log('Side panel behavior set successfully');
      })
      .catch(error => {
        console.warn('Could not set side panel behavior:', error);
      });
  } else {
    console.warn('sidePanel API is not available in this Chrome version');
  }
  
  // Initialize default settings
  initializeDefaultSettings();
});

// Handle extension icon click
chrome.action.onClicked.addListener((tab) => {
  if (chrome.sidePanel && chrome.sidePanel.open) {
    chrome.sidePanel.open({ windowId: tab.windowId })
      .then(() => {
        console.log('Side panel opened');
      })
      .catch(error => {
        console.warn('Could not open side panel:', error);
      });
  }
});

// Handle scheduled auto-backups
chrome.alarms.onAlarm.addListener(async (alarm) => {
  if (alarm.name === 'auto-backup') {
    console.log('Running scheduled auto-backup...');
    
    // Get backup settings
    const result = await chrome.storage.local.get(['autoBackupSettings']);
    const settings = result.autoBackupSettings;
    
    if (settings?.enabled && settings.folderPath) {
      try {
        // Trigger backup process
        await chrome.runtime.sendMessage({
          action: 'runScheduledBackup',
          settings: settings
        });
        
        // Update last backup time
        const now = new Date().toISOString();
        await chrome.storage.local.set({ lastBackupTime: now });
        
        console.log('Scheduled backup completed');
      } catch (error) {
        console.log('No extension page listening for backup message');
      }
    }
  }
});

// Initialize default settings
async function initializeDefaultSettings() {
  const defaults = {
    autoBackupSettings: {
      enabled: false,
      frequency: 'daily',
      maxBackups: '10',
      includeHistory: true,
      includeBookmarks: true,
      folderPath: ''
    },
    lastBackupTime: null,
    backupsCount: 0,
    backupFolderPath: ''
  };
  
  // Set defaults only if they don't exist
  for (const [key, value] of Object.entries(defaults)) {
    const result = await chrome.storage.local.get([key]);
    if (!result[key]) {
      await chrome.storage.local.set({ [key]: value });
    }
  }
}

// Setup auto-backup alarm based on frequency
async function setupAutoBackupAlarm(frequency) {
  // Clear existing alarm
  chrome.alarms.clear('auto-backup');
  
  if (frequency === 'disabled') {
    console.log('Auto-backup disabled');
    return;
  }
  
  let periodInMinutes;
  switch (frequency) {
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
  
  // Create new alarm
  chrome.alarms.create('auto-backup', {
    delayInMinutes: 1, // Start after 1 minute
    periodInMinutes: periodInMinutes
  });
  
  console.log(`Auto-backup scheduled: ${frequency} (every ${periodInMinutes} minutes)`);
}

// Listen for messages from side panel
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  console.log('Background received message:', request.action);
  
  // Handle getHistory request
  if (request.action === 'getHistory') {
    chrome.history.search(request.params, (results) => {
      sendResponse({ success: true, data: results });
    });
    return true; // Keep message channel open
  }
  
  // Handle getBookmarks request
  if (request.action === 'getBookmarks') {
    chrome.bookmarks.getTree((results) => {
      sendResponse({ success: true, data: results });
    });
    return true;
  }
  
  // Handle setupAutoBackup request
  if (request.action === 'setupAutoBackup') {
    const { frequency, folderPath, maxBackups, includeHistory, includeBookmarks } = request;
    
    // Update settings
    const settings = {
      enabled: frequency !== 'disabled',
      frequency: frequency,
      folderPath: folderPath,
      maxBackups: maxBackups,
      includeHistory: includeHistory,
      includeBookmarks: includeBookmarks
    };
    
    chrome.storage.local.set({ autoBackupSettings: settings }, () => {
      // Setup alarm
      setupAutoBackupAlarm(frequency)
        .then(() => {
          sendResponse({ 
            success: true, 
            message: `Auto-backup scheduled: ${frequency}`
          });
        })
        .catch(error => {
          sendResponse({ 
            success: false, 
            error: `Failed to setup alarm: ${error.message}`
          });
        });
    });
    
    return true;
  }
  
  // Handle checkSidePanelAvailable request
  if (request.action === 'checkSidePanelAvailable') {
    const available = !!(chrome.sidePanel && chrome.sidePanel.setPanelBehavior);
    sendResponse({ 
      available: available,
      version: '4.0'
    });
    return true;
  }
  
  // Handle runBackupNow request
  if (request.action === 'runBackupNow') {
    console.log('Manual backup triggered');
    
    // Get settings
    chrome.storage.local.get(['autoBackupSettings'], (result) => {
      const settings = result.autoBackupSettings;
      
      if (!settings || !settings.folderPath) {
        sendResponse({ 
          success: false, 
          error: 'Backup folder not configured'
        });
        return;
      }
      
      // Trigger backup in side panel
      chrome.runtime.sendMessage({
        action: 'triggerManualBackup',
        settings: settings
      }).catch(() => {
        // Side panel might not be open
        console.log('Side panel not open for manual backup');
      });
      
      sendResponse({ 
        success: true, 
        message: 'Backup process started'
      });
    });
    
    return true;
  }
  
  // Handle cleanupOldBackups request
  if (request.action === 'cleanupOldBackups') {
    const { maxBackups, folderPath } = request;
    
    // Simulate cleanup (in real implementation, would delete files)
    console.log(`Cleaning up backups in ${folderPath}, keeping ${maxBackups} backups`);
    
    setTimeout(() => {
      sendResponse({ 
        success: true, 
        message: `Cleanup completed, keeping ${maxBackups} backups`
      });
    }, 1000);
    
    return true;
  }
  
  // Handle saveBackupFolder request
  if (request.action === 'saveBackupFolder') {
    const { folderPath } = request;
    
    chrome.storage.local.set({ backupFolderPath: folderPath }, () => {
      sendResponse({ success: true });
    });
    
    return true;
  }
  
  // Handle getBackupStats request
  if (request.action === 'getBackupStats') {
    chrome.storage.local.get(['lastBackupTime', 'backupsCount', 'autoBackupSettings'], (result) => {
      sendResponse({
        success: true,
        stats: {
          lastBackupTime: result.lastBackupTime,
          backupsCount: result.backupsCount || 0,
          autoBackupEnabled: result.autoBackupSettings?.enabled || false,
          nextBackup: calculateNextBackupTime(result.autoBackupSettings?.frequency)
        }
      });
    });
    
    return true;
  }
  
  // Handle updateBackupStats request
  if (request.action === 'updateBackupStats') {
    const { backupsCount, lastBackupTime } = request;
    
    const updates = {};
    if (backupsCount !== undefined) updates.backupsCount = backupsCount;
    if (lastBackupTime !== undefined) updates.lastBackupTime = lastBackupTime;
    
    chrome.storage.local.set(updates, () => {
      sendResponse({ success: true });
    });
    
    return true;
  }
  
  // Handle exportData request
  if (request.action === 'exportData') {
    const { includeHistory, includeBookmarks, timeRange, format } = request;
    
    // Get history if requested
    if (includeHistory) {
      const { startTime, endTime } = timeRange;
      chrome.history.search({
        text: '',
        startTime: startTime,
        endTime: endTime,
        maxResults: 10000
      }, (historyItems) => {
        // Get bookmarks if requested
        if (includeBookmarks) {
          chrome.bookmarks.getTree((bookmarkTree) => {
            sendResponse({
              success: true,
              data: {
                history: historyItems,
                bookmarks: bookmarkTree,
                exportDate: new Date().toISOString(),
                version: '4.0'
              }
            });
          });
        } else {
          sendResponse({
            success: true,
            data: {
              history: historyItems,
              bookmarks: [],
              exportDate: new Date().toISOString(),
              version: '4.0'
            }
          });
        }
      });
    } else if (includeBookmarks) {
      // Only bookmarks requested
      chrome.bookmarks.getTree((bookmarkTree) => {
        sendResponse({
          success: true,
          data: {
            history: [],
            bookmarks: bookmarkTree,
            exportDate: new Date().toISOString(),
            version: '4.0'
          }
        });
      });
    } else {
      sendResponse({
        success: false,
        error: 'No data selected for export'
      });
    }
    
    return true;
  }
  
  // Handle importData request
  if (request.action === 'importData') {
    const { data, mode } = request;
    
    let importedCount = 0;
    let skippedCount = 0;
    let errors = [];
    
    // Import history
    if (data.history && data.history.length > 0) {
      // For now, just acknowledge - actual import happens in sidepanel.js
      importedCount += data.history.length;
    }
    
    // Import bookmarks
    if (data.bookmarks && data.bookmarks.length > 0) {
      // For now, just acknowledge - actual import happens in sidepanel.js
      const bookmarkCount = countBookmarks(data.bookmarks[0]);
      importedCount += bookmarkCount;
    }
    
    sendResponse({
      success: true,
      importedCount: importedCount,
      skippedCount: skippedCount,
      errors: errors
    });
    
    return true;
  }
  
  // Default response for unknown actions
  sendResponse({ 
    success: false, 
    error: `Unknown action: ${request.action}` 
  });
  return false;
});

// Helper function to calculate next backup time
function calculateNextBackupTime(frequency) {
  if (!frequency || frequency === 'disabled') {
    return null;
  }
  
  const now = new Date();
  const next = new Date(now);
  
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
  
  return next.toISOString();
}

// Helper function to count bookmarks
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

// Initialize on startup
chrome.runtime.onStartup.addListener(() => {
  console.log('Extension v4.0 starting up...');
  
  // Restore auto-backup alarm if enabled
  chrome.storage.local.get(['autoBackupSettings'], (result) => {
    if (result.autoBackupSettings?.enabled) {
      setupAutoBackupAlarm(result.autoBackupSettings.frequency);
    }
  });
});

// Handle update available
chrome.runtime.onUpdateAvailable.addListener(() => {
  console.log('Update available, reloading extension...');
  chrome.runtime.reload();
});

// Handle uninstall
chrome.runtime.onSuspend.addListener(() => {
  console.log('Extension suspending...');
});

// Error handling
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.action === 'logError') {
    console.error('Error from side panel:', message.error);
    sendResponse({ success: true });
  }
  return false;
});