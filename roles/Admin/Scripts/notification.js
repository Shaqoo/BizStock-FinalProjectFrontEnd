
document.addEventListener("DOMContentLoaded",async () =>{
    document.querySelector('#dashboardTitle').textContent = "Notifications"
    //document.querySelector('#profilePreview').src = sessionStorage.getItem("pic");
    document.querySelector('#notifications-sidebar-link').classList.add("bg-blue-800");
})

const dropdown = document.getElementById("customDropdown");
const options = document.getElementById("dropdownOptions");
const selected = document.getElementById("selectedType");

dropdown.addEventListener("click", () => options.classList.toggle("hidden"));

options.querySelectorAll("li").forEach(opt => {
  opt.addEventListener("click", () => {
    selected.innerHTML = opt.innerHTML;  
    selected.dataset.value = opt.dataset.value;
    options.classList.add("hidden");
  });
});

document.addEventListener("click", (e) => {
  if (!dropdown.contains(e.target)) options.classList.add("hidden");
});


let notifications = [
  // { id: 1, title: "Server Maintenance", message: "Server will be down at 10 PM", type: "info", timestamp: new Date(), isRead: false },
  // { id: 2, title: "New User Registered", message: "Jane Doe has registered.", type: "success", timestamp: new Date(), isRead: true },
  // { id: 3, title: "Order #1234", message: "Order #1234 has been delivered.", type: "success", timestamp: new Date(), isRead: false },
  // { id: 4, title: "System Update", message: "Version 2.0 has been deployed.", type: "info", timestamp: new Date(), isRead: true },
  // { id: 5, title: "Password Reset", message: "User John requested a password reset.", type: "warning", timestamp: new Date(), isRead: false }
];


const typeColors = { info: "text-blue-500", success: "text-green-500", warning: "text-yellow-500", error: "text-red-500" };

function renderNotifications() {
  const list = document.getElementById("notificationList");
  list.innerHTML = "";
  notifications.forEach(n => {
    const li = document.createElement("li");
    li.className = `flex items-start p-3 rounded border ${n.isRead ? "bg-gray-100" : "bg-white"} shadow hover:shadow-md transition`;
    li.innerHTML = `
      <span class="material-icons ${typeColors[n.type] || "text-gray-500"} mr-3">notifications</span>
      <div class="flex-1">
        <p class="font-semibold">${n.title}</p>
        <p class="text-gray-700">${n.message}</p>
        <span class="text-xs text-gray-400">${n.timestamp.toLocaleString()}</span>
      </div>
      <button class="ml-3 text-sm text-blue-500 hover:underline" onclick="markAsRead('${n.id}')">${n.isRead ? "Read" : "Mark as Read"}</button>
    `;
    list.appendChild(li);
  });
}

 

document.getElementById("notifTarget").addEventListener("change", (e) => {
  document.getElementById("specificUserDiv").classList.toggle("hidden", e.target.value !== "specific");
});

