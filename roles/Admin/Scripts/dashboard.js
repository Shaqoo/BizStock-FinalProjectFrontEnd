const apiBaseUrl = "https://localhost:7124/api/v1";


google.charts.load('current', { 'packages': ['corechart'] });
    google.charts.setOnLoadCallback(loadStockMovementStats);

    async function loadStockMovementStats() {
      try {
        const response = await fetch(`${apiBaseUrl}/StockMovements/stock-movements/stats`);
        const result = await response.json();

        if (!result || !result.data) {
          console.error("No stats available");
          return;
        }

        const stats = result.data;

        const data = google.visualization.arrayToDataTable([
          ['Movement Type', 'Count'],
          ['Inbound', stats.totalInbound],
          ['Outbound', stats.totalOutbound],
          ['Adjustment In', stats.totalAdjustmentIn],
          ['Adjustment Out', stats.totalAdjustmentOut],
          ['Transfer In', stats.totalTransferIn],
          ['Transfer Out', stats.totalTransferOut]
        ]);

        const options = {
          title: 'Stock Movement Breakdown',
          is3D: true,
          chartArea: { width: '90%', height: '80%' },
          legend: { position: 'bottom' },
          colors: ['#4CAF50', '#F44336', '#FF9800', '#2196F3', '#9C27B0', '#00BCD4']
        };

        const chart = new google.visualization.PieChart(document.getElementById('stockMovementChart'));
        chart.draw(data, options);
      } catch (err) {
        console.error("Error loading stock movement stats", err);
      }
    }


 const productStats = {
    total: 200,
    active: 180,
    inactive: 20,
    lowStock: 15,
    outOfStock: 5,
    stockValue: 75000
  };

function render(){  
   new Chart(document.getElementById("productStockChart"), {
        type: "pie",
        data: {
          labels: ["Active", "Inactive", "Out of Stock", "Low Stock"],
          datasets: [{
            data: [productStats.active, productStats.inactive, productStats.outOfStock, productStats.lowStock],
            backgroundColor: ["#34d399", "#9ca3af", "#f87171", "#fbbf24"]
          }]
        }
      });

//document.querySelector('#totalUsers').textContent = 1000;
document.querySelector('#stockValue').textContent = '₦' + productStats.stockValue.toLocaleString();
}


let loadProductsStats = async () => {
    try {
      const res = await fetch(`${apiBaseUrl}/Products/stats`, {
        headers: { "Authorization": `Bearer ${sessionStorage.getItem("accessToken")}` }
      });
      const data = await res.json();
      if(!res.ok) throw new Error(data.message);
      console.log(data);
      productStats.total = data.data.totalProducts;
      productStats.active = data.data.activeCount;
      productStats.inactive = data.data.inactiveCount;
      productStats.lowStock = data.data.lowStockCount;
      productStats.outOfStock = data.data.outOfStockCount;
      productStats.stockValue = data.data.totalInventoryValue;
    }
    catch(error){
      console.log(error);
    }
  }

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
    document.querySelector('#totalPOs').textContent = data.data.totalPurchaseOrders;
    document.querySelector('#totalOrders').textContent = data.data.totalPurchaseOrders;

      }catch(error){
        console.log(error);
      }
   
}
 

 async function loadUserGrowth() {
    try {
      const res = await fetch("https://localhost:7124/api/v1/Users/growth/weekly");
      const result = await res.json();

      if (!result.isSuccess) {
        console.error("Failed to load user growth:", result.message);
        return;
      }

      
      document.getElementById("totalUsers").textContent = result.data.totalUsers;

    
      const userGrowth = result.data.userGrowthDtos;

      const labels = userGrowth.map(item => {
        const date = new Date(item.weekStart);
        return date.toLocaleDateString("en-US", { month: "short", day: "numeric" });
      });

      const counts = userGrowth.map(item => item.userCount);

       
      const ctx = document.getElementById("userGrowthChart").getContext("2d");
      new Chart(ctx, {
        type: "line",
        data: {
          labels: labels,
          datasets: [{
            label: "Users Gained",
            data: counts,
            borderColor: "rgb(99, 102, 241)",
            backgroundColor: "rgba(99, 102, 241, 0.2)",
            fill: true,
            tension: 0.3,
            pointRadius: 5,
            pointBackgroundColor: "rgb(99, 102, 241)"
          }]
        },
        options: {
          responsive: true,
          plugins: {
            legend: { display: true },
            tooltip: { mode: "index", intersect: false }
          },
          interaction: {
            mode: "nearest",
            axis: "x",
            intersect: false
          },
          scales: {
            x: { grid: { display: false } },
            y: { beginAtZero: true }
          }
        }
      });
    } catch (err) {
      console.error("Error fetching user growth:", err);
    }
  }


