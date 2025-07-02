// Background script để bắt các request âm thanh
let audioUrls = [];

// Lắng nghe các network request
chrome.webRequest.onBeforeRequest.addListener(
  function(details) {
    // Kiểm tra nếu URL chứa file audio từ aigei
    const isAudioUrl = details.url.includes('aigei.com') && 
        (details.url.includes('.mp3') || 
         details.url.includes('.wav') || 
         details.url.includes('.m4a') ||
         details.url.includes('.flac') ||
         details.url.includes('.aac') ||
         details.url.includes('audio/') ||
         (details.url.includes('/src/aud/') && details.url.includes('.')));
    
    if (isAudioUrl) {
      console.log('Phát hiện audio URL:', details.url);
      
      // Kiểm tra xem URL đã tồn tại chưa để tránh duplicate
      const isDuplicate = audioUrls.some(audio => audio.url === details.url);
      
      if (!isDuplicate) {
        // Lưu URL vào storage
        const audioData = {
          url: details.url,
          timestamp: Date.now(),
          tabId: details.tabId,
          filename: extractFilenameFromUrl(details.url)
        };
        
        audioUrls.push(audioData);
        
        // Lưu vào Chrome storage
        chrome.storage.local.set({
          'audioUrls': audioUrls
        });
        
        // Gửi thông báo đến popup nếu đang mở
        chrome.runtime.sendMessage({
          type: 'NEW_AUDIO_URL',
          data: audioData
        }).catch(() => {
          // Popup có thể chưa mở, bỏ qua lỗi
        });
        
        console.log('Đã lưu audio URL:', audioData.filename);
      }
    }
  },
  {
    urls: ["*://*.aigei.com/*"]
  },
  ["requestBody"]
);

// Tạo context menu
chrome.runtime.onInstalled.addListener(() => {
  chrome.contextMenus.create({
    id: "copyAudioUrl",
    title: "Copy Audio URL for IDM",
    contexts: ["audio", "video"],
    documentUrlPatterns: ["*://*.aigei.com/*"]
  });
});

// Xử lý context menu clicks
chrome.contextMenus.onClicked.addListener((info, tab) => {
  if (info.menuItemId === "copyAudioUrl") {
    const url = info.srcUrl || info.linkUrl;
    if (url) {
      // Inject script để copy URL
      chrome.scripting.executeScript({
        target: { tabId: tab.id },
        func: (audioUrl) => {
          navigator.clipboard.writeText(audioUrl).then(() => {
            console.log('Audio URL copied:', audioUrl);
            
            // Show notification
            const notification = document.createElement('div');
            notification.style.cssText = `
              position: fixed; top: 20px; right: 20px; background: #4CAF50; color: white;
              padding: 15px; border-radius: 8px; z-index: 99999; font-family: Arial;
              box-shadow: 0 4px 12px rgba(0,0,0,0.3);
            `;
            notification.innerHTML = `
              🎵 Audio URL copied!<br>
              <small>Paste vào IDM để tải xuống</small>
              <button onclick="this.parentElement.remove()" style="float: right; background: none; border: none; color: white; cursor: pointer;">×</button>
            `;
            document.body.appendChild(notification);
            
            setTimeout(() => {
              if (notification.parentElement) {
                notification.remove();
              }
            }, 5000);
          });
        },
        args: [url]
      });
    }
  }
});

// Xử lý download - Tập trung vào IDM integration
chrome.runtime.onMessage.addListener(async (message, sender, sendResponse) => {
  console.log('Background received message:', message.type, message);
  
  if (message.type === 'DOWNLOAD_AUDIO') {
    const { url, filename, tabId } = message;
    console.log(`Starting download for: ${url}`);

    // Phương pháp 1: Dùng chrome.downloads.download trực tiếp
    // IDM sẽ bắt link này. Header Referer được thêm tự động bởi declarativeNetRequest
    chrome.downloads.download({
      url: url,
      filename: filename || 'aigei_download.mp3',
      saveAs: true
    }, (downloadId) => {
      if (chrome.runtime.lastError) {
        console.error('Download failed, falling back to clipboard method:', chrome.runtime.lastError.message);
        // Nếu lỗi (ví dụ: do Chrome chặn), chuyển sang phương pháp 2
        injectIDMScript(url, filename, tabId, sendResponse);
      } else {
        console.log(`Download started with ID: ${downloadId}`);
        sendResponse({ success: true, method: 'direct_download' });
      }
    });

    return true; // Giữ kênh message mở cho các phản hồi bất đồng bộ
  }
  
  if (message.type === 'GET_AUDIO_URLS') {
    try {
      const result = await chrome.storage.local.get(['audioUrls']);
      sendResponse({ audioUrls: result.audioUrls || [] });
    } catch (e) {
      console.error('Error getting audio URLs:', e);
      sendResponse({ audioUrls: [] });
    }
    return true;
  }
  
  if (message.type === 'CLEAR_AUDIO_URLS') {
    audioUrls = [];
    await chrome.storage.local.set({ 'audioUrls': [] });
    sendResponse({ success: true });
  }
});

