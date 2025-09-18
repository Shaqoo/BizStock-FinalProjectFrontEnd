const API_BASE = "https://localhost:7124/api/v1";
const apiBase = "https://localhost:7124/api/v1/Notifications";
let currentPage = 1;
const itemsPerPage = 10;
let currentMode = "all";
let movementType = "all";
let startDate = "";
let endDate = "";
let totalPages = 1;
let filterWarehouseId = "";
let filterProductId = "";



let fetchByCurrentMode = () => {
    if (currentMode === "all") loadStockMovements();
    else if (currentMode === "filterByDateRange") fetchByDateRange(startDate, endDate);
    else if (currentMode === "filterByMovementType") filterByMovementType(movementType);
    else if (currentMode === "filterByWarehouse") filterByWarehouse(filterWarehouseId);
    else if (currentMode === "filterByProduct") filterByProduct(filterProductId);
}


async function searchProductStock(page = 1) {
    const keyword = document.getElementById("searchInput").value;
    if (!keyword || keyword.length < 2) {
    Swal.fire("Error", "Please enter at least 2 characters", "error");
    return;
    }

    try {
    const res = await fetch(`${API_BASE}/Warehouses/search-productstocksummary?keyword=${keyword}&Page=${page}&pageSize=10`, {
        headers: { "Authorization": `Bearer ${sessionStorage.getItem("accessToken")}` }
    });

    if (!res.ok) throw new Error("Failed to fetch");
    const data = await res.json();
    renderSearchResults(data.data.items);
    } catch (err) {
    Swal.fire("Error", err.message, "error");
    }
}

document.getElementById("transferButton").addEventListener("click", transferStock);
document.getElementById("adjustButton").addEventListener("click", adjustStock);

function updatePagination() {
  const paginationInfo = document.querySelector('.paginationInfo');
  const paginationButtonsContainer = document.querySelector('.paginationContainer');

  const startItem = (currentPage - 1) * itemsPerPage + 1;
  const endItem = Math.min(currentPage * itemsPerPage, itemsPerPage * totalPages); 
  paginationInfo.textContent = `Showing ${startItem}-${endItem} of ${itemsPerPage * totalPages}`;

  paginationButtonsContainer.innerHTML = "";

  const prevBtn = document.createElement("button");
  prevBtn.innerHTML = "&laquo;";
  prevBtn.className = "px-3 py-1 border rounded hover:bg-gray-100";
  prevBtn.disabled = currentPage === 1;
  prevBtn.onclick = () => {
    if (currentPage > 1) {
      currentPage--;
      fetchByCurrentMode();
    }
  };
  paginationButtonsContainer.appendChild(prevBtn);

  for (let i = 1; i <= totalPages; i++) {
    if (i < currentPage - 1 || i > currentPage + 1) continue;

    const pageBtn = document.createElement("button");
    pageBtn.textContent = i;
    pageBtn.className = "px-3 py-1 border rounded hover:bg-gray-100";
    if (i === currentPage) {
      pageBtn.classList.add("bg-blue-600", "text-white");
    }

    pageBtn.onclick = () => {
      currentPage = i;
      fetchByCurrentMode();
    };

    paginationButtonsContainer.appendChild(pageBtn);
  }

  const nextBtn = document.createElement("button");
  nextBtn.innerHTML = "&raquo;";
  nextBtn.className = "px-3 py-1 border rounded hover:bg-gray-100";
  nextBtn.disabled = currentPage === totalPages;
  nextBtn.onclick = () => {
    if (currentPage < totalPages) {
      currentPage++;
      fetchByCurrentMode();
    }
  };
  paginationButtonsContainer.appendChild(nextBtn);
}


let getProduct = async (id) =>{
  let product = await fetch(`${API_BASE}/Products/by-id/${id}`);
  return product.json();
}

let getWarehouse = async (id) =>{
  let warehouse = await fetch(`${API_BASE}/Warehouses/${id}`,{
    headers:{
      "Authorization": `Bearer ${sessionStorage.getItem("accessToken")}`
}});
  return warehouse.json();
}


