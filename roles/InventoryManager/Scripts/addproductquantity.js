 const API_BASE = "https://localhost:7124/api/v1";
  const productSearch = document.getElementById("productSearch");
  const productSuggestions = document.getElementById("productSuggestions");
  const productIdInput = document.getElementById("productId");
  const warehouseSelect = document.getElementById("warehouseSelect");
  const addQuantityForm = document.getElementById("addQuantityForm");
  const submitBtn = document.getElementById("submitBtn");
  const clearBtn = document.getElementById("clearBtn");

  function debounce(fn, delay = 350) {
    let t;
    return (...args) => {
      clearTimeout(t);
      t = setTimeout(() => fn(...args), delay);
    };
  }

  async function loadWarehouses() {
    try {
      const res = await fetch(`${API_BASE}/Warehouses?pageNumber=1&pageSize=10`, {
        headers: { "Authorization": `Bearer ${sessionStorage.getItem("accessToken")}` }
      });
      if (!res.ok) throw new Error("Failed to load warehouses");
      const payload = await res.json();
      const items = payload?.data?.items;
      warehouseSelect.innerHTML = `<option value="">Select warehouse</option>` +
        items.map(w => `<option value="${w.id}">${escapeHtml(w.name)} — ${escapeHtml(w.location ?? "")}</option>`).join("");
    } catch (err) {
      warehouseSelect.innerHTML = `<option value="">Unable to load warehouses</option>`;
      console.error(err);
    }
  }

  function escapeHtml(s) {
    if (!s && s !== 0) return "";
    return String(s).replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
  }

  async function fetchProductSuggestions(query) {
    if (!query || query.length < 2) {
      productSuggestions.classList.add("hidden");
      return;
    }

    try {
      const res = await fetch(`${API_BASE}/Products/search?pageNumber=1&pageSize=10&keyword=${encodeURIComponent(query)}`, {
      headers: { "Authorization": `Bearer ${sessionStorage.getItem("accessToken")}` }
    });
    const data = await res.json();

      const items = data.data.items;
      if (!Array.isArray(items) || items.length === 0) {
        productSuggestions.innerHTML = `<li class="px-3 py-2 text-sm text-gray-500">No results</li>`;
        productSuggestions.classList.remove("hidden");
        return;
      }

      console.log(items);

      productSuggestions.innerHTML = items.map(p => `
        <li class="flex items-center gap-3 px-3 py-2 hover:bg-sky-50 cursor-pointer" data-id="${p.id}">
          <img src="${escapeHtml(p.imageUrl ?? '/roles/common/images/placeholder.png')}" alt="${escapeHtml(p.name)}"
               class="w-8 h-8 object-cover rounded">
          <div class="flex-1">
            <div class="font-medium text-sm">${escapeHtml(p.name)}</div>
            <div class="text-xs text-gray-500">SKU: ${escapeHtml(p.sku ?? '-')}${p.category ? ' • ' + escapeHtml(p.category) : ''}</div>
          </div>
        </li>
      `).join("");
      productSuggestions.classList.remove("hidden");

      productSuggestions.querySelectorAll("li").forEach(li => {
        li.addEventListener("click", () => {
          productIdInput.value = li.dataset.id;
          productSearch.value = li.querySelector(".font-medium").textContent;
          productSuggestions.classList.add("hidden");
        });
      });
    } catch (err) {
      console.error("product suggestions error", err);
      productSuggestions.classList.add("hidden");
    }
  }

  const debouncedFetch = debounce((q) => fetchProductSuggestions(q), 350);
  productSearch.addEventListener("input", (e) => {
    productIdInput.value = ""; 
    debouncedFetch(e.target.value.trim());
  });

  document.addEventListener("click", (e) => {
    if (!productSuggestions.contains(e.target) && e.target !== productSearch) {
      productSuggestions.classList.add("hidden");
    }
  });

  addQuantityForm.addEventListener("submit", async (e) => {
    e.preventDefault();

    const warehouseId = warehouseSelect.value;
    const productId = productIdInput.value;
    const quantity = parseInt(document.getElementById("quantity").value ?? "", 10);
    const reorderLevel = parseInt(document.getElementById("reorderLevel").value ?? "", 10);

    if (!productId) {
      return Swal.fire({ icon: "warning", title: "Missing product", text: "Please select a product from suggestions." });
    }
    if (!warehouseId) {
      return Swal.fire({ icon: "warning", title: "Missing warehouse", text: "Please select a warehouse." });
    }
    if (Number.isNaN(quantity) || quantity < 0) {
      return Swal.fire({ icon: "warning", title: "Invalid quantity", text: "Quantity must be 0 or greater." });
    }
    if (Number.isNaN(reorderLevel) || reorderLevel < 0) {
      return Swal.fire({ icon: "warning", title: "Invalid reorder level", text: "Reorder level must be 0 or greater." });
    }

    try {
      submitBtn.disabled = true;
      const res = await fetch(`${API_BASE}/Products/add-quantity`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${sessionStorage.getItem("accessToken")}`
        },
        body: JSON.stringify({
          WarehouseId: warehouseId,
          ProductId: productId,
          Quantity: quantity,
          ReorderLevel: reorderLevel
        })
      });

      const text = await res.json();
      if (!res.ok) {
        Swal.fire({ icon: "error", title: "Error", text: text.message || "Failed to add product quantity" });
        return;
      }

      Swal.fire({ icon: "success", title: "Success", text: text.message || "Quantity added" });
      productSearch.value = "";
      productIdInput.value = "";
      document.getElementById("quantity").value = "";
      document.getElementById("reorderLevel").value = "";
      warehouseSelect.selectedIndex = 0;
    } catch (err) {
      console.error(err);
      Swal.fire({ icon: "error", title: "Error", text: err.message || "Network error" });
    } finally {
      submitBtn.disabled = false;
    }
  });

  clearBtn.addEventListener("click", () => {
    productSearch.value = "";
    productIdInput.value = "";
    document.getElementById("quantity").value = "";
    document.getElementById("reorderLevel").value = "";
    warehouseSelect.selectedIndex = 0;
    productSuggestions.classList.add("hidden");
  });

  function productIdToGuid(v) { return v; }

  
  (async function init() {
    await loadWarehouses();
    
  })();
