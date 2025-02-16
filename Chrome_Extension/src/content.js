// Wait until the page and all resources (e.g., images) are fully loaded
window.addEventListener("load", () => {
  const imgs = document.querySelectorAll("img");
  // Filter only images that are fully loaded
  const imageURLs = Array.from(imgs)
    .filter(img => img.complete && img.naturalWidth > 0)
    .map(img => img.src);

  chrome.runtime.sendMessage({ images: imageURLs });
});

chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.imageUpdate) {
    // Updated to use consensus property from background.js
    const { imageUrl, consensus } = message.imageUpdate;
    const result = consensus;

    // Determine color and label based on confidence thresholds
    let color, label;
    if (result >= 66) {
      color = "#ff0000"; // red for high AI likelihood
      label = "High AI Likelihood";
    } else if (result >= 33) {
      color = "#ffc107"; // yellow for moderate AI likelihood
      label = "Moderate AI Likelihood";
    } else {
      color = "#28a745"; // green for low AI likelihood
      label = "Low AI Likelihood";
    }

    // Find the image with the matching src attribute
    const images = document.querySelectorAll(`img[src="${imageUrl}"]`);
    images.forEach(img => {
      // Ensure the parent container is relatively positioned for the overlay
      if (img.parentElement) {
        img.parentElement.style.position = "relative";
      }

      // Create an overlay div element if it doesn't exist
      let overlay = img.parentElement.querySelector(".ai-overlay");
      if (!overlay) {
        overlay = document.createElement("div");
        overlay.className = "ai-overlay";
        overlay.style.position = "absolute";
        overlay.style.bottom = "0";
        overlay.style.left = "0";
        overlay.style.width = "100%";
        overlay.style.backgroundColor = "rgba(255, 255, 255, 0.8)";
        overlay.style.textAlign = "center";
        overlay.style.fontSize = "14px";
        overlay.style.fontWeight = "bold";
        overlay.style.padding = "2px 0";
        overlay.style.zIndex = "9999";
        img.parentElement.appendChild(overlay);
      }
      
      // Set the overlay text and color
      overlay.textContent = `${label}: ${result}%`;
      overlay.style.color = color;
    });
  }
});