# 🚀 Upgrade Guide: v1.0 → v2.0

## What's New in Version 2.0

Welcome to version 2.0! This major update brings powerful new features:

### 🎯 Key Improvements

1. **Side Panel Interface** - Opens on the right side of browser instead of popup
2. **Cloud Storage** - Connect to 6 different cloud providers
3. **Auto-Backup** - Schedule automatic backups
4. **Smart Duplicates** - Intelligent duplicate detection on import

---

## Breaking Changes

### Interface Change: Popup → Side Panel

**Old Behavior (v1.0):**
- Extension opened as popup when clicking icon
- Limited size (420x500px)
- Closed when clicking outside

**New Behavior (v2.0):**
- Extension opens as side panel on right side
- Full height, stays open while browsing
- Can be resized and pinned

**Migration:** No action needed - Chrome handles this automatically

---

## New Features Guide

### 1. Using Cloud Storage

**Step 1:** Click extension icon to open side panel

**Step 2:** Go to "Cloud" tab

**Step 3:** Click "Connect" on your preferred provider:
- Google Drive
- Dropbox
- OneDrive
- Box
- pCloud
- MEGA

**Step 4:** Authorize in popup window

**Step 5:** Export to cloud:
- Go to "Export" tab
- Change "Destination" to "Cloud Storage"
- Click "Export Data"

**Note:** Cloud features require OAuth2 setup (see OAUTH2_SETUP.md)

---

### 2. Setting Up Auto-Backup

**Step 1:** Connect a cloud provider first (see above)

**Step 2:** Go to "Auto" tab

**Step 3:** Configure backup settings:
```
Backup Frequency: Daily / Weekly / Monthly
Cloud Provider: Select your connected provider
Backup Content: ☑ History ☑ Bookmarks
```

**Step 4:** Click "Save Settings"

**Step 5:** (Optional) Click "Backup Now" to test

**View Backup Status:**
- Next Backup: Shows when next backup will run
- Last Backup: Shows when last backup completed

---

### 3. Smart Duplicate Detection

**How It Works:**

When importing with "Merge" mode:

```
URL exists + Same timestamp → Skip (duplicate)
URL exists + Older timestamp → Skip (existing is newer)
URL exists + Newer timestamp → Update (import is newer)
URL doesn't exist → Add (new entry)
```

**Benefits:**
- No duplicate URLs in history
- Always keeps most recent data
- Detailed statistics showing what was updated

**Import Statistics Now Show:**
- History Added: New URLs imported
- History Updated: Existing URLs with newer timestamps
- History Skipped: Duplicates or older timestamps
- Bookmarks: Total bookmarks imported

---

## Comparing Versions

### Export Feature

| Feature | v1.0 | v2.0 |
|---------|------|------|
| Time periods | ✅ 7 options | ✅ 7 options |
| File formats | ✅ JSON, HTML, CSV | ✅ JSON, HTML, CSV |
| Local download | ✅ | ✅ |
| Cloud upload | ❌ | ✅ **NEW** |
| Destination choice | ❌ | ✅ **NEW** |

### Import Feature

| Feature | v1.0 | v2.0 |
|---------|------|------|
| Local file | ✅ | ✅ |
| Cloud file | ❌ | ✅ **NEW** |
| Duplicate detection | ❌ | ✅ **NEW** |
| Update if newer | ❌ | ✅ **NEW** |
| Detailed stats | ❌ | ✅ **NEW** |
| Merge/Replace modes | ✅ | ✅ Enhanced |

### Interface

| Feature | v1.0 | v2.0 |
|---------|------|------|
| View type | Popup | Side Panel |
| Size | 420x500px | Full height |
| Stays open | ❌ | ✅ |
| Tabs | 2 (Export/Import) | 4 (Export/Import/Cloud/Auto) |

### New Features

| Feature | v1.0 | v2.0 |
|---------|------|------|
| Cloud storage | ❌ | ✅ 6 providers |
| Auto-backup | ❌ | ✅ Daily/Weekly/Monthly |
| OAuth2 auth | ❌ | ✅ Secure login |
| Backup tracking | ❌ | ✅ Last/Next times |
| Smart duplicates | ❌ | ✅ Update if newer |

---

## Migration Steps

### For Regular Users

**Step 1:** Uninstall old version (optional)
- Go to chrome://extensions/
- Remove version 1.0

**Step 2:** Install version 2.0
- Load unpacked extension
- Select the extension folder

**Step 3:** Existing data is preserved
- Your history and bookmarks are untouched
- Chrome manages extension data

**Step 4:** Try new features
- Open side panel (click extension icon)
- Explore Cloud and Auto tabs

### For Developers

**Step 1:** Update manifest version
```json
"version": "2.0.0"
```

**Step 2:** Add new permissions
```json
"permissions": [
  "history",
  "bookmarks",
  "downloads",
  "storage",
  "alarms",      // NEW: For scheduled backups
  "identity"     // NEW: For OAuth2
]
```

