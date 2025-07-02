# 🚀 HƯỚNG DẪN CÀI ĐẶT VÀ SỬ DỤNG

## Bước 1: Cài đặt Extension

### Cách 1: Tải từ GitHub
1. Download zip file từ GitHub hoặc clone repository:
   ```
   git clone <repository-url>
   ```

### Cách 2: Copy files thủ công
1. Tạo thư mục mới tên `aigei-audio-downloader`
2. Copy tất cả files vào thư mục đó

## Bước 2: Load Extension vào Chrome

1. **Mở Chrome Extensions:**
   - Gõ `chrome://extensions/` vào address bar
   - Hoặc Menu ⋮ > More tools > Extensions

2. **Bật Developer Mode:**
   - Tìm toggle "Developer mode" ở góc trên phải
   - Bật nó lên (ON)

3. **Load Extension:**
   - Click nút "Load unpacked"
   - Chọn thư mục chứa extension (có file manifest.json)
   - Extension sẽ xuất hiện với icon 🎵

4. **Pin Extension (tuỳ chọn):**
   - Click icon puzzle 🧩 trên toolbar Chrome
   - Tìm "Aigei Audio Downloader" và click pin 📌

## Bước 3: Sử dụng Extension

### Trên trang Aigei.com:

1. **Vào trang aigei.com**
   - Extension sẽ hiện thông báo "Aigei Audio Downloader đã sẵn sàng!"

2. **Nghe thử file âm thanh:**
   - Click play/preview bất kỳ file âm thanh nào
   - Extension sẽ tự động bắt URL và hiện thông báo "🎵 Phát hiện file âm thanh mới!"

3. **Xem danh sách file đã bắt:**
   - Click vào icon extension trên toolbar
   - Popup sẽ hiện danh sách các file âm thanh đã phát hiện

4. **Tải xuống:**
   - Click nút "📥 Tải xuống" bên cạnh file muốn tải
   - File sẽ được download về thư mục Downloads

### Các tính năng khác:

- **🔄 Làm mới:** Cập nhật danh sách file
- **🗑️ Xóa tất cả:** Xóa lịch sử file đã phát hiện
- **📊 Thống kê:** Xem số file đã phát hiện và đã tải

## Troubleshooting

### Extension không hoạt động:
1. Kiểm tra đã enable extension chưa
2. Refresh trang aigei.com (F5)
3. Kiểm tra Console có lỗi không (F12)

### Không bắt được file âm thanh:
1. Đảm bảo đang ở trang aigei.com
2. Thử click play file âm thanh khác
3. Check Network tab trong DevTools

### Không tải được file:
1. Kiểm tra quyền Downloads của extension
2. Thử tải file khác
3. Check popup có thông báo lỗi không

## Tips

- File âm thanh sẽ tự động bị xóa khỏi danh sách sau 1 giờ
- Extension chỉ hoạt động trên domain aigei.com
- Có thể tải nhiều file cùng lúc
- File được lưu với tên gốc từ server

## Cấu trúc Extension

```
aigei-audio-downloader/
├── manifest.json       # Cấu hình extension
├── background.js       # Service worker bắt network requests
├── content.js          # Script chạy trên trang aigei.com
├── popup.html          # Giao diện popup
├── popup.js           # Logic popup
├── icons/             # Icons cho extension
│   ├── icon16.svg
│   ├── icon48.svg
│   └── icon128.svg
└── README.md          # Tài liệu
```

Chúc bạn sử dụng extension hiệu quả! 🎵
