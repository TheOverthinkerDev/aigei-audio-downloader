
<img width="300" height="300" alt="Asset 10" src="https://github.com/user-attachments/assets/598e1ff6-a7b3-4783-bb9d-85c58119dfeb" />


# Aigei Sound Downloader

This Chrome extension helps users download audio files from the Aigei website. It adds a download button to each audio item, no need QQ account.

## Features
- **Dynamic Download Button**: A button appears on each audio item.
- **One-Click Download**: Click the button to download the audio file directly via browser (IDM is not currently supported because it does not have the ability to get title-name yet.).

## How it Works
1. `Unitkey` is a data returned by the API of aigei.com to distinguish separate audio boxes, each box will be covered by a separate `Unitkey` and marked in the HTML of the website with the format `unitKey="item-xxxxxx"`
2. The extension will check the HTML to find the `Unitkey` with the ID of the Item and remember it, then check the position of the audio play button on each box and the title name because they have the same ID
3. The extension will then listen to the user, every time the user clicks on the audio play button on any box, the extension will identify it by `Unitkey` to know which box the user clicks on in the website
4. When the audio API returns the URL of the mp3 file, the extension will capture it and attach it to the nearest box distinguished by the ID of the audio play button and remember it to avoid the URL attaching to the wrong box that was clicked most recently in the future
5. When the mp3 file is downloaded, it will be attached to the title name in the box previously identified by `Unitkey`

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
- If you click the audio wave, download button will not work, if you accidentally click it, you need to refresh the page to reset the download button, don't try to click it again, it will get error and not work until you refresh the page. (will fix it in future)
- refresh the page if you encounter any issues with the download button not appearing or functioning correctly. (fix 99% of the time)

`Have fun downloading your favorite audio files from Aigei! If you encounter any issues or have suggestions, feel free to open an issue on the GitHub repository.`
