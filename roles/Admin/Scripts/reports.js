const apiBaseUrl = "https://localhost:7124/api/v1";
let currentPage = 1;
const pageSize = 20;
let totalPages = 1;
let currentMode = "all";
let isFetching = false;


const tbody = document.getElementById("auditTableBody");
const cards = document.getElementById("auditCards");
const searchInput = document.getElementById("searchInput");
const hiddenUserId = document.getElementById("specificUserId");


let searchDebounceTimeout;
function fetchByCurrentMode() {
  if(currentMode === "all")
    loadLogs();
  else if(currentMode === "search")
    searchLogs(searchInput.value.trim());
  else if(currentMode === "searchByUser")
    searchByUser(hiddenUserId.value.trim());
}

function updatePagination() {
  const paginationInfo = document.querySelector('.paginationInfo');
  const paginationButtonsContainer = document.querySelector('.paginationContainer');

  const startItem = (currentPage - 1) * pageSize + 1;
  const endItem = Math.min(currentPage * pageSize, pageSize * totalPages); 
  paginationInfo.textContent = `Showing ${startItem}-${endItem} of ${pageSize * totalPages}`;

  paginationButtonsContainer.innerHTML = "";

  const prevBtn = document.createElement("button");
  prevBtn.innerHTML = "&laquo;";
  prevBtn.className = "px-3 py-1 border rounded hover:bg-gray-100";
  prevBtn.disabled = currentPage === 1;
  prevBtn.onclick = () => {
    if (currentPage > 1) {
      currentPage--;
      fetchByCurrentMode();
    }
  };
  paginationButtonsContainer.appendChild(prevBtn);

  for (let i = 1; i <= totalPages; i++) {
    if (i < currentPage - 1 || i > currentPage + 1) continue;

    const pageBtn = document.createElement("button");
    pageBtn.textContent = i;
    pageBtn.className = "px-3 py-1 border rounded hover:bg-gray-100";
    if (i === currentPage) {
      pageBtn.classList.add("bg-blue-600", "text-white");
    }

    pageBtn.onclick = () => {
      currentPage = i;
      fetchByCurrentMode();
    };

    paginationButtonsContainer.appendChild(pageBtn);
  }

  const nextBtn = document.createElement("button");
  nextBtn.innerHTML = "&raquo;";
  nextBtn.className = "px-3 py-1 border rounded hover:bg-gray-100";
  nextBtn.disabled = currentPage === totalPages;
  nextBtn.onclick = () => {
    if (currentPage < totalPages) {
      currentPage++;
      fetchByCurrentMode();
    }
  };
  paginationButtonsContainer.appendChild(nextBtn);
}

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


async function loadLogs() {
  if (isFetching) return;
     isFetching = true;
  try{
  const response = await fetch(`${apiBaseUrl}/AuditLogs?pageNumber=${currentPage}&pageSize=${pageSize}`,{
    headers:{
      "Authorization": `Bearer ${sessionStorage.getItem("accessToken")}`
    }
  });
   
  if(!response.ok) throw new Error("Failed to fetch logs");
  
  const data = await response.json();
  renderLogs(data.items);
  totalPages = data.totalPages;
  updatePagination();
}catch(err){
  console.error("Error loading logs:", err);
  tbody.innerHTML = `<p class="text-red-500">❌ Could not load Logs.</p>`;
  cards.innerHTML = `<p class="text-red-500">❌ Could not load Logs.</p>`;
}finally {
    isFetching = false;
  }
}

searchInput.addEventListener("input", () => {
  const inputValue = searchInput.value.trim();

  clearTimeout(searchDebounceTimeout);

  searchDebounceTimeout = setTimeout(() => {
  currentMode = inputValue === "" ? "all" : "search";
  currentPage = 1;

    fetchByCurrentMode();
  }, 300); 
});

let searchLogs = async (input) =>{
    if (isFetching) return;
     isFetching = true;
    let url = `${apiBaseUrl}/AuditLogs/search?search=${encodeURIComponent(input)}&pageNumber=${currentPage}&pageSize=${pageSize}`;
    try {
        const response = await fetch(url,{
          "Authorization": `Bearer ${sessionStorage.getItem("accessToken")}`
        });
    if (!response.ok) throw new Error("Failed to fetch");

    const data = await response.json();
    const logs = data.items;
    totalPages = data.totalPages;

    renderLogs(logs);
    updatePagination();
  } catch (err) {
    console.error("Error:", err);
    tbody.innerHTML = `<p class="text-red-500">❌ Could not load Logs.</p>`;
    cards.innerHTML = `<p class="text-red-500">❌ Could not load Logs.</p>`;
  }finally {
    isFetching = false;
  }
}




