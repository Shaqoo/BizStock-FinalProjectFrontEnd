  const regenBtn = document.getElementById("regen-btn");
  const resultContainer = document.getElementById("mfa-result");
  const qrCodeImg = document.getElementById("qr-code");
  const manualKey = document.getElementById("manual-key");
  const recoveryCodesList = document.getElementById("recovery-codes");
  const downloadBtn = document.getElementById("download-codes");
  const copyBtn = document.getElementById("copy-codes");

  let recoveryCodes = [];

  regenBtn.addEventListener("click", async () => {
    try {
      const token = sessionStorage.getItem("accessToken");
      if (!token) {
        Swal.fire({
          icon: 'warning',
          title: 'Login Required',
          text: 'Please log in first!'
        });
        return;
      }

      const response = await fetch("https://localhost:7124/api/v1/Users/regenerate", {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${token}`,
          "Content-Type": "application/json"
        }
      });

      if (!response.ok) {
        throw new Error("Failed to regenerate MFA");
      }

      const { data } = await response.json();

      recoveryCodes = data.recoveryCodes;

      qrCodeImg.src = data.qrCodeImageUrl;
      manualKey.textContent = data.manualEntryKey;
      recoveryCodesList.innerHTML = "";
      recoveryCodes.forEach(code => {
        const li = document.createElement("li");
        li.textContent = code;
        recoveryCodesList.appendChild(li);
      });

      resultContainer.classList.remove("hidden");

    } catch (err) {
      console.error(err);
      Swal.fire({
        icon: 'error',
        title: 'Error',
        text: err.message
      });
    }
  });

  copyBtn.addEventListener("click", () => {
    if (recoveryCodes.length === 0) {
      Swal.fire({ icon: 'info', title: 'No Codes', text: 'Please regenerate first.' });
      return;
    }
    navigator.clipboard.writeText(recoveryCodes.join("\n")).then(() => {
      Swal.fire({
        icon: 'success',
        title: 'Copied!',
        text: 'Recovery codes copied to clipboard.',
        showConfirmButton: false,
        timer: 2000
      });
    });
  });

  downloadBtn.addEventListener("click", () => {
    if (recoveryCodes.length === 0) {
      Swal.fire({ icon: 'info', title: 'No Codes', text: 'Please regenerate first.' });
      return;
    }
    const blob = new Blob([recoveryCodes.join("\n")], { type: "text/plain" });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "recovery-codes.txt";
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);

    Swal.fire({
      icon: 'success',
      title: 'Downloaded!',
      text: 'Recovery codes downloaded.',
      showConfirmButton: false,
      timer: 2000
    });
  });
