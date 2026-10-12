document.addEventListener("DOMContentLoaded", () => {
  const btn = document.getElementById("checkBtn");
  const result = document.getElementById("result");
  const input = document.getElementById("urlInput");
  const qrInput = document.getElementById("qrImage");

  /* ===============================
     Auto-detect current tab URL
     =============================== */
  chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
    if (tabs?.[0]?.url) {
      input.value = tabs[0].url;
    }
  });

  /* ===============================
     Button click → Full analysis
     =============================== */
  btn.addEventListener("click", () => {
    const url = input.value.trim();
    resetResult();

    if (!url) {
      showWarning("⚠️ Please enter a URL first");
      return;
    }

    result.textContent = "🔍 Analyzing URL...";

    setTimeout(() => {
      const score = calculateRiskScore(url);
      displayRisk(score);
    }, 600); // small delay = better UX
  });

  /* ===============================
     QR Image Upload Scanner
     =============================== */
  qrInput.addEventListener("change", (e) => {
    const file = e.target.files[0];
    if (!file) return;

    resetResult();
    result.textContent = "📷 Scanning QR Code...";

    const img = new Image();
    const reader = new FileReader();

    reader.onload = () => (img.src = reader.result);

    img.onload = () => {
      const canvas = document.createElement("canvas");
      const ctx = canvas.getContext("2d");

      canvas.width = img.width;
      canvas.height = img.height;
      ctx.drawImage(img, 0, 0);

      const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
      const qrCode = jsQR(imageData.data, canvas.width, canvas.height);

      if (qrCode) {
        input.value = qrCode.data;
        showSafe("📎 QR URL extracted — ready to scan");
      } else {
        showWarning("❌ No QR code found in image");
      }
    };

    reader.readAsDataURL(file);
  });

  /* ===============================
     UI helper functions
     =============================== */
  function resetResult() {
    result.className = "";
    result.textContent = "";
  }

  function showSafe(msg) {
    result.textContent = msg;
    result.className = "safe";
  }

  function showWarning(msg) {
    result.textContent = msg;
    result.className = "warning";
  }

  function displayRisk(score) {
    if (score >= 7) {
      showWarning(`🚨 HIGH RISK (${score}/10) — Likely Phishing`);
    } else if (score >= 4) {
      showWarning(`⚠️ MEDIUM RISK (${score}/10) — Be Careful`);
    } else {
      showSafe(`✅ LOW RISK (${score}/10) — Looks Safe`);
    }
  }
});

/* ===============================
   ADVANCED PHISHING LOGIC
   (Rule + ML-style scoring)
   =============================== */
function calculateRiskScore(url) {
  let score = 0;
  const lowerUrl = url.toLowerCase();

  // Length-based risk
  if (url.length > 75) score += 2;
  if (url.length > 120) score += 2;

  // Suspicious characters
  if (url.includes("@")) score += 2;
  if (url.includes("-")) score += 1;

  // IP address usage
  if (/\d+\.\d+\.\d+\.\d+/.test(url)) score += 3;

  // HTTP instead of HTTPS
  if (url.startsWith("http://")) score += 2;

  // URL shorteners
  if (lowerUrl.includes("bit.ly") || lowerUrl.includes("tinyurl")) score += 2;

  // Phishing keywords
  const keywords = [
    "login", "verify", "secure", "account",
    "update", "bank", "free", "reward"
  ];

  keywords.forEach(word => {
    if (lowerUrl.includes(word)) score += 1;
  });

  return Math.min(score, 10); // cap score at 10
}
