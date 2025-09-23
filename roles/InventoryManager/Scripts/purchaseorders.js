let apiBase = "https://localhost:7124/api/v1/Notifications";
let apiBaseUrl = "https://localhost:7124/api/v1";

let pageNumber = 1;
const pageSize = 20;

const supplierFilter = document.getElementById("supplierFilter");
const statusFilter = document.getElementById("statusFilter");
const startDate = document.getElementById("startDateFilter");
const endDate = document.getElementById("endDateFilter");
const apply = document.getElementById("applyFilters");

let currentMode = "all";

async function fetchByCurrentMode() {
  if(currentMode === "all") await loadPurchaseOrders();
  else if(currentMode === "dateMode") await loadPurchaseOrdersFilteredByDate(startDate.value, endDate.value);
  else if(currentMode === "supplierMode") await loadPurchaseOrdersFilteredBySupplier(supplierFilter.value);
  else if(currentMode === "statusMode") await loadPurchaseOrdersFilteredByStatus(statusFilter.value);
}

function renderResult(data){
  const tbody = document.getElementById("po-body");
  tbody.innerHTML = "";

  

data.items.forEach(po => {
  const tr = document.createElement('tr');
  tr.className = "hover:bg-gray-100 cursor-pointer";
  tr.dataset.id = po.id;

  tr.innerHTML = `
    <td class="p-3 border">${po.poNumber}</td>
    <td class="p-3 border">${po.supplierName}</td>
    <td class="p-3 border">₦${po.totalAmount.toLocaleString()}</td>
    <td class="p-3 border">${po.status}</td>
    <td class="p-3 border">${new Date(po.createdAt).toLocaleDateString()}</td>
  `;

  tr.addEventListener('click', () => {
     document.getElementById('loadingOverlay').style.display = 'block';


  setTimeout(() => {
    window.location.href = `/roles/InventoryManager/Pages/purchaseorderdetails.html?id=${po.id}`;
  }, 500);
  });

  tbody.appendChild(tr);
});


  document.getElementById("pageInfo").innerText = `Page ${data.pageNumber} of ${data.totalPages}`;
  document.getElementById("prevPage").disabled = !data.hasPreviousPage;
  document.getElementById("nextPage").disabled = !data.hasNextPage;
}


apply.addEventListener("click", async () => {
  const startDateValue = startDate.value;
  const endDateValue = endDate.value;

if (!startDateValue || !endDateValue) {
  Swal.fire({
    icon: 'warning',
    title: 'Missing Dates',
    text: 'Please select both start and end dates.'
  });
} else {
  const now = new Date();
  const startDate = new Date(startDateValue);
  const endDate = new Date(endDateValue);

  if (endDate > now) {
    Swal.fire({
      icon: 'error',
      title: 'Invalid End Date',
      text: 'End date cannot be in the future.'
    });
  } else if (startDate > endDate) {
    Swal.fire({
      icon: 'error',
      title: 'Invalid Date Range',
      text: 'Start date cannot be after end date.'
    });
  } 
  await loadPurchaseOrdersFilteredByDate(startDateValue, endDateValue);
  currentMode = "dateMode";
}});



async function loadPurchaseOrdersFilteredByDate(startDateValue, endDateValue) {
   const res = await fetch(`${apiBaseUrl}/PurchaseOrders/date-range?startDate=${startDateValue}&endDate=${endDateValue}&page=${pageNumber}&pageSize=${pageSize}`,{
    headers: {
      "Authorization" : `Bearer ${sessionStorage.getItem("accessToken")}`,
      "Content-Type": "application/json"
    },
    });
  const data = await res.json();
  console.log(data);
  renderResult(data.data);
}

async function loadSuppliers(){
    const res = await fetch(`${apiBaseUrl}/Suppliers?page=1&pageSize=10`,{
      headers: {
        "Authorization": `Bearer ${sessionStorage.getItem("accessToken")}`,
        "Content-Type": "application/json"
      }}
    );
    const data = await res.json();
    console.log(data.data);
    const container = document.querySelector('#supplierFilter');

    data.data.items.forEach(supplier => {
      const option = document.createElement('option');
      option.value = supplier.id;
      option.textContent = supplier.email;
      container.appendChild(option);
    })
}

async function loadPurchaseOrdersFilteredBySupplier(supplierId) {
  const res = await fetch(`${apiBaseUrl}/PurchaseOrders/supplier/${supplierId}?page=${pageNumber}&pageSize=${pageSize}`,{
    headers: {
      "Authorization" : `Bearer ${sessionStorage.getItem("accessToken")}`,
      "Content-Type": "application/json"
    },
    });
  const data = await res.json();
  console.log(data);
  renderResult(data);
}

supplierFilter.addEventListener("change", async () => {
  const supplierId = supplierFilter.value;
  console.log(supplierId);
  if(supplierId === "all"){
    await loadPurchaseOrders();
    return;
  }
  await loadPurchaseOrdersFilteredBySupplier(supplierId);
  currentMode = "supplierMode";
});


async function loadPurchaseOrdersFilteredByStatus(status){
  const res = await fetch(`${apiBaseUrl}/PurchaseOrders/status/${status}?page=${pageNumber}&pageSize=${pageSize}`,{
     headers: {
      "Authorization" : `Bearer ${sessionStorage.getItem("accessToken")}`,
      "Content-Type": "application/json"
    },
    });
  const data = await res.json();
  console.log(data);
  renderResult(data);
}

