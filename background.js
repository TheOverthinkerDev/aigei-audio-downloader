chrome.webRequest.onBeforeSendHeaders.addListener(
  function(details) {
    const url = details.url;
    console.log('Request URL:', url);
    if (url.includes("s1.aigei.com/src/aud/mp3") || url.includes("s2.aigei.com/src/aud/mp3") || url.includes("s2.aigei.com/pvaud/aud/mp3")) {
      console.log('Captured audio URL:', url);
      // No longer using lastClickedUnitKey - just send the URL to content script
      // The content script will find the button in "finding" state and associate the URL
      if (details.tabId >= 0) {
        chrome.tabs.sendMessage(details.tabId, {
          action: 'urlCaptured',
          url: url
        });
      }
    }
  },
  { urls: ["*://*.aigei.com/*"] },
  ["requestHeaders"]
);

chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  // New handler for fetching the file and returning a data URL
  if (request.action === "fetchAndDownload") {
    console.log(`[background] Received fetchAndDownload for: ${request.filename}`);
    fetch(request.url)
      .then(response => {
        console.log(`[background] Fetched URL. Status: ${response.status}`);
        if (!response.ok) {
          throw new Error(`Network response was not ok, status: ${response.status}`);
        }
        return response.blob();
      })
      .then(blob => {
        // URL.createObjectURL is not available in service workers.
        // We must use FileReader to convert the blob to a data URL.
        const reader = new FileReader();
        reader.onloadend = function() {
          console.log(`[background] Created data URL successfully.`);
          // Send the data URL back to the content script
          chrome.tabs.sendMessage(sender.tab.id, {
            action: 'downloadReady',
            url: reader.result, // This is the data URL
            filename: request.filename,
            unitKey: request.unitKey
          });
        };
        reader.onerror = function() {
            console.error('[background] FileReader failed to read the blob.');
            chrome.tabs.sendMessage(sender.tab.id, { 
                action: 'downloadFailed', 
                filename: request.filename,
                error: 'FileReader failed to convert blob.',
                unitKey: request.unitKey
            });
        };
        reader.readAsDataURL(blob);
      })
      .catch(error => {
        console.error('[background] Fetch or blob conversion failed:', error);
        // Notify the content script of the failure
        chrome.tabs.sendMessage(sender.tab.id, { 
            action: 'downloadFailed', 
            filename: request.filename,
            error: error.message,
            unitKey: request.unitKey
        });
      });
    return true; // Keep the message channel open for the asynchronous response
  }
});
