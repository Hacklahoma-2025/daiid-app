chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
    if (message.images) {
      // For each image, send the URL to your Python backend
      message.images.forEach(url => {
        fetch("http://localhost:5000/process", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ imageUrl: url })
        })
        .then(response => response.json())
        .then(result => {
          console.log(`Result for ${url}:`, result.number);
          // Optionally, update the UI or store the result
        })
        .catch(err => console.error("Error processing image:", err));
      });
    }
});
  