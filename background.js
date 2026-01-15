// Background service worker for Chrome Extension v2.0 - DEVELOPMENT VERSION
// Cloud features disabled until you set up real OAuth2 credentials

chrome.runtime.onInstalled.addListener(() => {
  console.log('Export/Import History & Bookmarks extension installed v2.0 - DEVELOPMENT MODE');
  
  // Check if sidePanel API is available
  if (chrome.sidePanel && chrome.sidePanel.setPanelBehavior) {
    chrome.sidePanel.setPanelBehavior({ openPanelOnActionClick: true })
      .then(() => {
        console.log('Side panel behavior set successfully');
      })
      .catch(error => {
        console.warn('Could not set side panel behavior:', error);
      });
  }
});

// Handle extension icon click
chrome.action.onClicked.addListener((tab) => {
  if (chrome.sidePanel && chrome.sidePanel.open) {
    chrome.sidePanel.open({ windowId: tab.windowId })
      .catch(error => {
        console.warn('Could not open side panel:', error);
      });
  }
});

// Listen for messages from side panel
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  console.log('Background received message:', request.action);
  
  if (request.action === 'getHistory') {
    chrome.history.search(request.params, (results) => {
      sendResponse({ success: true, data: results });
    });
    return true;
  }
  
  if (request.action === 'getBookmarks') {
    chrome.bookmarks.getTree((results) => {
      sendResponse({ success: true, data: results });
    });
    return true;
  }
  
  if (request.action === 'setupAutoBackup') {
    const { frequency } = request;
    
    chrome.alarms.clear('auto-backup');
    
    if (frequency !== 'disabled') {
      let delayInMinutes;
      switch (frequency) {
        case 'daily': delayInMinutes = 24 * 60; break;
        case 'weekly': delayInMinutes = 7 * 24 * 60; break;
        case 'monthly': delayInMinutes = 30 * 24 * 60; break;
        default: delayInMinutes = 24 * 60;
      }
      
      chrome.alarms.create('auto-backup', {
        delayInMinutes: delayInMinutes,
        periodInMinutes: delayInMinutes
      });
      
      console.log(`Auto-backup scheduled (simulated): ${frequency}`);
      sendResponse({ success: true, message: `Auto-backup scheduled: ${frequency} (DEVELOPMENT MODE)` });
    } else {
      sendResponse({ success: true, message: 'Auto-backup disabled' });
    }
    
    return true;
  }
  
  // DEVELOPMENT MODE: Simulate OAuth2 without real credentials
  if (request.action === 'oauth2Authenticate') {
    const { provider } = request;
    
    console.log(`DEVELOPMENT MODE: Simulating OAuth2 for ${provider}`);
    
    // Simulate successful connection after delay
    setTimeout(() => {
      // Generate a fake token for development
      const fakeToken = `dev_token_${provider}_${Date.now()}`;
      
      // Store in local storage
      chrome.storage.local.get(['cloudTokens'], (result) => {
        const tokens = result.cloudTokens || {};
        tokens[provider] = fakeToken;
        chrome.storage.local.set({ cloudTokens: tokens }, () => {
          sendResponse({ 
            success: true, 
            token: fakeToken,
            warning: 'DEVELOPMENT MODE: Using simulated cloud connection'
          });
        });
      });
    }, 1000);
    
    return true; // Keep message channel open
  }
  
  if (request.action === 'checkSidePanelAvailable') {
    const available = !!(chrome.sidePanel && chrome.sidePanel.setPanelBehavior);
    sendResponse({ available: available });
    return true;
  }
  
  if (request.action === 'runAutoBackup') {
    console.log('DEVELOPMENT MODE: Auto-backup triggered (simulated)');
    // Simulate backup by logging
    chrome.storage.local.set({ lastBackupTime: new Date().toISOString() });
    sendResponse({ success: true, message: 'Backup completed (simulated)' });
    return true;
  }
});

// Handle scheduled auto-backups
chrome.alarms.onAlarm.addListener(async (alarm) => {
  if (alarm.name === 'auto-backup') {
    console.log('DEVELOPMENT MODE: Running simulated auto-backup...');
    
    const settings = await chrome.storage.local.get(['autoBackupSettings']);
    if (settings.autoBackupSettings?.enabled) {
      // Just log for development
      console.log('Backup would run now with settings:', settings.autoBackupSettings);
      chrome.storage.local.set({ lastBackupTime: new Date().toISOString() });
    }
  }
});

// Initialize on startup
chrome.runtime.onStartup.addListener(() => {
  console.log('Extension starting up - DEVELOPMENT MODE');
});
