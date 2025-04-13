document.addEventListener("DOMContentLoaded", () => {
  const hostInput = document.getElementById("hostInput");
  const saveBtn = document.getElementById("saveBtn");
  const downloads = document.getElementById("downloads");
  const clear = document.getElementById("clear");

  const clearHistory = async () => {
    chrome.storage.sync.get(["baseUrl"], (data) => {
      if (data.baseUrl) {
        const url = `${data.baseUrl}/downloads/clear`;
        fetch(url)
          .then((r) => console.log(r))
          .catch((err) => console.log(err));
      }
    });
  };

  chrome.storage.sync.get(["baseUrl"], (data) => {
    if (data.baseUrl) {
      hostInput.value = data.baseUrl;

      const url = `${data.baseUrl}/downloads`;
      fetchURL(url)
        .then((html) => (downloads.innerHTML = html))
        .catch();

      setInterval(() => {
        fetchURL(url)
          .then((html) => (downloads.innerHTML = html))
          .catch();
      }, 2000);

      clear.addEventListener("click", () => {
        clearHistory();
      });
    }
  });

  saveBtn.addEventListener("click", () => {
    const newBase = hostInput.value.trim();
    if (!/^https?:\/\/[^ "]+$/.test(newBase)) {
      alert("Please enter a valid URL (e.g. http://localhost:3000)");
      return;
    }

    chrome.storage.sync.set({ baseUrl: newBase }, () => {
      saveBtn.textContent = "Saved!";
      setTimeout(() => (saveBtn.textContent = "Save"), 1000);
    });
  });
});

function renderDownloads(downloads) {
  const html = downloads
    .sort((a, b) =>
      a.fileName.toLowerCase() > b.fileName.toLowerCase() ? 1 : -1
    )
    .map(
      (d) => `
  <div style="border: 1px solid #ccc; border-radius: 8px; padding: 10px; margin-bottom: 10px; background: #f9f9f9;">
    <div style="margin-bottom:4px"><strong>${d.fileName}</strong></div>
    <div style="margin-bottom:4px">Status: ${d.status}</div>
    <div style="margin-bottom:4px">Path: ${d.path}</div>
    <div style="display: flex;align-items: center;justify-content: space-between;">
      <div style="height: 10px; background: #eee; border-radius: 5px; overflow: hidden; width:88%">
        <div style="width: ${
          d.progress
        }%; height: 100%; background: #4caf50;"></div>
        </div>
      <div style="width:10%">${d.progress.toFixed(1)}%</div>
    </div>
  </div>
`
    )
    .join("");
  return `
    <div style="width: 500px; font-family: Arial, sans-serif;">
      ${html ? html : '<div style="margin-bottom:8px;">No downloads yet...</div>'}
    </div>
  `;
}

const fetchURL = async (url) => {
  const response = await fetch(url);
  const json = await response.json();
  return renderDownloads(json);
};
