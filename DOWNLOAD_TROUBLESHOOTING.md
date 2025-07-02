# 🔧 DOWNLOAD TROUBLESHOOTING

## ❌ Vấn đề: Bấm tải xuống nhưng không có gì xảy ra

### 🎯 Extension đã được cải thiện với multiple download methods:

## 📥 Download Methods (Auto fallback):

### Method 1: Chrome Downloads API (Primary)
- Extension sẽ thử download qua Chrome trước
- File sẽ xuất hiện trong Downloads folder
- Nếu thành công: hiện "✅ Đã tải (Chrome)"

### Method 2: New Tab for IDM (Backup)
- Nếu Chrome API fail, sẽ mở tab mới với URL
- IDM sẽ tự động detect và hiện popup download
- Tab sẽ tự đóng sau 5 giây
- Hiện "✅ Mở tab (IDM)"

### Method 3: Script Injection (Final fallback)
- Inject download script trực tiếp vào trang
- Copy URL vào clipboard
- Hiện notification với instructions
- Hiện "✅ Script injected"

## 🎯 IDM Integration:

### Cách 1: Copy URL Button
- Click nút 📋 bên cạnh nút tải xuống
- URL sẽ được copy vào clipboard
- Mở IDM và paste URL (Ctrl+V)

### Cách 2: Context Menu
- Right-click vào audio/video element trên aigei.com
- Chọn "Copy Audio URL for IDM"
- URL tự động copy vào clipboard

### Cách 3: Manual IDM Capture
1. Mở IDM
2. Bật "Monitor Browser" trong IDM
3. Play audio trên aigei.com
4. IDM sẽ tự động detect và hiện popup

## 🛠️ Troubleshooting Steps:

### Bước 1: Check Extension Status
```
1. Mở chrome://extensions/
2. Verify "Aigei Audio Downloader" is enabled
3. Check không có error messages
4. Reload extension nếu cần
```

### Bước 2: Check Permissions
```
1. Extension cần permissions:
   - Downloads ✓
   - Tabs ✓  
   - Scripting ✓
   - webRequest ✓
   - aigei.com access ✓
```

### Bước 3: Test Download Methods
```
1. Try Chrome download first
2. If fails, check new tab opens
3. Look for clipboard notification
4. Check IDM is running and monitoring
```

### Bước 4: Manual Methods
```
1. Copy URL using 📋 button
2. Paste in IDM manually
3. Or save file from Network tab in DevTools
```

## 🔍 Debug Information:

### Console Logs to Check:
```javascript
// Mở DevTools (F12) và check Console:
- "Download response: {method: 'chrome_download'}"
- "Chrome download started: [downloadId]"
- "Opened in new tab for IDM capture"
- "Download script injected successfully"
```

### Network Tab:
```
1. F12 → Network tab
2. Filter by "Media" 
3. Play audio on aigei.com
4. Right-click audio request → Save as
```

## ⚡ Quick Solutions:

### Chrome Downloads Not Working:
```
1. Check Chrome download folder permissions
2. Try different download location
3. Disable "Ask where to save" in Chrome settings
```

### IDM Not Detecting:
```
1. Enable "Monitor Applications" in IDM
2. Add Chrome to monitored browsers
3. Restart IDM service
4. Check IDM is not in quiet mode
```

### Extension Not Detecting Audio:
```
1. Refresh aigei.com page
2. Wait for "Extension ready" notification  
3. Try different audio file
4. Check Network tab for .mp3/.wav requests
```

## 📋 Expected Results:

✅ **Success Scenarios:**
- Chrome downloads file automatically
- IDM popup appears for download
- URL copied to clipboard with notification
- New tab opens briefly then closes

❌ **If Still Not Working:**
1. Use manual URL copy (📋 button)
2. Paste URL directly in IDM
3. Use browser's "Save link as"
4. Download from Network tab in DevTools

## 💡 Pro Tips:

- IDM works best with direct file URLs
- Some URLs may have expiration tokens
- Try downloading immediately after detection
- Keep IDM running and monitoring browsers

---
**Updated: Extension now has 3-layer fallback system for maximum compatibility! 🎵**
