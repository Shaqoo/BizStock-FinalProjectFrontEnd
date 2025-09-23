 let apiBaseUrl = 'https://localhost:7124/api/v1';
 let globalPurchaseOrderId = "";

    document.addEventListener("DOMContentLoaded", async () => {
  const urlParams = new URLSearchParams(window.location.search);
  const purchaseOrderId = urlParams.get("id");
  globalPurchaseOrderId = purchaseOrderId;

  const response = await fetch(`${apiBaseUrl}/PurchaseOrders/${purchaseOrderId}/get-byId`,{
        headers: {
        "Authorization": `Bearer ${sessionStorage.getItem("accessToken")}`,
        "Content-Type": "application/json"
      }
    });
  const data = await response.json();
  const po = data.data;
  console.log(po);



  document.getElementById("poNumber").textContent = po.poNumber;
  document.getElementById("supplierName").textContent = po.supplierName;
  document.getElementById("status").textContent = po.status;
  document.getElementById("createdAt").textContent = new Date(po.createdAt).toLocaleString();
  document.getElementById("approvedAt").textContent = po.approvedAt ?? "-";
  document.getElementById("approvedBy").textContent = po.approvedBy ?? "-";
  document.getElementById("totalAmount").textContent = `₦${po.totalAmount.toFixed(2)}`;


  const tbody = document.getElementById("poItemsBody");
  po.items.forEach(item => {
    tbody.insertAdjacentHTML("beforeend", `
      <tr data-id="${item.id}" class="border-b">
        <td class="p-3"><img src="${item.productImgUrl}" class="w-12 h-12"/></td>
        <td class="p-3">${item.productName}</td>
        <td class="p-3">${item.orderedQuantity}</td>
        <td class="p-3">${item.receivedQuantity}</td>
        <td class="p-3">₦${item.unitPrice.toFixed(2)}</td>
        <td class="p-3 font-semibold">₦${item.lineTotal.toFixed(2)}</td>
        <td class="p-3 flex space-x-2">
          <button id="editItemBtn" disabled="true" onclick="editItem('${item.id}')" class="text-blue-600" title="Edit Item">✏️</button>
          <button id="removeItemBtn" disabled="true" onclick="removeItem('${item.id}')" class="text-red-600" title="Remove Item">🗑️</button>
        </td>
      </tr>
    `);
  });

  
  const actionsDiv = document.getElementById("statusActions");
  if (po.status === "Draft") {
    actionsDiv.innerHTML = `
    <button onclick="openAddItemModal()" class="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded">
  Add Item
</button>
      <button onclick="updateStatus('${purchaseOrderId}', 'Cancel')" class="bg-red-600 text-white px-4 py-2 rounded">Cancel</button>
    `;
    document.getElementById("editItemBtn").disabled = false;
    document.getElementById("removeItemBtn").disabled = false;

  } else if (po.status === "Confirmed") {
    actionsDiv.innerHTML = `
      <button 
        onclick="openReceiveModal()" 
        class="px-3 py-1 bg-green-600 text-white rounded hover:bg-green-700"
        title="Receive Items"
      >
        📦 Receive
      </button>
      <button onclick="updateStatus('${purchaseOrderId}', 'Cancel')" class="bg-red-600 text-white px-4 py-2 rounded">Cancel</button>
    `;
  }
  else if (po.status === "PartiallyReceived") {
    actionsDiv.innerHTML = `
      <button 
        onclick="openReceiveModal()" 
        class="px-3 py-1 bg-green-600 text-white rounded hover:bg-green-700"
        title="Receive Items"
      >
        📦 Receive
      </button>
    `;
  }
  });

  function openAddItemModal() {
    document.getElementById('addItemModal').classList.remove('hidden');
  }


  function hideAddItemModal() {
    document.getElementById('addItemModal').classList.add('hidden');
  }


  function closeAddItemModal(event) {
    const modal = document.getElementById('addItemModal');
    if (event.target === modal) {
      hideAddItemModal();
    }
  }

  document.getElementById("addItemForm").addEventListener("submit", async function (e) {
    e.preventDefault();

    const productId = document.getElementById("productId").value;
    const productName = document.getElementById("productName").value;
    const quantity = parseFloat(document.getElementById("orderedQty").value);
    const price = parseFloat(document.getElementById("unitPrice").value);

    if (!productName || !productId || quantity < 0 || price < 0) {
      await Swal.fire({
        icon: "warning",
        title: "Invalid Input",
        text: "Please make sure all fields are filled correctly.",
      });
      return;
    }
   document.querySelector("#btns").classList.add("hidden");
    try {
      const response = await fetch(`${apiBaseUrl}/PurchaseOrders/${globalPurchaseOrderId}/items`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${sessionStorage.getItem("accessToken")}`
        },
        body: JSON.stringify({
          purchaseOrderId: globalPurchaseOrderId,
          productId: productId,
          productName: productName,
          quantityOrdered: quantity,
          unitPrice: price
        })
      });

      const result = await response.json();

      if (response.ok && result.isSuccess) {
        await Swal.fire({
          icon: 'success',
          title: 'Item Added',
          text: result.message || 'The item was successfully added.'
        });

        hideAddItemModal();
        location.reload();  
      } else {
        await Swal.fire({
          icon: 'error',
          title: 'Error',
          text: result.message || 'Failed to add item.'
        });
      }
    } catch (error) {
      console.error("Add Item Error:", error);
      await Swal.fire({
        icon: 'error',
        title: 'Error',
        text: 'Something went wrong. Please try again.'
      });
    }finally{
      document.querySelector("#btns").classList.remove("hidden");
    }
  });




async function updateStatus(poId, action) {
  let url = "";
  let bodyData = null;

  if (action === "Cancel") {
    url = `${apiBaseUrl}/PurchaseOrders/${poId}/cancel`;

    const { value: reason } = await Swal.fire({
      title: 'Cancel Purchase Order',
      input: 'text',
      inputLabel: 'Reason for cancellation',
      inputPlaceholder: 'Enter reason...',
      inputValidator: (value) => {
        if (!value) {
          return 'You must provide a reason';
        }
      },
      showCancelButton: true,
      confirmButtonText: 'Submit',
    });

    if (!reason) {
      return;
    }

    bodyData = JSON.stringify({ reason }); 
  } else if (action === "Received") {
    url = `${apiBaseUrl}/PurchaseOrders/${poId}/received`;
    bodyData = null; 
  } else {
    return; 
  }

  try {
    const response = await fetch(url, {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${sessionStorage.getItem("accessToken")}`
      },
      body: bodyData
    });

    const result = await response.json();

    if (response.ok && result.isSuccess) {
      await Swal.fire({
        icon: 'success',
        title: 'Success',
        text: result.message || 'Purchase order status updated.'
      });
      location.reload();
    } else {
      await Swal.fire({
        icon: 'error',
        title: 'Update Failed',
        text: result.message || 'Unable to update purchase order status.'
      });
    }

  } catch (error) {
    console.error("Error:", error);
    await Swal.fire({
      icon: 'error',
      title: 'Unexpected Error',
      text: 'Something went wrong. Please try again later.'
    });
  }
}



