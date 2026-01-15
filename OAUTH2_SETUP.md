# Cloud Storage OAuth2 Setup Guide

## Overview

To use cloud storage features, you need to set up OAuth2 credentials for each provider you want to support. This guide walks you through the process.

## Important Note for Development

The extension includes placeholder OAuth2 configurations. To use cloud storage in production, you'll need to:

1. Register your extension with each cloud provider
2. Obtain OAuth2 client IDs and secrets
3. Update the credentials in `background.js`

## Setting Up Each Provider

### 1. Google Drive

**Step 1:** Go to [Google Cloud Console](https://console.cloud.google.com/)

**Step 2:** Create a new project or select existing one

**Step 3:** Enable Google Drive API
- Go to "APIs & Services" → "Library"
- Search for "Google Drive API"
- Click "Enable"

**Step 4:** Create OAuth2 Credentials
- Go to "APIs & Services" → "Credentials"
- Click "Create Credentials" → "OAuth client ID"
- Application type: "Chrome Extension"
- Add your extension ID (find it in chrome://extensions/)

**Step 5:** Configure OAuth consent screen
- Add application name
- Add scopes: `https://www.googleapis.com/auth/drive.file`
- Add test users (for development)

**Step 6:** Copy the Client ID and update in `manifest.json`:
```json
"oauth2": {
  "client_id": "YOUR_GOOGLE_CLIENT_ID.apps.googleusercontent.com",
  "scopes": ["https://www.googleapis.com/auth/drive.file"]
}
```

---

### 2. Dropbox

**Step 1:** Go to [Dropbox App Console](https://www.dropbox.com/developers/apps)

**Step 2:** Click "Create app"
- Choose "Scoped access"
- Choose "Full Dropbox" or "App folder"
- Name your app

**Step 3:** Configure permissions
- Go to "Permissions" tab
- Enable: `files.content.write`, `files.content.read`

**Step 4:** Get credentials
- Go to "Settings" tab
- Copy "App key" (this is your client_id)

**Step 5:** Add redirect URI
- Add: `https://<your-extension-id>.chromiumapp.org/`
- Get extension ID from chrome://extensions/

**Step 6:** Update `background.js`:
```javascript
'dropbox': {
  url: 'https://www.dropbox.com/oauth2/authorize',
  client_id: 'YOUR_DROPBOX_CLIENT_ID',
  ...
}
```

---

### 3. OneDrive (Microsoft)

**Step 1:** Go to [Azure Portal](https://portal.azure.com/)

**Step 2:** Register application
- Navigate to "Azure Active Directory" → "App registrations"
- Click "New registration"
- Name: Your extension name
- Supported account types: "Personal Microsoft accounts only"

**Step 3:** Add platform
- Go to "Authentication"
- Add platform: "Single-page application"
- Redirect URI: `https://<your-extension-id>.chromiumapp.org/`

**Step 4:** API permissions
- Go to "API permissions"
- Add: `Files.ReadWrite`, `offline_access`

**Step 5:** Copy Application (client) ID

**Step 6:** Update `background.js`:
```javascript
'onedrive': {
  url: 'https://login.microsoftonline.com/common/oauth2/v2.0/authorize',
  client_id: 'YOUR_ONEDRIVE_CLIENT_ID',
  ...
}
```

---

### 4. Box

**Step 1:** Go to [Box Developer Console](https://app.box.com/developers/console)

**Step 2:** Create new app
- Click "Create New App"
- Choose "Custom App"
- Authentication method: "Standard OAuth 2.0"

**Step 3:** Configure OAuth2
- Add redirect URI: `https://<your-extension-id>.chromiumapp.org/`
- Scopes: Select "Read and write all files and folders"

**Step 4:** Copy Client ID

**Step 5:** Update `background.js`:
```javascript
'box': {
  url: 'https://account.box.com/api/oauth2/authorize',
  client_id: 'YOUR_BOX_CLIENT_ID',
  ...
}
```

---

### 5. pCloud

**Step 1:** Go to [pCloud App Console](https://docs.pcloud.com/)

**Step 2:** Register your app
- Request API access from pCloud support
- Provide your app details

**Step 3:** Receive credentials
- pCloud will provide your client_id and app_key

**Step 4:** Update `background.js`:
```javascript
'pcloud': {
  url: 'https://my.pcloud.com/oauth2/authorize',
  client_id: 'YOUR_PCLOUD_CLIENT_ID',
  ...
}
```

---

### 6. MEGA

**Step 1:** MEGA uses a different authentication approach

**Step 2:** You'll need to implement MEGA's SDK
- Visit: https://github.com/meganz/sdk

**Step 3:** Or use email/password authentication
- MEGA doesn't support standard OAuth2
- Alternative: Use API key authentication

**Step 4:** For now, this is a placeholder in the extension

---

## Testing OAuth2 Flow

### 1. Install Extension
```bash
# Load unpacked extension in chrome://extensions/
```

### 2. Get Extension ID
- Go to chrome://extensions/
- Copy your extension ID (e.g., `abcdefghijklmnopqrstuvwxyz123456`)

### 3. Update Redirect URIs
- For each provider, add:
- `https://abcdefghijklmnopqrstuvwxyz123456.chromiumapp.org/`

### 4. Test Connection
- Open extension side panel
- Go to "Cloud" tab
- Click "Connect" for your provider
- Authorize access in popup window

---

## Development Mode

For development and testing, you can:

1. **Use Test Mode**
   - Most providers offer sandbox/test environments
   - Use test credentials that don't require approval

2. **Local Testing**
   - Some providers allow localhost for testing
   - Update redirect URI to use localhost

3. **Mock Mode**
   - The extension includes mock cloud functionality
   - Works without real OAuth2 credentials
   - Shows placeholder data

---

## Security Best Practices

### 1. Never Commit Credentials
```bash
# Add to .gitignore
config/credentials.js
*.pem
*.key
```

### 2. Use Environment Variables
```javascript
const CLIENT_ID = process.env.GOOGLE_CLIENT_ID || 'YOUR_CLIENT_ID';
```

### 3. Rotate Credentials Regularly
- Generate new credentials every 90 days
- Revoke old credentials

### 4. Limit Scopes
- Only request necessary permissions
- Use read-only when possible

---

## Troubleshooting

### "Redirect URI mismatch" Error
**Solution:** Make sure redirect URI in provider console matches:
```
https://<your-extension-id>.chromiumapp.org/
```

### "Invalid client_id" Error
**Solution:** 
- Verify client ID is correct
- Check if app is enabled
- Wait a few minutes after creating credentials

### "Access denied" Error
**Solution:**
- Check if user granted all permissions
- Verify scopes are correct
- Check if OAuth consent screen is configured

### Token Expired
**Solution:**
- Implement token refresh logic
- Request `offline_access` scope
- Store refresh tokens securely

---

## Quick Start (Development)

For quick testing without setting up OAuth2:

1. Use the extension in "local-only" mode
2. Only use "Local Download" option for exports
3. Skip cloud storage features

The extension works perfectly without cloud features!

---

## Production Deployment

When publishing to Chrome Web Store:

1. **Set up all OAuth2 credentials** as described above
2. **Update manifest.json** with production values
3. **Add privacy policy** explaining data usage
4. **Submit for review** with proper documentation
5. **Configure OAuth consent screens** for public access

---

## API Rate Limits

Be aware of rate limits:

- **Google Drive:** 1000 requests per 100 seconds per user
- **Dropbox:** Varies by plan, typically 120 requests per minute
- **OneDrive:** Varies, typically 10,000 requests per day
- **Box:** Varies by plan
- **pCloud:** Check with pCloud
- **MEGA:** Check with MEGA

Implement retry logic and respect rate limits!

---

## Support

If you need help setting up OAuth2:

1. Check provider's official documentation
2. Use provider's developer forums
3. Review sample code in extension
4. Contact provider support

---

**Version:** 2.0  
**Last Updated:** January 2024

Made with ❤️ for developers
