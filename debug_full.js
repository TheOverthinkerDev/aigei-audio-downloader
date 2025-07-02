// Extension Debug & Health Check Script
console.log('🚀 Starting Aigei Sound Downloader Extension Debug...');

// Check 1: Extension Basic Info
function checkExtensionBasics() {
    console.log('\n📋 === EXTENSION BASICS ===');
    
    if (typeof chrome === 'undefined') {
        console.error('❌ Chrome APIs not available');
        return false;
    }
    
    console.log('✅ Chrome APIs available');
    
    if (chrome.runtime && chrome.runtime.id) {
        console.log(`✅ Extension ID: ${chrome.runtime.id}`);
    } else {
        console.error('❌ Extension ID not found');
        return false;
    }
    
    return true;
}

// Check 2: Permissions
async function checkPermissions() {
    console.log('\n🔐 === PERMISSIONS CHECK ===');
    
    const requiredPermissions = [
        'downloads', 'storage', 'scripting', 'tabs', 'webRequest', 'contextMenus'
    ];
    
    try {
        const permissions = await chrome.permissions.getAll();
        console.log('📋 Granted permissions:', permissions.permissions);
        console.log('🌐 Host permissions:', permissions.origins);
        
        for (const perm of requiredPermissions) {
            if (permissions.permissions.includes(perm)) {
                console.log(`✅ ${perm} permission granted`);
            } else {
                console.error(`❌ ${perm} permission missing`);
            }
        }
        
        // Check aigei.com host permission
        const hasAigeiAccess = permissions.origins.some(origin => 
            origin.includes('aigei.com') || origin === '<all_urls>'
        );
        
        if (hasAigeiAccess) {
            console.log('✅ Aigei.com host permission granted');
        } else {
            console.error('❌ Aigei.com host permission missing');
        }
        
    } catch (error) {
        console.error('❌ Failed to check permissions:', error);
    }
}

// Check 3: Storage
async function checkStorage() {
    console.log('\n💾 === STORAGE CHECK ===');
    
    try {
        // Test write
        const testData = { debugTest: Date.now() };
        await chrome.storage.local.set(testData);
        console.log('✅ Storage write successful');
        
        // Test read
        const result = await chrome.storage.local.get('debugTest');
        if (result.debugTest === testData.debugTest) {
            console.log('✅ Storage read successful');
        } else {
            console.error('❌ Storage read/write mismatch');
        }
        
        // Check existing data
        const allData = await chrome.storage.local.get(null);
        console.log('📦 Current storage data:', allData);
        
        // Clean up test
        await chrome.storage.local.remove('debugTest');
        console.log('✅ Storage cleanup successful');
        
    } catch (error) {
        console.error('❌ Storage test failed:', error);
    }
}

// Check 4: Background Communication
async function checkBackgroundComm() {
    console.log('\n📡 === BACKGROUND COMMUNICATION ===');
    
    try {
        // Test basic ping
        const response = await chrome.runtime.sendMessage({ type: 'PING' });
        console.log('📨 Background response:', response);
        
        // Test get audio URLs
        const audioResponse = await chrome.runtime.sendMessage({ type: 'GET_AUDIO_URLS' });
        console.log('🎵 Current audio URLs:', audioResponse);
        
    } catch (error) {
        console.error('❌ Background communication failed:', error);
        console.log('💡 This is normal if background script is not responding to PING');
    }
}

// Check 5: Content Script Detection
function checkContentScript() {
    console.log('\n📄 === CONTENT SCRIPT CHECK ===');
    
    // Check if we're on aigei.com
    const isAigeiSite = window.location.hostname.includes('aigei.com');
    console.log(`🌐 Current site: ${window.location.hostname}`);
    console.log(`🎯 Is Aigei site: ${isAigeiSite}`);
    
    // Look for extension injected elements
    const extensionElements = document.querySelectorAll('[data-aigei-extension]');
    if (extensionElements.length > 0) {
        console.log(`✅ Found ${extensionElements.length} extension elements`);
    } else {
        console.log('ℹ️ No extension elements found (normal if not on aigei.com)');
    }
    
    // Check for audio elements
    const audioElements = document.querySelectorAll('audio, video');
    console.log(`🎵 Audio/Video elements found: ${audioElements.length}`);
    
    audioElements.forEach((element, index) => {
        console.log(`  📻 Element ${index + 1}: ${element.tagName} - ${element.src || 'No src'}`);
    });
}

// Check 6: Network Monitoring
function checkNetworkMonitoring() {
    console.log('\n🌐 === NETWORK MONITORING ===');
    
    // Override XMLHttpRequest to monitor requests
    const originalXHR = window.XMLHttpRequest;
    let requestCount = 0;
    
    window.XMLHttpRequest = function() {
        const xhr = new originalXHR();
        const originalOpen = xhr.open;
        
        xhr.open = function(method, url, async, user, password) {
            requestCount++;
            
            if (url.includes('.mp3') || url.includes('.wav') || url.includes('.ogg') || url.includes('.m4a')) {
                console.log(`🎵 Audio request detected: ${method} ${url}`);
            }
            
            return originalOpen.apply(this, arguments);
        };
        
        return xhr;
    };
    
    // Override fetch
    const originalFetch = window.fetch;
    window.fetch = function(url, options) {
        if (typeof url === 'string' && (url.includes('.mp3') || url.includes('.wav') || url.includes('.ogg') || url.includes('.m4a'))) {
            console.log(`🎵 Audio fetch detected: ${url}`);
        }
        
        return originalFetch.apply(this, arguments);
    };
    
    console.log('✅ Network monitoring hooks installed');
    
    // Restore after 10 seconds
    setTimeout(() => {
        window.XMLHttpRequest = originalXHR;
        window.fetch = originalFetch;
        console.log(`ℹ️ Network monitoring disabled. Detected ${requestCount} requests.`);
    }, 10000);
}

// Main debug function
async function runFullDebug() {
    console.log('🔍 ===== AIGEI SOUND DOWNLOADER DEBUG REPORT =====');
    console.log(`🕐 Time: ${new Date().toLocaleString()}`);
    console.log(`🌐 URL: ${window.location.href}`);
    console.log(`👤 User Agent: ${navigator.userAgent.split(' ').slice(-2).join(' ')}`);
    
    try {
        const basicsOK = checkExtensionBasics();
        
        if (basicsOK) {
            await checkPermissions();
            await checkStorage();
            await checkBackgroundComm();
        }
        
        checkContentScript();
        checkNetworkMonitoring();
        
        console.log('\n✅ === DEBUG COMPLETE ===');
        console.log('📋 Summary:');
        console.log('   - Check console above for any ❌ errors');
        console.log('   - If extension is working, you should see mostly ✅ marks');
        console.log('   - Test by playing audio on aigei.com and checking popup');
        
    } catch (error) {
        console.error('❌ Debug script failed:', error);
    }
}

// Auto-run debug
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', runFullDebug);
} else {
    runFullDebug();
}

// Manual debug trigger
window.debugAigeiExtension = runFullDebug;

console.log('💡 To run debug manually, call: debugAigeiExtension()');
