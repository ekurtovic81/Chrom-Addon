// Background service worker for Chrome Extension v2.0
// Handles side panel, cloud sync, and scheduled backups

chrome.runtime.onInstalled.addListener(() => {
  console.log('Export/Import History & Bookmarks extension installed v2.0');
  
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
    const settings = await chrome.storage.local.get(['autoBackupSettings']);
    if (settings.autoBackupSettings?.enabled) {
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
          delayInMinutes = 24 * 60;
          break;
        case 'weekly':
          delayInMinutes = 7 * 24 * 60;
          break;
        case 'monthly':
          delayInMinutes = 30 * 24 * 60;
          break;
        default:
          delayInMinutes = 24 * 60;
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
  
  // AUTOMATIC CLOUD AUTHENTICATION - NO MANUAL CREDENTIALS NEEDED
  if (request.action === 'oauth2Authenticate') {
    const { provider } = request;
    
    console.log(`Attempting automatic authentication for: ${provider}`);
    
    // Handle authentication based on provider
    authenticateProvider(provider)
      .then(credentials => {
        sendResponse({ 
          success: true, 
          credentials: credentials,
          message: `Successfully connected to ${provider}`
        });
      })
      .catch(error => {
        console.error(`Authentication failed for ${provider}:`, error);
        
        // If automatic auth fails, use fallback to launchWebAuthFlow
        fallbackAuthentication(provider)
          .then(credentials => {
            sendResponse({
              success: true,
              credentials: credentials,
              message: `Connected to ${provider} using fallback method`
            });
          })
          .catch(fallbackError => {
            sendResponse({
              success: false,
              error: fallbackError.message || 'Authentication failed',
              fallbackError: true
            });
          });
      });
    
    return true; // Keep message channel open
  }
  
  if (request.action === 'checkSidePanelAvailable') {
    const available = !!(chrome.sidePanel && chrome.sidePanel.setPanelBehavior);
    sendResponse({ 
      available: available, 
      chromeVersion: navigator.userAgent 
    });
    return true;
  }
  
  if (request.action === 'updateCloudCredentials') {
    const { provider, credentials } = request;
    
    // Save credentials to storage
    chrome.storage.local.get(['cloudTokens'], (result) => {
      const tokens = result.cloudTokens || {};
      tokens[provider] = credentials;
      chrome.storage.local.set({ cloudTokens: tokens }, () => {
        sendResponse({ success: true });
      });
    });
    
    return true;
  }
  
  if (request.action === 'runAutoBackup') {
    console.log('Manual backup triggered from UI');
    // Just acknowledge - actual backup runs from side panel
    sendResponse({ success: true, message: 'Backup process started' });
    return true;
  }
  
  if (request.action === 'validateCloudToken') {
    const { provider, token } = request;
    
    validateToken(provider, token)
      .then(isValid => {
        sendResponse({ success: true, isValid: isValid });
      })
      .catch(error => {
        sendResponse({ success: false, error: error.message });
      });
    
    return true;
  }
});

// AUTOMATIC AUTHENTICATION FUNCTION
async function authenticateProvider(provider) {
  console.log(`Starting automatic authentication for ${provider}`);
  
  const providerConfig = {
    'google-drive': {
      name: 'Google Drive',
      scopes: ['https://www.googleapis.com/auth/drive.file'],
      autoSupported: true
    },
    'dropbox': {
      name: 'Dropbox',
      scopes: ['files.content.write', 'files.content.read'],
      autoSupported: false
    },
    'onedrive': {
      name: 'OneDrive',
      scopes: ['Files.ReadWrite', 'offline_access'],
      autoSupported: false
    },
    'box': {
      name: 'Box',
      scopes: ['root_readwrite'],
      autoSupported: false
    },
    'pcloud': {
      name: 'pCloud',
      scopes: ['files'],
      autoSupported: false
    },
    'mega': {
      name: 'MEGA',
      scopes: ['readwrite'],
      autoSupported: false
    }
  };
  
  const config = providerConfig[provider];
  if (!config) {
    throw new Error(`Unsupported provider: ${provider}`);
  }
  
  // For Google Drive - use Chrome Identity API (works automatically)
  if (provider === 'google-drive' && chrome.identity && chrome.identity.getAuthToken) {
    return new Promise((resolve, reject) => {
      chrome.identity.getAuthToken({ 
        interactive: true,
        scopes: config.scopes
      }, (token) => {
        if (chrome.runtime.lastError) {
          console.error('Google Drive auth error:', chrome.runtime.lastError);
          reject(new Error(`Google authentication failed: ${chrome.runtime.lastError.message}`));
        } else if (token) {
          console.log('Successfully obtained Google Drive token');
          resolve({
            provider: provider,
            token: token,
            type: 'oauth2',
            timestamp: Date.now(),
            expires_in: 3600,
            automaticallyObtained: true
          });
        } else {
          reject(new Error('No token received from Google'));
        }
      });
    });
  }
  
  // For other providers that don't support automatic auth
  throw new Error(`${config.name} requires manual OAuth2 setup. Please use fallback authentication.`);
}

// FALLBACK AUTHENTICATION - Universal OAuth2 flow
async function fallbackAuthentication(provider) {
  console.log(`Using fallback authentication for ${provider}`);
  
  const providerUrls = {
    'google-drive': {
      authUrl: 'https://accounts.google.com/o/oauth2/auth',
      clientId: '491291805478-cnqldqi78p9ulr9q75mg3i0d7jfjbe92.apps.googleusercontent.com',
      scope: 'https://www.googleapis.com/auth/drive.file'
    },
    'dropbox': {
      authUrl: 'https://www.dropbox.com/oauth2/authorize',
      clientId: 'YOUR_DROPBOX_CLIENT_ID',
      scope: 'files.content.write files.content.read'
    },
    'onedrive': {
      authUrl: 'https://login.microsoftonline.com/common/oauth2/v2.0/authorize',
      clientId: 'YOUR_ONEDRIVE_CLIENT_ID',
      scope: 'Files.ReadWrite offline_access'
    },
    'box': {
      authUrl: 'https://account.box.com/api/oauth2/authorize',
      clientId: 'YOUR_BOX_CLIENT_ID',
      scope: 'root_readwrite'
    },
    'pcloud': {
      authUrl: 'https://my.pcloud.com/oauth2/authorize',
      clientId: 'YOUR_PCLOUD_CLIENT_ID',
      scope: 'files'
    }
  };
  
  const config = providerUrls[provider];
  if (!config) {
    throw new Error(`No fallback configuration for ${provider}`);
  }
  
  return new Promise((resolve, reject) => {
    // Get the redirect URI automatically from Chrome
    const redirectUri = chrome.identity.getRedirectURL();
    console.log(`Using redirect URI: ${redirectUri}`);
    
    // Build OAuth2 URL
    const authUrl = new URL(config.authUrl);
    authUrl.searchParams.append('client_id', config.clientId);
    authUrl.searchParams.append('redirect_uri', redirectUri);
    authUrl.searchParams.append('response_type', 'token');
    authUrl.searchParams.append('scope', config.scope);
    authUrl.searchParams.append('state', provider); // To identify which provider
    
    console.log(`Launching OAuth2 flow for ${provider}`);
    
    chrome.identity.launchWebAuthFlow(
      {
        url: authUrl.toString(),
        interactive: true
      },
      (redirectUrl) => {
        if (chrome.runtime.lastError) {
          const error = chrome.runtime.lastError;
          console.error(`OAuth2 flow error for ${provider}:`, error);
          
          // Special handling for common errors
          if (error.message.includes('client_id')) {
            reject(new Error(`Please configure OAuth2 for ${provider}. Click for instructions.`));
          } else if (error.message.includes('redirect_uri')) {
            reject(new Error(`Redirect URI mismatch. Extension ID: ${chrome.runtime.id}`));
          } else {
            reject(new Error(`Authentication failed: ${error.message}`));
          }
        } else if (redirectUrl) {
          console.log(`OAuth2 redirect received for ${provider}`);
          
          // Extract token from redirect URL
          const token = extractAccessTokenFromUrl(redirectUrl);
          if (token) {
            console.log(`Successfully extracted token for ${provider}`);
            resolve({
              provider: provider,
              token: token,
              type: 'oauth2',
              timestamp: Date.now(),
              expires_in: 3600,
              automaticallyObtained: false,
              method: 'web_auth_flow'
            });
          } else {
            // Try to extract authorization code instead
            const authCode = extractAuthorizationCodeFromUrl(redirectUrl);
            if (authCode) {
              console.log(`Got authorization code for ${provider}`);
              resolve({
                provider: provider,
                code: authCode,
                type: 'oauth2_code',
                timestamp: Date.now(),
                automaticallyObtained: false,
                method: 'web_auth_flow'
              });
            } else {
              reject(new Error('Could not extract token or authorization code from response'));
            }
          }
        } else {
          reject(new Error('Authentication was cancelled by user'));
        }
      }
    );
  });
}

// Helper function to extract access token from URL
function extractAccessTokenFromUrl(url) {
  try {
    const parsedUrl = new URL(url);
    
    // Try hash fragment (implicit grant flow)
    if (parsedUrl.hash) {
      const hashParams = new URLSearchParams(parsedUrl.hash.substring(1));
      const token = hashParams.get('access_token');
      if (token) return token;
    }
    
    // Try query parameters (some providers use this)
    const queryParams = new URLSearchParams(parsedUrl.search);
    const token = queryParams.get('access_token');
    if (token) return token;
    
    return null;
  } catch (error) {
    console.error('Error extracting token from URL:', error);
    return null;
  }
}

// Helper function to extract authorization code from URL
function extractAuthorizationCodeFromUrl(url) {
  try {
    const parsedUrl = new URL(url);
    const queryParams = new URLSearchParams(parsedUrl.search);
    return queryParams.get('code');
  } catch (error) {
    console.error('Error extracting auth code from URL:', error);
    return null;
  }
}

// Validate token by making a test API call
async function validateToken(provider, token) {
  if (!token) return false;
  
  const validationEndpoints = {
    'google-drive': 'https://www.googleapis.com/oauth2/v1/tokeninfo',
    'dropbox': 'https://api.dropboxapi.com/2/users/get_current_account'
  };
  
  const endpoint = validationEndpoints[provider];
  if (!endpoint) {
    // If no validation endpoint, assume token is valid
    return true;
  }
  
  try {
    const response = await fetch(endpoint, {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });
    
    return response.ok;
  } catch (error) {
    console.error(`Token validation failed for ${provider}:`, error);
    return false;
  }
}

// Initialize extension
chrome.runtime.onStartup.addListener(() => {
  console.log('Extension starting up...');
  
  // Clear any expired tokens on startup
  chrome.storage.local.get(['cloudTokens'], (result) => {
    const tokens = result.cloudTokens || {};
    const validTokens = {};
    
    // Filter out expired tokens (simplified check)
    Object.keys(tokens).forEach(provider => {
      const tokenData = tokens[provider];
      if (tokenData.timestamp && (Date.now() - tokenData.timestamp < 3500000)) {
        // Token is less than ~58 minutes old (assuming 1 hour expiry)
        validTokens[provider] = tokenData;
      }
    });
    
    chrome.storage.local.set({ cloudTokens: validTokens });
  });
});

// Handle token refresh for Google Drive
function refreshGoogleToken(oldToken) {
  return new Promise((resolve, reject) => {
    chrome.identity.getAuthToken({ 
      interactive: false 
    }, (newToken) => {
      if (chrome.runtime.lastError) {
        reject(new Error('Token refresh failed'));
      } else {
        resolve(newToken);
      }
    });
  });
}

// Listen for token refresh
chrome.identity.onSignInChanged.addListener((account, signedIn) => {
  console.log('Sign in status changed:', account, signedIn);
  
  if (!signedIn) {
    // User signed out - clear Google tokens
    chrome.storage.local.get(['cloudTokens'], (result) => {
      const tokens = result.cloudTokens || {};
      delete tokens['google-drive'];
      chrome.storage.local.set({ cloudTokens: tokens });
    });
  }
});
