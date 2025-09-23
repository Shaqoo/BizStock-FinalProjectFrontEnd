let apiBaseUrl = "https://localhost:7124/api/v1";
let itemIndex = 0;


let activeRow = null; 

function debounce(fn, delay = 300) {
  let timeout;
  return (...args) => {
    clearTimeout(timeout);
    timeout = setTimeout(() => fn(...args), delay);
  };
}

function addItemRow() {
  const container = document.getElementById("itemsContainer");

  const row = document.createElement("div");
  row.className = "grid grid-cols-5 gap-2 items-center border p-2 rounded";
  row.setAttribute("data-index", itemIndex);

  row.innerHTML = `
    <input id="productId_${itemIndex}" type="hidden" />
    <input id="productName_${itemIndex}" type="hidden" />
    <input type="text" placeholder="Search Products" class="product-search border rounded p-2" required />
    <input type="number" placeholder="Quantity" class="border rounded p-2" name="quantity_${itemIndex}" min="1" required oninput="calculateTotals()" />
    <input type="number" step="0.01" placeholder="Unit Price" class="product-price border rounded p-2" name="unitPrice_${itemIndex}" required oninput="calculateTotals()" />
    <button type="button" onclick="removeItemRow(this)" class="text-red-600">🗑️</button>
  `;

  container.appendChild(row);

  const searchInput = row.querySelector(".product-search");
  const priceInput = row.querySelector(".product-price");

  searchInput.addEventListener("input", debounce(async (e) => {
    activeRow = row;
    await fetchProducts(e.target.value.trim());
  }, 500));

  itemIndex++;
}

async function fetchProducts(query) {
  const productSuggestions = document.getElementById("productSuggestions");
  if (query.length < 2 || !activeRow) {
    productSuggestions.classList.add("hidden");
    return;
  }

  try {
    const res = await fetch(`${apiBaseUrl}/Products/search?pageNumber=1&pageSize=10&keyword=${encodeURIComponent(query)}`, {
      headers: { "Authorization": `Bearer ${sessionStorage.getItem("accessToken")}` }
    });

    const data = await res.json();
    if (!Array.isArray(data.data.items)) return;

    productSuggestions.innerHTML = data.data.items.map(p => `
      <li class="px-3 py-2 hover:bg-gray-100 cursor-pointer flex items-center gap-2" 
          data-id="${p.id}" data-name="${p.name}" data-price="${p.costPrice}">
        <img src="${p.imageUrl || '/placeholder.png'}" alt="${p.name}" class="w-8 h-8 object-cover rounded">
        <div>
          <div class="font-medium">${p.name}</div>
          <div class="text-xs text-gray-500">SKU: ${p.sku} | ${p.barcode}</div>
        </div>
      </li>
    `).join("");

    productSuggestions.classList.remove("hidden");

    [...productSuggestions.querySelectorAll("li")].forEach(li => {
      li.addEventListener("click", () => {
        const index = activeRow.getAttribute("data-index");
        const hiddenId = activeRow.querySelector(`#productId_${index}`);
        const hiddenName = activeRow.querySelector(`#productName_${index}`);
        const inputSearch = activeRow.querySelector(".product-search");
        const inputPrice = activeRow.querySelector(".product-price");

        inputSearch.value = li.dataset.name;
        hiddenId.value = li.dataset.id;
        hiddenName.value = li.dataset.name;
        inputPrice.value = li.dataset.price;

        productSuggestions.classList.add("hidden");
        activeRow = null;
      });
    });

  } catch (err) {
    console.error("Product search error", err);
  }
}



function removeItemRow(button) {
  button.parentElement.remove();
  calculateTotals();
}

function calculateTotals() {
  let total = 0;
  for (let i = 0; i < itemIndex; i++) {
    const qty = parseFloat(document.querySelector(`[name="quantity_${i}"]`)?.value || 0);
    const price = parseFloat(document.querySelector(`[name="unitPrice_${i}"]`)?.value || 0);
    total += qty * price;
  }

  const discount = parseFloat(document.getElementById("discount").value || 0);
  const tax = parseFloat(document.getElementById("tax").value || 0);

  let discounted = total - (total * discount / 100);
  let taxed = discounted + (discounted * tax / 100);

  document.getElementById("totalAmount").textContent = `$${taxed.toFixed(2)}`;
}

