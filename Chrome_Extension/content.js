// Find all images on the page
const imgs = document.querySelectorAll('img');
const imageURLs = Array.from(imgs).map(img => img.src);

// Send the list to the background script
chrome.runtime.sendMessage({ images: imageURLs });
