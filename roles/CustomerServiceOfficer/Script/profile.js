 let apiBaseUrl = "https://localhost:7124/api/v1";


  document.addEventListener("DOMContentLoaded", async () => {
    await loadProfile();
  });

async function loadProfile() {
    try {
      const response = await fetch("https://localhost:7124/api/v1/users/me", {
        headers: {
          "Authorization": `Bearer ${sessionStorage.getItem("accessToken")}`
        }
      });

      const result = await response.json();
      const user = result.data;

      document.getElementById("profilePic").src = user.profilepicture ?? getAvatarUrl(user.fullName);
      document.getElementById("profileName").textContent = user.fullName;
      document.getElementById("profileEmail").textContent = user.email;
      document.getElementById("profilePhone").textContent = user.phoneNumber;

      document.getElementById("isEmailVerified").textContent = user.isEmailVerified ? "✅ Verified" : "❌ Not Verified";
      document.getElementById("isPhoneVerified").textContent = user.isPhoneVerified ? "✅ Verified" : "❌ Not Verified";
      document.getElementById("isTwoFactorAuthEnabled").textContent = user.isTwoFactorEnabled ? "🔒 Enabled" : "🔒 Disabled";
      document.getElementById("role").textContent = user.role;

      document.getElementById("gender").textContent = user.gender || "-";
      document.getElementById("dob").textContent = user.dob ? new Date(user.dob).toLocaleDateString() : "-";
      document.getElementById("lastLogin").textContent = user.lastLoggedIn ? new Date(user.lastLoggedIn).toLocaleString() : "-";

    } catch (err) {
      console.error("Failed to load profile", err);
    }
  }

function getAvatarUrl(name) {
  return `https://ui-avatars.com/api/?name=${encodeURIComponent(name)}&background=0D8ABC&color=fff&size=128&rounded=true`;
}