function renderSearchResults(items) {
    const container = document.getElementById("searchResults");
    console.log(items);
    if (!items.length) {
    container.innerHTML = `<p class="text-gray-500">No products found.</p>`;
    return;
    }
    container.innerHTML = `
    <table class="min-w-full border">
        <thead class="bg-blue-200">
        <tr>
            <th class="px-4 py-2 border">Product</th>
            <th class="px-4 py-2 border">Total Quantity</th>
            <th class="px-4 py-2 border">Warehouses</th>
        </tr>
        </thead>
        <tbody>
        ${items.map(p => `
            <tr>
            <td class="border px-4 py-2">${p.productName}</td>
            <td class="border px-4 py-2">${p.totalQuantity}</td>
            <td class="border px-4 py-2 align-top">
                 <ul class="list-disc pl-5 space-y-1 text-sm">
                ${(p.warehouses ?? [])
                    .map(ws => `<li><span class="font-medium">${ws.warehouseName}</span>: ${ws.quantity} items</li>`)
                    .join("")}
            </ul>
            </td>
            </tr>
        `).join("")}
        </tbody>
    </table>
`;

}

let isFetching = false;

async function loadStockMovements() {
    if (isFetching) return;
    isFetching = true;
    try {
    const res = await fetch(`${API_BASE}/StockMovements?Page=${currentPage}&PageSize=${itemsPerPage}`, {
        headers: { "Authorization": `Bearer ${sessionStorage.getItem("accessToken")}` }
    });
    if (!res.ok) Swal.fire("Error", "Failed to load stock movements", "error");

    const result = await res.json();
    renderMovementsTable(result.data.items);
    totalPages = result.data.totalPages;
    updatePagination();
    } catch (err) {
    Swal.fire("Error", err.message, "error");
    }finally{
        isFetching = false;
    }
}

async function renderMovementsTable(data) {
  const container = document.getElementById("movementsTable");
  if (!data || data.length === 0) {
    container.innerHTML = `<p class="text-gray-500">No stock movements found</p>`;
    return;
  }
 
  for (const m of data) {
    try {
      const productRes = await getProduct(m.productId);
      console.log(productRes);
      m.productName = productRes?.data?.name ?? "-";

      const warehouseRes = await getWarehouse(m.warehouseId);
      console.log(warehouseRes);
      m.warehouseName = warehouseRes?.data?.name ?? "-";
    } catch {
      m.productName = "-";
      m.warehouseName = "-";
    }
  }

  container.innerHTML = `
    <div>
      <table class="min-w-full border border-gray-200 hidden sm:table">
        <thead class="bg-gray-100">
          <tr>
            <th class="px-4 py-2 border text-left">Product</th>
            <th class="px-4 py-2 border text-left">Type</th>
            <th class="px-4 py-2 border text-left">Quantity</th>
            <th class="px-4 py-2 border text-left">Warehouse</th>
            <th class="px-4 py-2 border text-left">Date</th>
            <th class="px-4 py-2 border text-left min-w-[250px]">Reason</th>
          </tr>
        </thead>
        <tbody>
          ${data.map(m => `
            <tr class="hover:bg-gray-50">
              <td class="px-4 py-2 border">${m.productName}</td>
              <td class="px-4 py-2 border">${m.movementType}</td>
              <td class="px-4 py-2 border">${m.quantityChanged}</td>
              <td class="px-4 py-2 border">${m.warehouseName}</td>
              <td class="px-4 py-2 border">${new Date(m.date).toLocaleString()}</td>
              <td class="px-4 py-2 border break-words whitespace-pre-wrap">${m.reason ?? "-"}</td>
            </tr>
          `).join("")}
        </tbody>
      </table>

      <!-- Mobile card view -->
      <div class="sm:hidden space-y-4">
        ${data.map(m => `
          <div class="border rounded-lg p-4 shadow-sm bg-white">
            <p><span class="font-semibold">Product:</span> ${m.productName}</p>
            <p><span class="font-semibold">Type:</span> ${m.movementType}</p>
            <p><span class="font-semibold">Quantity:</span> ${m.quantityChanged}</p>
            <p><span class="font-semibold">Warehouse:</span> ${m.warehouseName}</p>
            <p><span class="font-semibold">Date:</span> ${new Date(m.date).toLocaleString()}</p>
            <p class="break-words whitespace-pre-wrap"><span class="font-semibold">Reason:</span> ${m.reason ?? "-"}</p>
          </div>
        `).join("")}
      </div>
    </div>
  `;
}


    
const dateFilterBtn = document.getElementById("apply-date-filter");


dateFilterBtn.addEventListener("click", async () => {
  startDate = document.getElementById("start-date").value;
  endDate = document.getElementById("end-date").value;
  currentMode = "filterByDateRange";
  fetchByDateRange(startDate, endDate);
});

