const apiBaseUrl = "https://localhost:7124/api/v1";
let apiBase = "https://localhost:7124/api/v1/Notifications";

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

  
    async function loadReports() {

      const suppliers = ["Supplier A", "Supplier B", "Supplier C", "Supplier D", "Supplier E"];
      const supplierValues = [25000, 18000, 12000, 10000, 7000];

      document.getElementById("totalPOs").innerText = orderStats.totalOrders;
      document.getElementById("totalSpend").innerText = `₦${orderStats.totalSpent.toLocaleString()}`;
      document.getElementById("stockValue").innerText = `₦${productStats.stockValue.toLocaleString()}`;
      document.getElementById("activeProducts").innerText = productStats.active;

new Chart(document.getElementById("poStatusChart"), {
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

      new Chart(document.getElementById("poTrendChart"), {
        type: "line",
        data: {
          labels: ["Jan", "Feb", "Mar", "Apr", "May"],
          datasets: [{ label: "Purchase Orders", data: [10, 20, 30, 25, 40], borderColor: "#3b82f6", fill: false }]
        }
      });

      new Chart(document.getElementById("topSuppliersChart"), {
        type: "bar",
        data: {
          labels: suppliers,
          datasets: [{ label: "Spend (₦)", data: supplierValues, backgroundColor: "#6366f1" }]
        }
      });

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

document.addEventListener("DOMContentLoaded",async () => {
  await loadProductsStats();
  await loadOrderStats();
  loadReports();
})


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
          legend: { position: 'bottom' }
        };

        const chart = new google.visualization.PieChart(document.getElementById('stockMovementChart'));
        chart.draw(data, options);
      } catch (err) {
        console.error("Error loading stock movement stats", err);
      }
    }


  let currentType = "line";
  let currentTrend = [];
  let currentRange = "daily";

  const colorMap = {
    Inbound: "#16a34a",
    Outbound: "#dc2626",
    AdjustmentIn: "#3b82f6",
    AdjustmentOut: "#60a5fa",
    TransferIn: "#eab308",
    TransferOut: "#f59e0b"
  };

  async function fetchStockTrend(range = "daily") {
    try {
      const res = await fetch(`${apiBaseUrl}/StockMovements/trend/${range}`);
      const result = await res.json();
      return result.data;
    } catch (err) {
      console.error("Error fetching stock trend:", err);
      alert("Failed to load stock trend data.");
      return [];
    }
  }

  function getSelectedCategories() {
    const checkboxes = document.querySelectorAll("#categoryToggles input[type='checkbox']");
    return Array.from(checkboxes)
      .filter(checkbox => checkbox.checked)
      .map(checkbox => checkbox.value);
  }

  function buildDatasets(trend, selectedCategories) {
    return selectedCategories.map(key => {
      const label = key.replace(/([A-Z])/g, " $1").trim();
      const data = trend.map(item => item[key.charAt(0).toLowerCase() + key.slice(1)]);
      const color = colorMap[key];
      return {
        label,
        data,
        backgroundColor: currentType === "bar" ? color + "99" : color + "33",
        borderColor: color,
        borderWidth: 2,
        fill: currentType === "line"
      };
    });
  }

  function renderChart(type, trend, range, selectedCategories) {
    const labels = trend.map(x => x.period);
    const datasets = buildDatasets(trend, selectedCategories);

    const ctx = document.getElementById("stockTrendChart").getContext("2d");
     if (window.stockTrendChart && typeof window.stockTrendChart.destroy === 'function') {
    window.stockTrendChart.destroy();
  }

    window.stockTrendChart = new Chart(ctx, {
      type,
      data: { labels, datasets },
      options: {
        responsive: true,
        plugins: {
          legend: { position: "bottom" },
          title: {
            display: true,
            text: `Stock Movement Trend (${range.charAt(0).toUpperCase() + range.slice(1)})`
          },
          tooltip: {
            mode: 'index',
            intersect: false,
            callbacks: {
              label: function (context) {
                const label = context.dataset.label || '';
                const value = context.parsed.y;
                return `${label}: ${value.toLocaleString()}`;
              }
            }
          }
        },
        interaction: {
          mode: 'nearest',
          axis: 'x',
          intersect: false
        },
        scales: {
          y: {
            beginAtZero: true,
            title: { display: true, text: "Volume" }
          },
          x: {
            title: { display: true, text: range.charAt(0).toUpperCase() + range.slice(1) }
          }
        }
      }
    });
  }

  async function loadStockTrend(range = "daily") {
    currentRange = range;
    currentTrend = await fetchStockTrend(range);
    const selectedCategories = getSelectedCategories();
    renderChart(currentType, currentTrend, range, selectedCategories);
  }

  document.getElementById("trendRange").addEventListener("change", e => loadStockTrend(e.target.value));

  document.getElementById("toggleChartType").addEventListener("click", () => {
    currentType = currentType === "bar" ? "line" : "bar";
    const selectedCategories = getSelectedCategories();
    renderChart(currentType, currentTrend, currentRange, selectedCategories);
    document.getElementById("toggleChartType").textContent =
      currentType === "bar" ? "Switch to Line" : "Switch to Bar";
  });

  document.querySelectorAll("#categoryToggles input[type='checkbox']").forEach(checkbox => {
    checkbox.addEventListener("change", () => {
      const selectedCategories = getSelectedCategories();
      renderChart(currentType, currentTrend, currentRange, selectedCategories);
    });
  });

  loadStockTrend();
 
