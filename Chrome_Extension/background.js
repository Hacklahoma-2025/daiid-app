chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.images) {
    message.images.forEach(url => {
      fetch("http://localhost:5000/process", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ imageUrl: url })
      })
        .then(response => response.text()) // get response as text
        .then(text => {
          console.log("Response text:", text);
          // Then try parsing it if it's valid JSON.
          const result = JSON.parse(text);
          if (sender.tab && sender.tab.id) {
            chrome.tabs.sendMessage(sender.tab.id, {
              imageUpdate: {
                imageUrl: url,
                result: result.number
              }
            });
          }
        })
        .catch(err => console.error("Error processing image:", err));
    });
  }
});