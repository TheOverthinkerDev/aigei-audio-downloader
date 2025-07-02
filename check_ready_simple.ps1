# PowerShell script kiểm tra Chrome Extension

Write-Host "🔍 Kiểm tra Aigei Audio Downloader Extension..." -ForegroundColor Cyan
Write-Host "================================================" -ForegroundColor Cyan

# Check required files
$files = @(
    "manifest.json",
    "background.js", 
    "content.js",
    "popup.html",
    "popup.js",
    "icons/icon16.svg",
    "icons/icon48.svg", 
    "icons/icon128.svg",
    "README.md",
    "INSTALL.md",
    "TESTING.md"
)

$missingFiles = @()

foreach ($file in $files) {
    if (Test-Path $file) {
        Write-Host "✅ $file" -ForegroundColor Green
    } else {
        Write-Host "❌ $file - THIẾU FILE" -ForegroundColor Red
        $missingFiles += $file
    }
}

Write-Host ""
Write-Host "📊 KẾT QUẢ KIỂM TRA:" -ForegroundColor Yellow
Write-Host "===================="

if ($missingFiles.Count -eq 0) {
    Write-Host "🎉 TẤT CẢ FILES ĐÃ SẴN SÀNG!" -ForegroundColor Green
    Write-Host ""
    Write-Host "📋 BƯỚC TIẾP THEO:" -ForegroundColor Cyan
    Write-Host "1. Mở Chrome và vào chrome://extensions/"
    Write-Host "2. Bật Developer mode"
    Write-Host "3. Click 'Load unpacked' và chọn thư mục này"
    Write-Host "4. Vào aigei.com để test extension"
    Write-Host ""
    Write-Host "📖 Xem thêm: INSTALL.md và TESTING.md"
} else {
    Write-Host "⚠️  CÒN THIẾU $($missingFiles.Count) FILES:" -ForegroundColor Yellow
    foreach ($file in $missingFiles) {
        Write-Host "   - $file" -ForegroundColor Red
    }
}

Write-Host ""
Write-Host "🔗 Extension sẽ hoạt động trên: *.aigei.com" -ForegroundColor Magenta
Write-Host "🎵 Chúc bạn thành công!" -ForegroundColor Green

# Pause để user có thể đọc kết quả
Read-Host "Nhấn Enter để tiếp tục..."
