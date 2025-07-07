
![logo128](https://github.com/user-attachments/assets/d91f3cff-a97b-4a23-9fc2-e6b7f6a450e8)

# Aigei Sound Downloader

This Chrome extension helps users download audio files from the Aigei website. It adds a download button to each audio item, no need QQ account.

## Features
- **Dynamic Download Button**: A button appears on each audio item.
- **One-Click Download**: Click the button to download the audio file directly via browser (IDM is not currently supported because it does not have the ability to get title-name yet.).

## How it Works
1. The extension injects a content script into the Aigei website.
2. The content script scans the page for audio items and checks `unitkey` for each item.
3. If the `unitkey` is found, a download button is created and appended to the audio item.
4. When the play button is clicked, the extension fetches the audio file using the `unitkey`.
5. The audio file is named using the `unitkey` and the current timestamp to ensure uniqueness.

## Instructions
1. Install the Chrome extension.
   - Download the extension files and load them in Chrome via `chrome://extensions/` with "Developer mode" enabled.
   - Click "Load unpacked" and select the directory containing the extension files.
2. Navigate to the Aigei website and play any audio item.
3. Click the download button that appears.
4. The audio file will be downloaded to your device.

## Issues
- Sometimes the download button may not appear immediately. If this happens, try refreshing the page.
- Some download requests just have name without .mp3 extension, so you may need to manually add `.mp3` to the file name after downloading. (rare)
- If you click the audio wave extension download button will not work, if you accidentally click it, you need to refresh the page to reset the download button, don't try to click it again, it will get error and not work until you refresh the page.
- refresh the page if you encounter any issues with the download button not appearing or functioning correctly. (fix 99% of the time)

`Have fun downloading your favorite audio files from Aigei! If you encounter any issues or have suggestions, feel free to open an issue on the GitHub repository.`
