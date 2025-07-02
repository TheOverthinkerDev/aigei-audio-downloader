# Aigei Audio Downloader

Chrome extension để tự động bắt và tải file âm thanh từ trang web aigei.com.

## ✨ Tính năng

- 🎵 **Tự động phát hiện:** Bắt file âm thanh khi preview trên aigei.com
- 📥 **Tải xuống dễ dàng:** Download với 1 click 
- 📊 **Thống kê:** Theo dõi số file đã phát hiện và tải xuống
- 🔄 **Tự động cập nhật:** Làm mới danh sách real-time
- 🗑️ **Quản lý:** Xóa lịch sử file đã phát hiện
- 🎯 **Chính xác:** Hỗ trợ nhiều định dạng audio (.mp3, .wav, .m4a, .flac, .aac)
- ⚡ **Nhanh chóng:** Không ảnh hưởng tốc độ browse web

## 🚀 Cài đặt nhanh

1. **Download extension:**
   ```bash
   git clone [repository-url]
   # hoặc download zip
   ```

2. **Load vào Chrome:**
   - Mở `chrome://extensions/`
   - Bật "Developer mode" 
   - Click "Load unpacked"
   - Chọn thư mục extension

3. **Sử dụng:**
   - Vào aigei.com
   - Play preview audio
   - Click icon extension để download

📖 **Chi tiết:** Xem [INSTALL.md](INSTALL.md)

## 🎯 Cách hoạt động

Extension hoạt động bằng cách:

1. **Monitor Network:** Theo dõi requests từ aigei.com
2. **Detect Audio:** Phát hiện URLs chứa file âm thanh  
3. **Capture & Store:** Lưu URLs vào Chrome storage
4. **Download:** Sử dụng Chrome Downloads API

## 📁 Cấu trúc files

```
aigei-audio-downloader/
├── manifest.json      # Cấu hình extension
├── background.js      # Service worker bắt network requests  
├── content.js         # Script chạy trên aigei.com
├── popup.html         # Giao diện popup
├── popup.js          # Logic popup
├── icons/            # Icons cho extension
│   ├── icon16.svg
│   ├── icon48.svg  
│   └── icon128.svg
├── README.md         # Documentation chính
├── INSTALL.md        # Hướng dẫn cài đặt chi tiết
├── TESTING.md        # Guide test extension
└── check_ready.ps1   # Script kiểm tra files
```

## 🧪 Testing & Debugging

### Quick Test
1. Load extension trong Chrome (xem [INSTALL.md](INSTALL.md))
2. Mở `test_extension.html` và click "Check Extension"
3. Kiểm tra popup hoạt động
4. Test trên aigei.com thực tế

### Detailed Testing
- **[TESTING_DETAILED.md](TESTING_DETAILED.md)** - Hướng dẫn test chi tiết
- **`test_extension.html`** - Test page với simulated audio
- **`debug_full.js`** - Debug script để check extension health

### Debug Commands
```javascript
// Trong console của bất kỳ trang nào
debugAigeiExtension(); // Chạy full diagnostic

// Trong background script console
console.log('Extension status check');
```

## ⚙️ Requirements

- Chrome browser (version 88+)
- Permissions: downloads, webRequest, activeTab, storage
- Domain: *.aigei.com

## 🔧 Troubleshooting

**Extension không hoạt động:**
- ✅ Kiểm tra đã enable extension
- ✅ Refresh trang aigei.com
- ✅ Check Console có lỗi gì không

**Không bắt được audio:**
- ✅ Đảm bảo đang ở aigei.com
- ✅ Thử play file audio khác
- ✅ Check Network tab trong DevTools

**Download fail:**
- ✅ Check permissions Downloads
- ✅ Thử file khác
- ✅ Check popup có báo lỗi không

## 🤝 Contributing

Feel free to:
- Report bugs
- Suggest features  
- Submit pull requests
- Improve documentation

## 📝 License

MIT License - Tự do sử dụng và chỉnh sửa.

## 👨‍💻 Tác giả

Được tạo bởi GitHub Copilot theo yêu cầu của người dùng.

---

🎵 **Happy downloading!** Chúc bạn tải được nhiều file âm thanh hay!