// Tạo tên file từ URL
function generateFilename(url) {
  try {
    const urlObj = new URL(url);
    const pathname = urlObj.pathname;
    const filename = pathname.split('/').pop();
    
    if (filename && filename.includes('.')) {
      return `aigei_audio_${filename}`;
    } else {
      const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
      return `aigei_audio_${timestamp}.mp3`;
    }
  } catch (e) {
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    return `aigei_audio_${timestamp}.mp3`;
  }
}

// Extract filename từ URL (helper function)
function extractFilenameFromUrl(url) {
  try {
    const urlObj = new URL(url);
    const pathname = urlObj.pathname;
    const filename = pathname.split('/').pop();
    
    if (filename && filename.includes('.')) {
      return filename;
    } else {
      // Tạo filename từ hash hoặc path
      const segments = pathname.split('/').filter(s => s.length > 0);
      const lastSegment = segments[segments.length - 1];
      if (lastSegment && lastSegment.length > 10) {
        return `${lastSegment.substring(0, 20)}.mp3`;
      }
      return `audio_${Date.now()}.mp3`;
    }
  } catch (e) {
    return `audio_${Date.now()}.mp3`;
  }
}

// Cleanup old URLs (giữ trong 1 giờ)
setInterval(() => {
  const oneHourAgo = Date.now() - (60 * 60 * 1000);
  audioUrls = audioUrls.filter(audio => audio.timestamp > oneHourAgo);
  chrome.storage.local.set({ 'audioUrls': audioUrls });
}, 10 * 60 * 1000); // Chạy mỗi 10 phút

// Function inject IDM script vào tab
function injectIDMScript(url, filename, tabId, sendResponse) {
  chrome.scripting.executeScript({
    target: { tabId: tabId },
    func: function(downloadUrl, downloadFilename) {
      console.log('Injecting IDM helper script for:', downloadUrl);
      
      // The most reliable method: copy to clipboard and show instructions.
      if (navigator.clipboard) {
        navigator.clipboard.writeText(downloadUrl).then(() => {
          console.log('URL copied to clipboard for IDM');
        }).catch((error) => {
          console.error('Clipboard copy failed:', error);
        });
      }
      
      // Show a clear, helpful notification on the page.
      const oldNotification = document.getElementById('aigei-idm-notification');
      if (oldNotification) oldNotification.remove();

      const notification = document.createElement('div');
      notification.id = 'aigei-idm-notification';
      notification.style.cssText = `
        position: fixed; top: 20px; right: 20px; 
        background: #2196F3; color: white; 
        padding: 20px; border-radius: 12px; 
        z-index: 99999; font-family: Arial, sans-serif; 
        max-width: 350px; 
        box-shadow: 0 6px 20px rgba(0,0,0,0.3);
        border: 2px solid #1976D2;
        transition: opacity 0.4s, transform 0.4s cubic-bezier(0.25, 1, 0.5, 1);
        transform: translateX(110%);
        opacity: 0;
      `;
      
      notification.innerHTML = `
        <div style="font-size: 16px; font-weight: bold; margin-bottom: 10px;">
          🎵 IDM Download Ready
        </div>
        <div style="margin-bottom: 15px; font-size: 14px; line-height: 1.4;">
          <strong>URL has been copied to your clipboard!</strong><br>
          Open IDM and click "Add Url" to begin the download.
        </div>
        <div style="font-size: 12px; opacity: 0.9; margin-bottom: 10px;">
          This is the most reliable way to download protected files.
        </div>
        <button onclick="this.parentElement.style.transform='translateX(110%)'; this.parentElement.style.opacity=0; setTimeout(() => this.parentElement.remove(), 500)" 
                style="float: right; background: rgba(255,255,255,0.2); 
                       border: 1px solid rgba(255,255,255,0.3); 
                       color: white; cursor: pointer; 
                       padding: 5px 10px; border-radius: 4px;">
          ✓ Got it
        </button>
        <div style="clear: both;"></div>
      `;
      
      if (document.body) {
        document.body.appendChild(notification);
        // Animate in
        setTimeout(() => {
            notification.style.transform = 'translateX(0)';
            notification.style.opacity = '1';
        }, 100);
        
        // Auto remove notification after 15 seconds
        setTimeout(() => {
          if (document.body.contains(notification)) {
            notification.style.transform = 'translateX(110%)';
            notification.style.opacity = '0';
            setTimeout(() => notification.remove(), 500);
          }
        }, 15000);
      }
      
      return 'IDM helper script executed. User has been instructed.';
    },
    args: [url, filename]
  }, (results) => {
    if (chrome.runtime.lastError) {
      console.error('IDM script injection failed:', chrome.runtime.lastError);
      sendResponse({ success: false, error: 'IDM script injection failed', details: chrome.runtime.lastError.message });
    } else {
      console.log('IDM script injected successfully');
      sendResponse({ success: true, method: 'idm_script_injection' });
    }
  });
}
