let apiBaseUrl = "https://localhost:7124/api/v1";

document.querySelector('#customers').addEventListener('click', () =>{
 window.location.href = '/roles/InventoryManager/customers.html';
});

document.querySelector('#chatthreads').addEventListener('click', () =>{
 window.location.href = '/roles/InventoryManager/chatthread.html';
});

document.querySelector('#notifications').addEventListener('click', () =>{
 window.location.href = '/roles/InventoryManager/notifications.html';
});


async function loadDatas() {
    const openThreadElement = document.getElementById("openThreads");
    const activeCustomersElement = document.getElementById("activeCustomers");
    const pendingOrders = document.querySelector('#pendingOrders');
    const unReadNotifications = document.querySelector('#unreadNotifications');
     try {
        const response = await fetch(`${apiBaseUrl}/ChatThreads/stats`, {
            headers: {
                "Authorization": `Bearer ${sessionStorage.getItem("accessToken")}`,
                "Content-Type": "application/json"
            }
        });

        const response2 = await fetch(`${apiBaseUrl}/Notifications/recipient/count-unread`, {
                headers: {
                "Authorization": `Bearer ${sessionStorage.getItem("accessToken")}`
                }
        });
        const data2 = await response2.json();

        const response3 = await fetch(`${apiBaseUrl}/customers/stats`, {
            method: "GET",
            headers: {
                "Content-Type": "application/json",
                "Authorization": `Bearer ${sessionStorage.getItem("accessToken")}`
            }
        });
        const data3 = await response3.json();

        if (!response.ok){
             openThreadElement.textContent = "0";
             throw new Error("Failed to fetch chat stats");
            }

        const data = await response.json();
        const stats = data.data;

        openThreadElement.textContent = stats.openThreads;
        unReadNotifications.textContent = data2.data;
        activeCustomersElement.textContent = data3.data.verifiedCustomers;
        pendingOrders.textContent = data3.data.totalOrders;
    } catch (err) {
        console.error(err);
        openThreadElement.textContent = "0";
    }

}

document.addEventListener("DOMContentLoaded", () => {
    loadDatas();
});