# 🚀 Chrome Extension Installation Guide

## Export/Import History & Bookmarks

### Quick Start - 3 Simple Steps

#### Step 1: Download the Extension
You should have a folder called `extension` containing these files:
- manifest.json
- popup.html
- popup.js
- background.js
- styles.css
- icons/icon128.png
- README.md

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

## 🎯 How to Use the Extension

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

**Step 4:** Click **"Export Data"** button

**Step 5:** Choose where to save the file

**Step 6:** View statistics showing how many items were exported!

### Importing Your Data

**Step 1:** Click the extension icon

**Step 2:** Switch to the **"Import"** tab

**Step 3:** Choose import mode:
- **Merge with existing data** - Adds to your current history/bookmarks
- **Replace existing data** - Replaces your data (Note: Chrome has limitations on clearing history)

**Step 4:** Upload your file:
- Click the upload area, OR
- Drag and drop your file

**Step 5:** Click **"Import Data"** button

**Step 6:** Wait for completion and view statistics!

---

## 📁 File Formats Explained

### JSON Format (Recommended)
- ✅ Best for re-importing
- ✅ Preserves all metadata
- ✅ Maintains folder structure
- ✅ Includes timestamps
- 📄 Example: `browser-data-1234567890.json`

### HTML Format
- ✅ Opens in any web browser
- ✅ Human-readable tables
- ✅ Clickable links
- ❌ Not ideal for re-importing
- 📄 Example: `browser-data-1234567890.html`

### CSV Format
- ✅ Opens in Excel/Google Sheets
- ✅ Easy to analyze
- ✅ Searchable
- ❌ Limited bookmark structure
- 📄 Example: `browser-data-1234567890.csv`

---

## 🔧 Troubleshooting

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

### Problem: Import file is not accepted
**Solution:**
- Make sure the file is JSON, HTML, or CSV format
- Check if the file was exported correctly
- Try opening the file in a text editor to verify it contains data

### Problem: Bookmarks aren't importing
**Solution:**
- Ensure the file contains bookmark data
- Check JSON structure is valid
- Make sure you granted bookmark permissions

### Problem: Can't see extension icon in toolbar
**Solution:**
- Click the puzzle piece icon (🧩)
- Find the extension and click the pin icon

---

## 🔒 Permissions Explained

The extension needs these permissions to work:

| Permission | Why It's Needed |
|------------|-----------------|
| **history** | To read and add browser history items |
| **bookmarks** | To read and create bookmark folders/items |
| **downloads** | To save exported files to your computer |
| **storage** | To remember your settings |

**Privacy Note:** This extension works 100% offline. No data is sent to any server. Everything stays on your computer.

---

## 📱 Features Overview

### ✨ Modern Design
- Beautiful gradient interface
- Smooth animations
- Progress indicators
- Real-time statistics

### 🕐 Flexible Time Periods
- Today, Yesterday, 7/30/90 days
- All time history
- Custom date range

### 📊 Statistics Dashboard
- See exactly how many items were processed
- Separate counts for history and bookmarks
- Animated numbers

### 🎨 Multiple Export Formats
- JSON for perfect re-importing
- HTML for viewing in browser
- CSV for spreadsheet analysis

### 🔄 Smart Import Options
- Merge with existing data
- Replace mode (where possible)
- Progress tracking

---

## 💡 Use Cases

### 1. Backup Your Browsing Data
Export all your history and bookmarks before:
- Resetting your browser
- Switching computers
- Clean reinstall

### 2. Transfer to Another Profile
- Export from one Chrome profile
- Import into another profile
- Keep your data synced

### 3. Archive Old History
- Export specific time periods
- Keep records for reference
- Free up browser storage

### 4. Analyze Your Browsing
- Export to CSV
- Open in Excel
- Analyze patterns and statistics

### 5. Backup Bookmarks
- Regular bookmark backups
- Preserve folder structure
- Easy restoration

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

---

## 📋 System Requirements

- **Browser:** Google Chrome 88 or later
- **Operating System:** Windows, macOS, Linux
- **Disk Space:** Minimal (< 1 MB)
- **Internet:** Not required (works offline)

---

## 🎉 You're All Set!

Your extension is now installed and ready to use. Start by exporting your first backup!

**Quick Tips:**
- 📅 Export regularly to keep backups current
- 💾 Store exports in a safe location
- 🔄 Test import with small datasets first
- ⭐ Consider custom date ranges for specific needs

---

**Version:** 1.0.0  
**Last Updated:** 2024

Made with ❤️ for Chrome users everywhere