async function fetchByDateRange(startDate, endDate) {
    if(isFetching) return;
    isFetching = true;
     if (!startDate || !endDate) {
    Swal.fire({ icon: "warning", title: "Missing Dates", text: "Please select both start and end dates." });
    return;
  }

  try {
    const response = await fetch(`${API_BASE}/StockMovements/date-range?startDate=${startDate}&endDate=${endDate}&Page=${currentPage}&pageSize=${itemsPerPage}`, {
      method: "GET",
      headers: {
        "Authorization": `Bearer ${sessionStorage.getItem("accessToken")}`
      }
    });

    if (!response.ok) throw new Error("Failed to fetch stock movements.");

    const data = await response.json();

    
    renderMovementsTable(data.data.items);

    totalPages = data.data.totalPages;
    updatePagination();

  } catch (err) {
    Swal.fire({ icon: "error", title: "Error", text: err.message });
  }finally{
        isFetching = false;
  }
}


const filterByWarehouseBtn = document.querySelector("#filterWarehouseBtn");

filterByWarehouseBtn.addEventListener("click", async () => {
  const warehouseId = document.getElementById("filterWarehouseId").value;
  currentMode = "filterByWarehouse";
  filterWarehouseId = warehouseId;
  filterByWarehouse(warehouseId);  
})

async function filterByWarehouse(warehouseId) {
  if (!warehouseId) {
    Swal.fire({ icon: "warning", title: "Missing Warehouse", text: "Please select a warehouse." });
    return;
  }
  if(isFetching) return;
  isFetching = true;
  try {
    const response = await fetch(`${API_BASE}/StockMovements/warehouse/${warehouseId}?Page=${currentPage}&PageSize=${itemsPerPage}`, {
      method: "GET",
      headers: {
        "Authorization": `Bearer ${sessionStorage.getItem("accessToken")}`
      }
    });

    if (!response.ok) throw new Error("Failed to fetch stock movements.");

    const data = await response.json();

    
    renderMovementsTable(data.data.items);

    totalPages = data.data.totalPages;
    updatePagination();
    currentMode = "filterByWarehouse";

  } catch (err) {
    Swal.fire({ icon: "error", title: "Error", text: err.message });
  }finally{
    isFetching = false;
  }
}


const filterByProductBtn = document.querySelector("#filterProductBtn");

filterByProductBtn.addEventListener("click", async () => {
  const productId = document.getElementById("hiddenFilterProductId").value;
  currentMode = "filterByProduct";
  filterProductId = productId;
  filterByProduct(productId);  
})

async function filterByProduct(productId) {
  if (!productId) {
    Swal.fire({ icon: "warning", title: "Missing Product", text: "Please select a Product." });
    return;
  }
  if(isFetching) return;
  isFetching = true;
  try {
    const response = await fetch(`${API_BASE}/StockMovements/Product/${productId}?Page=${currentPage}&PageSize=${itemsPerPage}`, {
      method: "GET",
      headers: {
        "Authorization": `Bearer ${sessionStorage.getItem("accessToken")}`
      }
    });

    if (!response.ok) throw new Error("Failed to fetch stock movements.");

    const data = await response.json();

    
    renderMovementsTable(data.data.items);

    totalPages = data.data.totalPages;
    updatePagination();
  } catch (err) {
    Swal.fire({ icon: "error", title: "Error", text: err.message });
  }finally{
    isFetching = false;
  }
}
 


const dropdownBtn = document.getElementById("dropdownStatusBtn");
const dropdownList = document.getElementById("dropdownStatusList");
const selectedStatusValue = document.getElementById("selectedStatusValue");

let selectedMovementType = "all";

dropdownBtn.addEventListener("click", () => {
  dropdownList.classList.toggle("hidden");
   console.log("clicked1");
});

document.querySelectorAll(".status-option").forEach(item => {
  item.addEventListener("click", async (e) => {
    selectedMovementType = e.currentTarget.dataset.value;
    console.log("clicked");
    selectedStatusValue.textContent = e.currentTarget.textContent;
    dropdownList.classList.add("hidden");
    console.log(selectedMovementType);
    if(selectedMovementType === "all"){
        loadStockMovements();
        return;
    }
    if(selectedMovementType){
    currentMode = "filterByDateRange";
    movementType = selectedMovementType;
    filterByMovementType(selectedMovementType);
    return;
}});
});


