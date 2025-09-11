const apiBaseUrl = "https://localhost:7124/api/v1"; 

async function loadCustomerStats() {
  document.getElementById("totalCustomers").textContent = "Loading...";
  document.getElementById("verifiedCustomers").textContent = "Loading...";
  document.getElementById("withOrders").textContent = "Loading...";
  document.getElementById("openComplaints").textContent = "Loading...";
  try {
    const response = await fetch(`${apiBaseUrl}/customers/stats`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${sessionStorage.getItem("accessToken")}`
      }
    });

    if (!response.ok) {
      throw new Error("Failed to fetch customer stats");
    }

    const data = await response.json();
    const stats = data.data; 
    console.log(stats);


    document.getElementById("totalCustomers").textContent = stats.totalCustomers;
    document.getElementById("verifiedCustomers").textContent = stats.verifiedCustomers;
    document.getElementById("withOrders").textContent = stats.totalOrders;
    document.getElementById("openComplaints").textContent = stats.openComplaints;

  } catch (err) {
    console.error(err);
    Swal.fire({
      icon: "error",
      title: "Error",
      text: "Unable to load customer stats. Please try again."
    });

    document.getElementById("totalCustomers").textContent = "N/A";
    document.getElementById("verifiedCustomers").textContent = "N/A";
    document.getElementById("withOrders").textContent = "N/A";
    document.getElementById("openComplaints").textContent = "N/A";
  }
}

document.addEventListener("DOMContentLoaded",() => {
  searchCustomers("", 1, 10);
  loadCustomerStats()
});
 
let debounceTimer;

async function searchCustomers(query = "", page = 1, pageSize = 10) {
  if(!query || query.trim() === "") return;
  try {
    const response = await fetch(`${apiBaseUrl}/Users/search-customers?query=${encodeURIComponent(query)}&page=${page}&pageSize=${pageSize}`, {
      headers: { "Authorization": `Bearer ${sessionStorage.getItem("accessToken")}` }
    });

    if (!response.ok) throw new Error("Failed to fetch customers");

    const data = await response.json();
    const customers = data.data ?? data;
    console.log(customers);

    renderCustomerTable(customers.items);
  } catch (err) {
    console.error(err);
    Swal.fire({ icon: "error", title: "Error", text: "Could not fetch customers" });
  }
}

function renderCustomerTable(customers) {
  const list = document.getElementById("customerList");
  list.innerHTML = "";

  if (!customers || customers.length === 0) {
    list.innerHTML = `<tr><td colspan="7" class="text-center p-4 text-gray-500">No customers found</td></tr>`;
    return;
  }

  customers.forEach(c => {
    const tr = document.createElement("tr");
    tr.className = "hover:bg-gray-50";

    tr.innerHTML = `
      <td class="p-3 border-b">
        <img src="${c.profilepicture ?? getAvatarUrl(c.fullName)}" alt="${c.fullName}" class="w-10 h-10 rounded-full">
      </td>
      <td class="p-3 border-b font-semibold">${c.fullName}</td>
      <td class="p-3 border-b">${c.email}</td>
      <td class="p-3 border-b">${c.phoneNumber ?? "-"}</td>
      <td class="p-3 border-b">${c.lastLoggedIn ? new Date(c.lastLoggedIn).toLocaleString() : "-"}</td>
      <td class="p-3 border-b">
        ${c.isEmailVerified ? `<span class="text-green-600 font-medium">Verified</span>` : `<span class="text-red-500 font-medium">Unverified</span>`}
      </td>
      <td class="p-3 border-b">
        <button class="px-3 py-1 bg-blue-600 text-white rounded hover:bg-blue-700 text-sm"
                onclick="loadCustomerDetails('${c.id}')">
          View Details
        </button>
      </td>
    `;

    list.appendChild(tr);
  });
}

async function loadCustomerDetails(customerId) {
  try {
    const response = await fetch(`${apiBaseUrl}/Users/${customerId}`, {
      headers: { "Authorization": `Bearer ${sessionStorage.getItem("accessToken")}` }
    });

    if (!response.ok) throw new Error("Failed to fetch customer details");

    const data = await response.json();
    const c = data.data ?? data;

    document.querySelector(".bg-white.shadow.rounded-xl").classList.add("hidden");
    document.getElementById("customerDetails").classList.remove("hidden");

    document.getElementById("detailPic").src = c.profilepicture || getAvatarUrl(c.fullName);
    document.getElementById("detailName").textContent = c.fullName;
    document.getElementById("detailEmail").textContent = c.email;
    document.getElementById("detailPhone").textContent = c.phoneNumber ?? "-";
    document.getElementById("detailEmailVerified").textContent = c.isEmailVerified ? "✅" : "❌";
    document.getElementById("detailPhoneVerified").textContent = c.isPhoneVerified ? "✅" : "❌";
    document.getElementById("detailGender").textContent = c.gender ?? "-";
    document.getElementById("detailDob").textContent = c.dob ? new Date(c.dob).toLocaleDateString() : "-";
    document.getElementById("detailLastLogin").textContent = c.lastLoggedIn ? new Date(c.lastLoggedIn).toLocaleString() : "-";
    document.getElementById("detailStatus").textContent = c.isActive ? "Active" : "Inactive";
  } catch (err) {
    console.error(err);
    Swal.fire({ icon: "error", title: "Error", text: "Could not load customer details" });
  }
}

function closeDetails() {
  document.querySelector(".bg-white.shadow.rounded-xl").classList.remove("hidden");
  document.getElementById("customerDetails").classList.add("hidden");
}

document.getElementById("searchInput").addEventListener("input", (e) => {
  clearTimeout(debounceTimer);
  debounceTimer = setTimeout(() => {
    searchCustomers(e.target.value, 1, 10);
  }, 500);
});

document.getElementById("searchBtn").addEventListener("click", () => {
  const query = document.getElementById("searchInput").value;
  searchCustomers(query, 1, 10);
});

function getAvatarUrl(name) {
  return `https://ui-avatars.com/api/?name=${encodeURIComponent(name)}&background=0D8ABC&color=fff&size=128&rounded=true`;
}

