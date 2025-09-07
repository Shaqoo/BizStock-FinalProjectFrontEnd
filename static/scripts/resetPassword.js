 function isValidPassword(password) {
  const regex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&#])[A-Za-z\d@$!%*?&#]{8,}$/;
  return regex.test(password);
}

const apiBaseUrl = "https://localhost:7124/api/v1/Users"; 
const token = sessionStorage.getItem("accessToken");

document.querySelector("#verifyBtn").addEventListener("click", async () => {
  const currentPassword = document.querySelector("#currentPassword").value.trim();
  if (!currentPassword) {
    Swal.fire("Error", "Please enter your current password", "error");
    return;
  }
  try {
    const response = await fetch(`${apiBaseUrl}/request-change-password`, {
      method: "POST",
      headers: { 
        "Content-Type": "application/json",
        "Authorization": `Bearer ${token}`
      },
      body: JSON.stringify({ password: currentPassword })
    });
    const data = await response.json();
    console.log(data);

    if (data.isSuccess) {
      Swal.fire("Success", "Password verified! Enter a new password", "success");
       const changeStep = document.querySelector("#change-step");

        changeStep.classList.remove("max-h-0");
        changeStep.classList.add("max-h-screen");
    } else {
      Swal.fire("Error", data.message || "Incorrect current password", "error");
    }
  } catch (err) {
    console.error(err);
    Swal.fire("Error", "An error occurred", "error");
  }
});

document.querySelector("#changeBtn").addEventListener("click", async () => {
  const newPassword = document.querySelector("#newPassword").value.trim();
  const confirmNewPassword = document.querySelector("#confirmNewPassword").value.trim();

  if (!newPassword || !confirmNewPassword) {
    Swal.fire("Error", "All fields are required", "error");
    return;
  }


  if (!isValidPassword(newPassword)) {
    return Swal.fire("Error", "Password must be at least 8 characters and include a letter, a number, and a special character.", "error");
  }
  

  if (newPassword !== confirmNewPassword) {
    Swal.fire("Error", "Passwords do not match", "error");
    return;
  }

  try {
    const response = await fetch(`${apiBaseUrl}/change-password`, {
      method: "POST",
      headers: { 
        "Content-Type": "application/json",
        "Authorization": `Bearer ${token}`
      },
      body: JSON.stringify({ newPassword, confirmNewPassword })
    });
    const data = await response.json();

    if (data.isSuccess) {
      Swal.fire("Success", "Password changed successfully!", "success");
      setTimeout(() => window.location.href = "/login", 2000);
    } else {
      Swal.fire("Error", data.message || "Failed to change password", "error");
    }
  } catch (err) {
    console.error(err);
    Swal.fire("Error", "An error occurred", "error");
  }
});