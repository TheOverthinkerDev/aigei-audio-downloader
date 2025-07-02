// Background script để bắt các request âm thanh
let audioUrls = [];

// Function to update the badge count on the extension icon
function updateBadge() {
  chrome.storage.local.get(['audioUrls'], (result) => {
    const count = result.audioUrls ? result.audioUrls.length : 0;
    chrome.action.setBadgeText({ text: count > 0 ? count.toString() : '' });
    if (count > 0) {
      // Set a noticeable color for the badge
      chrome.action.setBadgeBackgroundColor({ color: '#4CAF50' }); // Green
    }
  });
}

// Khởi tạo danh sách URL từ storage khi service worker khởi động
chrome.storage.local.get(['audioUrls'], (result) => {
  if (result.audioUrls) {
    audioUrls = result.audioUrls;
    console.log('Đã khôi phục danh sách audio URLs từ storage:', audioUrls);
  }
  updateBadge(); // Update badge on startup
});

// Lắng nghe các network request
chrome.webRequest.onBeforeRequest.addListener(
  function(details) {
    // Kiểm tra nếu là media request hoặc có đuôi file âm thanh
    const isMediaRequest = details.type === 'media';
    const hasAudioExtension = details.url.endsWith('.mp3') || 
                            details.url.endsWith('.wav') || 
                            details.url.endsWith('.m4a') ||
                            details.url.endsWith('.flac') ||
                            details.url.endsWith('.aac');

    if (details.url.includes('aigei.com') && (isMediaRequest || hasAudioExtension)) {
      console.log('Phát hiện media URL:', details.url, 'Type:', details.type);
      
      // Sử dụng hàm async để xử lý storage một cách an toàn
      (async () => {
        // Lấy danh sách mới nhất từ storage để tránh ghi đè
        const result = await chrome.storage.local.get(['audioUrls']);
        let currentUrls = result.audioUrls || [];

        const isDuplicate = currentUrls.some(audio => audio.url === details.url);
        
        if (!isDuplicate) {
          const audioData = {
            url: details.url,
            timestamp: Date.now(),
            tabId: details.tabId,
            filename: extractFilenameFromUrl(details.url)
          };
          
          currentUrls.push(audioData);
          audioUrls = currentUrls; // Cập nhật cache trong bộ nhớ
          
          await chrome.storage.local.set({ 'audioUrls': currentUrls });
          updateBadge(); // Update badge when new URL is added

          // --- NEW: Show the Download Now/Later prompt instead of just a notification ---
          if (details.tabId > 0) { // Ensure we have a valid tab to inject into
            injectDownloadPrompt(audioData.url, audioData.filename, details.tabId);
          }
          
          // Gửi thông báo đến popup nếu đang mở để cập nhật danh sách
          chrome.runtime.sendMessage({
            type: 'NEW_AUDIO_URL',
            data: audioData
          }).catch(() => {
            // Popup có thể chưa mở, bỏ qua lỗi
          });
          
          console.log('Đã lưu audio URL:', audioData.filename);
        }
      })();
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
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  console.log('Background received message:', message.type, message);
  
  if (message.type === 'DOWNLOAD_AUDIO') {
    const { url, filename } = message;

    const startDownloadInjection = (tabId) => {
      if (!tabId) {
        console.error("Could not determine the target tab for injection.");
        sendResponse({ success: false, error: "Could not find active tab." });
        return;
      }
      
      console.log(`Download request for: ${url}. Forcing IDM/Clipboard method on tab ${tabId}.`);
      // Bỏ qua chrome.downloads.download và đi thẳng đến phương pháp clipboard/IDM
      // vì đây là cách đáng tin cậy nhất cho các URL được bảo vệ.
      injectIDMScript(url, filename, tabId, sendResponse);
    };

    // Lấy tabId một cách an toàn. Ưu tiên sender.tab.id, nếu không có thì query tab active.
    if (sender.tab && sender.tab.id) {
      startDownloadInjection(sender.tab.id);
    } else {
      chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
        if (tabs && tabs.length > 0) {
          startDownloadInjection(tabs[0].id);
        } else {
          console.error("No active tab found to inject the script.");
          sendResponse({ success: false, error: "No active tab found." });
        }
      });
    }

    return true; // Giữ kênh message mở cho các phản hồi bất đồng bộ
  }
  
  if (message.type === 'GET_AUDIO_URLS') {
    (async () => {
        try {
            const result = await chrome.storage.local.get(['audioUrls']);
            sendResponse({ audioUrls: result.audioUrls || [] });
        } catch (e) {
            console.error('Error getting audio URLs:', e);
            sendResponse({ audioUrls: [] });
        }
    })();
    return true; // Correctly return true for async response
  }
  
  if (message.type === 'CLEAR_AUDIO_URLS') {
    (async () => {
        audioUrls = [];
        await chrome.storage.local.set({ 'audioUrls': [] });
        updateBadge(); // Update badge when list is cleared
        sendResponse({ success: true });
    })();
    return true; // Correctly return true for async response
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
  (async () => {
    const result = await chrome.storage.local.get(['audioUrls']);
    const currentUrls = result.audioUrls || [];
    const updatedUrls = currentUrls.filter(audio => audio.timestamp > oneHourAgo);
    await chrome.storage.local.set({ 'audioUrls': updatedUrls });
    audioUrls = updatedUrls; // Update in-memory cache
    updateBadge(); // Update badge after cleanup
  })();
}, 10 * 60 * 1000); // Chạy mỗi 10 phút

