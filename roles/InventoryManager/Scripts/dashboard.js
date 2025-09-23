const apiBaseUrl = "https://localhost:7124/api/v1";
let apiBase = "https://localhost:7124/api/v1/Notifications";

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
      <h1 class="text-2xl font-bold">Dashboard</h1>
      <div class="flex items-center space-x-4 mt-4">
        <span class="text-gray-600">Hello, ${user.fullName}!</span>
        <img src="${user.profilePicture ?? getAvatarUrl(user.fullName)}" 
             loading="lazy" 
             class="w-10 h-10 rounded-full border" 
             alt="Profile Picture">
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

document.addEventListener("DOMContentLoaded", async () => {
  await loadProfile();
  await loadOrderStats();
  await loadProductsStats();
  await loadLowStockProducts();
  await loadRecentActivities();
  load();
});



     const productStats = {
    total: 200,
    active: 180,
    inactive: 20,
    lowStock: 15,
    outOfStock: 5,
    stockValue: 75000
  };
 

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

function load()
{
   
    document.querySelector('#dashboardStats').innerHTML = `  <div class="bg-white p-6 rounded-lg shadow-md">
        <h2 class="text-gray-500 text-sm">Total Purchase Orders</h2>
        <p class="text-2xl font-bold">${orderStats.totalOrders}</p>
      </div>
      <div class="bg-white p-6 rounded-lg shadow-md">
        <h2 class="text-gray-500 text-sm">Total Amount Spent</h2>
        <p class="text-2xl font-bold text-green-600">₦${orderStats.totalSpent.toLocaleString()}</p>
      </div>
      <div class="bg-white p-6 rounded-lg shadow-md">
        <h2 class="text-gray-500 text-sm">Outstanding Amount</h2>
        <p class="text-2xl font-bold text-red-600">₦${orderStats.outStandingAmount.toLocaleString()}</p>
      </div>
      <div class="bg-white p-6 rounded-lg shadow-md">
        <h2 class="text-gray-500 text-sm">Low Stock Products</h2>
        <p class="text-2xl font-bold text-orange-500">${productStats.lowStock}</p>
      </div>`

   
   new Chart(document.getElementById("orderStatusChart"), {
  type: "doughnut",
  data: {
    labels: ["Draft", "Confirmed", "Partially Received", "Received", "Rejected", "Cancelled"],
    datasets: [{
      data: [
        orderStats.draft,
        orderStats.confirmed,
        orderStats.partiallyReceived,
        orderStats.received,
        orderStats.rejected,
        orderStats.cancelled
      ],
      backgroundColor: [
        "#fbbf24",  
        "#3b82f6", 
        "#a855f7", 
        "#10b981", 
        "#f97316", 
        "#ef4444"  
      ],
    }]
  },
  options: {
    responsive: true,
    plugins: {
      legend: {
        position: 'top'
      },
      tooltip: {
        callbacks: {
          label: function (tooltipItem) {
            const value = tooltipItem.raw;
            const label = tooltipItem.label;
            return `${label}: ${value}`;
          }
        }
      }
    }
  }
});


    
    new Chart(document.getElementById("topProductsChart"), {
      type: "bar",
      data: {
        labels: ["Product A", "Product B", "Product C", "Product D", "Product E"],
        datasets: [{
          label: "Units Sold",
          data: [120, 95, 80, 60, 45],
          backgroundColor: "#3b82f6"
        }]
      },
      options: {
        scales: {
          y: { beginAtZero: true }
        }
      }
    });

    new Chart(document.getElementById("productChart"), {
    type: "bar",
    data: {
      labels: ["Active", "Inactive", "Low Stock", "Out of Stock"],
      datasets: [{
        label: "Products",
        data: [productStats.active, productStats.inactive, productStats.lowStock, productStats.outOfStock],
        backgroundColor: ["#10b981","#6b7280","#f59e0b","#ef4444"]
      }]
    },
    options: { responsive: true, plugins: { legend: { display: false } } }
  });

 
  document.getElementById("poTotal").textContent = `${orderStats.totalOrders.toLocaleString()}`;
  document.getElementById("poSpend").textContent = `₦${orderStats.totalSpent.toLocaleString()}`;
  document.getElementById("productTotal").textContent = productStats.total;
  document.getElementById("stockValue").textContent = `₦${productStats.stockValue.toLocaleString()}`;
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

let loadLowStockProducts = async () => {
  try {
    const res = await fetch(`${apiBaseUrl}/Products/low-stock?pageNumber=1&pageSize=5`, {
      headers: { "Authorization": `Bearer ${sessionStorage.getItem("accessToken")}` }
    });
    const data = await res.json();
    if(!res.ok) throw new Error(data.message);
    console.log(data);
    renderLowStockProducts(data.data.items);
  }
  catch(error){
    console.log(error);
  }

}

renderLowStockProducts = (products) => {
  const container = document.getElementById("lowStockProducts");
  container.innerHTML = "";
  products.forEach(product =>{
    container.insertAdjacentHTML("beforeend",` <li class="py-2 flex justify-between items-center">
      <div class="flex items-center space-x-3">
        <img src="${product.imageUrl}" alt="${product.name}" loading="lazy" class="w-10 h-10 rounded object-cover" />
        <span>${product.name}</span>
      </div>
      <span class="text-red-600 font-semibold">${product.quantity} left</span>
    </li>`)
  } )
}

 const colorMap = {
    info: 'bg-blue-500',
    success: 'bg-green-500',
    error: 'bg-red-500',
    warning: 'bg-yellow-500'
  };

dayjs.extend(dayjs_plugin_relativeTime);

function renderRecentActivities(activities){
  const container = document.querySelector('#activity-list');
  container.innerHTML = '';
  
  activities.forEach(activity =>{
     const timeAgo = dayjs(activity.timestamp).fromNow();
    container.insertAdjacentHTML('beforeend',`<li class="flex items-start">
          <span class="w-3 h-3 mt-2 rounded-full ${colorMap[activity.type]}"></span>
          <p class="ml-3 text-gray-700"><strong>${activity.message}</strong></p>
          <span class="ml-auto text-sm text-gray-400">${timeAgo}</span>
        </li>`)
  });
}


async function loadRecentActivities(){
   try {
    const res = await fetch(`${apiBaseUrl}/Notifications/recipient/paged?page=1&pageSize=8`, {
      headers: { "Authorization": `Bearer ${sessionStorage.getItem("accessToken")}` }
    });
    const data = await res.json();
    if(!res.ok) throw new Error(data.message);
    console.log(data);
    renderRecentActivities(data.data.items);
  }
  catch(error){
    console.log(error);
  }
}
   