async function removeItem(itemId) {
  const confirm = await Swal.fire({
    title: 'Are you sure?',
    text: "This will permanently remove the item.",
    icon: 'warning',
    showCancelButton: true,
    confirmButtonColor: '#d33',
    cancelButtonColor: '#3085d6',
    confirmButtonText: 'Yes, delete it!',
    cancelButtonText: 'Cancel'
  });

  if (!confirm.isConfirmed) {
    return;  
  }
  try {
    const response = await fetch(`${apiBaseUrl}/PurchaseOrders/${globalPurchaseOrderId}/items`, {
      method: "DELETE",
      headers: {
        "Authorization": `Bearer ${sessionStorage.getItem("accessToken")}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        purchaseOrderId: globalPurchaseOrderId,
        purchaseOrderItemId: itemId
      })
    });

    const result = await response.json();

    if (response.ok && result.isSuccess) {
      await Swal.fire({
        icon: 'success',
        title: 'Deleted!',
        text: result.message || 'Item successfully removed.',
      });
      //location.reload();
      const row = document.querySelector(`tr[data-id="${itemId}"]`);
      if (row) row.remove();
    } else {
      await Swal.fire({
        icon: 'error',
        title: 'Delete Failed',
        text: result.message || 'Failed to remove the item.',
      });
    }
  } catch (error) {
    console.error('Error:', error);
    await Swal.fire({
      icon: 'error',
      title: 'Error',
      text: 'An unexpected error occurred. Please try again.',
    });
  }
}



function editItem(itemId) {
  const row = document.querySelector(`tr[data-id="${itemId}"]`);
  const cells = row.querySelectorAll("td");

  const qty = cells[2].textContent;
  const price = cells[4].textContent.replace("₦", "");

  cells[2].innerHTML = `<input id="editQty-${itemId}" type="number" value="${qty}" class="border p-1 w-20"/>`;
  cells[4].innerHTML = `<input id="editPrice-${itemId}" type="number" value="${price}" class="border p-1 w-24"/>`;
  cells[6].innerHTML = `
   <button onclick="saveItem('${itemId}')" class="text-green-600" title="Save Item">💾</button>
  <button onclick="location.reload()" class="text-gray-600" title="Cancel">✖️</button>
  `;
}


async function saveItem(itemId) {
  const qty = parseFloat(document.getElementById(`editQty-${itemId}`).value);
  const price = parseFloat(document.getElementById(`editPrice-${itemId}`).value);

  if (qty < 0 || price < 0) {
    await Swal.fire({
      icon: 'warning',
      title: 'Invalid Input',
      text: 'Quantity and Price must be 0 or greater.',
    });
    return; 
  }

  try {
    const response = await fetch(`${apiBaseUrl}/PurchaseOrders/${globalPurchaseOrderId}/items/${itemId}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json",
        "Authorization" : `Bearer ${sessionStorage.getItem("accessToken")}`
       },
      body: JSON.stringify({
        purchaseOrderId: globalPurchaseOrderId,
        purchaseOrderItemId: itemId,
        quantityOrdered: qty,
        unitPrice: price
      })
    });

    const result = await response.json();

    if (response.ok && result.isSuccess) {
      await Swal.fire({
        icon: 'success',
        title: 'Success',
        text: result.message || 'Item updated successfully!',
      });
      //location.reload();
      const row = document.querySelector(`tr[data-id="${itemId}"]`);
      const cells = row.querySelectorAll("td");
      cells[2].textContent = qty;
      cells[4].textContent = `₦${price.toFixed(2)}`;

    } else {
      await Swal.fire({
        icon: 'error',
        title: 'Update Failed',
        text: result.message || 'Could not update the item.',
      });
    }
  } catch (error) {
    console.error('Fetch error:', error);
    await Swal.fire({
      icon: 'error',
      title: 'Error',
      text: 'An unexpected error occurred. Please try again.',
    });
  }
}


