chrome.runtime.onInstalled.addListener((details) => {
    chrome.contextMenus.create({
      id: "sendToPrivate",
      title: "Forward to private",
      contexts: ["link"]
    });
    chrome.contextMenus.create({
      id: "sendToTorrents",
      title: "Forward to torrents",
      contexts: ["link"]
    });
  
    if (details.reason === "install") {
      chrome.runtime.openOptionsPage();
    }
  });
  
  chrome.contextMenus.onClicked.addListener((info, tab) => {
    if (info.menuItemId === "sendToTorrents") {
      chrome.storage.sync.get(["baseUrl"], (data) => {
        const baseUrl = data.baseUrl || "http://localhost:3000";
        const linkUrl = encodeURIComponent(btoa(info.linkUrl));
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
    if(info.menuItemId === "sendToPrivate") {
      chrome.storage.sync.get(["baseUrl"], (data) => {
        const baseUrl = data.baseUrl || "http://localhost:3000";
        const linkUrl = encodeURIComponent(btoa(info.linkUrl));
        const fullUrl = `${baseUrl}/download/private?url=${linkUrl}`;
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
  