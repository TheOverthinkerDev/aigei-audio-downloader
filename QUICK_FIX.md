# 🚨 QUICK FIX GUIDE - Extension Loading Issues

## ❌ Problem: "Extension not properly loaded"

### Step 1: Check Chrome Extensions Page
1. Open Chrome and go to `chrome://extensions/`
2. Make sure "Developer mode" is turned ON (top right toggle)
3. Look for "Aigei Audio Downloader" in the list
4. If extension is there but has errors, click "Reload" button

### Step 2: Reload Extension
```
1. Go to chrome://extensions/
2. Find your extension
3. Click "Reload" button (🔄)
4. Wait for reload to complete
```

### Step 3: Check for Errors
1. If extension shows errors, click "Details" 
2. Look at error messages
3. Common fixes:
   - Manifest syntax error → Check manifest.json
   - Permission denied → Make sure all files exist
   - Service worker error → Check background.js

### Step 4: Complete Reinstall
If reload doesn't work:
```
1. Click "Remove" to uninstall extension
2. Click "Load unpacked" again
3. Select the folder: D:\1. Workspace\Github\Aigei_sound_dowloader
4. Extension should appear with no errors
```

## ❌ Problem: "Chrome APIs not available"

### Cause: Extension not properly loaded or permissions missing

### Fix:
1. Uninstall and reinstall extension (Step 4 above)
2. Make sure you're testing on a regular webpage (not chrome:// pages)
3. Check that manifest.json has all required permissions

## ❌ Problem: Download/Copy not working

### Cause: Extension loaded but functions fail

### Fix:
1. Open extension popup and check for error messages
2. Right-click extension icon → "Inspect popup" to see console errors
3. Check chrome://extensions/ → click "Service worker" → check background script console
4. Make sure you're on aigei.com or test page

## 🧪 Quick Test Steps

### Test 1: Basic Extension
1. Open extension popup by clicking icon in toolbar
2. Should show "Aigei Audio Downloader" interface
3. Should display current stats (0 files detected initially)

### Test 2: IDM Integration Test  
1. Go to aigei.com and try to play an audio file
2. Extension should detect and list the audio URLs
3. Click "Tải xuống" button to test IDM integration

### Test 3: Manual Copy Test
1. Click "Copy URL" button on any detected audio
2. Open IDM manually and paste URL to verify it works
3. Should successfully start download in IDM

### Test 4: Audio Detection
1. Go to aigei.com
2. Play any audio preview
3. Open extension popup
4. Should show detected audio URLs

## 🛠️ Manual Installation Steps (If All Fails)

1. **Download/Extract files to folder**
2. **Open Chrome → Settings → Extensions**
3. **Turn ON "Developer mode"**
4. **Click "Load unpacked"**
5. **Select folder containing manifest.json**
6. **Extension should appear with green icon**

## 🔧 Common File Issues

### Missing Files Check:
```
✅ manifest.json
✅ background.js  
✅ content.js
✅ popup.html
✅ popup.js
```

### Manifest.json Must Have:
```json
{
  "manifest_version": 3,
  "name": "Aigei Audio Downloader", 
  "permissions": ["downloads", "storage", "scripting", "tabs", "webRequest", "contextMenus"],
  "host_permissions": ["*://*.aigei.com/*"]
}
```

## ✅ Success Indicators

Extension working properly when:
- ✅ Extension appears in chrome://extensions/ with no errors
- ✅ Extension popup opens correctly
- ✅ Popup opens from toolbar icon
- ✅ No console errors in popup or background script
- ✅ Can detect audio URLs on aigei.com
- ✅ IDM integration works (new tab opens or clipboard copy successful)

## 📞 Still Not Working?

1. **Check Chrome version**: Extension requires Chrome 88+
2. **Restart Chrome completely**
3. **Try different browser**: Edge, Brave (Chromium-based)
4. **Check file permissions**: Make sure files are not read-only

## 🎯 Expected Working State

When everything works:
- Extension icon appears in toolbar (even without custom icon)
- Popup opens showing clean interface
- Visiting aigei.com and playing audio shows detected URLs in popup  
- Download and Copy buttons work in popup
- No error messages in console

**Total time to fix: Usually 2-5 minutes**