function debounce(fn, delay = 300) {
  let timeout;
  return (...args) => {
    clearTimeout(timeout);
    timeout = setTimeout(() => fn(...args), delay);
  };
}


const productSearch = document.getElementById("productSearch");
const productSuggestions = document.getElementById("productSuggestions");
const hiddenProductId = document.getElementById("productId");
const hiddenProductName = document.getElementById("productName");
const price = document.getElementById("unitPrice");


async function fetchProducts(query) {
  if (query.length < 2) {
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
          <div class="text-xs text-gray-500">SKU: ${p.sku} | ${p.category}</div>
        </div>
      </li>
    `).join("");

    productSuggestions.classList.remove("hidden");

    [...productSuggestions.querySelectorAll("li")].forEach(li => {
      li.addEventListener("click", () => {
        productSearch.value = li.dataset.name;
        hiddenProductId.value = li.dataset.id;
        hiddenProductName.value = li.dataset.name;
        price.value = li.dataset.price;
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




async function selectWarehouseBeforeReceiving() {
    try {
        const response = await fetch(`${apiBaseUrl}/Warehouses?Page=1&pageSize=10`, {
      headers: { "Authorization": `Bearer ${sessionStorage.getItem("accessToken")}` }
    });

        const data = await response.json();

        const warehouses = data.data.items || [];

        if (warehouses.length === 0) {
            Swal.fire({
                icon: 'error',
                title: 'No Warehouses Found',
                text: 'Please create a warehouse before receiving items.',
            });
            return null;
        }

        
        const options = warehouses.map(wh => 
            `<option value="${wh.id}">${wh.name}</option>`
        ).join("");

       
        const { value: selectedWarehouseId } = await Swal.fire({
    title: 'Select Warehouse',
    html: `
        <div style="margin-top: 10px;">
            <select id="warehouse-select" class="swal2-input" style="padding: 8px;">
                <option value="" disabled selected>Select a warehouse</option>
                ${options}
            </select>
        </div>
    `,
    showCancelButton: true,
    focusConfirm: false,
    preConfirm: () => {
        const selected = document.getElementById('warehouse-select').value;
        if (!selected) {
            Swal.showValidationMessage('You must select a warehouse');
        }
        return selected;
    }
});

        return selectedWarehouseId || null;

    } catch (error) {
        console.error("Error loading warehouses:", error);
        Swal.fire({
            icon: 'error',
            title: 'Error',
            text: 'Failed to load warehouses. Please try again.',
        });
        return null;
    }
}


async function openReceiveModal() {
    document.getElementById("receiveModal").classList.remove("hidden");

      try {
        const response = await fetch(`${apiBaseUrl}/PurchaseOrders/${globalPurchaseOrderId}/get-byId`,{
          headers: {
        "Authorization": `Bearer ${sessionStorage.getItem("accessToken")}`,
        "Content-Type": "application/json"
      }
    });

        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }

        const data = await response.json();
        const po = data.data;

        document.getElementById("receivePONumber").innerText = po.poNumber;

        const container = document.getElementById("receiveItemsContainer");
        container.innerHTML = "";

        po.items.forEach(item => {
            const row = document.createElement("div");
            row.className = "flex items-center justify-between border-b pb-2";

            row.innerHTML = `
              <div class="flex items-center space-x-3">
                <img src="${item.productImgUrl}" class="w-12 h-12 object-cover rounded" />
                <div>
                  <p class="font-semibold">${item.productName}</p>
                  <p class="text-sm text-gray-500">Ordered: ${item.orderedQuantity}, Received: ${item.receivedQuantity}</p>
                </div>
              </div>
              <input type="number" min="0" max="${item.orderedQuantity - item.receivedQuantity}" 
                     class="border rounded p-2 w-24"
                     name="received_${item.id}" placeholder="Qty" />
            `;

            container.appendChild(row);
        });

    } catch (error) {
    console.error("Error loading purchase order:", error);
    Swal.fire({
        icon: 'error',
        title: 'Error',
        text: 'Failed to load purchase order. Please try again later.',
        footer: '<a href="#">Try reloading the page</a>',
        confirmButtonText: 'OK'
    });
}

}

function closeReceiveModal() {
    document.getElementById("receiveModal").classList.add("hidden");
}


document.getElementById("receiveForm").addEventListener("submit", async (e) => {
    e.preventDefault();

    const inputs = e.target.querySelectorAll("input[name^='received_']");
    const items = [];

    inputs.forEach(input => {
        const qty = parseInt(input.value || "0");
        if (qty > 0) {
            const itemId = input.name.split("_")[1];
            items.push({ purchaseOrderItemId: itemId, quantityReceived: qty });
        }
    });

    if (items.length === 0) {
    Swal.fire({
        icon: 'warning',
        title: 'No Items Received',
        text: 'Please enter at least one received quantity before submitting.',
        confirmButtonText: 'OK'
    });
    return;
}

 const warehouseId = await selectWarehouseBeforeReceiving();
 if (!warehouseId) return; 


    const response = await fetch(`${apiBaseUrl}/PurchaseOrders/${globalPurchaseOrderId}/receive-items?warehouseId=${warehouseId}`, {
        method: "POST",
        headers: { "Content-Type": "application/json",
          "Authorization" : `Bearer ${sessionStorage.getItem("accessToken")}`
         },
        body: JSON.stringify(items)
    });

    const result = await response.json();
  if (response.ok) {
    Swal.fire({
        icon: 'success',
        title: 'Success!',
        text: 'Items received successfully ✅',
        confirmButtonText: 'OK'
    }).then(() => {
        closeReceiveModal();
        location.reload();
    });
} else {
    Swal.fire({
        icon: 'error',
        title: 'Error',
        text: result.message || "Failed to receive items",
        confirmButtonText: 'OK'
    });
}

});
