// cloudAuth.js - Helper for automatic cloud credentials fetching from browser

class CloudAuth {
  constructor() {
    this.providers = {
      'google-drive': {
        name: 'Google Drive',
        authType: 'oauth2',
        scope: 'https://www.googleapis.com/auth/drive.file',
        authUrl: 'https://accounts.google.com/o/oauth2/auth'
      },
      'dropbox': {
        name: 'Dropbox',
        authType: 'oauth2',
        scope: 'files.content.write files.content.read',
        authUrl: 'https://www.dropbox.com/oauth2/authorize'
      },
      'onedrive': {
        name: 'OneDrive',
        authType: 'oauth2',
        scope: 'Files.ReadWrite offline_access',
        authUrl: 'https://login.microsoftonline.com/common/oauth2/v2.0/authorize'
      },
      'box': {
        name: 'Box',
        authType: 'oauth2',
        scope: 'root_readwrite',
        authUrl: 'https://account.box.com/api/oauth2/authorize'
      },
      'pcloud': {
        name: 'pCloud',
        authType: 'oauth2',
        scope: 'files',
        authUrl: 'https://my.pcloud.com/oauth2/authorize'
      },
      'mega': {
        name: 'MEGA',
        authType: 'apiKey',
        scope: 'readwrite',
        authUrl: null // MEGA has different system
      }
    };
  }

  /**
   * Dynamically fetch credentials for cloud provider
   * @param {string} provider - Provider name
   * @returns {Promise<Object>} - Credentials and access token
   */
  async getCredentials(provider) {
    console.log(`Attempting to get credentials for: ${provider}`);
    
    const providerConfig = this.providers[provider];
    if (!providerConfig) {
      throw new Error(`Unknown provider: ${provider}`);
    }

    if (providerConfig.authType === 'oauth2') {
      return await this.handleOAuth2(provider, providerConfig);
    } else if (providerConfig.authType === 'apiKey') {
      return await this.handleApiKey(provider, providerConfig);
    }

    throw new Error(`Unsupported auth type for ${provider}`);
  }

  /**
   * Handle OAuth2 flow through Chrome Identity API
   */
  async handleOAuth2(provider, config) {
    return new Promise((resolve, reject) => {
      // Use Chrome Identity API which automatically handles OAuth2
      chrome.identity.getAuthToken(
        {
          interactive: true,
          accountHint: '', // This will prompt user to choose account
        },
        (token) => {
          if (chrome.runtime.lastError) {
            console.error(`OAuth2 error for ${provider}:`, chrome.runtime.lastError);
            
            // If Chrome Identity API doesn't work, try alternative way
            this.fallbackOAuth2(provider, config)
              .then(resolve)
              .catch(reject);
          } else if (token) {
            console.log(`Successfully got token for ${provider}`);
            resolve({
              provider: provider,
              token: token,
              type: 'oauth2',
              timestamp: Date.now(),
              expires_in: 3600 // Google tokens last 1 hour
            });
          } else {
            reject(new Error(`Failed to get token for ${provider}`));
          }
        }
      );
    });
  }

