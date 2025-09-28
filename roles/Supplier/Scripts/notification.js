
const apiBaseUrl = "https://localhost:7124/api/v1";

const token = sessionStorage.getItem("accessToken");
dayjs.extend(dayjs_plugin_relativeTime);

  const connection = new signalR.HubConnectionBuilder()
    .withUrl("https://localhost:7124/hubs/notificationHub", {
      accessTokenFactory: () =>  token
    })
    .withAutomaticReconnect()
    .build();

const colorMap = {
  info: {
    read: "bg-blue-50 border-blue-500",
    unread: "bg-blue-100 border-blue-600"
  },
  success: {
    read: "bg-green-50 border-green-500",
    unread: "bg-green-100 border-green-600"
  },
  warning: {
    read: "bg-yellow-50 border-yellow-500",
    unread: "bg-yellow-100 border-yellow-600"
  },
  error: {
    read: "bg-red-50 border-red-500",
    unread: "bg-red-100 border-red-600"
  }
};

const mapBtn = {
    info: "text-blue-600",
    success: "text-green-600",
    warning: "text-yellow-600",
    error: "text-red-600"
}


 const markAllBtn = document.getElementById("markAllAsRead");

  function renderNotificationCard(notification) {
    const card = document.createElement("div");
    const type = colorMap[notification.type] ? notification.type : "info";
    const state = notification.isRead ? "read" : "unread";
   const timeAgo = dayjs(notification.timestamp).fromNow();

  card.className = `${colorMap[type][state]} border-l-4 p-4 rounded shadow`;

    card.id = `notification-${notification.id}`;

    card.innerHTML = `
       <div class="flex justify-between items-center">
            <h3 class="font-semibold text-gray-800">${notification.title}</h3>
            <span class="text-sm text-gray-500">${timeAgo} ago</span>
          </div>
          <p class="text-gray-700">${notification.message}</p>
          <button class=" ${notification.isRead ? 'hidden disabled' : ''} markBtn mt-2 text-sm ${mapBtn[type]} hover:underline">Mark as read</button>
        </div>
    `;
    const btn = card.querySelector(".markBtn");
    if (btn) {
      btn.addEventListener("click", () => markAsRead(notification.id));
    }
    return card;
  }

  
  function updateNotificationCard(notificationId) {
    const card = document.getElementById(`notification-${notificationId}`);
    if (card) {
      const type = colorMap[notification.type] ? notification.type : "info";
      const state = "read";
      card.className = `${colorMap[type][state]} border-l-4 p-4 rounded shadow`;

      
      const btn = card.querySelector(".markBtn");
      if (btn) btn.remove();
    }
  }

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
    const list = document.getElementById("notificationsList");
    list.innerHTML = "";
    data.data.items.forEach(notification => {
      list.appendChild(renderNotificationCard(notification));
    });
  }

  connection.on("ReceiveNotification", (notification) => {
    const list = document.getElementById("notificationsList");
    list.prepend(renderNotificationCard(notification));
    document.querySelector("#notificationSound").play();
    loadUnreadNotifications();
  });

  connection.on("NotificationMarkedAsRead", ({ notificationId }) => {
    updateNotificationCard(notificationId);
    loadUnreadNotifications();
  });

  connection.on("AllNotificationsMarkedAsRead", () => {
    document.querySelectorAll("[id^='notification-']").forEach(card => {
      updateNotificationCard(card.id.replace("notification-", ""));
      loadUnreadNotifications();
    });
  });

  connection.start().then(() => {
    console.log("SignalR connected.");
    loadNotifications();
    loadUnreadNotifications();
  }).catch(err => console.error(err));

 