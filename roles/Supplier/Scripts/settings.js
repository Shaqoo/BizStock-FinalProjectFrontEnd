const modal = document.getElementById("modal");
const modalTitle = document.getElementById("modal-title");
const modalBody = document.getElementById("modal-body");
const modalForm = document.getElementById("modal-form");
const closeModal = document.getElementById("close-modal");
const modalContent = document.getElementById("modal-content");
const previewImg = document.getElementById("preview-img");

function openModal(title, bodyHtml) {
  document.getElementById("modal-title").textContent = title;
  document.getElementById("modal-body").innerHTML = bodyHtml;

  modal.classList.remove("hidden");
  setTimeout(() => {
    modalContent.classList.remove("opacity-0", "translate-y-10");
    modalContent.classList.add("opacity-100", "translate-y-0");
  }, 100);
}

function hideModal() {
  modalContent.classList.remove("opacity-100", "translate-y-0");
  modalContent.classList.add("opacity-0", "translate-y-10");
  
  setTimeout(() => {
    modal.classList.add("hidden");
  }, 300);  
}


document.getElementById("edit-img-btn").addEventListener("click", () => {
  openModal("Update Profile Picture", `
    <input type="file" id="profile-file" name="file" class="w-full border p-2 rounded-lg">
  `);
});

closeModal.addEventListener("click", hideModal);

document.getElementById("edit-name-btn").addEventListener("click", () => {
  openModal("Update Full Name", `
    <input type="text" id="first-name" placeholder="First Name" class="w-full border p-2 rounded-lg">
    <input type="text" id="last-name" placeholder="Last Name" class="w-full border p-2 rounded-lg">
  `);
});


document.getElementById("reset-password-btn").addEventListener("click", () => {
  Swal.fire({
    icon: "warning",
    title: "Reset Password?",
    text: "You will receive a reset link in your email.",
    showCancelButton: true,
    confirmButtonText: "Yes, Reset"
  }).then((res) => {
    if (res.isConfirmed) {
      window.location.href = '/general/resetPassword.html'
      Swal.fire("Success", "Password reset email sent.", "success");
    }
  });
});


document.getElementById("regen-mfa-btn").addEventListener("click", () => {
  Swal.fire({
    icon: "question",
    title: "Regenerate MFA?",
    text: "This will invalidate your old MFA setup.",
    showCancelButton: true,
    confirmButtonText: "Yes, Regenerate"
  }).then((res) => {
    if (res.isConfirmed) {
      window.location.href = '/general/mfa-regenerate.html'
      Swal.fire("Success", "New MFA link generated.", "success");
    }
  });
});


closeModal.addEventListener("click", () => {
  modal.classList.add("hidden");
});

const apiBaseUrl = "https://localhost:7124/api/v1";


modalForm.addEventListener("submit",async (e) => {
  e.preventDefault();

  if (modalTitle.textContent.includes("Profile Picture")) {
    const fileInput = document.getElementById("profile-file");
    if (fileInput.files.length > 0) {
      const reader = new FileReader();
      reader.onload = () => {
        previewImg.src = reader.result;  
      };
    const file = fileInput.files[0];
    if (file.size > 4 * 1024 * 1024) { 
    Swal.fire({
    icon: "error",
    title: "File Too Large",
    text: "Profile picture must be less than 4 MB.",
    });
    return;
}
      reader.readAsDataURL(fileInput.files[0]);

    const formData = new FormData();
    formData.append("file", file);

    try {
      const response = await fetch(`${apiBaseUrl}/Users/profile-picture`, {
        method: "PUT",
        headers: {
          "Authorization": `Bearer ${sessionStorage.getItem("accessToken")}`
        },
        body: formData
      });

      if (response.ok) {
        Swal.fire({
          icon: "success",
          title: "Updated!",
          text: "Profile picture updated successfully.",
        });
        fileInput.value = "";
      } else {
        Swal.fire({
          icon: "error",
          title: "Upload Failed",
          text: "Could not upload profile picture. Try again.",
        });
        fileInput.value = "";
      }
    } catch (err) {
      console.error(err);
      Swal.fire({
        icon: "error",
        title: "Error",
        text: "Something went wrong while uploading.",
      });
      fileInput.value = "";
    }

      Swal.fire("Success", "Profile picture updated.", "success");
    }
  } else if (modalTitle.textContent.includes("Full Name")) {
    const first = document.getElementById("first-name").value;
    const last = document.getElementById("last-name").value;
    const firstname = first.trim();
    const lastname = last.trim();

    const nameRegex = /^[A-Za-z]{2,}$/; 
    if (!firstname || !lastname) {
        Swal.fire({icon: 'warning', title: 'Name is required', text: 'Please enter your first and last name', confirmButtonText: 'OK'});
        return;
    }
    if (!nameRegex.test(firstname) || !nameRegex.test(lastname)) {
        Swal.fire({icon: 'warning', title: 'Invalid Name', text: "First name and last name must contain only letters and be at least 2 characters long", confirmButtonText: 'OK'});
        return;
    }

    const dto = {
        Firstname: firstname,
        Lastname: lastname
    };

    try {
        const response = await fetch(`${apiBaseUrl}/Users/full-name`, {
            method: "PUT", 
            headers: {
                "Content-Type": "application/json",
                "Authorization": `Bearer ${sessionStorage.getItem("accessToken")}`
            },
            body: JSON.stringify(dto)
        });

        const data = await response.json();
        if (data.isSuccess) {
            Swal.fire({icon: 'success', title: 'Success', text: 'Name updated successfully!', confirmButtonText: 'OK'});
        } else {
            Swal.fire({icon: 'error', title: 'Error', text: data.message || "Failed to update name", confirmButtonText: 'OK'});
        }
    } catch (err) {
        console.error(err);
        Swal.fire({icon: 'error', title: 'Error', text: "An error occurred while updating name", confirmButtonText: 'OK'});
    }
    Swal.fire("Success", `Name updated to ${first} ${last}`, "success");
  }

  modal.classList.add("hidden");
});


async function load() {
  try{
    const result = await fetch(`${apiBase}/Users/me`, {
        headers: {
            "Authorization": `Bearer ${sessionStorage.getItem("accessToken")}`
        }
    });
    const data = await result.json();
    if (!result.ok) throw new Error(data.message);
    console.log(data);
    const user = data.data;
    document.getElementById("preview-img").src = user.profilePicture ?? getAvatarUrl(user.fullName);
    document.getElementById("preview-name").textContent = user.fullName;
}catch(err){
    console.error(err);
}
}

function getAvatarUrl(name) {
  return `https://ui-avatars.com/api/?name=${encodeURIComponent(name)}&background=0D8ABC&color=fff&size=128&rounded=true`;
}

load();