async function filterByMovementType(movementType) {
    if(isFetching) return;
    isFetching = true;
    let url = `${API_BASE}/StockMovements/type/${movementType}?Page=${currentPage}&pageSize=${itemsPerPage}`;

    try {
      const res = await fetch(url, {
        headers: {
          "Authorization": `Bearer ${sessionStorage.getItem("accessToken")}`
        }
      });
      if (!res.ok) throw new Error("Failed to load stock movements.");

      const data = await res.json();
      renderMovementsTable(data.data.items);
      totalPages = data.data.totalPages;
      updatePagination();

    } catch (err) {
      Swal.fire({ icon: "error", title: "Error", text: err.message });
    }finally{
        isFetching = false;
    }
}


    async function adjustStock() {
      const dto = {
        productId: document.getElementById("adjustProductId").value,
        warehouseId: document.getElementById("adjustWarehouseId").value,
        quantity: parseInt(document.getElementById("adjustQuantity").value),
        adjustmentType: document.getElementById("adjustType").value,
        reason: document.getElementById("adjustReason").value
      };

      try {
        const res = await fetch(`${API_BASE}/StockMovements/adjust`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${sessionStorage.getItem("accessToken")}`
          },
          body: JSON.stringify(dto)
        });

        if (res.ok) {
          Swal.fire("Success", "Stock adjusted successfully", "success");
          loadStockMovements();
          return;
        }
           Swal.fire("Error", "Failed to adjust stock", "error");
       
      } catch (err) {
        Swal.fire("Error", err.message, "error");
      }
    }

    async function transferStock() {
      const dto = {
        productId: document.getElementById("transferProductId").value,
        fromWarehouseId: document.getElementById("fromWarehouseId").value,
        toWarehouseId: document.getElementById("toWarehouseId").value,
        quantity: parseInt(document.getElementById("transferQuantity").value),
        reason: document.getElementById("transferReason").value
      };

      if (!dto.productId || !dto.fromWarehouseId || !dto.toWarehouseId || !dto.quantity) {
        Swal.fire("Error", "Please fill in all fields", "error");
        return;
      }
       
      if (dto.fromWarehouseId === dto.toWarehouseId) {
        Swal.fire("Error", "Source and destination warehouses cannot be the same", "error");
        return;
      }


      try {
        const res = await fetch(`${API_BASE}/StockMovements/transfer`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${sessionStorage.getItem("accessToken")}`
          },
          body: JSON.stringify(dto)
        });

        if (res.ok){
          Swal.fire("Success", "Stock transferred successfully", "success");
          loadStockMovements();
          return;
        }
        else
          Swal.fire("Error", "Failed to transfer stock", "error");
        
      } catch (err) {
        Swal.fire("Error", err.message, "error");
      }
    }

    
    document.addEventListener("DOMContentLoaded", () => {
      loadStockMovements();
    });

function debounce(fn, delay = 300) {
  let timeout;
  return (...args) => {
    clearTimeout(timeout);
    timeout = setTimeout(() => fn(...args), delay);
  };
}


const productSearch = document.getElementById("productSearch");
const productSuggestions = document.getElementById("productSuggestions");
const hiddenProductId = document.getElementById("adjustProductId");

async function fetchProducts(query) {
  if (query.length < 2) {
    productSuggestions.classList.add("hidden");
    return;
  }

  try {
    const res = await fetch(`${API_BASE}/Products/search?pageNumber=1&pageSize=10&keyword=${encodeURIComponent(query)}`, {
      headers: { "Authorization": `Bearer ${sessionStorage.getItem("accessToken")}` }
    });
    const data = await res.json();

    if (!Array.isArray(data.data.items)) return;

    productSuggestions.innerHTML = data.data.items.map(p => `
      <li class="px-3 py-2 hover:bg-gray-100 cursor-pointer flex items-center gap-2" 
          data-id="${p.id}" data-name="${p.name}">
        <img src="${p.imageUrl || '/placeholder.png'}" alt="${p.name}" class="w-8 h-8 object-cover rounded">
        <div>
          <div class="font-medium">${p.name}</div>
          <div class="text-xs text-gray-500">SKU: ${p.sku} | ${p.category}</div>
        </div>
      </li>
    `).join("");

    productSuggestions.classList.remove("hidden");

    [...productSuggestions.querySelectorAll("li")].forEach(li => {
      li.addEventListener("click", () => {
        productSearch.value = li.dataset.name;
        hiddenProductId.value = li.dataset.id;
        productSuggestions.classList.add("hidden");
      });
    });

  } catch (err) {
    console.error("Product search error", err);
  }
}

productSearch.addEventListener("input", debounce(e => {
  fetchProducts(e.target.value.trim());
}, 800)); 

