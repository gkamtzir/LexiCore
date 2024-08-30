// Listen for the shortcut command
chrome.commands.onCommand.addListener(async (command) => {
  if (command === "show_tooltip") {
    chrome.tabs.query({ active: true, currentWindow: true }, async (tabs) => {
      await chrome.scripting.insertCSS({
        files: ["styles.css"],
        target: { tabId: tabs[0].id },
      });

      chrome.scripting.executeScript({
        target: { tabId: tabs[0].id },
        files: ['script.js']
      });
    });
  }
});
