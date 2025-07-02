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

// Xử lý download với multiple methods
chrome.runtime.onMessage.addListener(async (message, sender, sendResponse) => {
  console.log('Background received message:', message.type, message);
  
  if (message.type === 'DOWNLOAD_AUDIO') {
    const { url, filename, tabId } = message;
    
    // Tạo tên file nếu không có
    const finalFilename = filename || generateFilename(url);
    
    console.log('Attempting download:', { url, finalFilename, tabId, sender });

    try {
      const downloadId = await chrome.downloads.download({
        url,
        filename: finalFilename,
        saveAs: false,
        conflictAction: 'uniquify'
      });
      console.log('Chrome download started successfully:', downloadId);
      sendResponse({ success: true, method: 'chrome_download', downloadId });
    } catch (downloadError) {
      console.error('Chrome download failed:', downloadError);
      try {
        const tab = await chrome.tabs.create({ url, active: false });
        console.log('New tab created for IDM capture:', tab.id);
        setTimeout(() => {
          chrome.tabs.remove(tab.id).catch(console.error);
        }, 5000);
        sendResponse({ success: true, method: 'new_tab', tabId: tab.id });
      } catch (tabError) {
        console.error('Tab creation failed:', tabError);
        const targetTabId = tabId || (sender.tab && sender.tab.id);
        if (targetTabId) {
          injectDownloadScript(url, finalFilename, targetTabId, sendResponse);
        } else {
          console.error('No tab ID available for script injection');
          sendResponse({ success: false, error: 'No tab context available for script injection' });
        }
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

// Function inject download script vào tab
function injectDownloadScript(url, filename, tabId, sendResponse) {
  chrome.scripting.executeScript({
    target: { tabId: tabId },
    func: function(downloadUrl, downloadFilename) {
      console.log('Injecting download script for:', downloadUrl);
      
      // Method 1: Create download link
      const link = document.createElement('a');
      link.href = downloadUrl;
      link.download = downloadFilename;
      link.style.display = 'none';
      
      // Safely append to body
      if (document.body) {
        document.body.appendChild(link);
        
        // Trigger download
        link.click();
        
        // Clean up
        setTimeout(() => {
          if (document.body.contains(link)) {
            document.body.removeChild(link);
          }
        }, 1000);
      }
      
      // Method 2: Copy to clipboard
      if (navigator.clipboard) {
        navigator.clipboard.writeText(downloadUrl).then(() => {
          console.log('URL copied to clipboard');
        }).catch((error) => {
          console.log('Clipboard copy failed:', error);
        });
      }
      
      // Method 3: Show notification to user
      const notification = document.createElement('div');
      notification.style.cssText = 'position: fixed; top: 20px; right: 20px; background: #4CAF50; color: white; padding: 15px; border-radius: 8px; z-index: 99999; font-family: Arial; max-width: 300px; box-shadow: 0 4px 12px rgba(0,0,0,0.3);';
      
      notification.innerHTML = '<strong>🎵 Audio Download</strong><br>File: ' + downloadFilename + '<br><small>URL copied to clipboard. Use IDM or paste in browser.</small><button onclick="this.parentElement.remove()" style="float: right; background: none; border: none; color: white; cursor: pointer; font-size: 16px; margin-left: 10px;">×</button>';
      
      if (document.body) {
        document.body.appendChild(notification);
        
        // Auto remove notification
        setTimeout(() => {
          if (document.body.contains(notification)) {
            notification.remove();
          }
        }, 10000);
      }
      
      return 'Download script executed successfully';
    },
    args: [url, filename]
  }, (results) => {
    if (chrome.runtime.lastError) {
      console.error('Script injection failed:', chrome.runtime.lastError);
      sendResponse({ success: false, error: 'Script injection failed', lastError: chrome.runtime.lastError.message });
    } else {
      console.log('Download script injected successfully');
      sendResponse({ success: true, method: 'script_injection', results: results });
    }
  });
}
