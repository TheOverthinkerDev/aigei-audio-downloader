#!/bin/bash

# Script kiểm tra Chrome Extension đã sẵn sàng chưa

echo "🔍 Kiểm tra Aigei Audio Downloader Extension..."
echo "================================================"

# Check required files
files=(
    "manifest.json"
    "background.js" 
    "content.js"
    "popup.html"
    "popup.js"
    "icons/icon16.svg"
    "icons/icon48.svg"
    "icons/icon128.svg"
    "README.md"
    "INSTALL.md"
    "TESTING.md"
)

missing_files=()

for file in "${files[@]}"; do
    if [ -f "$file" ]; then
        echo "✅ $file"
    else
        echo "❌ $file - THIẾU FILE"
        missing_files+=("$file")
    fi
done

echo ""
echo "📊 KẾT QUẢ KIỂM TRA:"
echo "===================="

if [ ${#missing_files[@]} -eq 0 ]; then
    echo "🎉 TẤT CẢ FILES ĐÃ SẴN SÀNG!"
    echo ""
    echo "📋 BƯỚC TIẾP THEO:"
    echo "1. Mở Chrome và vào chrome://extensions/"
    echo "2. Bật Developer mode"
    echo "3. Click 'Load unpacked' và chọn thư mục này"
    echo "4. Vào aigei.com để test extension"
    echo ""
    echo "📖 Xem thêm: INSTALL.md và TESTING.md"
else
    echo "⚠️  CÒN THIẾU ${#missing_files[@]} FILES:"
    for file in "${missing_files[@]}"; do
        echo "   - $file"
    done
fi

echo ""
echo "🔗 Extension sẽ hoạt động trên: *.aigei.com"
echo "🎵 Chúc bạn thành công!"
