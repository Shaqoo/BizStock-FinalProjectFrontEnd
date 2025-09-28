const sidebar = document.getElementById('sidebar');
    const overlay = document.getElementById('overlay');
    const mobileToggle = document.getElementById('mobileToggle');
    const collapseToggle = document.getElementById('collapseToggle');

    
    mobileToggle.addEventListener('click', () => {
      sidebar.classList.toggle('-translate-x-full');
      overlay.classList.toggle('active');
    });

    overlay.addEventListener('click', () => {
      sidebar.classList.add('-translate-x-full');
      overlay.classList.remove('active');
    });

 
    collapseToggle.addEventListener('click', () => {
      sidebar.classList.toggle('w-64');
      sidebar.classList.toggle('w-20');
      
       
      document.querySelectorAll('.link-text, .sidebar-profile h1, .sidebar-profile p').forEach(el => {
        el.classList.toggle('hidden');
      });
    });

const apiBase = "https://localhost:7124/api/v1";
async function loadSidebar() {

const sidebarHeader = document.getElementById("sidebar");
const profile = document.getElementById("profile");

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
    sidebarHeader.innerHTML = `
    <div class="p-6 border-b flex flex-col items-center sidebar-profile">
      <img src="${user.profilePicture ?? getAvatarUrl(user.fullName)}" class="w-20 h-20 rounded-full mb-2" alt="Profile">
      <h1 class="text-lg font-semibold">${user.fullName}</h1>
      <p class="text-sm text-gray-500">Supplier</p>
    </div>

    
    <nav class="flex-1 p-4">
      <ul class="space-y-3">
        <li><a href="/roles/Supplier/Pages/dashboard.html" class="flex items-center space-x-2 p-2 rounded hover:bg-green-100"><span>📊</span><span class="link-text">Dashboard</span></a></li>
        <li><a href="/roles/Supplier/Pages/notification.html" class="flex items-center space-x-2 p-2 rounded hover:bg-green-100"><span>🔔</span><span class="link-text">Notifications</span></a></li>
        <li><a href="/roles/Supplier/Pages/po.html" class="flex items-center space-x-2 p-2 rounded hover:bg-green-100"><span>🧾</span><span class="link-text">Purchase Orders</span></a></li>
        <li><a href="/roles/Supplier/Pages/supplier.html" class="flex items-center space-x-2 p-2 rounded hover:bg-green-100"><span>👤</span><span class="link-text">Profile</span></a></li>
        <li><a href="/roles/Supplier/Pages/settings.html" class="flex items-center space-x-2 p-2 rounded hover:bg-green-100"><span>⚙️</span><span class="link-text">Settings</span></a></li>
      </ul>
    </nav>`

    profile.innerHTML = ` <img src="${user.profilePicture ?? getAvatarUrl(user.fullName)}" alt="Profile" class="w-10 h-10 rounded-full">
          <span class="font-medium">${user.fullName}</span>`
}catch(err){
    console.error(err);
}
}

function getAvatarUrl(name) {
  return `https://ui-avatars.com/api/?name=${encodeURIComponent(name)}&background=0D8ABC&color=fff&size=128&rounded=true`;
}


async function loadUnreadNotifications() {
    const notifications = document.getElementById("notificationCount");
    try {
        const response = await fetch(`${apiBase}/Notifications/recipient/count-unread`, {
    headers: {
      "Authorization": `Bearer ${sessionStorage.getItem("accessToken")}`
    }
  });
    const data = await response.json();
    notifications.textContent = data.data;
    } catch (error) {
        console.error("Error fetching notification count:", error);
        notifications.textContent = 0;
    }
}


document.addEventListener("DOMContentLoaded", async () => {
    await loadSidebar();
    await loadUnreadNotifications();
})