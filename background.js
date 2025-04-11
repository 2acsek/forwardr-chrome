chrome.runtime.onInstalled.addListener((details) => {
    chrome.contextMenus.create({
      id: "sendToHost",
      title: "Send to configured host",
      contexts: ["link"]
    });
  
    if (details.reason === "install") {
      chrome.runtime.openOptionsPage();
    }
  });
  
  chrome.contextMenus.onClicked.addListener((info, tab) => {
    if (info.menuItemId === "sendToHost") {
      chrome.storage.sync.get(["baseUrl"], (data) => {
        const baseUrl = data.baseUrl || "http://localhost:3000";
        const linkUrl = encodeURIComponent(info.linkUrl);
        const fullUrl = `${baseUrl}/download?url=${linkUrl}`;
        console.log("URLDownloader: URL is being sent to: ", fullUrl)
        fetch(fullUrl)
          .then(response => {
            if (response.ok) {
              chrome.notifications.create({
                type: "basic",
                iconUrl: "icon.png",
                title: "Success",
                message: "Link sent successfully!"
              });
            } else {
              chrome.notifications.create({
                type: "basic",
                iconUrl: "icon.png",
                title: "Server Error",
                message: `Status: ${response.status}`
              });
            }
          })
          .catch(error => {
            chrome.notifications.create({
              type: "basic",
              iconUrl: "icon.png",
              title: "Request Failed",
              message: `Error: ${error.message}`
            });
          });
      });
    }
  });
  