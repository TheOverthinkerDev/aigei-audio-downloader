# 🧪 TESTING GUIDE - Aigei Sound Downloader Extension

## 📋 Pre-Test Checklist

### 1. Extension Installation
- [ ] Extension đã được load vào Chrome (chrome://extensions/)
- [ ] Extension hiển thị trong toolbar
- [ ] Extension có icon và popup hoạt động
- [ ] Tất cả permissions đã được cấp

### 2. Permissions Check
Kiểm tra extension có đầy đủ permissions:
- [ ] `downloads` - Cho Chrome Downloads API
- [ ] `storage` - Lưu trữ audio URLs
- [ ] `scripting` - Inject scripts vào web pages
- [ ] `tabs` - Truy cập tab information
- [ ] `webRequest` - Bắt network requests
- [ ] `contextMenus` - Right-click menu
- [ ] Host permission cho `*://*.aigei.com/*`

### 3. Developer Tools Setup
- [ ] Mở Developer Tools (F12)
- [ ] Tab Console để xem logs
- [ ] Tab Network để xem requests
- [ ] Tab Application > Storage để xem extension storage

## 🎯 Test Scenarios

### Scenario 1: Extension Basic Functions
**Test File**: `test_extension.html`

1. Mở file `test_extension.html` trong Chrome
2. Click "Check Extension" - should show extension ID và permissions
3. Test clipboard functionality
4. Test storage API
5. Test downloads API permissions

**Expected Results**:
- ✅ Extension ID displayed
- ✅ All APIs working
- ✅ Permissions granted

### Scenario 2: Popup Functionality
1. Click extension icon trong toolbar
2. Popup should open showing interface
3. Initially should show "Chưa có file âm thanh nào được phát hiện"
4. Test refresh và clear buttons

**Expected Results**:
- ✅ Popup opens without errors
- ✅ UI loads properly
- ✅ No console errors

### Scenario 3: Audio URL Detection (Simulated)
**Test on**: `test_extension.html`

1. Mở Developer Tools Console
2. Click các "▶ Play" buttons trong fake aigei section
3. Check Console logs for audio detection
4. Open extension popup - should show detected URLs

**Expected Results**:
- ✅ Audio elements created và detected
- ✅ URLs appear in popup
- ✅ Console shows detection logs

### Scenario 4: Real Aigei.com Testing
1. Navigate to `https://aigei.com`
2. Search for any audio content
3. Click preview/play trên audio files
4. Open extension popup during/after playing
5. Check if URLs are detected

**Expected Results**:
- ✅ Audio URLs detected từ aigei.com
- ✅ URLs displayed in popup with correct filenames
- ✅ Timestamps và file info correct

### Scenario 5: Download Testing
**Prerequisites**: Audio URLs detected trong popup

1. Click "📥" (download) button trên any audio item
2. Watch console logs for download attempts
3. Check Chrome Downloads (Ctrl+Shift+J)
4. Test fallback methods nếu Chrome download fails

**Expected Results**:
- ✅ Download starts successfully, OR
- ✅ New tab opens for IDM capture, OR  
- ✅ Script injection works với clipboard copy

### Scenario 6: Copy URL Testing
1. Click "📋" (copy) button trên any audio item
2. Paste clipboard content (Ctrl+V) in text editor
3. Verify URL is correct và complete

**Expected Results**:
- ✅ URL copied to clipboard
- ✅ Success message displayed
- ✅ Button shows ✅ feedback

### Scenario 7: Context Menu Testing
1. Right-click trên any audio element on aigei.com
2. Look for "Copy Audio URL for IDM" option
3. Click context menu option
4. Check clipboard và notification

**Expected Results**:
- ✅ Context menu appears
- ✅ URL copied successfully
- ✅ Notification displayed on page

## 🐛 Common Issues & Solutions

### Issue 1: Extension Not Loading
**Symptoms**: No extension icon, popup doesn't work
**Solutions**:
- Check manifest.json syntax
- Reload extension trong chrome://extensions/
- Check console for syntax errors

### Issue 2: No Audio URLs Detected
**Symptoms**: Popup always shows "Chưa có file âm thanh nào được phát hiện"
**Solutions**:
- Check content script injection
- Verify webRequest listeners working
- Test với `test_extension.html` first
- Check Network tab for audio requests

### Issue 3: Download Fails
**Symptoms**: Download button shows error, no file downloaded
**Solutions**:
- Check downloads permission
- Verify URL is accessible
- Test manual download của URL
- Check if IDM is running (for fallback)

### Issue 4: Copy Fails
**Symptoms**: Copy button doesn't work, clipboard empty
**Solutions**:
- Test clipboard API permissions
- Try manual copy của URL
- Check if site blocks clipboard access

### Issue 5: Popup Shows Errors
**Symptoms**: Red error messages trong popup
**Solutions**:
- Check background script console
- Verify message passing between scripts
- Check storage API errors

## 📊 Test Results Tracking

### Basic Functionality
- [ ] Extension loads: ✅/❌
- [ ] Popup opens: ✅/❌
- [ ] Permissions granted: ✅/❌
- [ ] APIs working: ✅/❌

### Audio Detection
- [ ] Simulated detection: ✅/❌
- [ ] Real aigei.com detection: ✅/❌
- [ ] URL formatting correct: ✅/❌
- [ ] Timestamps working: ✅/❌

### Download Features
- [ ] Chrome Downloads API: ✅/❌
- [ ] New tab fallback: ✅/❌
- [ ] Script injection: ✅/❌
- [ ] Copy URL: ✅/❌
- [ ] Context menu: ✅/❌

### User Interface
- [ ] Popup UI loads: ✅/❌
- [ ] Buttons work: ✅/❌
- [ ] Visual feedback: ✅/❌
- [ ] Error messages: ✅/❌
- [ ] Success messages: ✅/❌

## 📝 Debug Commands

### Console Commands for Testing
```javascript
// Check extension
chrome.runtime.id

// Test storage
chrome.storage.local.get(null).then(console.log)

// Test permissions
chrome.permissions.getAll().then(console.log)

// Send test message
chrome.runtime.sendMessage({type: 'TEST'})

// Simulate audio URL
window.postMessage({
  type: 'AUDIO_DETECTED',
  url: 'https://test.mp3'
}, '*')
```

### Background Script Debug
Open Extension DevTools:
1. Go to chrome://extensions/
2. Click "Service Worker" trên extension
3. Console will open for background script
4. Watch for message logs và errors

## 🎯 Success Criteria
Extension passes testing if:

1. **Basic Functions**: ✅ All APIs work, no console errors
2. **Detection**: ✅ Audio URLs detected từ both test page và real aigei.com
3. **Download**: ✅ At least one download method works (Chrome API, new tab, hoặc script injection)
4. **Copy**: ✅ URL copy to clipboard works reliably  
5. **UI**: ✅ Popup loads properly, buttons provide feedback, error/success messages clear
6. **Performance**: ✅ No significant page slowdown, memory leaks, hoặc crashes

## 📧 Reporting Issues
When reporting bugs, include:
- Chrome version
- Extension version
- Console logs (both page và background)
- Steps to reproduce
- Expected vs actual behavior
- Screenshots of errors
