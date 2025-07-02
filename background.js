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
    
    // Tạo tên file nếu không có
    const finalFilename = filename || generateFilename(url);
    
    console.log('Sending to IDM:', { url, finalFilename, tabId });

    try {
      // Method 1: Mở tab mới để IDM tự động bắt URL
      const tab = await chrome.tabs.create({ url, active: false });
      console.log('New tab created for IDM capture:', tab.id);
      
      // Đóng tab sau 3 giây để IDM có thời gian bắt URL
      setTimeout(() => {
        chrome.tabs.remove(tab.id).catch(console.error);
      }, 3000);
      
      sendResponse({ success: true, method: 'idm_new_tab', tabId: tab.id });
      
    } catch (tabError) {
      console.error('Tab creation failed, trying script injection:', tabError);
      
      // Method 2: Inject script để copy URL cho IDM
      const targetTabId = tabId || (sender.tab && sender.tab.id);
      if (targetTabId) {
        injectIDMScript(url, finalFilename, targetTabId, sendResponse);
      } else {
        sendResponse({ success: false, error: 'No tab available for IDM integration' });
      }
    }
    
    return true; // Giữ message channel mở cho async response
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
      console.log('Injecting IDM script for:', downloadUrl);
      
      // Method 1: Copy URL to clipboard for IDM
      if (navigator.clipboard) {
        navigator.clipboard.writeText(downloadUrl).then(() => {
          console.log('URL copied to clipboard for IDM');
        }).catch((error) => {
          console.log('Clipboard copy failed:', error);
        });
      }
      
      // Method 2: Show IDM instruction notification
      const notification = document.createElement('div');
      notification.style.cssText = `
        position: fixed; top: 20px; right: 20px; 
        background: #2196F3; color: white; 
        padding: 20px; border-radius: 12px; 
        z-index: 99999; font-family: Arial; 
        max-width: 350px; 
        box-shadow: 0 6px 20px rgba(0,0,0,0.3);
        border: 2px solid #1976D2;
      `;
      
      notification.innerHTML = `
        <div style="font-size: 16px; font-weight: bold; margin-bottom: 10px;">
          🎵 Aigei Audio Ready for IDM
        </div>
        <div style="margin-bottom: 10px;">
          <strong>File:</strong> ${downloadFilename}
        </div>
        <div style="margin-bottom: 15px; font-size: 14px;">
          <strong>URL copied to clipboard!</strong><br>
          Open IDM and paste (Ctrl+V) to start download.
        </div>
        <div style="font-size: 12px; opacity: 0.9; margin-bottom: 10px;">
          If IDM doesn't auto-detect, use:<br>
          "Downloads" → "Add URL" → Paste
        </div>
        <button onclick="this.parentElement.remove()" 
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
        
        // Auto remove notification after 15 seconds
        setTimeout(() => {
          if (document.body.contains(notification)) {
            notification.remove();
          }
        }, 15000);
      }
      
      // Method 3: Try to trigger IDM detection with invisible link
      const hiddenLink = document.createElement('a');
      hiddenLink.href = downloadUrl;
      hiddenLink.download = downloadFilename;
      hiddenLink.style.display = 'none';
      
      if (document.body) {
        document.body.appendChild(hiddenLink);
        // Click to trigger any download managers
        hiddenLink.click();
        
        // Clean up
        setTimeout(() => {
          if (document.body.contains(hiddenLink)) {
            document.body.removeChild(hiddenLink);
          }
        }, 2000);
      }
      
      return 'IDM script executed successfully';
    },
    args: [url, filename]
  }, (results) => {
    if (chrome.runtime.lastError) {
      console.error('IDM script injection failed:', chrome.runtime.lastError);
      sendResponse({ success: false, error: 'IDM script injection failed', lastError: chrome.runtime.lastError.message });
    } else {
      console.log('IDM script injected successfully');
      sendResponse({ success: true, method: 'idm_script_injection', results: results });
    }
  });
}