statusFilter.addEventListener("change", async () => {
  const status = statusFilter.value;
  console.log(status);
  if(status === "all"){
    await loadPurchaseOrders();
    return;
  }
   await loadPurchaseOrders();
  await loadPurchaseOrdersFilteredByStatus(status);
  currentMode = "statusMode";
});

async function loadPurchaseOrders() {
  const res = await fetch(`${apiBaseUrl}/PurchaseOrders?page=${pageNumber}&pageSize=${pageSize}`,{
    headers: {
        "Authorization": `Bearer ${sessionStorage.getItem("accessToken")}`,
        "Content-Type": "application/json"
    }
  });
  const data = await res.json();
  
  console.log(data)
  renderResult(data);
  currentMode = "all";
}


document.getElementById("prevPage").addEventListener("click", () => {
  if (pageNumber > 1) {
    pageNumber--;
    fetchByCurrentMode();
  }
});
document.getElementById("nextPage").addEventListener("click", () => {
  pageNumber++;
  fetchByCurrentMode();
});
 

async function loadProfile() {
  const dashboardContainer = document.querySelector('#dashboardHeader');

  if (!dashboardContainer) {
    console.error("Dashboard container not found.");
    return;
  }

  try {
    const response = await fetch(`${apiBaseUrl}/Users/me`, {
      method: "GET",
      headers: {
        "Authorization": `Bearer ${sessionStorage.getItem("accessToken")}`,
        "Content-Type": "application/json"
      }
    });

    if (!response.ok) {
      throw new Error(`Failed to fetch profile: ${response.status}`);
    }

    const result = await response.json();
    const user = result.data;

    dashboardContainer.innerHTML = `
       <h1 class="text-2xl font-bold">Purchase Orders</h1>
        <button id="makePurchaseOrderBtn" type="button" class="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 flex items-center space-x-2">
  <i class="fas fa-plus"></i>
  <span>Add Purchase Order</span>
</button>
      <div class="flex items-center space-x-4">
        <span class="text-gray-600">Hello, ${user.fullName}</span>
        <img src="${user.profilePicture ?? getAvatarUrl(user.fullName)}" class="w-10 h-10 rounded-full border" alt="profile">
      </div>
    `;
    document.getElementById("makePurchaseOrderBtn").addEventListener("click", () => {
    window.location.href = "/roles/InventoryManager/Pages/createpo.html";
  });
  } catch (err) {
    dashboardContainer.innerHTML = `
      <p class="text-red-500">⚠️ Failed to load profile. Please try again.</p>
    `;
    console.error("Failed to load profile", err);
  }
}

function getAvatarUrl(name) {
  return `https://ui-avatars.com/api/?name=${encodeURIComponent(name)}&background=0D8ABC&color=fff&size=128&rounded=true`;
}



document.addEventListener("DOMContentLoaded",() => {
  loadSuppliers();
  loadProfile();
  fetchByCurrentMode();
});







async function exportTableToPDF(filename) {
  const { jsPDF } = window.jspdf;
  const doc = new jsPDF();

  const logoUrl = "/static/images/Favicon.jpg";

  const img = await new Promise((resolve, reject) => {
    const image = new Image();
    image.src = logoUrl;
    image.onload = () => resolve(image);
    image.onerror = reject;
  });

  doc.addImage(img, "JPEG", 14, 10, 20, 20);
  doc.setFontSize(18);
  doc.text("BizStock", 40, 20);
  doc.setFontSize(14);
  doc.text("Purchase Orders Report", 40, 28);
  doc.setFontSize(10);
  doc.text("Generated at: " + new Date().toLocaleString(), 40, 34);

  doc.autoTable({
    html: "#purchaseOrdersTable",
    startY: 40,
    styles: { fontSize: 10 },
    headStyles: { fillColor: [59, 130, 246] }, 
     didDrawPage: function (data) {
        const pageCount = doc.internal.getNumberOfPages();
        const pageSize = doc.internal.pageSize;
        const pageHeight = pageSize.height ? pageSize.height : pageSize.getHeight();

        doc.setFontSize(9);
        doc.setTextColor(100);
        
        
        doc.text("© 2025 BizStock - Inventory-Sales Management System", data.settings.margin.left, pageHeight - 10);

         
        doc.text(
          "Page " + pageCount,
          pageSize.width - data.settings.margin.right - 30,
          pageHeight - 10
        );
      }
  });

  doc.save(filename);
}



function exportTableToExcel(filename) {
  let table = document.getElementById("purchaseOrdersTable");
  let ws = XLSX.utils.table_to_sheet(table);


  XLSX.utils.sheet_add_aoa(ws, [
    ["BizStock", "Purchase Orders Report"],
    ["Generated At:", new Date().toLocaleString()],
    []
  ], { origin: "A1" });

  let wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, "PurchaseOrders");
  XLSX.writeFile(wb, filename);
}

function exportTableToCSV(filename) {
  const rows = document.querySelectorAll("#purchaseOrdersTable tr");
  let csv = [];
  

  csv.push('"BizStock","Purchase Orders Report"');
  csv.push('"Generated At:","' + new Date().toLocaleString() + '"');
  csv.push(""); 

  rows.forEach(row => {
    let cols = row.querySelectorAll("td, th");
    let rowData = [];
    cols.forEach(col => rowData.push(`"${col.innerText}"`));
    csv.push(rowData.join(","));
  });

  const blob = new Blob([csv.join("\n")], { type: "text/csv" });
  const link = document.createElement("a");
  link.href = URL.createObjectURL(blob);
  link.download = filename;
  link.click();
}