function renderLogs(logs){
  tbody.innerHTML = "";
  cards.innerHTML = "";
  if(logs.length == 0){
    console.log("no logs");
    tbody.innerHTML = `<p class="text-red-500">❌ Could not load Logs.</p>`;
    cards.innerHTML = `<p class="text-red-500">❌ Could not load Logs.</p>`;
    return;
  }


  logs.forEach(log => {
    const tr = document.createElement("tr");
    tr.className = "cursor-pointer hover:bg-gray-100";
    tr.onclick = () => openModal(log);
    tr.innerHTML = `
      <td class="p-2 border">${log.email}</td>
      <td class="p-2 border">${log.action}</td>
      <td class="p-2 border">${log.timestamp}</td>
      <td class="p-2 border">${log.ipAddress}</td>
    `;
    tbody.appendChild(tr);


    const card = document.createElement("div");
    card.className = "border rounded-lg p-3 shadow cursor-pointer hover:bg-gray-50";
    card.onclick = () => openModal(log);
    card.innerHTML = `
      <div class="flex items-center space-x-3">
        <img src="${log.profilePic ?? getAvatarUrl(log.fullname)}" alt="profile" class="w-10 h-10 rounded-full">
        <div>
          <p class="font-semibold">${log.fullname}</p>
          <p class="text-xs text-gray-500">${log.email}</p>
        </div>
      </div>
      <p class="mt-2 text-sm"><strong>Action:</strong> ${log.action}</p>
      <p class="text-xs text-gray-500">${log.timestamp}</p>
      <p class="text-xs">IP: ${log.ipAddress}</p>
      <p class="text-xs ${log.action.toLowerCase().includes("fail") ? "text-red-600" : "text-green-600"}">${log.action.toLowerCase().includes("fail") ? "Failed" : "Success"}</p>
    `;
    cards.appendChild(card);
  });
}


function openModal(log) {
  document.getElementById("auditModal").classList.remove("hidden");
  document.getElementById("auditModal").classList.add("flex");
  document.getElementById("modalContent").innerHTML = `
    <div class="flex items-center space-x-3">
      <img src="${log.profilePic ?? getAvatarUrl(log.fullname)}" alt="profile" class="w-12 h-12 rounded-full">
      <div>
        <p class="font-semibold">${log.fullname}</p>
        <p class="text-sm text-gray-500">${log.email}</p>
      </div>
    </div>
    <p><strong>UserId:</strong> ${log.userId}</p>
    <p><strong>Action:</strong> ${log.action}</p>
    <p><strong>Timestamp:</strong> ${log.timestamp}</p>
    <p><strong>IP Address:</strong> ${log.ipAddress}</p>
    <p><strong>Device Info:</strong> ${log.userAgent}</p>
    <p><strong>Status:</strong> ${log.action.toLowerCase().includes("fail") ? "Failed" : "Success"}</p>
    <p><strong>Description:</strong> ${log.description}</p>
  `;
}


function closeModal() {
  document.getElementById("auditModal").classList.add("hidden");
  document.getElementById("auditModal").classList.remove("flex");
}


let searchByUser = async (userId) =>{
  if (isFetching) return;
     isFetching = true;
    try{
  const response = await fetch(`${apiBaseUrl}/AuditLogs/user/${userId}?pageNumber=${currentPage}&pageSize=${pageSize}`,{
    headers:{
      "Authorization": `Bearer ${sessionStorage.getItem("accessToken")}`
    }
  });
   
  if(!response.ok) throw new Error("Failed to fetch logs");
  
  const data = await response.json();
  renderLogs(data.items);
  totalPages = data.totalPages;
  updatePagination();
}catch(err){
  console.error("Error loading logs:", err);
  tbody.innerHTML = `<p class="text-red-500">❌ Could not load Logs.</p>`;
  cards.innerHTML = `<p class="text-red-500">❌ Could not load Logs.</p>`;
}finally {
    isFetching = false;
  }
}

function debounce(fn, delay = 300) {
  let timeout;
  return (...args) => {
    clearTimeout(timeout);
    timeout = setTimeout(() => fn(...args), delay);
  };
}

const userSearch = document.getElementById("userSearch");
const userSuggestions = document.getElementById("userSuggestions");

async function fetchUsers(query) {
  if (query.length < 2) {
    userSuggestions.classList.add("hidden");
    return;
  }

  try {
    const res = await fetch(`${apiBaseUrl}/Users/search?page=1&pageSize=10&query=${encodeURIComponent(query)}`, {
      headers: { "Authorization": `Bearer ${sessionStorage.getItem("accessToken")}` }
    });
    const data = await res.json();

    if (!Array.isArray(data.items)) return;

    userSuggestions.innerHTML = data.items.map(p => `
      <li class="px-3 py-2 hover:bg-gray-100 cursor-pointer flex items-center gap-2" 
          data-id="${p.id}" data-name="${p.fullName}">
        <img src="${p.profilepicture || getAvatarUrl(p.fullName)}" alt="${p.fullName}" class="w-8 h-8 object-cover rounded">
        <div>
          <div class="font-medium">${p.fullName}</div>
          <div class="text-xs text-gray-500">Email: ${p.email} | ${p.phoneNumber}</div>
        </div>
      </li>
    `).join("");

    userSuggestions.classList.remove("hidden");

    [...userSuggestions.querySelectorAll("li")].forEach(li => {
      li.addEventListener("click", () => {
        userSearch.value = li.dataset.name;
        hiddenUserId.value = li.dataset.id;
        userSuggestions.classList.add("hidden");
        currentPage = 1;
        currentMode = "searchByUser";
        fetchByCurrentMode();
      });
    });

  } catch (err) {
    console.error("User search error", err);
  }
}

userSearch.addEventListener("input", debounce(e => {
  fetchUsers(e.target.value.trim());
}, 800)); 



 
function getAvatarUrl(name) {
  return `https://ui-avatars.com/api/?name=${encodeURIComponent(name)}&background=0D8ABC&color=fff&size=128&rounded=true`;
}


document.addEventListener("DOMContentLoaded",async () => {
  await loadUserGrowth();
  await loadStockTrend();
  await loadComplaintsChart();
  await loadHeatmap();
  fetchByCurrentMode();
 document.querySelector('#reports-sidebar-link').classList.add("bg-blue-800");
});



 