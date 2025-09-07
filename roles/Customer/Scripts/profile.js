const tabs = document.querySelectorAll(".tab-btn");
    const contents = document.querySelectorAll(".tab-content");

    tabs.forEach(tab => {
      tab.addEventListener("click", () => {
        tabs.forEach(t => t.classList.remove("text-blue-600", "border-blue-600", "active"));
        tab.classList.add("text-blue-600", "border-blue-600", "active");

        contents.forEach(c => c.classList.add("hidden"));
        document.getElementById(tab.dataset.tab).classList.remove("hidden");
      });
    });


document.addEventListener("DOMContentLoaded", async () => {
  await renderProfile();
});

let apiBaseUrl = "https://localhost:7124/api/v1";


async function renderProfile(){
    const customer = await currentCustomer();
    console.log("Customer:"+ customer);
    const user = await currentUser();
    console.log(user);

    document.querySelector("#profile-container").innerHTML = `
      <img src="${user.profilepicture ?? `https://ui-avatars.com/api/?name=${encodeURIComponent(user.fullName)}&size=150&background=0D8ABC&color=fff&rounded=true`}" 
     alt="Profile Picture" 
     class="w-24 h-24 rounded-full shadow-md border-2 border-gray-200">

      <div>
        <h1 class="text-2xl font-bold">${user.fullName}</h1>
        <p class="text-gray-600">${user.email}</p>
      </div>
    `;
    document.querySelector("#userName").textContent = user.fullName;
    document.querySelector("#user-profile-pic").src = user.profilepicture

    document.querySelector("#contact-info").innerHTML = `
        <li><strong>Username:</strong> ${user.fullName}</li>
        <li><strong>Email:</strong> ${user.email}</li>
        <li><strong>Phone:</strong> ${user.phoneNumber}</li>
        <li><strong>Date of Birth:</strong> ${new Date(user.dob).toLocaleDateString()}</li>
        <li><strong>Address:</strong>${customer.address === "" || null? "N/A" : customer.address}</li>
        <li><strong>Age:</strong> ${user.age}</li>
        <li><strong>Gender:</strong> ${user.gender}</li>
    `;
    
    document.querySelector("#account-info").innerHTML = `
        <li><strong>Role:</strong> ${user.role}</li>
        <li><strong>Last Logged In:</strong> ${new Date(user.lastLoggedIn).toLocaleDateString()}</li>
        <li><strong>Email Verified:</strong> ${user.isEmailVerified ? "✅" : "❌"}</li>
        <li><strong>Phone Verified:</strong> ${user.isEmailVerified ? "✅" : "❌"}</li>
        <li><strong>Two-Factor Enabled:</strong> ${user.isTwoFactorEnabled ? "🔒 Enabled" : "🔒 Disabled"}</li>
        `;
    
    document.querySelector("#business-info").innerHTML = `
        <li><strong>Customer Type:</strong> ${customer.customerType}</li>
        <li><strong>Business Name:</strong> ${customer.businessName ?? "N/A"}</li>
        <li><strong>Tax ID:</strong> ${customer.taxId ?? "N/A"}</li>
        <li><strong>State:</strong> ${customer.state?? "N/A"}</li>
    `
};


let currentCustomer = async () => {
  try {
    const request = await fetch(`${apiBaseUrl}/Customers/current`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${sessionStorage.getItem("accessToken")}`
    }});
    const response = await request.json();
    console.log(response);
    if(response.isSuccess)
      return response.data;
    else
      return null;
  } catch (error) {
    console.log(error);
    return null;
  }
}



  //const toggleBtn = document.getElementById("edit-profile");
  const editContainer = document.getElementById("edit-container");

//   toggleBtn.addEventListener("click", (e) => {
//     e.preventDefault();
//     editContainer.classList.toggle("hidden");

//     if (editContainer.classList.contains("hidden")) {
//       toggleBtn.textContent = "Edit Profile";
//       toggleBtn.classList.remove("bg-red-600", "hover:bg-red-700");
//       toggleBtn.classList.add("bg-blue-600", "hover:bg-blue-700");
//     } else {
//       toggleBtn.textContent = "Close Edit Profile";
//       toggleBtn.classList.remove("bg-blue-600", "hover:bg-blue-700");
//       toggleBtn.classList.add("bg-red-600", "hover:bg-red-700");
//     }
//   });


  function openModal(id) {
    document.getElementById('overlay').classList.remove('hidden');
    document.getElementById(id).classList.remove('hidden');
  }

  function closeModal(id) {
    document.getElementById('overlay').classList.add('hidden');
    document.getElementById(id).classList.add('hidden');
  }



  document.querySelector("#update-nameBtn").addEventListener("click", async () => {
    const firstname = document.querySelector("#firstName").value.trim();
    const lastname = document.querySelector("#lastName").value.trim();

 
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
            document.querySelector(".userName").textContent = `${firstname} ${lastname}`;
        } else {
            Swal.fire({icon: 'error', title: 'Error', text: data.message || "Failed to update name", confirmButtonText: 'OK'});
        }
    } catch (err) {
        console.error(err);
        Swal.fire({icon: 'error', title: 'Error', text: "An error occurred while updating name", confirmButtonText: 'OK'});
    }
});

const fileInput = document.querySelector("#profilePicInput");
const previewImg = document.querySelector("#profilePreview");
const updateBtn = document.querySelector("#update-picBtn");

fileInput.addEventListener("change", () => {
    const file = fileInput.files[0];
    if (!file) return;

    if (!file.type.startsWith("image/")) {
        Swal.fire("Error", "Only image files are allowed", "error");
        fileInput.value = "";
        previewImg.classList.add("hidden");
        return;
    }

    
    const maxSize = 4 * 1024 * 1024; 
    if (file.size > maxSize) {
        Swal.fire("Error", "File size must be 4MB or less", "error");
        fileInput.value = "";
        previewImg.classList.add("hidden");
        return;
    }

    previewImg.src = URL.createObjectURL(file);
    previewImg.classList.remove("hidden");
});


updateBtn.addEventListener("click", async () => {
    const file = fileInput.files[0];
    if (!file) {
        Swal.fire("Info", "Please select a file to upload", "info");
        return;
    }

    const formData = new FormData();
    formData.append("File", file);

    try {
        const response = await fetch(`${apiBaseUrl}/Users/profile-picture`, {
            method: "PUT",
            headers: {
                "Authorization": `Bearer ${sessionStorage.getItem("accessToken")}`
            },
            body: formData
        });

        const data = await response.json();

        if (data.isSuccess) {
            Swal.fire("Success", "Profile picture updated!", "success");
            fileInput.value = "";
            previewImg.classList.add("hidden");
        } else {
            Swal.fire("Error", data.message || "Failed to upload picture", "error");
        }
    } catch (err) {
        console.error(err);
        Swal.fire("Error", "An error occurred while uploading", "error");
    }
});
