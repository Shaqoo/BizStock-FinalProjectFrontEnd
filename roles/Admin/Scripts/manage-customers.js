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
    const apiBaseUrl = "https://localhost:7124/api/v1";
    let page = 1;
    const pageSize = 10;
    let query = "";

    document.addEventListener("DOMContentLoaded", () => {
      loadCustomerStats();
      searchCustomers();
    });

    async function loadCustomerStats() {
      try {
        const res = await fetch(`${apiBaseUrl}/Customers/stats`, {
          headers: { "Authorization": `Bearer ${sessionStorage.getItem("accessToken")}` }
        });
        const data = await res.json();
        if (data.isSuccess) {
          document.getElementById("totalCustomers").textContent = data.data.totalCustomers;
          document.getElementById("activeCustomers").textContent = data.data.verifiedCustomers;
          document.getElementById("inactiveCustomers").textContent = data.data.totalCustomers - data.data.verifiedCustomers;
        }
      } catch (err) {
        console.error(err);
      }
    }

    async function searchCustomers() {
        if (query.trim() === "") {
        loadCustomers();
        return;
      }
      try {
        const res = await fetch(`${apiBaseUrl}/Users/search-customers?query=${encodeURIComponent(query)}&page=${page}&pageSize=${pageSize}`, {
          headers: { "Authorization": `Bearer ${sessionStorage.getItem("accessToken")}` }
        });
        if (!res.ok) throw new Error("Failed to fetch customers");
        const data = await res.json();
        const array = data.items;
        console.log(array);
        renderCustomers(array);
        renderPagination(data.totalPages, data.totalCount);
      } catch (err) {
        console.error(err);
      }
    }

     async function loadCustomers() {
      try {
        const res = await fetch(`${apiBaseUrl}/Users/by-role/${encodeURIComponent("Customer")}?page=${page}&pageSize=${pageSize}`, {
          headers: { "Authorization": `Bearer ${sessionStorage.getItem("accessToken")}` }
        });
        if (!res.ok) throw new Error("Failed to fetch customers");
        const data = await res.json();
        const array = data.data.items;
        console.log(array);
        renderCustomers(array);
        renderPagination(data.data.totalPages, data.data.totalCount);
      } catch (err) {
        console.error(err);
      }
    }


    function renderCustomers(customers) {
      const list = document.getElementById("customersList");
      list.innerHTML = "";
      if (!customers || customers.length === 0) {
        list.innerHTML = `<tr><td colspan="7" class="text-center p-4 text-gray-500">No customers found</td></tr>`;
        return;
      }
      customers.forEach(c => {
        const tr = document.createElement("tr");
        tr.className = "hover:bg-blue-50";
        tr.innerHTML = `
          <td class="p-3 border-b">
            <img src="${c.profilepicture ?? getAvatarUrl(c.fullName)}" alt="${c.fullName}" class="w-10 h-10 rounded-full">
          </td>
          <td class="p-3 border-b font-semibold">${c.fullName}</td>
          <td class="p-3 border-b">${c.email}</td>
          <td class="p-3 border-b">${c.phoneNumber ?? "-"}</td>
          <td class="p-3 border-b">${c.customerType ?? "-"}</td>
          <td class="p-3 border-b">
            ${c.isActive 
              ? `<span class="text-green-600 font-medium">Active</span>` 
              : `<span class="text-red-500 font-medium">Inactive</span>`}
          </td>
          <td class="p-3 border-b">
            <button class="bg-blue-600 text-white px-3 py-1 rounded hover:bg-blue-700 text-sm" onclick="viewCustomer('${c.id}')">View</button>
          </td>
        `;
        list.appendChild(tr);
      });
    }

    function renderPagination(totalPages, totalCount) {
      const paginationInfo = document.getElementById("paginationInfo");
      paginationInfo.textContent = `Showing ${(page - 1) * pageSize + 1}–${Math.min(page * pageSize, totalCount)} of ${totalCount}`;

      const pageNumbers = document.getElementById("pageNumbers");
      pageNumbers.innerHTML = "";
      for (let i = 1; i <= totalPages; i++) {
        const btn = document.createElement("button");
        btn.textContent = i;
        btn.className = `px-3 py-1 border rounded ${i === page ? "bg-blue-600 text-white" : "hover:bg-blue-100"}`;
        btn.addEventListener("click", () => {
          page = i;
          searchCustomers();
        });
        pageNumbers.appendChild(btn);
      }
    }

    document.getElementById("searchBtn").addEventListener("click", () => {
      query = document.getElementById("searchInput").value;
      page = 1;
      searchCustomers();
    });

    let debounceTimer;

    document.getElementById("searchInput").addEventListener("input", (e) => {
        clearTimeout(debounceTimer);
        debounceTimer = setTimeout(() => {
            query = e.target.value;
            searchUsers(query); 
        }, 500);
        });



    function getAvatarUrl(name) {
      return `https://ui-avatars.com/api/?name=${encodeURIComponent(name)}&background=0D8ABC&color=fff&size=128&rounded=true`;
    }

    function viewCustomer(id) {
      window.location.href = `viewuser.html?id=${id}`;
    }
