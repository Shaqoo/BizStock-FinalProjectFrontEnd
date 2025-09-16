  const API_BASE = "https://localhost:7124/api/v1/Warehouses";
    const table = document.getElementById("warehouseTable");
    const modal = document.getElementById("warehouseModal");
    const openCreateBtn = document.getElementById("openCreateForm");
    const closeModalBtn = document.getElementById("closeModal");
    const form = document.getElementById("warehouseForm");
    const modalTitle = document.getElementById("modalTitle");
    const spinner = document.getElementById("loadingSpinner");
    const emptyState = document.getElementById("emptyState");

     
    let pageNumber = 1;
    let pageSize = 10;
    let totalPages = 1;
    let currentKeyword = "";

     
    function showLoading() {
      spinner.classList.remove("hidden");
      emptyState.classList.add("hidden");
      table.innerHTML = "";
    }

     
    function hideLoading() {
      spinner.classList.add("hidden");
    }

    
    openCreateBtn.onclick = () => {
      form.reset();
      document.getElementById("warehouseId").value = "";
      modalTitle.textContent = "Add Warehouse";
      modal.classList.remove("hidden");
      modal.classList.add("flex");
    };

     
    closeModalBtn.onclick = () => {
      modal.classList.add("hidden");
      modal.classList.remove("flex");
    };

    
    async function loadWarehouses() {
      showLoading();
      const url = currentKeyword
        ? `${API_BASE}/search?keyword=${encodeURIComponent(currentKeyword)}&Page=${pageNumber}&PageSize=${pageSize}`
        : `${API_BASE}?Page=${pageNumber}&PageSize=${pageSize}`;

      const res = await fetch(url,{
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${sessionStorage.getItem("accessToken")}`
        }
      });
      const data = await res.json();
      hideLoading();

      if (!data.data.items || data.data.items.length === 0) {
        emptyState.classList.remove("hidden");
        document.getElementById("pageInfo").textContent = "";
        return;
      }

      emptyState.classList.add("hidden");
      renderTable(data.data.items);
      updatePagination(data.data);
    }

     
    function renderTable(warehouses) {
      table.innerHTML = "";
      warehouses.forEach(w => {
        const row = document.createElement("tr");
        row.innerHTML = `
          <td class="px-6 py-3">${w.name}</td>
          <td class="px-6 py-3">${w.location}</td>
          <td class="px-6 py-3">${w.isActive ? "✅" : "❌"}</td>
          <td class="px-6 py-3">${w.itemCount}</td>
          <td class="px-6 py-3 space-x-2">
            <button onclick="editWarehouse('${w.id}', '${w.name}', '${w.location}')"
              class="bg-yellow-500 hover:bg-yellow-600 text-white px-3 py-1 rounded">
              ✏️ Edit
            </button>
            <button onclick="toggleWarehouse('${w.id}', ${w.isActive})"
              class="bg-${w.isActive ? "red" : "green"}-600 hover:bg-${w.isActive ? "red" : "green"}-700 text-white px-3 py-1 rounded">
              ${w.isActive ? "Deactivate" : "Activate"}
            </button>
          </td>
        `;
        table.appendChild(row);
      });
    }

    
    function updatePagination(data) {
      totalPages = data.totalPages || 1;
      document.getElementById("pageInfo").textContent =
        `Page ${data.pageNumber || pageNumber} of ${totalPages}`;
      document.getElementById("prevPage").disabled = pageNumber <= 1;
      document.getElementById("nextPage").disabled = pageNumber >= totalPages;
    }

    
    form.onsubmit = async (e) => {
      e.preventDefault();
      const id = document.getElementById("warehouseId").value;
      const name = document.getElementById("warehouseName").value;
      const location = document.getElementById("warehouseLocation").value;

      if (!name || !location) {
        Swal.fire({
        icon: "warning",
        title: "Missing Fields",
        text: "Name and Location are required."
        });
        return;
    }

    if (name.length < 3 || location.length < 3) {
        Swal.fire({
        icon: "warning",
        title: "Invalid Input",
        text: "Name and Location must be at least 3 characters long."
        });
        return;
    }

      const payload = { name, location };
      const url = id ? `${API_BASE}/${id}` : API_BASE;
      const method = id ? "PUT" : "POST";

       try {
        const response = await fetch(url, {
        method,
        headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${sessionStorage.getItem("accessToken")}`
        },
        body: JSON.stringify(payload)
        });

        const result = await response.json();

        if (response.ok) {
        Swal.fire({
            icon: "success",
            title: "Success",
            text: result.message || "Operation completed successfully!",
            timer: 2000,
            showConfirmButton: false
        });
         modal.classList.add("hidden");
         loadWarehouses();
        return result;
        } else {
        Swal.fire({
            icon: "error",
            title: "Error",
            text: result.message || "Something went wrong. Please try again."
        });
        return null;
        }
    } catch (err) {
        Swal.fire({
        icon: "error",
        title: "Request Failed",
        text: err.message || "Network error occurred"
        });
         modal.classList.add("hidden");
         loadWarehouses();
        return null;
    }
    };

    
    window.editWarehouse = (id, name, location) => {
      document.getElementById("warehouseId").value = id;
      document.getElementById("warehouseName").value = name;
      document.getElementById("warehouseLocation").value = location;
      modalTitle.textContent = "Edit Warehouse";
      modal.classList.remove("hidden");
      modal.classList.add("flex");
    };

   
    window.toggleWarehouse = async (id, isActive) => {
      const method = isActive ? "DELETE" : "PATCH";
    try {
        let res = await fetch(`${API_BASE}/${id}`, {
        method,
        headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${sessionStorage.getItem("accessToken")}`
        }
        });

        if (res.ok) {
        const msg = await res.json();
        Swal.fire({
            icon: "success",
            title: "Success",
            text: msg.message || "Operation completed successfully!"
        });
        } else {
        const errMsg = await res.json();
        Swal.fire({
            icon: "error",
            title: "Error",
            text: errMsg.message || "Something went wrong!"
        });
        }
    } catch (error) {
        Swal.fire({
        icon: "error",
        title: "Request Failed",
        text: error.message || "Unable to reach the server."
        });
    }
        loadWarehouses();
    };

   
    document.getElementById("searchBtn").onclick = () => {
      currentKeyword = document.getElementById("searchInput").value;
      pageNumber = 1;  
      loadWarehouses();
    };

   
    document.getElementById("prevPage").onclick = () => {
      if (pageNumber > 1) {
        pageNumber--;
        loadWarehouses();
      }
    };

    document.getElementById("nextPage").onclick = () => {
      if (pageNumber < totalPages) {
        pageNumber++;
        loadWarehouses();
      }
    };

    
    document.getElementById("pageSize").onchange = (e) => {
      pageSize = parseInt(e.target.value);
      pageNumber = 1;
      loadWarehouses();
    };

  
    loadWarehouses();
