// Quick test script for console debugging
// Paste this into aigei.com console to test audio detection

console.log('🎵 Aigei Audio Downloader - Quick Test');

// Test audio URL patterns
const testUrls = [
    'https://s2.aigei.com/src/aud/mp3/d2/d2730ae84521460fbb0cc6b50ecd01ff.mp3?e=1751452020&token=test',
    'https://s1.aigei.com/audio/sample.wav',
    'https://aigei.com/src/aud/music.m4a',
    'https://cdn.aigei.com/sounds/audio.flac'
];

function testAudioDetection(url) {
    const isAudio = url.includes('aigei.com') && 
        (url.includes('.mp3') || 
         url.includes('.wav') || 
         url.includes('.m4a') ||
         url.includes('.flac') ||
         url.includes('.aac') ||
         url.includes('audio/') ||
         (url.includes('/src/aud/') && url.includes('.')));
    
    console.log(`${isAudio ? '✅' : '❌'} ${url}`);
    return isAudio;
}

console.log('\n🔍 Testing URL patterns:');
testUrls.forEach(testAudioDetection);

console.log('\n📡 Monitoring network requests...');
console.log('Play an audio file and check if URLs are detected');

// Monitor XHR requests
const originalXHR = window.XMLHttpRequest;
let requestCount = 0;

window.XMLHttpRequest = function() {
    const xhr = new originalXHR();
    const originalOpen = xhr.open;
    
    xhr.open = function(method, url, ...args) {
        requestCount++;
        console.log(`🌐 Request #${requestCount}: ${method} ${url}`);
        
        if (testAudioDetection(url)) {
            console.log('🎵 AUDIO REQUEST DETECTED!');
        }
        
        return originalOpen.call(this, method, url, ...args);
    };
    
    return xhr;
};

console.log('✅ Test script loaded. Extension monitoring should work similarly.');
console.log('💡 Tip: Check Network tab in DevTools for audio requests');