document.getElementById("createPOForm").addEventListener("submit", async function(e) {
  e.preventDefault();

  const items = [];
  for (let i = 0; i < itemIndex; i++) {
    const productId = document.querySelector(`#productId_${i}`)?.value;
    const productName = document.querySelector(`#productName_${i}`)?.value;
    const quantity = parseInt(document.querySelector(`[name="quantity_${i}"]`)?.value);
    const unitPrice = parseFloat(document.querySelector(`[name="unitPrice_${i}"]`)?.value);

    if (!productId || !productName || isNaN(quantity) || isNaN(unitPrice)) {
      await Swal.fire({
        icon: "warning",
        title: "Incomplete Item",
        text: `Item ${i + 1} is missing required fields.`,
      });
      return;
    }

    if (quantity <= 0) {
      await Swal.fire({
        icon: "error",
        title: "Invalid Quantity",
        text: `Quantity in item ${i + 1} must be greater than 0.`,
      });
      return;
    }

    if (unitPrice <= 0) {
      await Swal.fire({
        icon: "error",
        title: "Invalid Unit Price",
        text: `Unit price in item ${i + 1} must be greater than 0.`,
      });
      return;
    }

    items.push({
      productId,
      productName,
      quantityOrdered: quantity,
      unitPrice,
    });
  }

  if (items.length === 0) {
    await Swal.fire({
      icon: "warning",
      title: "No Items",
      text: "You must add at least one item.",
    });
    return;
  }

  const discount = parseFloat(document.getElementById("discount").value || 0);
  const tax = parseFloat(document.getElementById("tax").value || 0);

  if (discount < 0 || discount > 5) {
    await Swal.fire({
      icon: "error",
      title: "Invalid Discount",
      text: "Discount must be between 0 and 5%.",
    });
    return;
  }

  if (tax < 0 || tax > 20) {
    await Swal.fire({
      icon: "error",
      title: "Invalid Tax",
      text: "Tax must be between 0 and 20%.",
    });
    return;
  }

  const dto = {
    supplierId: document.getElementById("supplierId").value,
    items,
    expectedDeliveryDate: document.getElementById("expectedDeliveryDate").value || null,
    notes: document.getElementById("notes").value,
    discount,
    tax
  };

  try {
    const response = await fetch(`${apiBaseUrl}/PurchaseOrders`, {
      method: "POST",
      headers: { "Content-Type": "application/json",
        "Authorization": `Bearer ${sessionStorage.getItem("accessToken")}`
       },
      body: JSON.stringify(dto)
    });

    const result = await response.json();
    if (response.ok) {
      Swal.fire({
        icon: "success",
        title: "Purchase Order Created 🎉",
        text: "PO Number: " + result.data,
        confirmButtonColor: "#16a34a"
      });
      document.getElementById("createPOForm").reset();
      document.getElementById("itemsContainer").innerHTML = "";
      document.getElementById("totalAmount").textContent = "$0.00";
      itemIndex = 0;
    } else {
      Swal.fire({
        icon: "error",
        title: "Failed to Create PO",
        text: result.message || "Something went wrong",
        confirmButtonColor: "#dc2626"
      });
    }
  } catch (err) {
    Swal.fire({
      icon: "error",
      title: "Error",
      text: err.message,
      confirmButtonColor: "#dc2626"
    });
  }
});

loadSuppliers();


async function loadSuppliers(){
    const res = await fetch(`${apiBaseUrl}/Suppliers?page=1&pageSize=10`,{
      headers: {
        "Authorization": `Bearer ${sessionStorage.getItem("accessToken")}`,
        "Content-Type": "application/json"
      }}
    );
    const data = await res.json();
    console.log(data.data);
    const container = document.querySelector('#supplierId');

    data.data.items.forEach(supplier => {
      const option = document.createElement('option');
      option.value = supplier.id;
      option.textContent = supplier.email;
      container.appendChild(option);
    })
}

document.addEventListener("click", (e) => {
  if (!e.target.closest("#productSuggestions") && !e.target.classList.contains("product-search")) {
    document.getElementById("productSuggestions").classList.add("hidden");
  }
});

