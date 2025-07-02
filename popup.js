// Popup script
document.addEventListener('DOMContentLoaded', async () => {
  const audioList = document.getElementById('audioList');
  const audioCount = document.getElementById('audioCount');
  const downloadCount = document.getElementById('downloadCount');
  const refreshBtn = document.getElementById('refreshBtn');
  const clearBtn = document.getElementById('clearBtn');
  
  let currentAudioUrls = [];
  let downloads = 0;

  // Load data khi popup mở
  await loadAudioUrls();

  // Event listeners
  refreshBtn.addEventListener('click', loadAudioUrls);
  clearBtn.addEventListener('click', clearAllUrls);

  // Listen for new audio URLs từ background script
  chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
    if (message.type === 'NEW_AUDIO_URL') {
      console.log('New audio URL received:', message.data);
      loadAudioUrls(); // Refresh list
    }
  });

  async function loadAudioUrls() {
    try {
      showLoading();
      
      const response = await chrome.runtime.sendMessage({
        type: 'GET_AUDIO_URLS'
      });
      
      currentAudioUrls = response.audioUrls || [];
      renderAudioList();
      updateStats();
      
    } catch (error) {
      console.error('Error loading audio URLs:', error);
      showError('Không thể tải danh sách file âm thanh');
    }
  }
  function renderAudioList() {
    if (currentAudioUrls.length === 0) {
      audioList.innerHTML = `
        <div class="empty-state">
          <div class="empty-icon">♪</div>
          <p>Chưa có file âm thanh nào được phát hiện</p>
          <p style="font-size: 12px; margin-top: 5px; color: #999;">
            Vào trang aigei.com và thử nghe một file âm thanh
          </p>
        </div>
      `;
      return;
    }

    const audioItems = currentAudioUrls
      .sort((a, b) => b.timestamp - a.timestamp) // Sort by newest first
      .map((audio, index) => {
        const filename = extractFilename(audio.url);
        const timeAgo = getTimeAgo(audio.timestamp);
          return `
          <div class="audio-item">
            <div class="audio-info">
              <div class="audio-filename">${filename}</div>
              <div class="audio-time">Phát hiện ${timeAgo}</div>
              <div class="audio-url" title="${audio.url}">${audio.url}</div>
            </div>
            <div style="display: flex; gap: 5px;">
              <button class="download-btn" onclick="downloadAudio('${audio.url}', '${filename}', ${index})">
                Tải xuống
              </button>
              <button class="copy-btn" onclick="copyAudioUrl('${audio.url}', '${filename}', ${index})">
                Copy URL
              </button>
            </div>
          </div>
        `;
      })
      .join('');

    audioList.innerHTML = audioItems;
  }

  function showLoading() {
    audioList.innerHTML = `
      <div class="loading">
        <div class="spinner"></div>
        Đang tải...
      </div>
    `;
  }
  function showError(message) {
    const errorDiv = document.createElement('div');
    errorDiv.className = 'error-message';
    errorDiv.innerHTML = `❌ ${message}`;
    
    // Insert at top of content
    const content = document.querySelector('.content');
    const stats = document.querySelector('.stats');
    content.insertBefore(errorDiv, stats.nextSibling);
    
    // Remove after 8 seconds (longer for fallback instructions)
    setTimeout(() => {
      if (errorDiv.parentNode) {
        errorDiv.remove();
      }
    }, 8000);
  }
  function showSuccess(message) {
    const successDiv = document.createElement('div');
    successDiv.className = 'success-message';
    successDiv.innerHTML = `${message}`;
    
    // Insert at top of content
    const content = document.querySelector('.content');
    const stats = document.querySelector('.stats');
    content.insertBefore(successDiv, stats.nextSibling);
    
    // Remove after 3 seconds
    setTimeout(() => {
      if (successDiv.parentNode) {
        successDiv.remove();
      }
    }, 3000);
  }

  async function clearAllUrls() {
    if (confirm('Bạn có chắc muốn xóa tất cả file âm thanh đã phát hiện?')) {
      try {
        await chrome.runtime.sendMessage({
          type: 'CLEAR_AUDIO_URLS'
        });
          currentAudioUrls = [];
        renderAudioList();
        updateStats();
        showSuccess('Đã xóa tất cả file âm thanh');
        
      } catch (error) {
        console.error('Error clearing URLs:', error);
        showError('Không thể xóa danh sách');
      }
    }
  }

  function updateStats() {
    audioCount.textContent = currentAudioUrls.length;
    downloadCount.textContent = downloads;
  }
  function extractFilename(url) {
    try {
      const urlObj = new URL(url);
      const pathname = urlObj.pathname;
      const filename = pathname.split('/').pop();
      
      if (filename && filename.includes('.')) {
        // Truncate long filenames
        if (filename.length > 30) {
          const ext = filename.split('.').pop();
          const name = filename.substring(0, 25);
          return `${name}...${ext}`;
        }
        return filename;
      } else {
        return 'audio_file.mp3';
      }
    } catch (e) {
      return 'audio_file.mp3';
    }
  }

  function getTimeAgo(timestamp) {
    const now = Date.now();
    const diff = now - timestamp;
    
    const minutes = Math.floor(diff / (1000 * 60));
    const hours = Math.floor(diff / (1000 * 60 * 60));
    
    if (minutes < 1) {
      return 'vừa xong';
    } else if (minutes < 60) {
      return `${minutes} phút trước`;
    } else {
      return `${hours} giờ trước`;
    }
  }  // Global function để download (được gọi từ HTML)
  window.downloadAudio = async function(url, filename, index) {
    // Each audio item has exactly one `.download-btn`, so use the same index
    const button = document.querySelectorAll('.download-btn')[index];
    const originalText = button.innerHTML;
    
    console.log('Download clicked:', { url, filename, index });
    
    try {
      button.disabled = true;
      button.innerHTML = '⏳ Đang tải...';
      
      // Get current active tab
      const tabs = await chrome.tabs.query({ active: true, currentWindow: true });
      if (!tabs[0]) {
        throw new Error('Cannot get current tab');
      }
      
      console.log('Sending download message to background...');
      
      const response = await chrome.runtime.sendMessage({
        type: 'DOWNLOAD_AUDIO',
        url: url,
        filename: filename,
        tabId: tabs[0].id
      });
      
      console.log('Download response received:', response);
      
      if (response && response.success) {        let successMessage = '';
        switch (response.method) {
          case 'new_tab':
            button.innerHTML = 'Tab mới';
            button.style.background = '#2196F3';
            successMessage = `Đã mở tab mới cho IDM: ${filename}`;
            break;
          case 'script_injection':
            button.innerHTML = 'Đã copy';
            button.style.background = '#FF9800';
            successMessage = `URL đã copy cho IDM: ${filename}`;
            break;
          default:
            button.innerHTML = 'Xong';
            button.style.background = '#4CAF50';
            successMessage = `Đã xử lý cho IDM: ${filename}`;
        }
        
        downloads++;
        updateStats();
        showSuccess(successMessage);
          // Reset button after 3 seconds
        setTimeout(() => {
          button.disabled = false;
          button.innerHTML = originalText;
          button.style.background = '';
        }, 3000);
        
      } else {
        console.error('Download failed:', response);
        throw new Error(response?.error || 'No response from background script');
      }
      
    } catch (error) {      console.error('Download error:', error);
      button.disabled = false;
      button.innerHTML = originalText;
      
      // Show detailed error + fallback options
      const fallbackMessage = `
        Download failed: ${error.message}<br>
        <strong>Fallback options:</strong><br>
        1. Try copy URL button<br>
        2. Check if extension has download permission<br>
        3. Open ${url} manually<br>
        4. Check Network tab in DevTools
      `;
      showError(fallbackMessage);
      
      // Auto-copy URL as fallback
      try {        if (navigator.clipboard) {
          await navigator.clipboard.writeText(url);
          showSuccess('URL auto-copied as fallback!');
        }
      } catch (clipboardError) {
        console.error('Auto-copy failed:', clipboardError);
      }
    }
  };// Global function để copy URL
  window.copyAudioUrl = async function(url, filename, index) {
    try {
      // Try modern clipboard API first
      if (navigator.clipboard && navigator.clipboard.writeText) {
        await navigator.clipboard.writeText(url);
      } else {
        // Fallback: Create temporary textarea
        const textarea = document.createElement('textarea');
        textarea.value = url;
        textarea.style.position = 'fixed';
        textarea.style.opacity = '0';
        document.body.appendChild(textarea);
        textarea.select();
        document.execCommand('copy');
        document.body.removeChild(textarea);
      }
        showSuccess(`URL đã copy: ${filename}<br><small>Paste vào IDM để tải xuống</small>`);
      
      // Visual feedback on button - Find correct copy button
      const audioItems = document.querySelectorAll('.audio-item');
      if (audioItems[index]) {
        const copyBtn = audioItems[index].querySelector('.copy-btn');
        if (copyBtn) {
          const originalText = copyBtn.innerHTML;
          const originalBackground = copyBtn.style.background;
          
          copyBtn.innerHTML = 'Đã copy';
          copyBtn.style.background = '#4CAF50';
          
          setTimeout(() => {
            copyBtn.innerHTML = originalText;
            copyBtn.style.background = originalBackground;
          }, 2000);
        }
      }
        } catch (error) {
      console.error('Copy failed:', error);
      showError(`Copy failed: ${error.message}<br>Manual: ${url}`);
    }
  };

  // Load download count from storage
  chrome.storage.local.get(['downloadCount'], (result) => {
    downloads = result.downloadCount || 0;
    updateStats();
  });

  // Save download count when changed
  function saveDownloadCount() {
    chrome.storage.local.set({ downloadCount: downloads });
  }

  // Update saveDownloadCount whenever downloads change
  const originalUpdateStats = updateStats;
  updateStats = function() {
    originalUpdateStats();
    saveDownloadCount();
  };
});
