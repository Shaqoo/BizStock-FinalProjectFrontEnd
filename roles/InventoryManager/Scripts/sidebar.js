window.onload = () => {
  document.querySelector('#sidebar').innerHTML = `
    <div class="p-6 text-2xl font-bold border-b">BizStock</div>
    <nav class="flex-1 p-4 space-y-2">
      <a href="/roles/InventoryManager/Pages/dashboard.html" title="Home" class="block p-2 rounded hover:bg-gray-200 flex items-center space-x-2">
        <span>🏠</span><span>Home</span>
      </a>
      <a href="/roles/InventoryManager/Pages/products.html" title="Products" class="block p-2 rounded hover:bg-gray-200 flex items-center space-x-2">
        <span>🏷️</span><span>Products</span>
      </a>
      <a href="/roles/InventoryManager/Pages/warehouse.html" title="Warehouses" class="block p-2 rounded hover:bg-gray-200 flex items-center space-x-2">
        <span>🏢</span><span>Warehouses</span>
      </a>
      <a href="/roles/InventoryManager/Pages/stockmanagement.html" title="Stock Management" class="block p-2 rounded hover:bg-gray-200 flex items-center space-x-2">
        <span>🔄</span><span>Stock Management</span>
      </a>
      <a href="/roles/InventoryManager/Pages/po.html" title="Purchase Orders" class="block p-2 rounded hover:bg-gray-200 flex items-center space-x-2">
        <span>🧾</span><span>Purchase Orders</span>
      </a>
      <a href="/roles/InventoryManager/Pages/reports.html" title="Reports" class="block p-2 rounded hover:bg-gray-200 flex items-center space-x-2">
        <span>📊</span><span>Reports</span>
      </a>
      <a href="/roles/InventoryManager/Pages/notifications.html" title="Notifications" class="block p-2 rounded hover:bg-gray-200 flex items-center space-x-2">
        <span>🔔</span><span>Notifications</span>
        <span id="unread-sidebar-badge" class="ml-auto hidden bg-red-500 text-white text-xs px-2 py-0.5 rounded-full"></span>
      </a>
      <a href="/roles/InventoryManager/Pages/settings.html" title="Settings" class="block p-2 rounded hover:bg-gray-200 flex items-center space-x-2">
        <span>⚙️</span><span>Settings</span>
      </a>
      <a href="#" title="Logout" class="block p-2 rounded hover:bg-gray-200 flex items-center space-x-2 text-red-600 font-semibold">
        <span>🚪</span><span>Logout</span>
      </a>
    </nav>
  `;
  updateSidebarUnreadCount();
};


async function updateSidebarUnreadCount() {
    try {
        const res = await fetch(`${apiBase}/recipient/count-unread`, {
            headers: { "Authorization": `Bearer ${sessionStorage.getItem("accessToken")}` }
        });
        const data = await res.json();
        if (data.success) {
            const badge = document.getElementById("unread-sidebar-badge");
            if (data.data > 0) {
                badge.textContent = data.data;
                badge.classList.remove("hidden");
            } else {
                badge.classList.add("hidden");
            }
        }
    } catch (err) {
        console.error("Error fetching unread count", err);
    }
}

document.addEventListener("DOMContentLoaded", () => {
  const sidebar = document.getElementById("sidebar");
  const toggleBtn = document.getElementById("sidebarToggle");

  toggleBtn.addEventListener("click", () => {
    sidebar.classList.toggle("-translate-x-full");
  });
});


