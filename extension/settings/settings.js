document.addEventListener('DOMContentLoaded', async () => {
  // Get current shortcuts
  const commands = await chrome.commands.getAll();
  const lookupCommand = commands.find(cmd => cmd.name === 'lookup-word');
  
  // Update UI
  const shortcutSpan = document.getElementById('current-shortcut');
  shortcutSpan.textContent = lookupCommand?.shortcut || 'Not set';
}); 