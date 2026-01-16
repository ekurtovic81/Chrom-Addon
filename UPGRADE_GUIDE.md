# 🚀 Upgrade Guide: v2.0 → v4.0

## What's New in Version 4.0

Welcome to version 4.0! This major update focuses on **enhanced local backup features** with cloud sync coming soon.

### 🎯 Key Improvements

1. **Enhanced Local Auto-Backup** - Automatic backups to local folder
2. **Folder Selection** - Choose backup folder directly from extension
3. **Backup Scheduling** - Hourly/Daily/Weekly/Monthly automatic backups
4. **Backup Management** - Automatic cleanup of old backups
5. **Direct Import from Backup Folder** - Import backups directly from your backup folder
6. **Cloud Coming Soon** - Cloud features temporarily disabled, enhanced local system

---

## Breaking Changes

### Removed: Cloud Storage Integration (Temporarily)

**Old Behavior (v2.0-v3.0):**
- 6 cloud providers supported (Google Drive, Dropbox, OneDrive, Box, pCloud, MEGA)
- OAuth2 authentication flows
- Export/import to/from cloud storage

**New Behavior (v4.0):**
- Cloud features temporarily disabled
- "Cloud" tab shows "Coming Soon" message
- All focus on enhanced local backup system
- Cloud sync planned for future versions

**Migration:** No data loss - cloud connections can be re-established when cloud features return

---

## New Features Guide

### 1. Setting Up Local Auto-Backup

**Step 1:** Open side panel (click extension icon)

**Step 2:** Go to "Auto-Backup" tab

**Step 3:** Configure backup settings:
```
1. Click "Browse" to select backup folder
2. Choose frequency: Hourly / Daily / Weekly / Monthly
3. Select content: ☑ History ☑ Bookmarks
4. Set "Keep Last": 5/10/20/50 backups or Unlimited
5. Click "Save Auto-Backup Settings"
```

**Step 4:** Manual backup:
- Click "Backup Now" to create immediate backup
- View status in footer: "Backup folder: [folder name]"

**View Backup Status:**
- **Next Backup:** Shows when next automatic backup will run
- **Last Backup:** Shows when last backup was created
- **Backups Count:** Total number of backups created

### 2. Enhanced Export with Auto-Save

**New Export Flow:**
1. Select what to export (History/Bookmarks)
2. Choose time period
3. Select export format (JSON/HTML/CSV)
4. **Automatically saves to backup folder**
5. Also downloads to default Downloads folder

**Benefits:**
- No need to choose save location each time
- All backups organized in one folder
- Automatic file naming with timestamps

### 3. Import from Backup Folder

**New Import Options:**
- **Local File:** Traditional file upload
- **From Backup Folder:** Direct import from your backup folder

**To import from backup folder:**
```
1. Switch to "Import" tab
2. Select "From Backup Folder"
3. Choose backup file from list
4. Select import mode (Merge/Replace)
5. Click "Import Selected Backup"
```

### 4. Backup Management

**Automatic Cleanup:**
- Old backups automatically deleted based on "Keep Last" setting
- Configurable retention: 5, 10, 20, 50 backups or unlimited
- Prevents disk space issues

**Backup Organization:**
- Files named: `backup-YYYY-MM-DD-HHMMSS.json`
- All formats supported: JSON, HTML, CSV
- Easy to identify backups by timestamp

---

## Comparing Versions

### Export Feature

| Feature | v2.0-v3.0 | v4.0 |
|---------|-----------|------|
| Time periods | ✅ 7 options | ✅ 7 options |
| File formats | ✅ JSON, HTML, CSV | ✅ JSON, HTML, CSV |
| Local download | ✅ | ✅ |
| Auto-save to folder | ❌ | ✅ **NEW** |
| Cloud upload | ✅ | ❌ (Coming Soon) |
| Automatic naming | ❌ | ✅ **NEW** |

### Import Feature

| Feature | v2.0-v3.0 | v4.0 |
|---------|-----------|------|
| Local file import | ✅ | ✅ |
| Import from backup folder | ❌ | ✅ **NEW** |
| Duplicate detection | ✅ | ✅ |
| Update if newer | ✅ | ✅ |
| Detailed stats | ✅ | ✅ |
| Cloud import | ✅ | ❌ (Coming Soon) |

