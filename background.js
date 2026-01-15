// Background service worker for Chrome Extension v2.0
// Handles side panel, cloud sync, and scheduled backups
// FIXED: Includes sidePanel API availability check

chrome.runtime.onInstalled.addListener(() => {
  console.log('Export/Import History & Bookmarks extension installed v2.0');
  
  // FIX: Check if sidePanel API is available before using it
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
    console.log('Extension will use popup.html instead');
  }
});

// Handle extension icon click - with fallback
chrome.action.onClicked.addListener((tab) => {
  // FIX: Check if sidePanel is available before trying to open
  if (chrome.sidePanel && chrome.sidePanel.open) {
    chrome.sidePanel.open({ windowId: tab.windowId })
      .then(() => {
        console.log('Side panel opened');
      })
      .catch(error => {
        console.warn('Could not open side panel:', error);
        // Fallback: Open popup manually
        openPopupFallback(tab);
      });
  } else {
    // Fallback to popup if sidePanel is not available
    console.log('Side panel API not available, using popup fallback');
    openPopupFallback(tab);
  }
});

// Fallback function to open popup when side panel is not available
function openPopupFallback(tab) {
  // We can't programmatically open a popup in Manifest V3
  // Instead, we'll set the popup in the manifest for fallback
  console.log('Please click the extension icon to open the popup interface');
  
  // Alternative: Use scripting API to inject content script
  chrome.scripting.executeScript({
    target: { tabId: tab.id },
    files: ['popup.js']
  }).catch(error => {
    console.log('Fallback to using popup.html interface');
  });
}

// Handle scheduled auto-backups
chrome.alarms.onAlarm.addListener(async (alarm) => {
  if (alarm.name === 'auto-backup') {
    console.log('Running scheduled auto-backup...');
    
    // Get backup settings
    const settings = await chrome.storage.local.get(['autoBackupSettings']);
    if (settings.autoBackupSettings?.enabled) {
      // Notify side panel to run backup
      try {
        await chrome.runtime.sendMessage({
          action: 'runAutoBackup',
          settings: settings.autoBackupSettings
        });
      } catch (error) {
        console.log('No extension page listening for auto-backup message');
      }
    }
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
        default:
          delayInMinutes = 24 * 60; // Default to daily
      }
      
      chrome.alarms.create('auto-backup', {
        delayInMinutes: delayInMinutes,
        periodInMinutes: delayInMinutes
      });
      
      console.log(`Auto-backup scheduled: ${frequency} (every ${delayInMinutes} minutes)`);
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
        console.error('OAuth2 authentication error:', error);
        sendResponse({ success: false, error: error.message });
      });
    
    return true;
  }
  
  if (request.action === 'checkSidePanelAvailable') {
    const available = !!(chrome.sidePanel && chrome.sidePanel.setPanelBehavior);
    sendResponse({ available: available, chromeVersion: navigator.userAgent });
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
    throw new Error('Unknown provider: ' + provider);
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
        } else if (redirectUrl) {
          // Extract token from redirect URL
          const urlParams = new URLSearchParams(new URL(redirectUrl).hash.substring(1));
          const token = urlParams.get('access_token');
          
          if (token) {
            resolve(token);
          } else {
            reject(new Error('Failed to extract token from response'));
          }
        } else {
          reject(new Error('Authentication was cancelled'));
        }
      }
    );
  });
}

// Add listener for runtime errors
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.action === 'logError') {
    console.error('Error from content:', message.error);
  }
});

// Initialize on startup
chrome.runtime.onStartup.addListener(() => {
  console.log('Extension starting up...');
});

// Listen for updates
chrome.runtime.onUpdateAvailable.addListener(() => {
  console.log('Update available, reloading extension...');
  chrome.runtime.reload();
});
