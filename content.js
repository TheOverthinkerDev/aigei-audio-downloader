const style = document.createElement('style');
style.textContent = `
  .unit-vip-box {
    display: none !important;
  }
`;
document.head.appendChild(style);

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

  // Create icon and label elements for the rolling effect
  const iconElement = document.createElement('div');
  const labelElement = document.createElement('span');

  // Apply base styles for the container button
  Object.assign(downloadButton.style, {
    display: 'flex',
    alignItems: 'center',
    cursor: 'pointer',
    width: '32px',
    height: '32px',
    overflow: 'hidden',
    borderRadius: '16px',
    backgroundColor: '#cccccc', // Initial inactive color
    transition: 'all 0.3s ease-out',
    whiteSpace: 'nowrap',
    fontFamily: 'Arial, sans-serif',
    border: 'none',
    position: 'absolute',
    top: '8px',
    right: '8px',
    padding: '0',
    zIndex: '1000',
    opacity: '0.5'
  });

  // Style the icon container
  Object.assign(iconElement.style, {
    flexShrink: '0',
    width: '32px',
    height: '32px',
    borderRadius: '50%',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(0,0,0,0.1)' // Slightly darker background for icon
  });

  // Style the label
  Object.assign(labelElement.style, {
    padding: '0 15px 0 10px',
    color: '#ffffff',
    fontWeight: 'bold',
    fontSize: '14px'
  });

  iconElement.innerHTML = `<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="white" style="width: 24px; height: 24px;">
    <path stroke-linecap="round" stroke-linejoin="round" d="m21 21-5.197-5.197m0 0A7.5 7.5 0 1 0 5.196 5.196a7.5 7.5 0 0 0 10.607 10.607Z" />
  </svg>`;
  labelElement.textContent = 'Play to find url';
  downloadButton.title = 'Please play the audio first to find the download URL.';

  downloadButton.appendChild(iconElement);
  downloadButton.appendChild(labelElement);

  downloadButton.onmouseenter = () => {
    const state = downloadButton.getAttribute('data-state');
    if (state === 'finding' || state === 'downloading') return;
    downloadButton.style.width = '160px'; // Expand width on hover
    iconElement.style.display = 'none';
    downloadButton.style.justifyContent = 'center';
    if (state === 'inactive') {
        downloadButton.style.opacity = '1';
    }
  };

  downloadButton.onmouseleave = () => {
    const state = downloadButton.getAttribute('data-state');
    if (state === 'finding' || state === 'downloading') return;
    downloadButton.style.width = '32px'; // Collapse on mouse leave
    iconElement.style.display = 'flex';
    downloadButton.style.justifyContent = 'initial';
    if (state === 'inactive') {
        downloadButton.style.opacity = '0.5';
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
            button.style.width = 'auto';
            button.style.padding = '0 15px';
            button.style.borderRadius = '20px';
            button.disabled = true;

            const icon = button.querySelector('div');
            const label = button.querySelector('span');
            icon.innerHTML = `<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="white" style="width: 24px; height: 24px;">
              <path stroke-linecap="round" stroke-linejoin="round" d="M3 16.5v2.25A2.25 2.25 0 0 0 5.25 21h13.5A2.25 2.25 0 0 0 21 18.75V16.5M16.5 12 12 16.5m0 0L7.5 12m4.5 4.5V3" />
            </svg>`;
            label.textContent = 'Ready to download';

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
      // No longer setting lastClickedUnitKey to avoid race conditions.
      // The background script will now send a generic 'urlCaptured' message,
      // and we'll find the button in the 'finding' state.

      // Set button to "finding url" state (yellow and long)
      const downloadButton = document.getElementById(`download-btn-${unitKey}`);
      if (downloadButton && downloadButton.getAttribute('data-state') === 'inactive') {
          downloadButton.setAttribute('data-state', 'finding');
          downloadButton.style.backgroundColor = '#ffc107'; // Yellow
          downloadButton.style.width = '160px'; // Keep expanded
          downloadButton.style.opacity = '1'; // Make it fully visible
          
          const icon = downloadButton.querySelector('div');
          const label = downloadButton.querySelector('span');
          icon.innerHTML = `<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="white" style="width: 24px; height: 24px;">
            <path stroke-linecap="round" stroke-linejoin="round" d="M12 6v6h4.5m4.5 0a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z" />
          </svg>`;
          label.textContent = 'Finding url';
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

  if (request.action === 'urlCaptured') {
    // The background script no longer knows the unitKey, so we find the button
    // that is currently in the "finding" state. This is more robust.
    const downloadButton = document.querySelector('button[data-state="finding"]');
    if (downloadButton) {
        const unitKey = downloadButton.id.replace('download-btn-', '');
        console.log(`[content] URL captured for ${unitKey}, enabling button.`);
        
        // Store the URL against the correct unitKey
        chrome.storage.local.set({ [unitKey]: request.url });

        downloadButton.setAttribute('data-state', 'ready');
        downloadButton.style.backgroundColor = '#28a745'; // Green for ready
        downloadButton.title = 'Click to download';
        downloadButton.disabled = false;
        downloadButton.style.opacity = '1';

        const icon = downloadButton.querySelector('div');
        const label = downloadButton.querySelector('span');
        icon.innerHTML = `<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="white" style="width: 24px; height: 24px;">
          <path stroke-linecap="round" stroke-linejoin="round" d="M3 16.5v2.25A2.25 2.25 0 0 0 5.25 21h13.5A2.25 2.25 0 0 0 21 18.75V16.5M16.5 12 12 16.5m0 0L7.5 12m4.5 4.5V3" />
        </svg>`;
        label.textContent = 'Ready to download';
        
        // Collapse the button to its icon form
        downloadButton.style.width = '32px';
    } else {
        console.warn('[content] Received a urlCaptured message, but no button was in the "finding" state.');
    }
    return; // End processing for this message type
  }

  // For other messages, we still expect a unitKey
  const downloadButton = document.getElementById(`download-btn-${request.unitKey}`);
  if (!downloadButton) {
      console.error(`[content] Could not find button with unitKey: ${request.unitKey}`);
      return;
  }

  if (request.action === 'downloadReady') {
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
    downloadButton.disabled = false;
    downloadButton.style.width = '32px';

    const icon = downloadButton.querySelector('div');
    icon.innerHTML = `<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="white" style="width: 24px; height: 24px;">
      <path stroke-linecap="round" stroke-linejoin="round" d="M3 16.5v2.25A2.25 2.25 0 0 0 5.25 21h13.5A2.25 2.25 0 0 0 21 18.75V16.5M16.5 12 12 16.5m0 0L7.5 12m4.5 4.5V3" />
    </svg>`;

  } else if (request.action === 'downloadFailed') {
    console.error(`[content] Download failed for ${request.filename}:`, request.error);
    alert(`Download failed for ${request.filename}. See console for details.`);
    // Reset the button state to ready (green and round) so the user can try again
    downloadButton.setAttribute('data-state', 'ready');
    downloadButton.style.backgroundColor = '#28a745'; // Green
    downloadButton.disabled = false;
    downloadButton.style.width = '32px';
    
    const icon = downloadButton.querySelector('div');
    icon.innerHTML = `<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="white" style="width: 24px; height: 24px;">
      <path stroke-linecap="round" stroke-linejoin="round" d="M3 16.5v2.25A2.25 2.25 0 0 0 5.25 21h13.5A2.25 2.25 0 0 0 21 18.75V16.5M16.5 12 12 16.5m0 0L7.5 12m4.5 4.5V3" />
    </svg>`;
  }
});
