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

      addRetryButtonListeners(data.baseUrl);

      const observer = new MutationObserver((mutations) => {
        for (const mutation of mutations) {
          if (mutation.addedNodes.length > 0 || mutation.type === "childList") {
            addRetryButtonListeners(data.baseUrl);
          }
        }
      });

      observer.observe(document.body, {
        childList: true,
        subtree: true,
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
    <div style="display:flex">
      <div style="margin-bottom:4px; margin-right:8px;">Status: ${
        d.status
      }</div>
      ${
        d.status === "failed"
          ? `<a style="color: blue; cursor: pointer;" class="retry-button" id="${d.id}">Retry</a>`
          : ""
      }
    </div>
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
  <script src="popup.js"></script>
`
    )
    .join("");
  return `
    <div style="width: 500px; font-family: Arial, sans-serif;">
      ${
        html
          ? html
          : '<div style="margin-bottom:8px;">No downloads yet...</div>'
      }
    </div>
  `;
}

const fetchURL = async (url) => {
  const response = await fetch(url);
  const json = await response.json();
  return renderDownloads(json);
};

function addRetryButtonListeners(urlBase) {
  const buttons = document.querySelectorAll(".retry-button");
  buttons.forEach((button) => {
    if (!button.dataset.listenerAdded) {
      button.addEventListener("click", () => {
        const id = button.id;
        if (id) {
          fetch(`${urlBase}/download/retry?id=${encodeURIComponent(id)}`)
            .then((response) => {
              if (!response.ok) throw new Error("Retry request failed");
              return response.json();
            })
            .then((data) => {
              console.log("Retry successful:", data);
            })
            .catch((error) => {
              console.error("Error retrying download:", error);
            });
        } else {
          console.warn("Retry button clicked, but no ID found.");
        }
      });
      button.dataset.listenerAdded = "true";
    }
  });
}
