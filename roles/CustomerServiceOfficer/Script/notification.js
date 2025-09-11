 
   let apiBaseUrl = "https://localhost:7124/api/v1";

    const apiBase = "https://localhost:7124/api/v1/Notifications";
    const token = sessionStorage.getItem("accessToken");


  const connection = new signalR.HubConnectionBuilder()
    .withUrl("https://localhost:7124/hubs/notificationHub", {
      accessTokenFactory: () =>  token
    })
    .withAutomaticReconnect()
    .build();

 const markAllBtn = document.getElementById("markAllBtn");

  function renderNotificationCard(notification) {
    const card = document.createElement("div");
    card.className = `border p-4 rounded-lg shadow-sm transition flex justify-between items-start ${
      notification.isRead ? "border-gray-300 bg-gray-50" : "border-blue-500 bg-white"
    }`;
    card.id = `notification-${notification.id}`;

    card.innerHTML = `
      <div>
        <h3 class="font-semibold ${notification.isRead ? "text-gray-600" : "text-blue-600"}">
          ${notification.title}
        </h3>
        <p class="text-sm text-gray-700">${notification.message}</p>
        <span class="text-xs text-gray-500">${new Date(notification.timestamp).toLocaleString()}</span>
      </div>
      ${
        notification.isRead
          ? ""
          : `<button data-id="${notification.id}" 
               class="markBtn ml-4 px-2 py-1 text-xs bg-blue-600 text-white rounded hover:bg-blue-700">
               Mark as Read
             </button>`
      }
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
      card.classList.remove("border-blue-500", "bg-white");
      card.classList.add("border-gray-300", "bg-gray-50");

      const title = card.querySelector("h3");
      if (title) {
        title.classList.remove("text-blue-600");
        title.classList.add("text-gray-600");
      }

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
    const response = await fetch(`${apiBase}/recipient/paged?Page=1&PageSize=20`, {
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
    countUnread();
  });

  connection.on("NotificationMarkedAsRead", ({ notificationId }) => {
    updateNotificationCard(notificationId);
    countUnread();
  });

  connection.on("AllNotificationsMarkedAsRead", () => {
    document.querySelectorAll("[id^='notification-']").forEach(card => {
      updateNotificationCard(card.id.replace("notification-", ""));
      countUnread();
    });
  });

  connection.start().then(() => {
    console.log("SignalR connected.");
    loadNotifications();
    countUnread();
  }).catch(err => console.error(err));


async function countUnread(){
   const response = await fetch(`${apiBase}/recipient/count-unread`, {
    headers: {
      "Authorization": `Bearer ${token}`
    }
  });
  const data = await response.json();
  const unreadCount = document.getElementById("unreadCount");
  unreadCount.textContent = data.data;
}

