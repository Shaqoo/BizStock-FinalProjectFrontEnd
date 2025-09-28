const apiBaseUrl = "https://localhost:7124/api/v1";

document.addEventListener("DOMContentLoaded",async () =>{
    document.querySelector('#dashboardTitle').textContent = "Profile"
    //document.querySelector('#profilePreview').src = sessionStorage.getItem("pic");
})

async function loadDetails() {
 const profileContent = document.querySelector('#profile-content');
 const dashboardContent =  document.querySelector('#dashboard-content');

  try{
    const result = await fetch(`${apiBaseUrl}/Users/me`, {
        headers: {
            "Authorization": `Bearer ${sessionStorage.getItem("accessToken")}`
        }
    });
    const data = await result.json();
    if (!result.ok) throw new Error(data.message);
    console.log(data);
    const user = data.data;
    dashboardContent.innerHTML = ` <img src="${user.profilePicture ?? getAvatarUrl(user.fullName)}" alt="Profile Picture"
         class="w-24 h-24 rounded-full border-4 border-indigo-600 object-cover mr-6" />
    <div>
      <h2 class="text-2xl font-bold text-gray-800 flex items-center">
        ${user.fullName}
        <span class="ml-2 px-2 py-1 text-xs font-semibold bg-indigo-600 text-white rounded-lg">${user.role}</span>
      </h2>
      <p class="text-sm text-gray-500 mt-1">Last Login: ${new Date(user.lastLoggedIn).toLocaleDateString()}</p>
    </div>`;

    profileContent.innerHTML = `<h3 class="text-xl font-semibold text-indigo-600 mb-4">Personal Information</h3>
    <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
      <p><span class="font-semibold">Full Name:</span> ${user.fullName}</p>
      <p><span class="font-semibold">Email:</span> ${user.email}</p>
      <p><span class="font-semibold">Age:</span> ${user.age}</p>
      <p><span class="font-semibold">Phone:</span> ${user.phoneNumber}</p>
      <p><span class="font-semibold">Date of Birth:</span> ${new Date(user.dob).toLocaleDateString()}</p>
      <p><span class="font-semibold">Gender:</span> ${user.gender}</p>
      <p><span class="font-semibold">Email Verified:</span> ${user.isEmailVerified ? "✅" : "❌"}</p>
      <p><span class="font-semibold">Phone Verified:</span> ${user.isEmailVerified ? "✅" : "❌"}</p>
      <p><span class="font-semibold">Two Factor Enabled:</span> ${user.isTwoFactorEnabled ? "✅" : "❌"}</p>
      <p><span class="font-semibold">Status:</span> Active</p>
      <p><span class="font-semibold">Role:</span> ${user.role}</p>
      <p><span class="font-semibold">Last Login:</span> ${new Date(user.lastLoggedIn).toLocaleDateString()}</p>
    </div>`;
    }catch(err){
    console.error(err);
}
}

function getAvatarUrl(name) {
  return `https://ui-avatars.com/api/?name=${encodeURIComponent(name)}&background=0D8ABC&color=fff&size=128&rounded=true`;
}

document.addEventListener("DOMContentLoaded", async () => {
    await loadDetails();
    document.querySelector('#profile-sidebar-link').classList.add("bg-blue-800");
})

