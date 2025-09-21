let apiBase = "https://localhost:7124/api/v1/Notifications";
let apiBaseUrl = "https://localhost:7124/api/v1";

let pageNumber = 1;
const pageSize = 20;

async function loadSuppliers(){
    
}

async function loadPurchaseOrders() {
 
 
  const res = await fetch(`${apiBaseUrl}/PurchaseOrders?page=${pageNumber}&pageSize=${pageSize}`,{
    headers: {
        "Authorization": `Bearer ${sessionStorage.getItem("accessToken")}`,
        "Content-Type": "application/json"
    }
  });
  const data = await res.json();
  
  console.log(data)

  const tbody = document.getElementById("po-body");
  tbody.innerHTML = "";

  data.items.forEach(po => {
    tbody.innerHTML += `
      <tr>
        <td class="p-3 border">${po.poNumber}</td>
        <td class="p-3 border">${po.supplierName}</td>
        <td class="p-3 border">₦${po.totalAmount.toLocaleString()}</td>
        <td class="p-3 border">${po.status}</td>
        <td class="p-3 border">${new Date(po.createdAt).toLocaleDateString()}</td>
      </tr>
    `;
  });

  document.getElementById("pageInfo").innerText = `Page ${data.pageNumber} of ${data.totalPages}`;
  document.getElementById("prevPage").disabled = !data.hasPreviousPage;
  document.getElementById("nextPage").disabled = !data.hasNextPage;
}

document.getElementById("prevPage").addEventListener("click", () => {
  if (pageNumber > 1) {
    pageNumber--;
    loadPurchaseOrders();
  }
});
document.getElementById("nextPage").addEventListener("click", () => {
  pageNumber++;
  loadPurchaseOrders();
});
document.getElementById("filterForm").addEventListener("submit", (e) => {
  e.preventDefault();
  pageNumber = 1;
  loadPurchaseOrders();
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
      <div class="flex items-center space-x-4">
        <span class="text-gray-600">Hello, ${user.fullName}</span>
        <img src="${user.profilePicture ?? getAvatarUrl(user.fullName)}" class="w-10 h-10 rounded-full border" alt="profile">
      </div>
    `;
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

loadPurchaseOrders();
loadProfile();



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

