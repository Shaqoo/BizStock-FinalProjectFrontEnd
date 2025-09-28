let apiBaseUrl = "https://localhost:7124/api/v1";
let supplierId = "";
let pageNumber = 1;
const pageSize = 20;

function renderResult(data){
  const tbody = document.getElementById("po-body");
  tbody.innerHTML = "";

  

data.items.forEach(po => {
  const tr = document.createElement('tr');
    tr.className = "bg-white border-b hover:bg-green-100 cursor-pointer";
    tr.dataset.id = po.id;

    tr.innerHTML = `
    <td class="p-3 border">${po.poNumber}</td>
    <td class="p-3 border">${po.supplierName}</td>
    <td class="p-3 border">₦${po.totalAmount.toLocaleString()}</td>
    <td class="p-3 border">${po.status}</td>
    <td class="p-3 border">${new Date(po.createdAt).toLocaleDateString()}</td>
    `;


  tr.addEventListener('click', () => {


  setTimeout(() => {
    window.location.href = `/roles/Supplier/Pages/po-details.html?id=${po.id}`;
  }, 500);
  });

  tbody.appendChild(tr);
});


  document.getElementById("pageInfo").innerText = `Page ${data.pageNumber} of ${data.totalPages}`;
  document.getElementById("prevPage").disabled = !data.hasPreviousPage;
  document.getElementById("nextPage").disabled = !data.hasNextPage;
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

document.getElementById("prevPage").addEventListener("click", () => {
  if (pageNumber > 1) {
    pageNumber--;
    loadPurchaseOrdersFilteredBySupplier(supplierId);
  }
});
document.getElementById("nextPage").addEventListener("click", () => {
  pageNumber++;
  loadPurchaseOrdersFilteredBySupplier(supplierId);
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



async function loadSupplierDetails() {
      try{
    const result = await fetch(`${apiBase}/Suppliers/supplier-me`, {
        headers: {
            "Authorization": `Bearer ${sessionStorage.getItem("accessToken")}`
        }
    });
    const data = await result.json();
    if (!result.ok) throw new Error(data.message);
    console.log(data);
    const user = data.data;
    supplierId = user.id;
       }catch(err){
    console.error(err);
}}


document.addEventListener("DOMContentLoaded", async () => {
    await loadSupplierDetails();
    supplierId = "58c71511-16d7-43c7-98fb-ada70a1c9e6e"
    await loadPurchaseOrdersFilteredBySupplier(supplierId);
});