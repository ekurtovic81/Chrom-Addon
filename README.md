# Export/Import History & Bookmarks - Chrome Extension v2.0

A powerful Chrome extension that allows you to export and import your browser history and bookmarks with cloud sync, automatic backups, and intelligent duplicate detection.

## 🆕 What's New in v2.0

### Side Panel Interface
- Opens on the right side of your browser for easy access
- Always accessible without blocking your browsing
- Larger, more comfortable interface

### Cloud Storage Integration
- **6 Cloud Providers Supported:**
  - Google Drive
  - Dropbox
  - OneDrive
  - Box
  - pCloud
  - MEGA
- OAuth2 secure authentication
- Direct export to cloud storage
- Import from cloud storage

### Automatic Backups
- Schedule automatic backups (Daily, Weekly, Monthly)
- Choose your preferred cloud provider
- Select what to backup (History and/or Bookmarks)
- Track last backup time and next scheduled backup

### Smart Duplicate Detection
- **Merge Mode:** Skips duplicate URLs
- **Update Logic:** If URL exists but import has newer timestamp, it updates the entry
- Detailed import statistics showing:
  - Items added
  - Items updated
  - Items skipped

## Features

✨ **Export Browser History**
- Choose time periods: Today, Yesterday, 7 days, 30 days, 90 days, All time, or Custom range
- Export in multiple formats: JSON, HTML, CSV
- Export to local file or cloud storage
- Preserves original timestamps and visit counts

📚 **Export/Import Bookmarks**
- Maintains complete folder structure
- Preserves all bookmark metadata
- Smart duplicate detection

☁️ **Cloud Storage**
- Connect multiple cloud providers
- Secure OAuth2 authentication
- Direct backup and restore

⏰ **Auto-Backup**
- Schedule recurring backups
- Automatic cloud uploads
- Backup tracking and history

🎨 **Modern Design**
- Side panel interface
- Vibrant gradient design
- Smooth animations and transitions
- Progress indicators
- Statistics display

## Installation Instructions

### Method 1: Load Unpacked Extension (For Testing)

1. **Open Chrome Extensions Page**
   - Open Google Chrome browser
   - Click the three dots menu (⋮) in the top-right corner
   - Go to **More Tools** → **Extensions**
   - Or simply type `chrome://extensions/` in the address bar

2. **Enable Developer Mode**
   - Toggle the **Developer mode** switch in the top-right corner of the Extensions page

3. **Load the Extension**
   - Click the **Load unpacked** button
   - Navigate to the `/app/extension/` folder on your computer
   - Select the folder and click **Select Folder**

4. **Pin the Extension (Optional)**
   - Click the puzzle piece icon (🧩) in Chrome's toolbar
   - Find "Export/Import History & Bookmarks" in the list
   - Click the pin icon to keep it visible in your toolbar

5. **Start Using**
   - Click the extension icon in your toolbar
   - The popup will open with all features ready to use

### Method 2: Creating a .CRX File (For Distribution)

If you want to package the extension for distribution:

1. **Zip the Extension**
   ```bash
   cd /app
   zip -r extension.zip extension/
   ```

2. **Create Private Key** (First time only)
   - Go to `chrome://extensions/`
   - Enable Developer mode
   - Click "Pack extension"
   - Select the extension folder
   - Leave "Private key file" empty for first time
   - Click "Pack Extension"
   - Chrome will create a .crx file and .pem file

3. **Share the Extension**
   - Share the .crx file with others
   - Recipients can drag-and-drop it into `chrome://extensions/`

### Method 3: Publish to Chrome Web Store (For Public Distribution)

1. **Create a Developer Account**
   - Go to [Chrome Web Store Developer Dashboard](https://chrome.google.com/webstore/devconsole/)
   - Pay the one-time $5 registration fee

2. **Prepare Extension**
   - Create a ZIP file of the extension folder
   - Prepare screenshots (1280x800 or 640x400)
   - Write a detailed description

3. **Upload Extension**
   - Click "New Item" in the Developer Dashboard
   - Upload the ZIP file
   - Fill in all required information
   - Submit for review

4. **Review Process**
   - Google typically reviews within a few days
   - Once approved, it will be available in the Chrome Web Store

## How to Use

### Exporting Data

1. Click the extension icon
2. In the **Export** tab:
   - Select what to export (History and/or Bookmarks)
   - Choose a time period
   - Select export format (JSON recommended for re-importing)
   - Click "Export Data"
3. Choose where to save the file
4. View statistics of exported items

### Importing Data

1. Click the extension icon
2. Switch to the **Import** tab
3. Choose import mode:
   - **Merge**: Adds to existing data
   - **Replace**: Replaces existing data (Note: Chrome doesn't allow clearing all history)
4. Click the upload area or drag & drop your file
5. Click "Import Data"
6. Wait for the process to complete and view statistics

## Supported File Formats

- **JSON**: Best for complete data preservation and re-importing
- **HTML**: Human-readable format that opens in any browser
- **CSV**: Compatible with spreadsheet applications like Excel

## Permissions Explained

The extension requires these permissions:
- **history**: To read and add browser history
- **bookmarks**: To read and create bookmarks
- **downloads**: To save exported files
- **storage**: To store settings

## Troubleshooting

### Extension doesn't appear after loading
- Make sure Developer mode is enabled
- Try reloading the extension (click the refresh icon)
- Check the Chrome Console for errors

### Export/Import not working
- Grant all requested permissions
- Check if you have enough disk space
- Ensure the file format is correct for import

### Bookmarks not importing correctly
- Make sure the file contains valid bookmark data
- Check that bookmarks are in the correct JSON structure

## Support

If you find this extension helpful, consider supporting the developer:

☕ [Buy Me a Coffee](https://buymeacoffee.com/ekurtovic81)

## Technical Details

- **Manifest Version**: 3 (Latest Chrome standard)
- **Permissions**: history, bookmarks, downloads, storage
- **File Formats**: JSON, HTML, CSV
- **Browser Compatibility**: Chrome 88+

## Privacy

This extension:
- Works completely offline
- Does NOT send any data to external servers
- Does NOT collect any personal information
- All data stays on your device

## Version

Current Version: 1.0.0

---

Made with ❤️ for Chrome users who value their browsing data
