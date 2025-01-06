let isInitialized = false;
let rotationInterval = null;

export function setupTextRotator() {
  if (typeof window === "undefined") return; // Skip during SSR

  // Prevent multiple initializations
  if (isInitialized) return;
  isInitialized = true;

  const loggers = ["Javascript logging libraries", "pino", "winston", "electron-log", "DataDog", "New Relic"];
  let currentIndex = 0;

  function updateText() {
    const element = document.getElementById("js-lib-label");
    if (element) {
      element.classList.remove("visible");

      // Wait for fade out to complete before changing text
      setTimeout(() => {
        element.textContent = loggers[currentIndex];
        currentIndex = (currentIndex + 1) % loggers.length;

        // Trigger reflow to ensure transition happens
        element.offsetHeight;

        // Start fade in
        element.classList.add("visible");
      }, 500); // Match the CSS transition duration
    }
  }

  // Clear any existing interval
  if (rotationInterval) {
    clearInterval(rotationInterval);
  }

  // Initial update
  updateText();

  // Start rotation
  rotationInterval = setInterval(updateText, 3000);
}
