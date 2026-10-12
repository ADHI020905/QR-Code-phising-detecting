chrome.runtime.onInstalled.addListener((details) => {
  if (details.reason === "install") {
    console.log("✅ QR Phishing Detector installed successfully");

    // Save default settings
    chrome.storage.local.set({
      protectionEnabled: true,
      scanCount: 0,
      riskLevel: "medium"
    });

    // Optional: show welcome notification
    chrome.notifications.create({
      type: "basic",
      iconUrl: "icons/icon128.png",
      title: "QR Phishing Detector",
      message: "Protection is now active. Stay safe from malicious QR codes!"
    });

  } else if (details.reason === "update") {
    console.log(
      `🔄 QR Phishing Detector updated from ${details.previousVersion}`
    );
  }
});
