// Content script để theo dõi trang aigei.com
console.log('Aigei Audio Downloader loaded');

// Tạo overlay notification
function showNotification(message, type = 'info') {
  // Xóa notification cũ nếu có
  const oldNotification = document.getElementById('aigei-downloader-notification');
  if (oldNotification) {
    oldNotification.remove();
  }
  
  const notification = document.createElement('div');
  notification.id = 'aigei-downloader-notification';
  notification.style.cssText = `
    position: fixed;
    top: 20px;
    right: 20px;
    background: ${type === 'success' ? '#4CAF50' : type === 'error' ? '#f44336' : '#2196F3'};
    color: white;
    padding: 12px 20px;
    border-radius: 8px;
    box-shadow: 0 4px 12px rgba(0,0,0,0.3);
    z-index: 10000;
    font-family: Arial, sans-serif;
    font-size: 14px;
    max-width: 300px;
    animation: slideIn 0.3s ease-out;
  `;
  
  // Add animation keyframes
  if (!document.getElementById('aigei-notification-styles')) {
    const style = document.createElement('style');
    style.id = 'aigei-notification-styles';
    style.textContent = `
      @keyframes slideIn {
        from { transform: translateX(100%); opacity: 0; }
        to { transform: translateX(0); opacity: 1; }
      }
      @keyframes slideOut {
        from { transform: translateX(0); opacity: 1; }
        to { transform: translateX(100%); opacity: 0; }
      }
    `;
    document.head.appendChild(style);
  }
  
  notification.textContent = message;
  document.body.appendChild(notification);
  
  // Auto remove after 3 seconds
  setTimeout(() => {
    if (notification.parentNode) {
      notification.style.animation = 'slideOut 0.3s ease-in';
      setTimeout(() => {
        if (notification.parentNode) {
          notification.remove();
        }
      }, 300);
    }
  }, 3000);
}

// Theo dõi các audio element và XHR requests
let audioCount = 0;

// Override XMLHttpRequest để bắt audio requests
const originalXHR = window.XMLHttpRequest;
window.XMLHttpRequest = function() {
  const xhr = new originalXHR();
  const originalOpen = xhr.open;
  
  xhr.open = function(method, url, ...args) {
    if (url && url.includes('aigei.com') && isAudioUrl(url)) {
      console.log('XHR Audio request detected:', url);
      showNotification('🎵 Phát hiện file âm thanh mới!', 'success');
    }
    return originalOpen.call(this, method, url, ...args);
  };
  
  return xhr;
};

// Override fetch API
const originalFetch = window.fetch;
window.fetch = function(url, ...args) {
  if (url && url.includes && url.includes('aigei.com') && isAudioUrl(url)) {
    console.log('Fetch Audio request detected:', url);
    showNotification('🎵 Phát hiện file âm thanh mới!', 'success');
  }
  return originalFetch.call(this, url, ...args);
};

// Helper function để check audio URL
function isAudioUrl(url) {
  return url.includes('.mp3') || 
         url.includes('.wav') || 
         url.includes('.m4a') ||
         url.includes('.flac') ||
         url.includes('.aac') ||
         url.includes('audio/') ||
         (url.includes('/src/aud/') && url.includes('.'));
}

// Theo dõi audio elements được tạo động
const observer = new MutationObserver((mutations) => {
  mutations.forEach((mutation) => {
    mutation.addedNodes.forEach((node) => {
      if (node.nodeType === 1) { // Element node
        // Kiểm tra chính node đó
        if (node.tagName === 'AUDIO' || node.tagName === 'VIDEO') {
          checkAudioSource(node);
        }
        
        // Kiểm tra các audio/video element con
        const audioElements = node.querySelectorAll ? node.querySelectorAll('audio, video') : [];
        audioElements.forEach(checkAudioSource);
      }
    });
  });
});

function checkAudioSource(element) {
  const src = element.src || element.currentSrc;
  if (src && src.includes('aigei.com') && isAudioUrl(src)) {
    console.log('Audio element detected:', src);
    showNotification('🎵 Phát hiện audio element!', 'success');
  }
}

