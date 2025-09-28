const apiBaseUrl = "https://localhost:7124/api/v1/PurchaseOrders";  
const urlParams = new URLSearchParams(window.location.search);
const poId = urlParams.get("id");


if (!poId) {
  Swal.fire("Error", "No Purchase Order ID found in URL.", "error");
} else {
  loadPurchaseOrder(poId);
}

function updateProgress(status) {
const steps = {
  Draft: ["step-draft"],
  Confirmed: ["step-draft", "step-confirmed"],
  PartiallyReceived: ["step-draft", "step-confirmed", "step-partially"],
  Received: ["step-draft", "step-confirmed", "step-partially", "step-received"],
  Delivered: ["step-draft", "step-confirmed", "step-partially", "step-received", "step-delivered"],
  Rejected: ["step-draft"],
  Cancelled: ["step-draft", "step-cancelled"]
};

  
  document.querySelectorAll("li[id^='step-']").forEach(li => {
    li.classList.remove("text-green-600", "font-bold");
    li.querySelector("span.w-8").classList.remove("bg-green-500", "text-white");
  });

   
  steps[status].forEach(stepId => {
    let el = document.getElementById(stepId);
    el.classList.add("text-green-600", "font-bold");
    el.querySelector("span.w-8").classList.add("bg-green-500", "text-white");
  });

  if (status === "Rejected") {
    let el = document.getElementById("step-draft");
    el.classList.remove("text-green-600");
    el.classList.add("text-red-600", "font-bold");
    el.querySelector("span.w-8").classList.add("bg-red-500", "text-white");
  }
}


async function loadPurchaseOrder(id) {
  try {
    const res = await fetch(`${apiBaseUrl}/${id}/get-byId`,{
        headers:{
            "Authorization": `Bearer ${sessionStorage.getItem("accessToken")}`
        }
    });
    const data = await res.json();

    if (!data.isSuccess) {
      Swal.fire("Error", data.message || "Not found", "error");
      return;
    }

    const po = data.data;

    document.getElementById("po-number").innerText = po.poNumber;
    document.getElementById("supplier-name").innerText = po.supplierName;
    document.getElementById("status").innerText = po.status;
    document.getElementById("created-at").innerText = new Date(po.createdAt).toLocaleString();
    document.getElementById("approved-by").innerText = po.approvedBy ?? "—";
    document.getElementById("total-amount").innerText = po.totalAmount.toFixed(2);

    updateProgress(po.status);


    const itemsBody = document.getElementById("items-body");
    itemsBody.innerHTML = "";
    po.items.forEach(it => {
      itemsBody.innerHTML += `
        <tr class="border-b">
          <td class="p-2"><img src="${it.productImgUrl}" class="w-12 h-12 rounded"></td>
          <td class="p-2">${it.productName}</td>
          <td class="p-2">${it.orderedQuantity}</td>
          <td class="p-2">${it.receivedQuantity}</td>
          <td class="p-2">$${it.unitPrice.toFixed(2)}</td>
          <td class="p-2">$${it.lineTotal.toFixed(2)}</td>
        </tr>`;
    });

    
    if (po.status !== "Draft") {
      document.getElementById("actions").style.display = "none";
    }

  } catch (err) {
    Swal.fire("Error", "Failed to load purchase order", "error");
  }
}


document.getElementById("confirm-btn").addEventListener("click", async () => {
  const { value: formValues } = await Swal.fire({
    title: "Confirm Purchase Order",
    html: `
      <input type="date" id="delivery-date" class="swal2-input" placeholder="Expected Delivery Date">
      <textarea id="notes" class="swal2-textarea" placeholder="Notes"></textarea>
    `,
    focusConfirm: false,
    preConfirm: () => {
      return {
        expectedDeliveryDate: document.getElementById("delivery-date").value,
        notes: document.getElementById("notes").value
      }
    }
  });

  if (formValues) {
    await fetch(`${apiBaseUrl}/${poId}/confirm`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json",
        "Authorization": `Bearer ${sessionStorage.getItem("accessToken")}`
       },
      body: JSON.stringify(formValues)
    });
    Swal.fire("Success", "Purchase Order Confirmed", "success").then(() => location.reload());
  }
});


document.getElementById("reject-btn").addEventListener("click", async () => {
  const { value: reason } = await Swal.fire({
    title: "Reject Purchase Order",
    input: "text",
    inputPlaceholder: "Enter rejection reason",
    showCancelButton: true
  });

  if (reason) {
    await fetch(`${apiBaseUrl}/${poId}/reject`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json",
        "Authorization" : `Bearer ${sessionStorage.getItem("accessToken")}`
       },
      body: JSON.stringify({ reason })
    });
    Swal.fire("Rejected", "Purchase Order Rejected", "success").then(() => location.reload());
  }
});
