// Background service worker for Chrome Extension
// Handles side panel, cloud sync, and scheduled backups

chrome.runtime.onInstalled.addListener(() => {
  console.log('Export/Import History & Bookmarks extension installed v2.0');
  
  // Enable side panel for all tabs
  chrome.sidePanel.setPanelBehavior({ openPanelOnActionClick: true });
});

// Open side panel when extension icon is clicked
chrome.action.onClicked.addListener((tab) => {
  chrome.sidePanel.open({ windowId: tab.windowId });
});

// Handle scheduled auto-backups
chrome.alarms.onAlarm.addListener(async (alarm) => {
  if (alarm.name === 'auto-backup') {
    console.log('Running scheduled auto-backup...');
    
    // Get backup settings
    const settings = await chrome.storage.local.get(['autoBackupSettings']);
    if (settings.autoBackupSettings?.enabled) {
      // Notify side panel to run backup
      chrome.runtime.sendMessage({
        action: 'runAutoBackup',
        settings: settings.autoBackupSettings
      });
    }
  }
});

// Listen for messages from side panel
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
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
    
    // Clear existing alarms
    chrome.alarms.clear('auto-backup');
    
    // Create new alarm based on frequency
    if (frequency !== 'disabled') {
      let delayInMinutes;
      switch (frequency) {
        case 'daily':
          delayInMinutes = 24 * 60; // 24 hours
          break;
        case 'weekly':
          delayInMinutes = 7 * 24 * 60; // 7 days
          break;
        case 'monthly':
          delayInMinutes = 30 * 24 * 60; // 30 days
          break;
      }
      
      chrome.alarms.create('auto-backup', {
        delayInMinutes: delayInMinutes,
        periodInMinutes: delayInMinutes
      });
      
      sendResponse({ success: true, message: `Auto-backup scheduled: ${frequency}` });
    } else {
      sendResponse({ success: true, message: 'Auto-backup disabled' });
    }
    
    return true;
  }
  
  if (request.action === 'oauth2Authenticate') {
    const { provider } = request;
    
    // OAuth2 authentication flow
    authenticateProvider(provider)
      .then(token => {
        sendResponse({ success: true, token: token });
      })
      .catch(error => {
        sendResponse({ success: false, error: error.message });
      });
    
    return true;
  }
});

// OAuth2 authentication helper
async function authenticateProvider(provider) {
  const authConfigs = {
    'google-drive': {
      url: 'https://accounts.google.com/o/oauth2/auth',
      client_id: 'YOUR_GOOGLE_CLIENT_ID',
      scope: 'https://www.googleapis.com/auth/drive.file',
      redirect_uri: chrome.identity.getRedirectURL()
    },
    'dropbox': {
      url: 'https://www.dropbox.com/oauth2/authorize',
      client_id: 'YOUR_DROPBOX_CLIENT_ID',
      scope: 'files.content.write files.content.read',
      redirect_uri: chrome.identity.getRedirectURL()
    },
    'onedrive': {
      url: 'https://login.microsoftonline.com/common/oauth2/v2.0/authorize',
      client_id: 'YOUR_ONEDRIVE_CLIENT_ID',
      scope: 'Files.ReadWrite offline_access',
      redirect_uri: chrome.identity.getRedirectURL()
    },
    'box': {
      url: 'https://account.box.com/api/oauth2/authorize',
      client_id: 'YOUR_BOX_CLIENT_ID',
      scope: 'root_readwrite',
      redirect_uri: chrome.identity.getRedirectURL()
    },
    'pcloud': {
      url: 'https://my.pcloud.com/oauth2/authorize',
      client_id: 'YOUR_PCLOUD_CLIENT_ID',
      scope: 'files',
      redirect_uri: chrome.identity.getRedirectURL()
    },
    'mega': {
      url: 'https://mega.nz/oauth/authorize',
      client_id: 'YOUR_MEGA_CLIENT_ID',
      scope: 'readwrite',
      redirect_uri: chrome.identity.getRedirectURL()
    }
  };
  
  const config = authConfigs[provider];
  if (!config) {
    throw new Error('Unknown provider');
  }
  
  const authUrl = `${config.url}?client_id=${config.client_id}&redirect_uri=${encodeURIComponent(config.redirect_uri)}&response_type=token&scope=${encodeURIComponent(config.scope)}`;
  
  return new Promise((resolve, reject) => {
    chrome.identity.launchWebAuthFlow(
      {
        url: authUrl,
        interactive: true
      },
      (redirectUrl) => {
        if (chrome.runtime.lastError) {
          reject(new Error(chrome.runtime.lastError.message));
        } else {
          // Extract token from redirect URL
          const token = new URL(redirectUrl).hash.match(/access_token=([^&]*)/)?.[1];
          if (token) {
            resolve(token);
          } else {
            reject(new Error('Failed to extract token'));
          }
        }
      }
    );
  });
}
