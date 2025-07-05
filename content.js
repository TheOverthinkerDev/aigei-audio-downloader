const musicBoxes = new Map();

function addDownloadButton(box) {
  const unitKey = box.getAttribute('unit-key');
  if (!unitKey || musicBoxes.has(unitKey)) {
    return;
  }

  const titleElement = box.querySelector('.title-name');
  const title = titleElement ? titleElement.getAttribute('title') : 'audio';
  musicBoxes.set(unitKey, { title });

  const downloadButton = document.createElement('button');
  downloadButton.id = `download-btn-${unitKey}`;

  // Apply styles for the button to be a round button in the top-right corner
  Object.assign(downloadButton.style, {
    position: 'absolute',
    top: '8px',
    right: '8px',
    width: '40px', // Start as round
    height: '40px',
    padding: '0',
    borderRadius: '50%', // Round
    backgroundColor: '#cccccc', // Gray
    color: '#666666',
    border: 'none',
    cursor: 'pointer',
    zIndex: '1000',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: '12px',
    textAlign: 'center',
    transition: 'all 0.3s ease',
    overflow: 'hidden', // Hide text when round
    whiteSpace: 'nowrap'
  });
  downloadButton.textContent = '🕵🏼‍♂️';
  downloadButton.title = 'Please play the audio first to find the download URL.';
  
  downloadButton.onmouseenter = () => {
    const state = downloadButton.getAttribute('data-state');
    if (state === 'finding' || state === 'downloading') return;
    
    downloadButton.style.width = 'auto';
    downloadButton.style.padding = '0 15px';
    downloadButton.style.borderRadius = '20px';

    if (state === 'inactive') {
        downloadButton.textContent = 'play to find url';
    } else if (state === 'ready') {
        downloadButton.textContent = 'ready to download';
    }
  };

  downloadButton.onmouseleave = () => {
    const state = downloadButton.getAttribute('data-state');
    if (state === 'finding' || state === 'downloading') return;

    downloadButton.style.width = '40px';
    downloadButton.style.padding = '0';
    downloadButton.style.borderRadius = '50%';

    if (state === 'inactive') {
        downloadButton.textContent = '🕵🏼‍♂️';
    } else if (state === 'ready') {
        downloadButton.textContent = '⬇️';
    }
  };

  downloadButton.onclick = () => {
    const button = document.getElementById(`download-btn-${unitKey}`);
    const state = button.getAttribute('data-state');

    if (state === 'inactive' || state === 'finding') {
        alert('Please play the audio first to find the download URL.');
        return;
    }

    if (state === 'ready') {
        chrome.storage.local.get([unitKey], function(result) {
          if (result[unitKey]) {
            // Set to "downloading..." state
            button.setAttribute('data-state', 'downloading');
            button.textContent = 'downloading...';
            button.style.width = 'auto';
            button.style.padding = '0 15px';
            button.style.borderRadius = '20px';
            button.disabled = true;

            // Send message to background to fetch as blob and download
            chrome.runtime.sendMessage({
              action: 'fetchAndDownload',
              url: result[unitKey],
              filename: title.includes('.') ? title : `${title}.mp3`,
              unitKey: unitKey
            });
          } else {
            alert('URL not found. Please try playing the audio again.');
          }
        });
    }
  };

  // The container needs to be relative for the button to be positioned absolutely inside it.
  box.style.position = 'relative';
  box.appendChild(downloadButton);

  const playButton = box.querySelector('.audio-player-btn');
  if (playButton) {
    playButton.addEventListener('click', () => {
      console.log('Play button clicked for unitKey:', unitKey);
      chrome.storage.local.set({ 'lastClickedUnitKey': unitKey });

      // Set button to "finding url" state (yellow and long)
      const downloadButton = document.getElementById(`download-btn-${unitKey}`);
      if (downloadButton && downloadButton.getAttribute('data-state') === 'inactive') {
          downloadButton.setAttribute('data-state', 'finding');
          downloadButton.textContent = 'finding url';
          downloadButton.style.backgroundColor = '#ffc107'; // Yellow
          downloadButton.style.color = '#000000';
          downloadButton.style.width = 'auto';
          downloadButton.style.padding = '0 15px';
          downloadButton.style.borderRadius = '20px';
      }
    });
  }
  
  // Set initial state
  downloadButton.setAttribute('data-state', 'inactive');
}

const observer = new MutationObserver((mutations) => {
  mutations.forEach((mutation) => {
    mutation.addedNodes.forEach((node) => {
      if (node.nodeType === 1) {
        // Check if the node itself is an audio box
        if (node.matches('[id^="unitBox_item-"]')) {
          addDownloadButton(node);
        }
        // Check for audio boxes within the added node
        node.querySelectorAll('[id^="unitBox_item-"]').forEach(addDownloadButton);
      }
    });
  });
});

observer.observe(document.body, { childList: true, subtree: true });

document.querySelectorAll('[id^="unitBox_item-"]').forEach(addDownloadButton);

// Re-check for buttons when the tab becomes visible again
document.addEventListener('visibilitychange', () => {
  if (document.visibilityState === 'visible') {
    console.log('[content] Tab is visible again, re-checking for download buttons.');
    document.querySelectorAll('[id^="unitBox_item-"]').forEach(addDownloadButton);
  }
});

// Listen for messages from the background script
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  console.log(`[content] Received message: ${request.action}`);

  // Find the corresponding audio box and button
  const downloadButton = document.getElementById(`download-btn-${request.unitKey}`);
  if (!downloadButton) {
      console.error(`[content] Could not find button with unitKey: ${request.unitKey}`);
      return;
  }

  if (request.action === 'urlCaptured') {
    console.log(`[content] URL captured for ${request.unitKey}, enabling button.`);
    downloadButton.setAttribute('data-state', 'ready');
    downloadButton.style.backgroundColor = '#28a745'; // Green for ready
    downloadButton.style.color = '#ffffff';
    downloadButton.textContent = '⬇️';
    downloadButton.title = 'Click to download';
    downloadButton.disabled = false;
    
    // Make it round again
    downloadButton.style.width = '40px';
    downloadButton.style.padding = '0';
    downloadButton.style.borderRadius = '50%';

  } else if (request.action === 'downloadReady') {
    console.log(`[content] Download is ready for ${request.filename}`);
    
    // Create a hidden link with the blob URL and click it
    const link = document.createElement('a');
    link.href = request.url;
    link.download = request.filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    // Clean up the blob URL to release memory
    URL.revokeObjectURL(request.url);

    // Reset the button state to ready (green and round)
    downloadButton.setAttribute('data-state', 'ready');
    downloadButton.style.backgroundColor = '#28a745'; // Green
    downloadButton.textContent = '⬇️';
    downloadButton.disabled = false;
    downloadButton.style.width = '40px';
    downloadButton.style.padding = '0';
    downloadButton.style.borderRadius = '50%';

  } else if (request.action === 'downloadFailed') {
    console.error(`[content] Download failed for ${request.filename}:`, request.error);
    alert(`Download failed for ${request.filename}. See console for details.`);
    // Reset the button state to ready (green and round) so the user can try again
    downloadButton.setAttribute('data-state', 'ready');
    downloadButton.style.backgroundColor = '#28a745'; // Green
    downloadButton.textContent = '⬇️';
    downloadButton.disabled = false;
    downloadButton.style.width = '40px';
    downloadButton.style.padding = '0';
    downloadButton.style.borderRadius = '50%';
  }
});
