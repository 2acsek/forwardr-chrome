document.addEventListener('DOMContentLoaded', () => {
    const hostInput = document.getElementById('hostInput');
    const saveBtn = document.getElementById('saveBtn');
  
    chrome.storage.sync.get(["baseUrl"], (data) => {
      if (data.baseUrl) {
        hostInput.value = data.baseUrl;
      }
    });
  
    saveBtn.addEventListener('click', () => {
      const newBase = hostInput.value.trim();
      if (!/^https?:\/\/[^ "]+$/.test(newBase)) {
        alert("Please enter a valid URL (e.g. http://localhost:3000)");
        return;
      }
  
      chrome.storage.sync.set({ baseUrl: newBase }, () => {
        saveBtn.textContent = "Saved!";
        setTimeout(() => saveBtn.textContent = "Save", 1000);
      });
    });
  });
  