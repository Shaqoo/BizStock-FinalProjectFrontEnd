const apiBase = "https://localhost:7124/api/v1/Users";
let userEmail = "";
let tokenDigits = "";


function isValidEmail(email) {
  const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return regex.test(email);
}

 function isValidPassword(password) {
  const regex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&#])[A-Za-z\d@$!%*?&#]{8,}$/;
  return regex.test(password);
}

async function sendResetToken() {
  userEmail = document.getElementById("email").value.trim();

  if (!isValidEmail(userEmail)) {
    return Swal.fire("Error", "Please enter a valid email address.", "error");
  }

  const res = await fetch(`${apiBase}/request-password-change`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email: userEmail })
  });

  const data = await res.json();
  if (res.ok) {
    Swal.fire("Success", data.message || "Reset code sent to your email!", "success");
    document.getElementById("step1").classList.add("hidden");
    document.getElementById("step2").classList.remove("hidden");
    document.querySelector(".digit-input").focus();
  } else {
    Swal.fire("Error", data.message || "Failed to send reset code.", "error");
  }
}

async function verifyResetToken() {
  const inputs = document.querySelectorAll(".digit-input");
  tokenDigits = Array.from(inputs).map(i => i.value).join("");

  if (tokenDigits.length !== 6) {
    return Swal.fire("Error", "Please enter the 6-digit code.", "error");
  }

  const res = await fetch(`${apiBase}/verify-password-code`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email: userEmail, code: tokenDigits })
  });

  const data = await res.json();
  if (res.ok) {
    Swal.fire("Verified", data.message || "Code verified successfully.", "success");
    document.getElementById("step2").classList.add("hidden");
    document.getElementById("step3").classList.remove("hidden");
  } else {
    Swal.fire("Error", data.message || "Invalid or expired code.", "error");
  }
}

async function resetPassword() {
  const newPassword = document.getElementById("newPassword").value;
  const confirmPassword = document.getElementById("confirmPassword").value;

  if (!isValidPassword(newPassword)) {
    return Swal.fire("Error", "Password must be at least 8 characters and include a letter, a number, and a special character.", "error");
  }

  if (newPassword !== confirmPassword) {
    return Swal.fire("Error", "Passwords do not match.", "error");
  }

  const res = await fetch(`${apiBase}/reset-password`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email: userEmail, newPassword,confirmPassword })
  });

  const data = await res.json();
  if (res.ok) {
    Swal.fire("Success", data.message || "Password reset successful!", "success")
      .then(() => window.location.href = "/general/login.html");
  } else {
    Swal.fire("Error", data.message || "Failed to reset password.", "error");
  }
}


function moveNext(e) {
  const input = e.target;
  const inputs = [...document.querySelectorAll(".digit-input")];
  const index = inputs.indexOf(input);

  if (input.value && index < inputs.length - 1) {
    inputs[index + 1].focus();
  }
}

document.addEventListener("DOMContentLoaded", () => {
  document.getElementById("btnSendCode").addEventListener("click", sendResetToken);
  document.getElementById("btnVerifyCode").addEventListener("click", verifyResetToken);
  document.getElementById("btnResetPassword").addEventListener("click", resetPassword);

  document.querySelectorAll(".digit-input").forEach(input => {
    input.addEventListener("input", moveNext);
  });
});
