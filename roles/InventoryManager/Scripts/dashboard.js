const apiBaseUrl = "https://localhost:7124/api/v1";
let apiBase = "https://localhost:7124/api/v1/Notifications";

async function loadProfile() {
  const dashboardContainer = document.querySelector('#dashboardHeader');

  if (!dashboardContainer) {
    console.error("Dashboard container not found.");
    return;
  }

  try {
    const response = await fetch(`${apiBaseUrl}/Users/me`, {
      method: "GET",
      headers: {
        "Authorization": `Bearer ${sessionStorage.getItem("accessToken")}`,
        "Content-Type": "application/json"
      }
    });

    if (!response.ok) {
      throw new Error(`Failed to fetch profile: ${response.status}`);
    }

    const result = await response.json();
    const user = result.data;

    dashboardContainer.innerHTML = `
      <h1 class="text-2xl font-bold">Dashboard</h1>
      <div class="flex items-center space-x-4 mt-4">
        <span class="text-gray-600">Hello, ${user.fullName}!</span>
        <img src="${user.profilePicture ?? getAvatarUrl(user.fullName)}" 
             loading="lazy" 
             class="w-10 h-10 rounded-full border" 
             alt="Profile Picture">
      </div>
    `;
  } catch (err) {
    dashboardContainer.innerHTML = `
      <p class="text-red-500">⚠️ Failed to load profile. Please try again.</p>
    `;
    console.error("Failed to load profile", err);
  }
}

function getAvatarUrl(name) {
  return `https://ui-avatars.com/api/?name=${encodeURIComponent(name)}&background=0D8ABC&color=fff&size=128&rounded=true`;
}

document.addEventListener("DOMContentLoaded", async () => {
  await loadProfile();
});

