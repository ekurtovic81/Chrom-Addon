# 🚀 Chrome Extension Installation Guide v4.0

## Export/Import History & Bookmarks with Local Auto-Backup

### Quick Start - 3 Simple Steps

#### Step 1: Download the Extension
You should have a folder called `extension` containing these files:
- manifest.json
- sidepanel.html
- sidepanel.js
- background.js
- styles.css
- icons/icon128.png
- README.md
- INSTALLATION_GUIDE.md

#### Step 2: Open Chrome Extensions
1. Open **Google Chrome**
2. Type `chrome://extensions/` in the address bar and press Enter
   
   OR
   
   Click the menu (⋮) → **More Tools** → **Extensions**

#### Step 3: Load the Extension
1. **Enable Developer Mode**
   - Look for the toggle switch in the top-right corner
   - Turn it ON (it should turn blue)

2. **Load Unpacked Extension**
   - Click the **"Load unpacked"** button (top-left area)
   - Browse to your `extension` folder
   - Click **"Select Folder"**

3. **Success!** 🎉
   - You should see the extension appear in your extensions list
   - The extension icon will appear in your Chrome toolbar

---

## 📌 Pin Extension to Toolbar

To keep the extension easily accessible:

1. Click the **puzzle piece icon** (🧩) in Chrome's toolbar
2. Find **"Export/Import History & Bookmarks"**
3. Click the **pin icon** next to it
4. The extension icon will now stay visible in your toolbar

---

## 🎯 How to Use the Extension v4.0

### First Time Setup
**Select a Backup Folder:**
1. Click the extension icon
2. Go to the **Export** tab
3. Click **"Browse"** next to the folder input
4. Select a folder where you want backups saved
5. This folder will be used for all automatic backups

### Exporting Your Data

**Step 1:** Click the extension icon in your toolbar

**Step 2:** Configure export settings:
- ✅ Check "Browser History" to export history
- ✅ Check "Bookmarks" to export bookmarks
- 📅 Choose time period from dropdown:
  - Today
  - Yesterday
  - Last 7 Days
  - Last 30 Days
  - Last 90 Days
  - All Time
  - Custom Period (enter dates manually)

**Step 3:** Select export format:
- **JSON** - Best for re-importing (recommended)
- **HTML** - Human-readable, opens in browser
- **CSV** - Spreadsheet compatible

**Step 4:** Make sure backup folder is selected

**Step 5:** Click **"Export & Save to Folder"** button

**What happens:**
1. File is saved to your selected backup folder
2. File is also downloaded to your Downloads folder
3. Statistics show how many items were exported
4. Backup counter increases by 1

### Importing Your Data

**Two ways to import:**

**Method A: From Local File**
1. Click the extension icon
2. Switch to the **"Import"** tab
3. Select **"Local File"**
4. Choose import mode:
   - **Merge with existing data** - Adds to your current history/bookmarks
   - **Replace existing data** - Replaces your data
5. Upload your file:
   - Click the upload area, OR
   - Drag and drop your file
6. Click **"Import from File"** button

**Method B: From Backup Folder**
1. Click the extension icon
2. Switch to the **"Import"** tab
3. Select **"From Backup Folder"**
4. Choose a backup file from the list
5. Select import mode
6. Click **"Import Selected Backup"** button

### Setting Up Auto-Backup

**Step 1:** Click the extension icon
**Step 2:** Go to the **"Auto-Backup"** tab
**Step 3:** Configure settings:
- **Backup Folder:** Select where to save backups
- **Frequency:** Hourly, Daily, Weekly, or Monthly
- **Backup Content:** History and/or Bookmarks
- **Keep Last:** How many backups to keep (5-50 or unlimited)

**Step 4:** Click **"Save Auto-Backup Settings"**

**Step 5:** (Optional) Click **"Backup Now"** to test

**What happens:**
- Backups run automatically at scheduled times
- Old backups are automatically deleted based on your settings
- Backup status shows in the footer
- Next backup time is displayed

### Cloud Features (Coming Soon)
The **Cloud** tab shows our upcoming features:
- Google Drive integration
- Dropbox integration
- OneDrive integration
- Multi-device sync

These features will be available in future updates!

---

## 📁 File Formats Explained

### JSON Format (Recommended)
- ✅ Best for re-importing
- ✅ Preserves all metadata
- ✅ Maintains folder structure
- ✅ Includes timestamps
- 📄 Example: `backup-2024-01-15T12-00-00.json`

### HTML Format
- ✅ Opens in any web browser
- ✅ Human-readable tables
- ✅ Clickable links
- ❌ Not ideal for re-importing
- 📄 Example: `backup-2024-01-15T12-00-00.html`

### CSV Format
- ✅ Opens in Excel/Google Sheets
- ✅ Easy to analyze
- ✅ Searchable
- ❌ Limited bookmark structure
- 📄 Example: `backup-2024-01-15T12-00-00.csv`

---

## 🔧 Troubleshooting v4.0

### Problem: Extension doesn't appear after loading
**Solution:**
- Make sure Developer mode is enabled (toggle ON)
- Check if you selected the correct folder
- Look for error messages on the extensions page
- Try clicking the "Reload" button on the extension