### Auto-Backup Feature

| Feature | v2.0-v3.0 | v4.0 |
|---------|-----------|------|
| Scheduled backups | ✅ | ✅ Enhanced |
| Frequency options | 3 (Daily/Weekly/Monthly) | 4 (Hourly/Daily/Weekly/Monthly) **NEW** |
| Folder selection | ❌ | ✅ **NEW** |
| Retention policy | ❌ | ✅ **NEW** |
| Backup counter | ❌ | ✅ **NEW** |
| Cloud backup | ✅ | ❌ (Coming Soon) |

### Interface Improvements

| Feature | v2.0-v3.0 | v4.0 |
|---------|-----------|------|
| Tab navigation | 4 tabs | 4 tabs (Cloud Coming Soon) |
| Backup status display | ❌ | ✅ **NEW** |
| Folder picker | ❌ | ✅ **NEW** |
| Version badge | ❌ | ✅ **NEW** |
| Enhanced statistics | ✅ | ✅ |

---

## Migration Steps

### From v2.0/v3.0 TO v4.0:

✅ **BACKWARD COMPATIBLE**
- Old export files work in v4.0
- Data format unchanged
- No data loss
- Settings preserved

⚠️ **CLOUD CONNECTIONS TEMPORARILY UNAVAILABLE**
- Cloud tokens preserved in storage
- Will reconnect automatically when cloud features return
- No need to re-authenticate

🔄 **UPGRADE PROCESS:**
1. Export any cloud data (optional - for safety)
2. Install v4.0
3. Configure local backup folder
4. Set up auto-backup schedule
5. Continue using enhanced local features

### For Developers:

**Step 1:** Update manifest version
```json
"version": "4.0.0"
```

**Step 2:** Remove cloud permissions (temporarily)
```json
"permissions": [
  "history",
  "bookmarks", 
  "downloads",
  "storage",
  "alarms"
  // Removed: "identity", "sidePanel" (now included by default)
]
```

**Step 3:** Update UI for local focus
- Replace cloud providers with folder selection
- Add "Coming Soon" message for cloud
- Enhance auto-backup interface

**Step 4:** Test local backup features
- Folder selection ✓
- Auto-backup scheduling ✓
- Import from backup folder ✓
- Backup management ✓

---

## Backward Compatibility

### Export Files

**v2.0/v3.0 exports work with v4.0:**
✅ JSON files from previous versions can be imported in v4.0
✅ HTML files compatible
✅ CSV files compatible

**v4.0 exports include enhanced metadata:**
```json
{
  "version": "4.0",
  "exportDate": "2024-01-15T12:00:00.000Z",
  "autoBackup": true,
  ...
}
```

### Data Format

No breaking changes to data structure:
- History items: Same format
- Bookmarks: Same tree structure
- Timestamps: Same format

### Settings Migration

Existing settings are preserved:
- Auto-backup frequency
- Export preferences
- UI preferences
- Cloud tokens (stored but not used)

---

## Feature Comparison Examples

### Example 1: Daily Backup Workflow

**v2.0/v3.0 Workflow:**
```
1. Click extension icon
2. Go to Auto tab
3. Configure frequency: Daily
4. Select cloud provider
5. Save settings
6. Backups upload to cloud
```

**v4.0 Workflow:**
```
1. Click extension icon
2. Go to Auto-Backup tab
3. Click "Browse" to select folder
4. Configure frequency: Daily
5. Set "Keep Last": 10 backups
6. Save settings
7. Backups automatically save to local folder
8. Old backups automatically deleted
```

### Example 2: Export and Save

**v2.0/v3.0 Behavior:**
```
Export 1000 items:
- Shows save dialog
- User chooses location each time
- Must manually organize files
```

**v4.0 Behavior:**
```
Export 1000 items:
- Automatically saves to backup folder
- Also downloads to Downloads/BrowserBackup/
- File named: backup-2024-01-15-120000.json
- No save dialog needed
```

### Example 3: Import Recovery

**v2.0/v3.0 Behavior:**
```
Recover from backup:
1. Remember where backup was saved
2. Navigate to folder
3. Select file
4. Import
```