function getIconForEntity(entityName) {
  switch (entityName?.toLowerCase()) {
    case "user":
      return { icon: "person", color: "text-yellow-500" };
    case "supplier":
      return { icon: "local_shipping", color: "text-green-500" };
    case "purchaseorder":
      return { icon: "shopping_bag", color: "text-blue-500" };
    case "salesorder":
      return { icon: "receipt_long", color: "text-indigo-500" };
    case "notification":
      return { icon: "notifications", color: "text-red-500" };
    case "customer":
      return { icon: "groups", color: "text-cyan-500" };
    case "stockmovement":
      return { icon: "sync_alt", color: "text-teal-500" };
    case "product":
      return { icon: "inventory_2", color: "text-purple-500" };
    case "cart":
      return { icon: "shopping_cart", color: "text-pink-500" };
    case "brand":
      return { icon: "star", color: "text-orange-500" };
    case "warehouseitem":
      return { icon: "warehouse", color: "text-amber-600" };
    case "review":
      return { icon: "rate_review", color: "text-cyan-600" };
    case "wishlist":
      return { icon: "favorite", color: "text-rose-500" };
    case "chatthread":
      return { icon: "forum", color: "text-sky-500" };
    case "chatmessage":
      return { icon: "chat", color: "text-violet-500" };
    case "deliveryagent":
      return { icon: "delivery_dining", color: "text-lime-500" };
    default:
      return { icon: "info", color: "text-gray-400" };
  }
}


async function loadAuditLogs(page = 1, size = 20) {
  const res = await fetch(`https://localhost:7124/api/v1/AuditLogs?pageNumber=${page}&pageSize=${size}`,{
    headers:{
        "Authorization" : `Bearer ${sessionStorage.getItem("accessToken")}`,
        "Content-Type": "application/json"
    }
  });
  const result = await res.json();

  const logs = result.items ?? [];  
  const list = document.getElementById("activity-list");
  list.innerHTML = "";

  logs.forEach(log => {
    const { icon, color } = getIconForEntity(log.entityName);

    const li = document.createElement("li");
    li.className = "flex items-start cursor-pointer hover:bg-gray-300";

    li.innerHTML = `
      <span class="material-icons ${color} mr-2">${icon}</span>
      <div>
        <p class="text-sm text-gray-700">
          ${log.action} on <span class="font-semibold">${log.entityName}</span>
        </p>
        <span class="text-xs text-gray-400">${timeAgo(log.timestamp)}</span>
      </div>
    `;

    list.appendChild(li);
  });
}


function timeAgo(date) {
  const seconds = Math.floor((new Date() - new Date(date)) / 1000);
  const intervals = {
    year: 31536000,
    month: 2592000,
    day: 86400,
    hour: 3600,
    minute: 60,
  };

  for (let unit in intervals) {
    const count = Math.floor(seconds / intervals[unit]);
    if (count >= 1) {
      return `${count} ${unit}${count > 1 ? "s" : ""} ago`;
    }
  }
  return "just now";
}





    new Chart(document.getElementById("ordersChart"), {
      type: "bar",
      data: {
        labels: ["Electronics", "Clothing", "Books", "Home"],
        datasets: [{ label: "Orders", data: [120, 200, 150, 80], backgroundColor: ["#10B981", "#3B82F6", "#F59E0B", "#EF4444"] }]
      }
    });


document.addEventListener("DOMContentLoaded",async () => {
  await loadProductsStats();
  await loadOrderStats();
  await loadUserGrowth();
  await loadAuditLogs();
  document.querySelector('#dashboard-sidebar-link').classList.add("bg-blue-800");
  render();
})