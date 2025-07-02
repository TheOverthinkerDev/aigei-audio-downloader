# 🎵 Aigei Audio Downloader

Chrome extension để tự động bắt và tải file âm thanh từ trang web aigei.com.

![Chrome Extension](https://img.shields.io/badge/Chrome-Extension-green)
![Manifest V3](https://img.shields.io/badge/Manifest-V3-blue)
![License](https://img.shields.io/badge/License-MIT-yellow)

## ✨ Tính năng

- 🎵 **Tự động phát hiện:** Bắt file âm thanh khi preview trên aigei.com
- 📥 **Tải xuống dễ dàng:** Download với 1 click 
- 📊 **Thống kê:** Theo dõi số file đã phát hiện và tải xuống
- 🔄 **Tự động cập nhật:** Làm mới danh sách real-time
- 🗑️ **Quản lý:** Xóa lịch sử file đã phát hiện
- 🎯 **Chính xác:** Hỗ trợ nhiều định dạng audio (.mp3, .wav, .m4a, .flac, .aac)
- ⚡ **Nhanh chóng:** Không ảnh hưởng tốc độ browse web

## 🚀 Cài đặt nhanh

### Option 1: Clone từ GitHub
```bash
git clone https://github.com/yourusername/aigei-audio-downloader.git
cd aigei-audio-downloader
```

### Option 2: Download ZIP
1. Click **"Code"** → **"Download ZIP"** 
2. Extract vào folder bất kỳ

### Load vào Chrome:
1. Mở `chrome://extensions/`
2. Bật **"Developer mode"** 
3. Click **"Load unpacked"**
4. Chọn thư mục extension

## 📖 Hướng dẫn chi tiết

- **[INSTALL.md](INSTALL.md)** - Hướng dẫn cài đặt từng bước
- **[QUICK_FIX.md](QUICK_FIX.md)** - Sửa lỗi nhanh nếu gặp vấn đề
- **[TESTING_DETAILED.md](TESTING_DETAILED.md)** - Test chi tiết

## 🧪 Testing nhanh

1. Load extension trong Chrome
2. Mở `simple_test.html` và click **"Check Extension"**
3. Kiểm tra popup hoạt động
4. Test trên aigei.com thực tế

## 🎯 Cách hoạt động

Extension hoạt động bằng cách:

1. **Monitor Network:** Theo dõi requests từ aigei.com
2. **Detect Audio:** Phát hiện URLs chứa file âm thanh  
3. **Capture & Store:** Lưu URLs vào Chrome storage
4. **Download:** Sử dụng Chrome Downloads API hoặc fallback methods

## 📁 Cấu trúc project

```
aigei-audio-downloader/
├── manifest.json           # Extension configuration
├── background.js           # Service worker - network monitoring
├── content.js             # Content script - page interaction  
├── popup.html             # Extension popup interface
├── popup.js               # Popup functionality
├── simple_test.html       # Quick test page
├── INSTALL.md             # Installation guide
├── QUICK_FIX.md          # Troubleshooting guide
└── TESTING_DETAILED.md   # Comprehensive testing
```

## ⚙️ Requirements

- **Chrome 88+** (hoặc Edge, Brave - Chromium-based browsers)
- **Manifest V3** support
- **Developer mode** enabled trong Extensions

## 🔧 Permissions

Extension cần các permissions sau:
- `downloads` - Download files
- `storage` - Lưu detected URLs  
- `scripting` - Inject scripts when needed
- `tabs` - Access tab information
- `webRequest` - Monitor network requests
- `contextMenus` - Right-click menu
- Host permission cho `*://*.aigei.com/*`

## 🚨 Troubleshooting

### Extension không load?
1. Check [QUICK_FIX.md](QUICK_FIX.md)
2. Reload extension trong chrome://extensions/
3. Check console errors

### Download không hoạt động?
1. Verify extension permissions
2. Test với simple_test.html trước
3. Check background script console

## 🤝 Contributing

1. Fork repository
2. Create feature branch: `git checkout -b feature-name`
3. Commit changes: `git commit -m 'Add feature'`
4. Push to branch: `git push origin feature-name`
5. Submit pull request

## 📄 License

MIT License - see [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- Aigei.com for the audio platform
- Chrome Extensions API documentation
- Open source community

## ⭐ Support

Nếu extension hữu ích, hãy cho một ⭐ trên GitHub!

---

**Disclaimer:** Extension này chỉ dành cho mục đích giáo dục và nghiên cứu. Hãy tôn trọng bản quyền và điều khoản sử dụng của aigei.com.