**Step 3:** Add side panel config
```json
"side_panel": {
  "default_path": "sidepanel.html"
}
```

**Step 4:** Set up OAuth2 (optional)
- See OAUTH2_SETUP.md for details
- Extension works without OAuth2 setup
- Cloud features require credentials

**Step 5:** Test thoroughly
- Export to local ✓
- Export to cloud ✓
- Import with duplicate detection ✓
- Auto-backup scheduling ✓

---

## Backward Compatibility

### Export Files

**v1.0 exports work with v2.0:**
✅ JSON files from v1.0 can be imported in v2.0
✅ HTML files compatible
✅ CSV files compatible

**v2.0 exports include version:**
```json
{
  "version": "2.0",
  "exportDate": "2024-01-15T...",
  ...
}
```

### Data Format

No breaking changes to data structure:
- History items: Same format
- Bookmarks: Same tree structure
- Timestamps: Same format

---

## Feature Comparison Examples

### Example 1: Daily Backup Workflow

**v1.0 Workflow:**
```
1. Click extension icon
2. Select options
3. Export to file
4. Manually upload to cloud storage
5. Repeat daily
```

**v2.0 Workflow:**
```
1. Configure auto-backup once:
   - Frequency: Daily
   - Provider: Google Drive
   - Content: History + Bookmarks
2. Done! Automatic backups run daily
```

### Example 2: Import Without Duplicates

**v1.0 Behavior:**
```
Import 100 URLs:
- Adds all 100 URLs
- Creates duplicates if URL already exists
- No way to update existing entries
```

**v2.0 Behavior:**
```
Import 100 URLs:
- 30 new URLs → Added
- 50 duplicates (same timestamp) → Skipped
- 20 existing but newer → Updated
- Shows detailed breakdown
```

---

## Troubleshooting Upgrade Issues

### Extension Won't Load

**Problem:** Extension fails to load after upgrade

**Solution:**
1. Check Chrome version (must be 88+)
2. Enable Developer mode
3. Check for error messages
4. Try reloading extension

### Side Panel Won't Open

**Problem:** Clicking icon does nothing

**Solution:**
1. Check permissions are granted
2. Right-click extension icon → Inspect popup
3. Check console for errors
4. Restart Chrome

### Cloud Connect Fails

**Problem:** OAuth2 authentication fails

**Solution:**
1. Verify OAuth2 credentials are set up
2. Check redirect URI matches extension ID
3. See OAUTH2_SETUP.md
4. Use local-only mode as fallback

### Import Shows No Duplicates Detected

**Problem:** Duplicate detection not working

**Solution:**
1. Ensure using v2.0 export format
2. Check URLs match exactly
3. Verify timestamps are present
4. Review import statistics

---

## Rollback to v1.0

If you need to rollback:

**Step 1:** Uninstall v2.0
```
chrome://extensions/ → Remove
```

**Step 2:** Reinstall v1.0
```
Load unpacked → Select v1.0 folder
```

**Step 3:** Your data is safe
- Chrome history unchanged
- Bookmarks unchanged
- Export files compatible

---

## FAQ

### Q: Do I need cloud storage to use v2.0?
**A:** No! All v1.0 features still work. Cloud and auto-backup are optional.

### Q: Will my old export files work?
**A:** Yes! v2.0 is backward compatible with v1.0 exports.

### Q: Is OAuth2 setup required?
**A:** Only if you want cloud storage features. Local export/import works without it.

### Q: Will duplicate detection break my data?
**A:** No! It only prevents adding duplicate URLs. Uses "update if newer" logic.

### Q: Can I use multiple cloud providers?
**A:** Yes! Connect to all 6 providers if you want.

### Q: How do I disable auto-backup?
**A:** Set "Backup Frequency" to "Disabled" in Auto tab.

### Q: Does v2.0 use more permissions?
**A:** Yes, 2 new permissions: `alarms` (for scheduling) and `identity` (for OAuth2).

### Q: Can I still use popup instead of side panel?
**A:** No, Chrome extension architecture requires using side panel for the new features.

---

## What's Next?

### Planned for Future Versions

- 🔄 Real-time sync across devices
- 🔍 Search within exported data
- 📊 Visual analytics dashboard
- 🔐 Encryption for sensitive data
- 📱 Mobile companion app
- 🎯 Selective import by URL pattern

Stay tuned for updates!

---

## Getting Help

### Resources
- 📖 README.md - Feature documentation
- 🛠️ OAUTH2_SETUP.md - Cloud setup guide
- 📋 INSTALLATION_GUIDE.md - Installation help
- ☕ [Buy Me a Coffee](https://buymeacoffee.com/ekurtovic81) - Support development

### Report Issues
- Check INSTALLATION_GUIDE.md troubleshooting
- Review console logs (F12)
- Disable cloud features if problematic
- Use v1.0 as fallback

---

**Version:** 2.0  
**Release Date:** January 2024  
**Upgrade Path:** v1.0 → v2.0 ✅

Enjoy the new features! 🎉