// Bắt đầu observe DOM changes - Safe initialization
function initializeDOMObserver() {
  if (document.body) {
    observer.observe(document.body, {
      childList: true,
      subtree: true
    });
    console.log('DOM observer initialized');
  } else {
    // Retry after short delay if body not ready
    setTimeout(initializeDOMObserver, 100);
  }
}

// Initialize observer safely
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initializeDOMObserver);
} else {
  initializeDOMObserver();
}

// Kiểm tra audio elements hiện có
document.addEventListener('DOMContentLoaded', () => {
  const existingAudios = document.querySelectorAll('audio, video');
  existingAudios.forEach(checkAudioSource);
});

// Show welcome message safely
function showWelcomeMessage() {
  if (document.body) {
    showNotification('Aigei Audio Downloader đã sẵn sàng!', 'info');
  } else {
    setTimeout(showWelcomeMessage, 500);
  }
}

// Wait for DOM to be ready
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', () => {
    setTimeout(showWelcomeMessage, 1000);
  });
} else {
  setTimeout(showWelcomeMessage, 1000);
}

// Intercept tất cả network requests
(function() {
  // Backup method: Monitor all outgoing requests
  const originalOpen = XMLHttpRequest.prototype.open;
  const originalSend = XMLHttpRequest.prototype.send;
  
  XMLHttpRequest.prototype.open = function(method, url, ...args) {
    this._url = url;
    return originalOpen.call(this, method, url, ...args);
  };
  
  XMLHttpRequest.prototype.send = function(data) {
    this.addEventListener('load', function() {
      if (this._url && isAudioUrl(this._url)) {
        console.log('XHR Audio detected:', this._url);
        showNotification('🎵 Detected audio via XHR!', 'success');
      }
    });
    
    return originalSend.call(this, data);
  };
})();

// Monitor window location changes for SPA navigation
let currentUrl = window.location.href;
setInterval(() => {
  if (window.location.href !== currentUrl) {
    currentUrl = window.location.href;
    console.log('Page navigation detected, re-initializing...');
    setTimeout(() => {
      showNotification('Extension re-initialized for new page', 'info');
    }, 1000);
  }
}, 1000);

// IDM Integration Helper
function createIDMDownloadLink(url, filename) {
  // Tạo invisible download link cho IDM
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  link.style.display = 'none';
  link.rel = 'noopener noreferrer';
  
  // Add special attributes that IDM might recognize
  link.setAttribute('data-idm-download', 'true');
  link.setAttribute('data-filename', filename);
  
  document.body.appendChild(link);
  
  // Trigger download
  const event = new MouseEvent('click', {
    view: window,
    bubbles: true,
    cancelable: true
  });
  
  link.dispatchEvent(event);
  
  // Clean up after delay
  setTimeout(() => {
    if (link.parentNode) {
      document.body.removeChild(link);
    }
  }, 2000);
  
  return link;
}

// Listen for download requests from extension
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.type === 'FORCE_DOWNLOAD') {
    const { url, filename } = message;
    
    try {
      // Method 1: Create download link
      const link = createIDMDownloadLink(url, filename);
      
      // Method 2: Open in new window (minimized)
      const newWindow = window.open(url, '_blank', 'width=1,height=1,top=0,left=0');
      if (newWindow) {
        setTimeout(() => {
          newWindow.close();
        }, 3000);
      }
      
      // Method 3: Trigger multiple download events
      setTimeout(() => {
        fetch(url, { method: 'HEAD' })
          .then(() => {
            showNotification(`🎯 IDM should capture: ${filename}`, 'success');
          })
          .catch(() => {
            showNotification(`⚠️ Check IDM for: ${filename}`, 'info');
          });
      }, 1000);
      
      sendResponse({ success: true });
      
    } catch (error) {
      console.error('Force download failed:', error);
      sendResponse({ success: false, error: error.message });
    }
    
    return true;
  }
});