**v4.0 Behavior:**
```
Recover from backup:
1. Switch to Import tab
2. Select "From Backup Folder"
3. View list of all backups
4. Select by date/time
5. Import directly
```

---

## Troubleshooting Upgrade Issues

### Extension Won't Load

**Problem:** Extension fails to load after upgrade

**Solution:**
1. Check Chrome version (must be 88+ for Manifest V3)
2. Enable Developer mode
3. Check for error messages
4. Try reloading extension

### Folder Selection Not Working

**Problem:** Can't select backup folder

**Solution:**
1. Ensure Chrome has file system permissions
2. Try selecting a different folder
3. Check console for errors
4. Manual workaround: Use default Downloads folder

### Auto-Backup Not Running

**Problem:** Scheduled backups not creating

**Solution:**
1. Verify folder is selected
2. Check auto-backup is enabled (not "Disabled")
3. Verify Chrome alarms are working
4. Try "Backup Now" to test manual backup

### Import from Folder Empty

**Problem:** No backup files shown in list

**Solution:**
1. Ensure backups exist in selected folder
2. Check file format (should be .json, .html, or .csv)
3. Try creating a new backup first
4. Verify folder permissions

---

## Rollback to v2.0/v3.0

If you need to rollback to previous version with cloud features:

**Step 1:** Export local backups from v4.0
```
Auto-Backup tab → Backup Now
```

**Step 2:** Uninstall v4.0
```
chrome://extensions/ → Remove
```

**Step 3:** Reinstall v2.0/v3.0
```
Load unpacked → Select previous version folder
```

**Step 4:** Your data is safe
- Chrome history unchanged
- Bookmarks unchanged
- v4.0 export files compatible with v2.0/v3.0

---

## FAQ

### Q: Why remove cloud features temporarily?
**A:** To focus on building a robust local backup system first. Cloud sync will return in future versions with better integration.

### Q: Will my cloud connections be lost?
**A:** No! Cloud tokens are preserved in storage. When cloud features return, you won't need to re-authenticate.

### Q: Is local backup secure?
**A:** Yes! Local backups are stored on your computer, giving you full control over your data.

### Q: What happens to old backups?
**A:** They're automatically managed based on your "Keep Last" setting. You can keep 5, 10, 20, 50, or unlimited backups.

### Q: Can I use both local and cloud backup?
**A:** Currently only local. Cloud will be added as an additional option in future versions.

### Q: How do I migrate from cloud to local backup?
**A:** Simply download your cloud backups and save them to your local backup folder.

### Q: What's the advantage of v4.0 over previous versions?
**A:** Automated local backup management, no manual file organization, direct import from backup folder, and better control over backup retention.

---

## What's Next?

### Planned for v4.1+
- 🔄 **Cloud Sync Return** - Google Drive, Dropbox integration
- 🔍 **Backup Search** - Search within backup files
- 📊 **Backup Analytics** - Visual charts of backup history
- 🔐 **Encryption** - Optional password protection for backups
- 🌐 **Multi-Computer Sync** - Sync backups across devices

### v4.2+ Vision
- 🤖 **Smart Backup** - AI-powered backup optimization
- 📱 **Mobile Companion** - View backups on mobile
- 🚨 **Backup Alerts** - Notifications for backup issues
- 🔄 **Incremental Backups** - Faster, smaller backups

Stay tuned for updates!

---

## Getting Help

### Resources
- 📖 `README.md` - Feature documentation
- 🛠️ `INSTALLATION_GUIDE.md` - Installation help
- 📋 This file - Upgrade instructions
- ☕ [Buy Me a Coffee](https://buymeacoffee.com/ekurtovic81) - Support development

### Report Issues
1. Check console logs (F12 in side panel)
2. Review backup folder permissions
3. Test with default settings
4. Contact through support channels

---

**Version:** 4.0  
**Release Date:** January 2024  
**Upgrade Path:** v2.0/v3.0 → v4.0 ✅  
**Focus:** Enhanced local backup system  
**Next:** Cloud sync integration  

Enjoy the new local backup features! Your data is now more secure and better organized than ever. 🎉