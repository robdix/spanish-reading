// Add this at the very top of the file
console.log('Background script loaded');

// Handle context menu creation
chrome.runtime.onInstalled.addListener(() => {
  console.log('Extension installed/updated');
  chrome.contextMenus.create({
    id: 'lookupWord',
    title: 'Look up "%s"',
    contexts: ['selection']
  });
});

// Handle context menu clicks
chrome.contextMenus.onClicked.addListener((info, tab) => {
  if (info.menuItemId === 'lookupWord' && tab.id) {
    console.log('Context menu clicked:', info.selectionText);
    
    // Get surrounding text for context
    chrome.scripting.executeScript({
      target: { tabId: tab.id },
      func: () => {
        const selection = window.getSelection();
        if (!selection.toString()) return null;
        
        const range = selection.getRangeAt(0);
        const container = range.commonAncestorContainer;
        
        // Get ~100 chars before and after
        const fullText = container.textContent;
        const start = Math.max(0, range.startOffset - 100);
        const end = Math.min(fullText.length, range.endOffset + 100);
        
        return {
          word: selection.toString(),
          context: fullText.substring(start, end)
        };
      }
    }).then(async ([{ result }]) => {
      if (!result) return;
      
      console.log('Got selection result:', result);
      
      // Create URL parameters
      const params = new URLSearchParams({
        word: result.word,
        context: result.context,
        source: 'extension'
      });

      // Open in a new Chrome window
      chrome.windows.create({
        url: `http://localhost:3000/define?${params.toString()}`,
        type: 'popup',
        width: 500,
        height: 800
      });
    });
  }
});

// Handle keyboard shortcuts
chrome.commands.onCommand.addListener((command) => {
  if (command === 'lookup-word') {
    chrome.tabs.query({ active: true, currentWindow: true }, async ([tab]) => {
      if (!tab.id) return;
      
      const [{ result }] = await chrome.scripting.executeScript({
        target: { tabId: tab.id },
        func: () => {
          const selection = window.getSelection();
          if (!selection.toString()) return null;
          
          const range = selection.getRangeAt(0);
          const container = range.commonAncestorContainer;
          const fullText = container.textContent;
          const start = Math.max(0, range.startOffset - 100);
          const end = Math.min(fullText.length, range.endOffset + 100);
          
          return {
            word: selection.toString(),
            context: fullText.substring(start, end)
          };
        }
      });

      if (result) {
        const params = new URLSearchParams({
          word: result.word,
          context: result.context,
          source: 'extension'
        });

        chrome.windows.create({
          url: `http://localhost:3000/define?${params.toString()}`,
          type: 'popup',
          width: 500,
          height: 800
        });
      }
    });
  }
}); 