async function loadWarehouses() {
  try {
    const res = await fetch(`${API_BASE}/Warehouses?Page=1&pageSize=10`, {
      headers: { "Authorization": `Bearer ${sessionStorage.getItem("accessToken")}` }
    });
    const data = await res.json();

    const select = document.getElementById("adjustWarehouseId");
    select.innerHTML = data.data.items.map(w => 
      `<option value="${w.id}">${w.name} (${w.location})</option>`
    ).join("");
    const fromWarehouse = document.getElementById("fromWarehouseId");
    fromWarehouse.innerHTML = data.data.items.map(w => 
      `<option value="${w.id}">${w.name} (${w.location})</option>`
    ).join("");

    const toWarehouse = document.getElementById("toWarehouseId");
    toWarehouse.innerHTML = data.data.items.map(w => 
      `<option value="${w.id}">${w.name} (${w.location})</option>`
    ).join("");

    const filterWarehouse = document.getElementById("filterWarehouseId");
    filterWarehouse.innerHTML = data.data.items.map(w => 
      `<option value="${w.id}">${w.name} (${w.location})</option>`
    ).join("");

  } catch (err) {
    console.error("Failed to load warehouses", err);
  }
}
loadWarehouses();


const productSearchTransfer = document.getElementById("productSearchTransfer");
const productTransferSuggestions = document.getElementById("productTransferSuggestions");
const hiddenTransferProductId = document.getElementById("transferProductId");

async function fetchTransferProducts(query) {
  if (query.length < 2) {
    productTransferSuggestions.classList.add("hidden");
    return;
  }

  try {
    const res = await fetch(`${API_BASE}/Products/search?pageNumber=1&pageSize=10&keyword=${encodeURIComponent(query)}`, {
      headers: { "Authorization": `Bearer ${sessionStorage.getItem("accessToken")}` }
    });
    const data = await res.json();

    if (!Array.isArray(data.data.items)) return;

    productTransferSuggestions.innerHTML = data.data.items.map(p => `
      <li class="px-3 py-2 hover:bg-gray-100 cursor-pointer flex items-center gap-2" 
          data-id="${p.id}" data-name="${p.name}">
        <img src="${p.imageUrl || '/placeholder.png'}" alt="${p.name}" class="w-8 h-8 object-cover rounded">
        <div>
          <div class="font-medium">${p.name}</div>
          <div class="text-xs text-gray-500">SKU: ${p.sku} | ${p.category}</div>
        </div>
      </li>
    `).join("");

    productTransferSuggestions.classList.remove("hidden");

    [...productTransferSuggestions.querySelectorAll("li")].forEach(li => {
      li.addEventListener("click", () => {
        productSearchTransfer.value = li.dataset.name;
        hiddenTransferProductId.value = li.dataset.id;
        productTransferSuggestions.classList.add("hidden");
      });
    });

  } catch (err) {
    console.error("Product search error", err);
  }
}

productSearchTransfer.addEventListener("input", debounce(e => {
  fetchTransferProducts(e.target.value.trim());
}, 800)); 

const productDetails = document.querySelector("#filterProductName");
const filterProductSuggestions = document.querySelector('#filterProductSuggestions');
const hiddenFilterProductId = document.querySelector('#hiddenFilterProductId');

async function fetchFilterSuggestionProducts(query) {
  if (query.length < 2) {
    filterProductSuggestions.classList.add("hidden");
    return;
  }

  try {
    const res = await fetch(`${API_BASE}/Products/search?pageNumber=1&pageSize=10&keyword=${encodeURIComponent(query)}`, {
      headers: { "Authorization": `Bearer ${sessionStorage.getItem("accessToken")}` }
    });
    const data = await res.json();

    if (!Array.isArray(data.data.items)) return;

    filterProductSuggestions.innerHTML = data.data.items.map(p => `
      <li class="px-3 py-2 hover:bg-gray-100 cursor-pointer flex items-center gap-2" 
          data-id="${p.id}" data-name="${p.name}">
        <img src="${p.imageUrl || '/placeholder.png'}" alt="${p.name}" class="w-8 h-8 object-cover rounded">
        <div>
          <div class="font-medium">${p.name}</div>
          <div class="text-xs text-gray-500">SKU: ${p.sku} | ${p.category}</div>
        </div>
      </li>
    `).join("");

    filterProductSuggestions.classList.remove("hidden");

    [...filterProductSuggestions.querySelectorAll("li")].forEach(li => {
      li.addEventListener("click", () => {
        productDetails.value = li.dataset.name;
        hiddenFilterProductId.value = li.dataset.id;
        filterProductSuggestions.classList.add("hidden");
      });
    });

  } catch (err) {
    console.error("Product search error", err);
  }
}

productDetails.addEventListener("input", debounce(e => {
  fetchFilterSuggestionProducts(e.target.value.trim());
}, 800)); 