### Problem: "Load unpacked" button is grayed out
**Solution:**
- Developer mode is not enabled
- Toggle the Developer mode switch in the top-right corner

### Problem: Export button doesn't work
**Solution:**
- Make sure you selected at least one option (History or Bookmarks)
- Check if Chrome has permissions to download files
- Try a different export format
- Make sure a backup folder is selected

### Problem: Can't select backup folder
**Solution:**
- Chrome's folder picker might be restricted
- Try selecting a folder in your Documents or Downloads directory
- The extension will use a file input as a workaround

### Problem: Auto-backup not running
**Solution:**
- Check if auto-backup is enabled in settings
- Make sure Chrome is running at the scheduled time
- Verify folder permissions
- Try running a manual backup first

### Problem: Can't see extension icon in toolbar
**Solution:**
- Click the puzzle piece icon (🧩)
- Find the extension and click the pin icon

---

## 🔒 Permissions Explained v4.0

The extension needs these permissions to work:

| Permission | Why It's Needed |
|------------|-----------------|
| **history** | To read and add browser history items |
| **bookmarks** | To read and create bookmark folders/items |
| **downloads** | To save exported files to your computer |
| **storage** | To remember your settings and backup data |
| **alarms** | To schedule automatic backups |

**Privacy Note:** This extension works 100% offline. No data is sent to any server. Everything stays on your computer.

---

## 📱 Features Overview v4.0

### ✨ Modern Design
- Beautiful gradient interface
- Smooth animations
- Progress indicators
- Real-time statistics
- Version 4.0 badge

### 🕐 Flexible Time Periods
- Today, Yesterday, 7/30/90 days
- All time history
- Custom date range

### 📊 Statistics Dashboard
- See exactly how many items were processed
- Separate counts for history and bookmarks
- Animated numbers
- Detailed import statistics

### 🎨 Multiple Export Formats
- JSON for perfect re-importing
- HTML for viewing in browser
- CSV for spreadsheet analysis

### 🔄 Smart Import Options
- Merge with existing data
- Replace mode (where possible)
- Progress tracking
- Import from backup folder

### ⚡ Enhanced Local Backup
- **Select backup folder** once, use forever
- **Automatic save** on every export
- **Import directly** from backup folder
- **Auto-backup scheduling** (hourly/daily/weekly/monthly)
- **Backup retention** (keep only what you need)
- **Backup counter** and status indicator

### ☁️ Coming Soon
- Cloud storage integration
- Multi-device sync
- Advanced backup options

---

## 💡 Use Cases v4.0

### 1. Regular Data Protection
- Set up daily auto-backup
- Keep last 10 backups
- Restore easily if needed

### 2. Transfer to Another Computer
- Export all data from old computer
- Copy backup folder to new computer
- Import from backup folder

### 3. Archive Old History
- Export specific time periods
- Keep records for reference
- Free up browser storage

### 4. Analyze Your Browsing
- Export to CSV
- Open in Excel
- Analyze patterns and statistics

### 5. Multiple Browser Profiles
- Export from one Chrome profile
- Import into another profile
- Keep your data synced manually

### 6. Development/Testing
- Backup before testing new extensions
- Restore if something goes wrong
- Compare different browser states

---

## 🎁 Support the Developer

If you find this extension helpful, consider buying the developer a coffee:

☕ **[Buy Me a Coffee](https://buymeacoffee.com/ekurtovic81)**

Your support helps maintain and improve this extension!

---

## 📞 Need More Help?

### Check Console for Errors
1. Right-click on the extension icon
2. Select "Inspect popup"
3. Go to Console tab
4. Look for error messages

### Reload the Extension
1. Go to `chrome://extensions/`
2. Find "Export/Import History & Bookmarks"
3. Click the reload icon (↻)

### Reinstall the Extension
1. Remove the extension
2. Reload the extensions page
3. Follow installation steps again

### Report Issues
- Check if the issue is listed in troubleshooting
- Try different export/import formats
- Test with smaller data sets first
- Make sure Chrome is up to date

---

## 📋 System Requirements v4.0

- **Browser:** Google Chrome 88 or later
- **Operating System:** Windows, macOS, Linux, ChromeOS
- **Disk Space:** Minimal (< 1 MB for extension)
- **Storage:** Depends on backup settings and data size
- **Internet:** Not required (works offline)
- **Permissions:** Grant all requested permissions for full functionality

---

## 🎉 You're All Set!

Your extension is now installed and ready to use. Start by exporting your first backup!

**Quick Tips:**
- 📅 Select a backup folder first thing
- 💾 Enable auto-backup for peace of mind
- 🔄 Test import with a small backup first
- ⭐ Review backup retention settings
- 🚀 Export regularly to keep backups current

**Recommended First Steps:**
1. Select a backup folder (Documents/BrowserBackups/)
2. Export your first backup (All Time, JSON format)
3. Set up daily auto-backup
4. Keep last 10 backups
5. Test import from your backup folder

**Version:** 4.0.0  
**Status:** ✅ Production Ready  
**Last Updated:** January 2024

Made with ❤️ for Chrome users everywhere