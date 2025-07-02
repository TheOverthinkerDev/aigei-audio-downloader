# 🧪 TESTING GUIDE

## Cách test extension

### Test cơ bản:

1. **Load extension vào Chrome**
   - Mở `chrome://extensions/`
   - Load unpacked từ thư mục extension

2. **Kiểm tra extension đã load**
   - Extension xuất hiện trong danh sách
   - Icon 🎵 hiện trên toolbar
   - Click vào popup hiện interface

3. **Test trên aigei.com**
   - Vào trang `https://www.aigei.com`
   - Tìm và play một file audio preview
   - Check có notification "Phát hiện file âm thanh" không
   - Mở popup xem có file trong danh sách không

### Test nâng cao:

4. **Kiểm tra Network capture**
   - Mở DevTools (F12) > Network tab
   - Filter by "Media" hoặc search ".mp3"
   - Play audio và check extension có bắt được URL không

5. **Test download**
   - Click "Tải xuống" trên một file
   - Check file có được download về Downloads folder không
   - Thử mở file đã download

### Debug:

6. **Check Console logs**
   - DevTools > Console
   - Tìm logs từ extension: "Aigei Audio Downloader"
   - Check có error messages không

7. **Check Extension errors**
   - `chrome://extensions/` > Click "Errors" trên extension
   - Xem có lỗi JavaScript nào không

### Test cases:

- ✅ Extension loads successfully
- ✅ Popup opens with interface  
- ✅ Notifications show on aigei.com
- ✅ Audio URLs are captured
- ✅ Download works
- ✅ Clear function works
- ✅ Refresh function works

### Expected behavior trên aigei.com:

1. **Load trang:** Notification "Extension đã sẵn sàng"
2. **Play audio:** Notification "Phát hiện file âm thanh mới"  
3. **Popup:** Danh sách file với thời gian phát hiện
4. **Download:** File tải về với tên đúng
5. **Stats:** Số lượng file và downloads cập nhật

### Troubleshooting common issues:

**Không bắt được audio:**
- Check aigei.com có đổi cấu trúc URL không
- Xem Network tab có request audio nào không
- Check permissions trong manifest

**Download fail:**
- Chrome có block download không
- Check Downloads permission
- Thử với file khác

**Popup không mở:**
- Check có lỗi JavaScript không
- Reload extension
- Check manifest.json syntax

### Advanced testing:

**Performance:**
- Memory usage sau khi capture nhiều files
- Extension có làm chậm trang không

**Edge cases:**
- URLs có special characters
- Very long filenames  
- Multiple files cùng lúc
- Network interruption

Chúc bạn test thành công! 🎵
