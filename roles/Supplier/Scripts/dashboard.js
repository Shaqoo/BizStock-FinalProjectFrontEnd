let apiBaseUrl = "https://localhost:7124/api/v1";

async function loadPoTrendChart() {
    try {
      const response = await fetch(`${apiBaseUrl}/PurchaseOrders/trend`,{
        headers: {
          "Authorization" : `Bearer ${sessionStorage.getItem("accessToken")}`,
          "Content-Type": "application/json"
        }
      });
      if (!response.ok) throw new Error("Failed to load trend data");

      const trendData = await response.json();

      const ctx = document.getElementById('ordersChart').getContext('2d');
    new Chart(ctx, {
      type: 'bar',
      data: {
        labels: trendData.data.labels,
        datasets: [{
          label: 'Purchase Orders Trend',
          data: trendData.data.data,
          backgroundColor: 'rgba(34,197,94,0.7)'
        }]
      }
    });
      
      
    } catch (err) {
      console.error("Chart loading error:", err);
    }
  }


  
 
  const orderStats = {
    draft: 12,
    confirmed: 45,
    received: 30,
    cancelled: 8,
    partiallyReceived: 15,
    rejected: 5,
    totalSpent: 10000,
    totalOrders: 50,
    outStandingAmount: 50000
  };

let loadOrderStats = async () => {
  try {
    const res = await fetch(`${apiBaseUrl}/PurchaseOrders/stats`, {
      headers:{
        "Authorization" : `Bearer ${sessionStorage.getItem("accessToken")}`
      }
    });
    const data = await res.json();
    if(!res.ok) throw new Error(data.message);
    console.log(data);
    orderStats.draft = data.data.draftCount;
    orderStats.confirmed = data.data.confirmedCount;
    orderStats.received = data.data.receivedCount;
    orderStats.cancelled = data.data.cancelledCount;
    orderStats.partiallyReceived = data.data.partiallyReceivedCount;
    orderStats.rejected = data.data.rejectedCount;
    orderStats.totalSpent = data.data.totalSpend;
    orderStats.totalOrders = data.data.totalPurchaseOrders;
    orderStats.outStandingAmount = data.data.outstandingAmount;

      }catch(error){
        console.log(error);
      } 
}


function load(){
    const dashboardContent = document.getElementById("dashboard-content");
    dashboardContent.innerHTML = ` <div class="bg-white p-4 rounded-lg shadow">
          <h2 class="text-gray-600">Total Orders</h2>
          <p class="text-2xl font-bold">${orderStats.totalOrders}</p>
        </div>
        <div class="bg-white p-4 rounded-lg shadow">
          <h2 class="text-gray-600">Pending Orders</h2>
          <p class="text-2xl font-bold">${orderStats.draft}</p>
        </div>
        <div class="bg-white p-4 rounded-lg shadow">
          <h2 class="text-gray-600">Delivered</h2>
          <p class="text-2xl font-bold">${orderStats.received}</p>
        </div>`;
    
}

const statusStyles = {
  draft: {
    text: "Draft",
    icon: "📝",
    bg: "bg-gray-100",
    textColor: "text-gray-700"
  },
  confirmed: {
    text: "Confirmed",
    icon: "✅",
    bg: "bg-blue-100",
    textColor: "text-blue-700"
  },
  partiallyreceived: {
    text: "Partially Received",
    icon: "🟡",
    bg: "bg-yellow-100",
    textColor: "text-yellow-800"
  },
  cancelled: {
    text: "Cancelled",
    icon: "✖️",
    bg: "bg-gray-200",
    textColor: "text-gray-600"
  },
  rejected: {
    text: "Rejected",
    icon: "⛔",
    bg: "bg-red-100",
    textColor: "text-red-700"
  },
  received: {
    text: "Received",
    icon: "🟢",
    bg: "bg-green-100",
    textColor: "text-green-800"
  }
};



async function loadPurchaseOrders() {
  const body = document.getElementById("po-body");
  const res = await fetch(`${apiBaseUrl}/PurchaseOrders?page=1&pageSize=5`,{
    headers: {
        "Authorization": `Bearer ${sessionStorage.getItem("accessToken")}`,
        "Content-Type": "application/json"
    }
  });


  const data = await res.json();

  body.innerHTML = "";  

data.items.forEach(po => {
  const status = po.status?.toLowerCase();
  const statusInfo = statusStyles[status] || {
    text: status,
    icon: "❔",
    bg: "bg-gray-100",
    textColor: "text-gray-700"
  };

  const statusBadge = `
    <span class="inline-flex items-center px-2 py-1 rounded-full text-xs font-semibold ${statusInfo.bg} ${statusInfo.textColor}">
      ${statusInfo.icon} ${statusInfo.text}
    </span>
  `;

  body.insertAdjacentHTML("beforeend", `
    <tr class="border-b">
      <td class="p-2">${po.poNumber}</td>
      <td class="p-2">${po.supplierName}</td>
      <td class="p-2">₦${po.totalAmount.toLocaleString()}</td>
      <td class="p-2">${statusBadge}</td>
      <td class="p-2">${new Date(po.createdAt).toLocaleDateString()}</td>
    </tr>
  `);
});  
 
}


document.addEventListener("DOMContentLoaded",async () => {
    await loadOrderStats();
    loadPoTrendChart();
    load();
    await loadPurchaseOrders();
})