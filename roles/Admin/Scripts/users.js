const apiBaseUrl = "https://localhost:7124/api/v1"; 
let page = 1;
const pageSize = 10;
let query = "";

document.addEventListener("DOMContentLoaded", async () => {
    document.querySelector('#user-sidebar-link').classList.add("bg-blue-800");
})

function renderPagination(count) {
  const pageCount = count;
  const pageNumbers = document.getElementById("pageNumbers");
  pageNumbers.innerHTML = "";

  for (let i = 1; i <= pageCount; i++) {
    const btn = document.createElement("button");
    btn.textContent = i;
    btn.className = `px-3 py-1 border rounded ${i === page ? 'bg-blue-500 text-white' : ''}`;
    btn.addEventListener("click", () => {
      page = i;
      searchUsers(query);
    });
    pageNumbers.appendChild(btn);
  }

  document.getElementById("prevPage").disabled = page === 1;
  document.getElementById("nextPage").disabled = page === pageCount;

  document.getElementById("prevPage").onclick = () => {
    if (page > 1) {
      page--;
      searchUsers(query);
    }
  };

  document.getElementById("nextPage").onclick = () => {
    if (page < pageCount) {
      page++;
      searchUsers(query);
    }
  };
}

let debounceTimer;

async function searchUsers(query = "") {
  if(!query || query.trim() === "") return;
  try {
    const response = await fetch(`${apiBaseUrl}/Users/search?query=${encodeURIComponent(query)}&page=${page}&pageSize=${pageSize}`, {
      headers: { "Authorization": `Bearer ${sessionStorage.getItem("accessToken")}` }
    });

    if (!response.ok) throw new Error("Failed to fetch users");

    const data = await response.json();
    const users = data.data ?? data;
    console.log(users);

    renderUsersTable(users.items);
     const resultsInfo = document.getElementById("resultsInfo");
   resultsInfo.textContent = `Showing ${(page * pageSize) - pageSize + 1}–${Math.min(page * pageSize, users.totalCount)} of ${users.totalCount} results`;

    renderPagination(users.totalPages);
  } catch (err) {
    console.error(err);
    Swal.fire({ icon: "error", title: "Error", text: "Could not fetch users" });
  }
}

function renderUsersTable(users) {
  const list = document.getElementById("usersList");
  list.innerHTML = "";

  if (!users || users.length === 0) {
    list.innerHTML = `<tr><td colspan="7" class="text-center p-4 text-gray-500">No users found</td></tr>`;
    return;
  }

  users.forEach(c => {
    const tr = document.createElement("tr");
    tr.className = "hover:bg-blue-50";

    tr.innerHTML = `
      <td class="p-3 border-b">
        <img src="${c.profilepicture ?? getAvatarUrl(c.fullName)}" alt="${c.fullName}" class="w-10 h-10 rounded-full">
      </td>
      <td class="p-3 border-b font-semibold">${c.fullName}</td>
      <td class="p-3 border-b">${c.email}</td>
      <td class="p-3 border-b">${c.role ?? "-"}</td>
      <td class="p-3 border-b">${c.lastLoggedIn ? new Date(c.lastLoggedIn).toLocaleString() : "-"}</td>
      <td class="p-3 border-b">
        ${c.isActive ? `<span class="text-green-600 rounded-full font-medium">Active</span>` : `<span class="text-red-500 rounded-full font-medium">InActive</span>`}
      </td>
      <td class="p-3 border-b">
        <button class="px-3 py-1 bg-blue-600 text-white rounded hover:bg-blue-700 text-sm"
                onclick="window.location.href='/roles/Admin/Pages/viewuser.html?id=${c.id}'">
          View Details
        </button>
      </td>
    `;

    list.appendChild(tr);
  });
}


document.getElementById("searchInput").addEventListener("input", (e) => {
  clearTimeout(debounceTimer);
  debounceTimer = setTimeout(() => {
    query = e.target.value;
    searchUsers(query); 
  }, 500);
});

document.getElementById("searchUserInput").addEventListener("input", (e) => {
  clearTimeout(debounceTimer);
  debounceTimer = setTimeout(() => {
    query = e.target.value;
    searchUsers(query); 
  }, 500);
});


document.getElementById("searchBtn").addEventListener("click", () => {
  query = document.getElementById("searchInput").value;
  searchUsers(query);
});


function getAvatarUrl(name) {
  return `https://ui-avatars.com/api/?name=${encodeURIComponent(name)}&background=0D8ABC&color=fff&size=128&rounded=true`;
}

async function LoadStats() {
  try {
    const response = await fetch(`${apiBaseUrl}/Users/stats/total`, {
      headers: {
        "Authorization": `Bearer ${sessionStorage.getItem("accessToken")}`
      }
    });

    if (!response.ok) throw new Error("Failed to fetch stats");

    const result = await response.json();
    const stats = result.data;

    document.getElementById("admins").textContent = stats.totalAdmins ?? 0;
    document.getElementById("customers").textContent = stats.totalCustomers ?? 0;
    document.getElementById("managers").textContent = stats.totalManagers ?? 0;
    document.getElementById("suppliers").textContent = stats.totalSuppliers ?? 0;
    document.getElementById("deliveryAgents").textContent = stats.totalDeliveryAgents ?? 0;
    document.getElementById("customerService").textContent = stats.totalCustomerServiceAgents ?? 0;
    document.getElementById("inventoryManagers").textContent = stats.totalInventoryManagers ?? 0;
    document.getElementById("totalUsers").textContent = stats.totalUsers ?? 0;

  } catch (err) {
    console.error("Error loading stats:", err);
    Swal.fire({ icon: "error", title: "Error", text: "Could not load user stats" });
  }
}

document.addEventListener("DOMContentLoaded", LoadStats);