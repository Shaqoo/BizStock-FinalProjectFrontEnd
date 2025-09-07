const notificationsList = document.getElementById("notificationsList");
    const unreadCount = document.getElementById("unreadCount");
    const notificationSound = document.getElementById("notificationSound");

    let notifications = [];

    function renderNotifications() {
      notificationsList.innerHTML = "";
      notifications.forEach((n, i) => {
        const li = document.createElement("li");
        li.className = `p-3 cursor-pointer ${n.isRead ? "bg-gray-50" : "bg-blue-50"} hover:bg-gray-100 transition rounded-lg`;
        li.innerHTML = `
          <div class="flex justify-between items-center">
            <div>
              <p class="font-semibold text-blue-600">${n.title}</p>
              <p class="text-xs text-gray-500">${new Date(n.timestamp).toLocaleString()}</p>
            </div>
            <button onclick="markAsRead(${i})" class="text-sm text-white bg-blue-600 hover:bg-blue-500 px-2 py-1 rounded">Mark Read</button>
          </div>
          <div class="hidden mt-2 text-gray-700">${n.message}</div>
        `;
        li.addEventListener("click", () => {
          const details = li.querySelector("div.hidden");
          if (details) details.classList.toggle("hidden");
        });
        notificationsList.appendChild(li);
      });

      unreadCount.textContent = notifications.filter(n => !n.isRead).length;
    }

    async function markAsRead(index) {
        console.log(notifications)
        const notif = notifications[index];
        if (!notif) return;

        try {
            const res = await fetch(`https://localhost:7124/api/v1/Notifications/mark-as-read/${notif.id}`, {
            method: "PUT",
            headers: {
                "Authorization": `Bearer ${sessionStorage.getItem("accessToken")}`,
                "Content-Type": "application/json"
            }
            });
        console.log(await res.json())
        } catch (err) {
            console.error("Failed to mark as read", err);
        }
        }


    document.getElementById("markAllBtn").addEventListener("click", async () => {
    try {
       const res = await fetch("https://localhost:7124/api/v1/Notifications/mark-all-as-read", {
        method: "PUT",
        headers: {
            "Authorization": `Bearer ${sessionStorage.getItem("accessToken")}`,
            "Content-Type": "application/json"
        }
        });
    console.log(await res.json())
    } catch (err) {
        console.error("Failed to mark all as read", err);
    }
    });


   
    const connection = new signalR.HubConnectionBuilder()
      .withUrl("https://localhost:7124/hubs/notificationhub?access_token=" + sessionStorage.getItem("accessToken"))
      .configureLogging(signalR.LogLevel.Information)
      .build();

     
    connection.on("ReceiveNotification", (notification) => {
    notifications.unshift({
        id: notification.id,  
        title: notification.title,
        message: notification.message,
        type: notification.type,
        timestamp: notification.timestamp,
        isRead: notification.isRead
    });
    renderNotifications();
    notificationSound.play();
    });

     
    connection.on("NotificationMarkedAsRead", ({ notificationId }) => {
    const notif = notifications.find(n => n.id === notificationId);
    if (notif) notif.isRead = true;
    renderNotifications();
    });


    connection.on("AllNotificationsMarkedAsRead", () => {
    notifications.forEach(n => n.isRead = true);
    renderNotifications();
    });


    connection.start().catch(err => console.error(err));

    async function loadNotifications() {
      const res = await fetch("https://localhost:7124/api/v1/Notifications/recipient/paged?Page=1&PageSize=10", {
        headers: { "Authorization": `Bearer ${sessionStorage.getItem("accessToken")}` }
      });
      const data = await res.json();
      console.log(data)
      notifications = data.data.items || [];
      renderNotifications();
    }

    loadNotifications();