document.getElementById("notificationForm").addEventListener("submit",async (e) => {
  e.preventDefault();
  const title = document.getElementById("notifTitle").value;
  const message = document.getElementById("notifMessage").value;
  const target = document.getElementById("notifTarget").value;
  const userId = document.getElementById("specificUserId").value;
  const type = selected.dataset.value;
 
   if (!title || !message || !type) {
    Swal.fire({ icon: "warning", title: "Missing Fields", text: "Title and message are required." });
    return;
  }

  const request = { title, message, type};

  let url = "";
  if (target === "specific" && userId) {
  request.userId = userId;
  url = `${apiBaseUrl}/Notifications/send/user`;
} else if (target.startsWith("role-")) {
  const role = target.split("-")[1];
  request.role = role;
  url = `${apiBaseUrl}/Notifications/send/role`;
 } else {
    Swal.fire({ icon: "error", title: "Invalid Target", text: "Please select a valid target." });
    return;
  }

  try {
    const response = await fetch(url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${sessionStorage.getItem("accessToken")}`
      },
      body: JSON.stringify(request)
    });

    const result = await response.json();

    if (response.ok) {
      Swal.fire({ icon: "success", title: "Notification Sent", text: result.message || "Successfully sent!" });
    } else {
      Swal.fire({ icon: "error", title: "Error", text: result.message || "Failed to send notification." });
    }
  } catch (err) {
    Swal.fire({ icon: "error", title: "Unexpected Error", text: err.message });
  }
  e.target.reset();
});






const apiBaseUrl = "https://localhost:7124/api/v1";

async function loadUnreadNotifications() {
    const notifications = document.getElementById("unreadCount");
    try {
        const response = await fetch(`${apiBaseUrl}/Notifications/recipient/count-unread`, {
    headers: {
      "Authorization": `Bearer ${sessionStorage.getItem("accessToken")}`
    }
  });
    const data = await response.json();
    notifications.textContent = data.data;
    } catch (error) {
        console.error("Error fetching notification count:", error);
        notifications.textContent = 0;
    }
}

const token = sessionStorage.getItem("accessToken");


const connection = new signalR.HubConnectionBuilder()
.withUrl("https://localhost:7124/hubs/notificationHub", {
    accessTokenFactory: () =>  token
})
.withAutomaticReconnect()
.build();




 const markAllBtn = document.getElementById("markAllAsRead");

  
async function markAsRead(notificationId) {
    await fetch(`https://localhost:7124/api/v1/Notifications/mark-as-read/${notificationId}`, {
      method: "PUT",
      headers: {
        "Authorization": `Bearer ${sessionStorage.getItem("accessToken")}`,
        "Content-Type": "application/json"
      }
    });
  }

markAllBtn.addEventListener("click", async () => {
    await fetch("https://localhost:7124/api/v1/Notifications/mark-all-as-read", {
      method: "PUT",
      headers: {
        "Authorization": `Bearer ${sessionStorage.getItem("accessToken")}`
      }
    });
    
  });

  async function loadNotifications() {
    const response = await fetch(`${apiBaseUrl}/Notifications/recipient/paged?Page=1&PageSize=20`, {
      headers: {
        "Authorization": `Bearer ${token}`
      }
    });
    const data = await response.json();
    notifications = data.data.items.map(notification => ({
    ...notification,
    timestamp: new Date(notification.timestamp),
    }));
   renderNotifications();
   
  }

connection.on("ReceiveNotification", (notification) => {
    const newNotif = {
        id: notification.id,
        title: notification.title,
        message: notification.message,
        type: notification.type,
        timestamp: new Date(notification.timestamp),
        isRead: notification.isRead ?? false
    };
    notifications.unshift(newNotif);
    renderNotifications();
    loadUnreadNotifications();
    console.log("Notification received:", newNotif);
    document.querySelector("#notificationSound").play();
});


  connection.on("NotificationMarkedAsRead", ({ notificationId }) => {
    const notif = notifications.find(n => n.id == notificationId);
    if (notif) notif.isRead = true;
    renderNotifications();
    loadUnreadNotifications();
    console.log("Notification marked as read");
  });

connection.on("AllNotificationsMarkedAsRead", () => {
  notifications.forEach(n => n.isRead = true);
  renderNotifications();
  loadUnreadNotifications();
  console.log("All notifications marked as read");
});

  connection.start().then(() => {
    console.log("SignalR connected.");
    
    loadNotifications();
    loadUnreadNotifications();
  }).catch(err => console.error(err));

 
function debounce(fn, delay = 300) {
  let timeout;
  return (...args) => {
    clearTimeout(timeout);
    timeout = setTimeout(() => fn(...args), delay);
  };
}

const userSearch = document.getElementById("userSearch");
const userSuggestions = document.getElementById("userSuggestions");
const hiddenUserId = document.getElementById("specificUserId");

async function fetchProducts(query) {
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
      });
    });

  } catch (err) {
    console.error("User search error", err);
  }
}

userSearch.addEventListener("input", debounce(e => {
  fetchProducts(e.target.value.trim());
}, 800)); 


function getAvatarUrl(name) {
  return `https://ui-avatars.com/api/?name=${encodeURIComponent(name)}&background=0D8ABC&color=fff&size=128&rounded=true`;
}