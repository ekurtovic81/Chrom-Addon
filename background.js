// Background service worker for Chrome Extension
// Handles background tasks and permissions

chrome.runtime.onInstalled.addListener(() => {
  console.log('Export/Import History & Bookmarks extension installed');
});

// Listen for messages from popup
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.action === 'getHistory') {
    chrome.history.search(request.params, (results) => {
      sendResponse({ success: true, data: results });
    });
    return true; // Keep message channel open for async response
  }
  
  if (request.action === 'getBookmarks') {
    chrome.bookmarks.getTree((results) => {
      sendResponse({ success: true, data: results });
    });
    return true;
  }
});
