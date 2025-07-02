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
            </div>
            <div class="audio-actions">
              <button class="download-btn" data-url="${audio.url}" data-filename="${filename}" data-index="${index}">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M12 15L12 3M12 15L15 12M12 15L9 12M21 15V19C21 19.5304 20.7893 20.0391 20.4142 20.4142C20.0391 20.7893 19.5304 21 19 21H5C4.46957 21 3.96086 20.7893 3.58579 20.4142C3.21071 20.0391 3 19.5304 3 19V15" stroke="white" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg>
                Download
              </button>
            </div>
          </div>
        `;
      })
      .join('');

    audioList.innerHTML = audioItems;
    addEventListenersToButtons();
  }

  function addEventListenersToButtons() {
    document.querySelectorAll('.download-btn').forEach(button => {
      button.addEventListener('click', (e) => {
        const url = e.currentTarget.dataset.url;
        const filename = e.currentTarget.dataset.filename;
        const index = parseInt(e.currentTarget.dataset.index, 10);
        downloadAudio(url, filename, index);
      });
    });
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
    // No confirmation needed as per user request.
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
  }

  async function downloadAudio(url, filename, index) {
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
        Download failed: ${error.message}<br><br>
        <strong>The URL has been copied to your clipboard as a fallback.</strong><br>
        Please open IDM and click "Add Url" to paste it.
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
  }

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
