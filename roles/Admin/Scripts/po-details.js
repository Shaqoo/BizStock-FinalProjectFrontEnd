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
      </tr>
    `);
  });
});

  