  /**
   * Fallback method for OAuth2 if Chrome Identity API doesn't work
   */
  async fallbackOAuth2(provider, config) {
    console.log(`Using fallback OAuth2 for ${provider}`);
    
    // Create custom OAuth2 URL
    const redirectUri = chrome.identity.getRedirectURL();
    const authUrl = `${config.authUrl}?client_id=YOUR_CLIENT_ID&redirect_uri=${encodeURIComponent(redirectUri)}&response_type=token&scope=${encodeURIComponent(config.scope)}`;
    
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
            const token = this.extractTokenFromUrl(redirectUrl);
            if (token) {
              resolve({
                provider: provider,
                token: token,
                type: 'oauth2',
                timestamp: Date.now(),
                expires_in: 3600
              });
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

  /**
   * Handle API Key authentication (for MEGA and similar)
   */
  async handleApiKey(provider, config) {
    console.log(`API Key authentication for ${provider}`);
    
    // Show API key input window
    const apiKey = await this.showApiKeyPrompt(provider);
    
    if (!apiKey) {
      throw new Error('API Key is required');
    }
    
    return {
      provider: provider,
      apiKey: apiKey,
      type: 'apiKey',
      timestamp: Date.now()
    };
  }

  /**
   * Show API key input prompt
   */
  async showApiKeyPrompt(provider) {
    return new Promise((resolve) => {
      // Create overlay for API key input
      const overlay = document.createElement('div');
      overlay.style.cssText = `
        position: fixed;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        background: rgba(0,0,0,0.5);
        display: flex;
        justify-content: center;
        align-items: center;
        z-index: 9999;
      `;
      
      const modal = document.createElement('div');
      modal.style.cssText = `
        background: white;
        padding: 20px;
        border-radius: 8px;
        width: 400px;
        max-width: 90%;
      `;
      
      modal.innerHTML = `
        <h3 style="margin-top: 0;">Connect to ${this.providers[provider].name}</h3>
        <p style="color: #666; font-size: 14px; margin-bottom: 20px;">
          Please enter your ${this.providers[provider].name} API Key to connect.
        </p>
        <input type="password" id="apiKeyInput" placeholder="Enter your API Key" 
               style="width: 100%; padding: 10px; margin-bottom: 15px; border: 1px solid #ccc; border-radius: 4px;">
        <div style="display: flex; justify-content: flex-end; gap: 10px;">
          <button id="cancelBtn" style="padding: 8px 16px; border: 1px solid #ccc; background: white; border-radius: 4px; cursor: pointer;">
            Cancel
          </button>
          <button id="connectBtn" style="padding: 8px 16px; background: #667eea; color: white; border: none; border-radius: 4px; cursor: pointer;">
            Connect
          </button>
        </div>
      `;
      
      overlay.appendChild(modal);
      document.body.appendChild(overlay);
      
      // Event handlers
      const apiKeyInput = modal.querySelector('#apiKeyInput');
      const cancelBtn = modal.querySelector('#cancelBtn');
      const connectBtn = modal.querySelector('#connectBtn');
      
      cancelBtn.onclick = () => {
        document.body.removeChild(overlay);
        resolve(null);
      };
      
      connectBtn.onclick = () => {
        const apiKey = apiKeyInput.value.trim();
        if (apiKey) {
          document.body.removeChild(overlay);
          resolve(apiKey);
        } else {
          apiKeyInput.style.borderColor = 'red';
          apiKeyInput.focus();
        }
      };
      
      // Enter key support
      apiKeyInput.onkeypress = (e) => {
        if (e.key === 'Enter') {
          connectBtn.click();
        }
      };
      
      apiKeyInput.focus();
    });
  }

  /**
   * Extract token from redirect URL
   */
  extractTokenFromUrl(url) {
    try {
      const parsedUrl = new URL(url);
      // Try hash fragment first (implicit flow)
      const hashParams = new URLSearchParams(parsedUrl.hash.substring(1));
      let token = hashParams.get('access_token');
      
      // If not in hash, try query params (auth code flow)
      if (!token) {
        const queryParams = new URLSearchParams(parsedUrl.search);
        token = queryParams.get('access_token') || queryParams.get('code');
      }
      
      return token;
    } catch (error) {
      console.error('Error extracting token:', error);
      return null;
    }
  }

  /**
   * Validate existing token
   */
  async validateToken(provider, token) {
    try {
      const response = await fetch(this.getValidationUrl(provider), {
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

  /**
   * Return validation URL for provider
   */
  getValidationUrl(provider) {
    const urls = {
      'google-drive': 'https://www.googleapis.com/oauth2/v1/tokeninfo',
      'dropbox': 'https://api.dropboxapi.com/2/users/get_current_account',
      'onedrive': 'https://graph.microsoft.com/v1.0/me',
      'box': 'https://api.box.com/2.0/users/me',
      'pcloud': 'https://api.pcloud.com/userinfo'
    };
    
    return urls[provider] || null;
  }

  /**
   * Update cloud connection in sidepanel.js
   */
  async updateConnection(provider, credentials) {
    try {
      // Send credentials to background script
      const response = await chrome.runtime.sendMessage({
        action: 'updateCloudCredentials',
        provider: provider,
        credentials: credentials
      });
      
      return response.success;
    } catch (error) {
      console.error('Error updating connection:', error);
      return false;
    }
  }
}

// Create global instance
window.cloudAuth = new CloudAuth();
