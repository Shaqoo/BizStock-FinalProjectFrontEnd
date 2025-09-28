
document.addEventListener("DOMContentLoaded",async () =>{
document.querySelector('#sidebar').innerHTML = `<div class="p-4 text-xl font-bold text-center border-b border-blue-700">Admin Panel</div>
    <nav class="mt-6 space-y-2 px-4">
      <a id="dashboard-sidebar-link" href="/roles/Admin/Pages/dashboard.html" class="flex items-center p-2 rounded hover:bg-gray-800"><span class="material-icons">dashboard</span><span class="ml-3">Dashboard</span></a>
       <div>
      <button id="manageUsersToggle" class="flex items-center justify-between w-full p-2 rounded hover:bg-gray-800 focus:outline-none">
        <div class="flex items-center">
          <span class="material-icons">people</span>
          <span class="ml-3">Manage Users</span>
        </div>
        <span class="material-icons transition-transform" id="manageUsersArrow">expand_more</span>
      </button>

      <div id="manageUsersMenu" class="ml-8 mt-2 space-y-2 hidden">
        <a href="/roles/Admin/Pages/users.html" class="block p-2 rounded hover:bg-gray-800">All Users</a>
        <a href="/roles/Admin/Pages/manage-customers.html" class="block p-2 rounded hover:bg-gray-800">Customers</a>
        <a href="/roles/Admin/Pages/manage-managers.html" class="block p-2 rounded hover:bg-gray-800">Managers</a>
        <a href="/roles/Admin/Pages/manage-suppliers.html" class="block p-2 rounded hover:bg-gray-800">Suppliers</a>
        <a href="/roles/Admin/Pages/manage-delivery.html" class="block p-2 rounded hover:bg-gray-800">Delivery Agents</a>
        <a href="/roles/Admin/Pages/manage-cso.html" class="block p-2 rounded hover:bg-gray-800">Customer Service</a>
        <a href="/roles/Admin/Pages/manage-inventory.html" class="block p-2 rounded hover:bg-gray-800">Inventory Managers</a>
      </div>
    </div>
      <a id="product-sidebar-link" href="#" class="flex items-center p-2 rounded hover:bg-gray-800"><span class="material-icons">inventory_2</span><span class="ml-3">Inventory Management</span></a>
      <a id="sales-sidebar-link" href="#" class="flex items-center p-2 rounded hover:bg-gray-800"><span class="material-icons">shopping_cart</span><span class="ml-3">Orders</span></a>
      <a id="purchase-sidebar-link" href="/roles/Admin/Pages/po-management.html" class="flex items-center p-2 rounded hover:bg-gray-800"><span class="material-icons">assignment</span><span class="ml-3">Purchase Orders</span></a>
      <a id="reports-sidebar-link" href="/roles/Admin/Pages/reports.html" class="flex items-center p-2 rounded hover:bg-gray-800"><span class="material-icons">bar_chart</span><span class="ml-3">Reports</span></a>
      <a id="notifications-sidebar-link" href="/roles/Admin/Pages/notification.html" class="flex items-center p-2 rounded hover:bg-gray-800"><span class="material-icons">notifications</span><span class="ml-3">Notifications</span></a>
      <a id="finance-sidebar-link" href="#" class="flex items-center p-2 rounded hover:bg-gray-800"><span class="material-icons">account_balance</span><span class="ml-3">Finance</span></a>
      <a id="profile-sidebar-link" href="/roles/Admin/Pages/profile.html" class="flex items-center p-2 rounded hover:bg-gray-800"><span class="material-icons">person</span><span class="ml-3">Profile</span></a>
      <a id="settings-sidebar-link" href="/roles/Admin/Pages/settings.html" class="flex items-center p-2 rounded hover:bg-gray-800"><span class="material-icons">settings</span><span class="ml-3">Settings</span></a>  
      <a id="system-sidebar-link" href="#" class="flex items-center p-2 rounded hover:bg-gray-800"><span class="material-icons">admin_panel_settings</span><span class="ml-3">System & Admin Tools</span></a>
    </nav>`;
const header = document.querySelector('#header');
if(header){
header.innerHTML = `<button class="md:hidden text-gray-600" onclick="toggleSidebar()">
        <span class="material-icons">menu</span>
      </button>
      <h1 id="dashboardTitle" class="text-xl font-semibold">Dashboard</h1>
      <div class="flex items-center space-x-4">
               <span class="material-icons text-gray-600 cursor-pointer">notifications</span>
        <span id="greeting">Hello, Admin</span>
        <img id="profileImage" src="https://i.pravatar.cc/40" alt="Profile" class="rounded-full w-10 h-10">
      </div>`;

 await loadDetails();
}

  const toggleBtn = document.getElementById("manageUsersToggle");
  const menu = document.getElementById("manageUsersMenu");
  const arrow = document.getElementById("manageUsersArrow");

  toggleBtn.addEventListener("click", () => {
    menu.classList.toggle("hidden");
    arrow.classList.toggle("rotate-180");
  });
})

function toggleSidebar() {
      const sidebar = document.getElementById("sidebar");
      const overlay = document.getElementById("overlay");
      if (sidebar.classList.contains("-translate-x-full")) {
        sidebar.classList.remove("-translate-x-full");
        overlay.classList.remove("hidden");
      } else {
        sidebar.classList.add("-translate-x-full");
        overlay.classList.add("hidden");
      }
    }



function getGreetingMessage(name) {
    const hour = new Date().getHours();
    let greeting;

    if (hour < 12) {
      greeting = "🌞 Good Morning";
    } else if (hour < 18) {
      greeting = "🎉 Good Afternoon";
    } else {
      greeting = "👋 Good Evening";
    }

    return `${greeting}, ${name}`;
  }

  


async function loadDetails() {
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
    document.getElementById("greeting").textContent = getGreetingMessage(user.fullName);
    document.querySelector('#profileImage').src = user.profilePicture ?? getAvatarUrl(user.fullName);
    sessionStorage.setItem("pic", user.profilePicture ?? getAvatarUrl(user.fullName));
    
}catch(err){
    console.error(err);
}}


function getAvatarUrl(name) {
  return `https://ui-avatars.com/api/?name=${encodeURIComponent(name)}&background=0D8ABC&color=fff&size=128&rounded=true`;
}
