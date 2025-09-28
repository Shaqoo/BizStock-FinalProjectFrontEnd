const apiBaseUrl = "https://localhost:7124/api/v1";


document.addEventListener("DOMContentLoaded",async () =>{
    document.querySelector('#dashboardTitle').textContent = "Profile Settings"
    document.querySelector('#profilePreview').src = sessionStorage.getItem("pic");
    document.querySelector('#settings-sidebar-link').classList.add("bg-blue-800");
})


const profilePicInput = document.getElementById("profilePicInput");
const changePicBtn = document.getElementById("changePicBtn");
const profilePreview = document.getElementById("profilePreview");

changePicBtn.addEventListener("click", () => profilePicInput.click());

profilePicInput.addEventListener("change", async () => {
    const file = profilePicInput.files[0];
    if (!file) return;

    if (file.size > 3 * 1024 * 1024) { 
        Swal.fire("Error", "Image must be 3MB or smaller", "error");
        profilePicInput.value = "";
        return;
    }

   
    const reader = new FileReader();
    reader.onload = e => profilePreview.src = e.target.result;
    reader.readAsDataURL(file);

    const formData = new FormData();
    formData.append("File", file);

    try {
        const response = await fetch(`${apiBaseUrl}/Users/profile-picture`, {
            method: "PUT",
            headers: { "Authorization": `Bearer ${sessionStorage.getItem("accessToken")}` },
            body: formData
        });
        const data = await response.json();
        if (!response.ok) throw new Error(data.message || "Failed to update profile picture");
        Swal.fire("Success", "Profile picture updated", "success");
    } catch (err) {
        Swal.fire("Error", err.message, "error");
    }
});

document.getElementById("updateNameBtn").addEventListener("click", async () => {
    const firstName = document.getElementById("firstName").value.trim();
    const lastName = document.getElementById("lastName").value.trim();

    if (!firstName || !lastName) {
        Swal.fire("Error", "Both first and last name are required", "error");
        return;
    }

    const dto = { Firstname: firstName, Lastname: lastName };

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
        if (!response.ok) throw new Error(data.message || "Failed to update name");
        Swal.fire("Success", "Full name updated", "success");
    } catch (err) {
        Swal.fire("Error", err.message, "error");
    }
});