// --- NEW: Function to inject the "Download Now / Later" prompt ---
function injectDownloadPrompt(url, filename, tabId) {
  chrome.scripting.executeScript({
    target: { tabId: tabId },
    func: (downloadUrl, downloadFilename) => {
      // Remove any old prompt first
      const oldPrompt = document.getElementById('aigei-download-prompt');
      if (oldPrompt) oldPrompt.remove();

      const prompt = document.createElement('div');
      prompt.id = 'aigei-download-prompt';
      prompt.style.cssText = `
        position: fixed; top: 20px; right: 20px; 
        background: white; color: #333; 
        padding: 15px; border-radius: 10px; 
        z-index: 10000; font-family: Arial, sans-serif; 
        max-width: 320px; 
        box-shadow: 0 5px 15px rgba(0,0,0,0.2);
        border: 1px solid #ddd;
        font-size: 14px;
        transition: transform 0.3s ease-in-out, opacity 0.3s ease-in-out;
        transform: translateY(-200%);
        opacity: 0;
      `;

      prompt.innerHTML = `
        <div style="font-weight: bold; margin-bottom: 8px;">🎵 Audio File Detected</div>
        <div style="margin-bottom: 15px; word-wrap: break-word; font-size: 13px; color: #555;">${downloadFilename}</div>
        <div style="display: flex; justify-content: flex-end; gap: 10px;">
          <button id="aigei-later-btn" style="background: #eee; border: 1px solid #ccc; padding: 8px 15px; border-radius: 5px; cursor: pointer;">Later</button>
          <button id="aigei-now-btn" style="background: #2196F3; color: white; border: none; padding: 8px 15px; border-radius: 5px; cursor: pointer;">Download Now</button>
        </div>
      `;

      document.body.appendChild(prompt);
      
      // Animate in
      setTimeout(() => { 
        prompt.style.transform = 'translateY(0)';
        prompt.style.opacity = '1';
      }, 50);

      const dismissPrompt = () => {
        prompt.style.transform = 'translateY(-200%)';
        prompt.style.opacity = '0';
        setTimeout(() => prompt.remove(), 300);
      };

      document.getElementById('aigei-later-btn').onclick = dismissPrompt;

      document.getElementById('aigei-now-btn').onclick = () => {
        chrome.runtime.sendMessage({ type: 'DOWNLOAD_AUDIO', url: downloadUrl, filename: downloadFilename });
        dismissPrompt();
      };
      
      // Auto-dismiss after 20 seconds
      setTimeout(() => {
        if (document.body.contains(prompt)) {
          dismissPrompt();
        }
      }, 20000);
    },
    args: [url, filename]
  });
}

// Function inject IDM script vào tab
function injectIDMScript(url, filename, tabId, sendResponse) {
  chrome.scripting.executeScript({
    target: { tabId: tabId },
    func: function(downloadUrl, downloadFilename) {
      console.log('Injecting silent IDM trigger for:', downloadUrl);
      
      // --- Create a hidden iframe to trigger the IDM download silently ---
      try {
        const iframe = document.createElement('iframe');
        iframe.style.display = 'none';
        iframe.src = downloadUrl;
        document.body.appendChild(iframe);
        console.log('Created a hidden iframe to trigger the IDM download.');
        
        // Clean up the iframe after a few seconds
        setTimeout(() => {
          if (iframe.parentElement) {
            iframe.remove();
          }
        }, 5000);
      } catch (e) {
        console.error('Failed to create the iframe for automatic IDM trigger:', e);
      }

      // --- Fallback: The most reliable method is still copying to clipboard ---
      if (navigator.clipboard) {
        navigator.clipboard.writeText(downloadUrl).then(() => {
          console.log('URL copied to clipboard as a reliable fallback for IDM.');
        }).catch((error) => {
          console.error('Clipboard copy failed:', error);
        });
      }
      
      // --- Notification has been removed as per user request ---
      
      return 'Silent IDM trigger executed.';
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
