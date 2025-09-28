const apiBaseUrl = "https://localhost:7124/api/v1";

 async function loadUserGrowth() {
    try {
      const res = await fetch(`${apiBaseUrl}/Users/growth/weekly`);
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
          maintainAspectRatio: true,
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

async function loadComplaintsChart() {
    try {
      const res = await fetch(`${apiBaseUrl}/ChatThreads/complaints/resolution-chart`,{
        headers:{
            "Authorization" : `Bearer ${sessionStorage.getItem("accessToken")}`,
            "Content-Type": "application/json"
        }
      });
      const result = await res.json();

      if (!result.isSuccess) {
        console.error("Failed to load complaints chart:", result.message);
        return;
      }

      const ctx = document.getElementById("complaintsChart").getContext("2d");

      new Chart(ctx, {
        type: "bar",
        data: {
          labels: result.data.labels,
          datasets: [{
            label: "Avg Resolution Time (days)",
            data: result.data.datas,
            backgroundColor: "#f59e0b"
          }]
        },
        options: {
          responsive: true,
          maintainAspectRatio: true,
          plugins: {
            legend: { position: "bottom" }
          },
          scales: {
            y: {
              beginAtZero: true,
              title: {
                display: true,
                text: "Days"
              }
            }
          }
        }
      });

    } catch (err) {
      console.error("Error loading complaints chart", err);
    }
  }



async function loadHeatmap() {
  try {
    const res = await fetch(`${apiBaseUrl}/AuditLogs/login-heatmap`,{
        headers:{
            "Authorization": `Bearer ${sessionStorage.getItem("accessToken")}`
        }
    });
    const result = await res.json();

    const data = result.data;
    console.log(data);
    console.log( data.datasets[0].data)

    new Chart(document.getElementById("heatmapChart"), {
      type: "bar",
      data: {
        labels: data.labels,
        datasets: [
          { label: "Morning (6-12)", data: data.datasets[0].data, backgroundColor: "#3b82f6" },
          { label: "Afternoon (12-18)", data: data.datasets[1].data, backgroundColor: "#10b981" },
          { label: "Evening (18-24)", data: data.datasets[2].data, backgroundColor: "#f59e0b" },
          { label: "Night (0-6)", data: data.datasets[3].data, backgroundColor: "#ef4444" }
        ]
      },
      options: {
        responsive: true,
        maintainAspectRatio: true,
        plugins: {
          legend: { position: "bottom" }
        }
      }
    });
  } catch (err) {
    console.error("Failed to load heatmap:", err);
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
      const res = await fetch(`${apiBaseUrl}/StockMovements/trend/${range}`,{
        headers:{
            "Authprization": `Bearer ${sessionStorage.getItem("accessToken")}`
        }
      });
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
        maintainAspectRatio: true,
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


google.charts.load('current', { 'packages': ['corechart'] });
    google.charts.setOnLoadCallback(loadStats);

async function loadStats() {
  try {
    const response = await fetch(`${apiBaseUrl}/Users/stats/total`, {
      headers: {
        "Authorization": `Bearer ${sessionStorage.getItem("accessToken")}`
      }
    });

    console.log(response);

    if (!response.ok) throw new Error("Failed to fetch stats");

    const result = await response.json();
    const stats = result.data;

    document.getElementById("totalUsers").textContent = stats.totalUsers ?? 0;
    console.log(stats);
    const data = google.visualization.arrayToDataTable([
      ['User Type', 'Count'],
      ['Admins', stats.totalAdmins ?? 0],
      ['Managers', stats.totalManagers ?? 0],
      ['Customers', stats.totalCustomers ?? 0],
      ['Suppliers', stats.totalSuppliers ?? 0],
      ['Delivery Agents', stats.totalDeliveryAgents ?? 0],
      ['Customer Service Agents', stats.totalCustomerServiceAgents ?? 0],
      ['Inventory Managers', stats.totalInventoryManagers ?? 0]
    ]);

    const options = {
      title: 'User Type Breakdown',
      is3D: true,
      chartArea: { width: '90%', height: '80%' },
      legend: { position: 'bottom' },
    };

    const chart = new google.visualization.PieChart(document.getElementById('userTypeChart'));
    chart.draw(data, options);

  } catch (err) {
    console.error("Error loading stats:", err);
    Swal.fire({ icon: "error", title: "Error", text: "Could not load user stats" });
  }
}





  
 



document.addEventListener("DOMContentLoaded",async () => {
  await loadUserGrowth();
  await loadStockTrend();
  await loadComplaintsChart();
  await loadHeatmap();
 document.querySelector('#reports-sidebar-link').classList.add("bg-blue-800");
});



 