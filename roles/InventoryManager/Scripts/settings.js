let apiBaseUrl = "https://localhost:7124/api/v1";
const apiBase = "https://localhost:7124/api/v1/Notifications";



document.querySelector("#regenerateBtn").addEventListener("click", () => {
  window.location.href = "/general/mfa-regenerate.html";
});

document.querySelector("#resetBtn").addEventListener("click", () => {
  window.location.href = "/general/resetPassword.html";
});


document.querySelector("#update-nameBtn").addEventListener("click", async () => {
  const firstname = document.querySelector("#firstName").value.trim();
  const lastname = document.querySelector("#lastName").value.trim();

  const nameRegex = /^[A-Za-z]{2,}$/;
  if (!firstname || !lastname) {
    Swal.fire({ icon: "warning", title: "Missing Fields", text: "Please enter both first and last name." });
    return;
  }
  if (!nameRegex.test(firstname) || !nameRegex.test(lastname)) {
    Swal.fire({ icon: "warning", title: "Invalid Name", text: "Names must be at least 2 letters and alphabetic only." });
    return;
  }

  const dto = { Firstname: firstname, Lastname: lastname };

  try {
    const response = await fetch(`${apiBaseUrl}/Users/full-name`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${sessionStorage.getItem("accessToken")}`,
      },
      body: JSON.stringify(dto),
    });

    const data = await response.json();
    if (data.isSuccess) {
      Swal.fire({ icon: "success", title: "Updated", text: "Name updated successfully!" });
      document.querySelector(".userName").textContent = `${firstname} ${lastname}`;
    } else {
      Swal.fire({ icon: "error", title: "Error", text: data.message || "Failed to update name" });
    }
  } catch (err) {
    console.error(err);
    Swal.fire({ icon: "error", title: "Error", text: "Could not update name." });
  }
});


const fileInput = document.getElementById("profilePicInput");
const previewContainer = document.getElementById("previewContainer");
const previewImg = document.getElementById("previewImg");
const form = document.getElementById("profilePicForm");

fileInput.addEventListener("change", () => {
  const file = fileInput.files[0];
  if (!file) return;

  if (file.size > 4 * 1024 * 1024) {
    Swal.fire({ icon: "error", title: "Too Large", text: "File must be under 4MB." });
    fileInput.value = "";
    previewContainer.classList.add("hidden");
    return;
  }

  const reader = new FileReader();
  reader.onload = (e) => {
    previewImg.src = e.target.result;
    previewContainer.classList.remove("hidden");
  };
  reader.readAsDataURL(file);
});

form.addEventListener("submit", async (e) => {
  e.preventDefault();
  const file = fileInput.files[0];
  if (!file) {
    Swal.fire({ icon: "warning", title: "No File", text: "Choose a picture to upload." });
    return;
  }

  const formData = new FormData();
  formData.append("file", file);

  try {
    const response = await fetch(`${apiBaseUrl}/Users/profile-picture`, {
      method: "PUT",
      headers: { "Authorization": `Bearer ${sessionStorage.getItem("accessToken")}` },
      body: formData,
    });

    if (response.ok) {
      Swal.fire({ icon: "success", title: "Uploaded!", text: "Profile picture updated successfully." });
      fileInput.value = "";
    } else {
      Swal.fire({ icon: "error", title: "Failed", text: "Could not upload profile picture." });
    }
  } catch (err) {
    console.error(err);
    Swal.fire({ icon: "error", title: "Error", text: "Something went wrong while uploading." });
  }
  finally{
    fileInput.value = "";
    previewContainer.classList.add("hidden");
  }
});
