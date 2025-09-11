let apiBaseUrl = "https://localhost:7124/api/v1";

async function loadChatThreadStats() {
    try {
        const response = await fetch(`${apiBaseUrl}/ChatThreads/stats`, {
            headers: {
                "Authorization": `Bearer ${sessionStorage.getItem("accessToken")}`,
                "Content-Type": "application/json"
            }
        });

        if (!response.ok) throw new Error("Failed to fetch chat stats");

        const data = await response.json();
        const stats = data.data;

        document.getElementById("openThreads").textContent = stats.openThreads;
        document.getElementById("inProgressThreads").textContent = stats.inProgressThreads;
        document.getElementById("closedThreads").textContent = stats.closedThreads;
        document.getElementById("totalThreads").textContent = stats.totalThreads;
    } catch (err) {
        console.error(err);
        Swal.fire({
            icon: 'error',
            title: 'Error',
            text: 'Unable to load chat thread statistics.'
        });
    }
}

loadChatThreadStats();



async function loadChatThreads() {
    try {
        const openResponse = await fetch(`${apiBaseUrl}/ChatThreads/status/Open?page=1&pageSize=10`, {
            headers: { "Authorization": `Bearer ${sessionStorage.getItem("accessToken")}` }
        });
        const openData = await openResponse.json();

        const assignedResponse = await fetch(`${apiBaseUrl}/ChatThreads/assigned?page=1&pageSize=15`, {
            headers: { "Authorization": `Bearer ${sessionStorage.getItem("accessToken")}` }
        });
        const assignedData = await assignedResponse.json();

        const threads = [
            ...assignedData.data.items.map(t => ({ ...t, type: 'inprogress' })),
            ...openData.data.items.map(t => ({ ...t, type: 'open' }))
        ];

        renderChatThreadsTable(threads);
    } catch (err) {
        console.error(err);
        Swal.fire({
            icon: 'error',
            title: 'Error',
            text: 'Unable to load chat threads.'
        });
    }
}

function renderChatThreadsTable(threads) {
    const tbody = document.getElementById("chatThreadList");
    tbody.innerHTML = "";

    threads.forEach(thread => {
        const tr = document.createElement("tr");
        tr.classList.add("border-b");

        tr.innerHTML = `
            <td class="p-3"><img src='${getAvatarUrl(thread.createdBy)}' alt='${thread.createdBy}' class='w-10 h-10 rounded-full'></td>
            <td class="p-3">${thread.createdBy}</td>
            <td class="p-3">${new Date(thread.createdAt).toLocaleString()}</td>
            <td class="p-3">${thread.status}</td>
            <td class="p-3">
                ${thread.type === 'open'
                    ? `<button onclick="joinThread('${thread.id}')" class="px-3 py-1 bg-green-600 text-white rounded hover:bg-green-700">Join</button>`
                    : `<button onclick="continueThread('${thread.id}')" class="px-3 py-1 bg-blue-600 text-white rounded hover:bg-blue-700">Continue</button>`}
            </td>
        `;
        tbody.appendChild(tr);
    });
}

function joinThread(threadId) {
  assignAgent(threadId, getCurrentUserId());
}



function continueThread(threadId) {  
  const url = new URL("/roles/CustomerServiceOfficer/chatmessage.html", window.location.origin);
  url.searchParams.set("threadId", threadId);
  console.log(url.toString());
  window.location.href = url.toString();
}

function getAvatarUrl(name) {
  return `https://ui-avatars.com/api/?name=${encodeURIComponent(name)}&background=0D8ABC&color=fff&size=128&rounded=true`;
}
loadChatThreads();

function getAccessToken() {
  return sessionStorage.getItem("accessToken");
}

function parseJwt(token) {
  try {
    const base64Url = token.split(".")[1];
    const base64 = base64Url.replace(/-/g, "+").replace(/_/g, "/");
    const jsonPayload = decodeURIComponent(
      atob(base64)
        .split("")
        .map(c => "%" + ("00" + c.charCodeAt(0).toString(16)).slice(-2))
        .join("")
    );
    return JSON.parse(jsonPayload);
  } catch (e) {
    console.error("Error parsing JWT:", e);
    return null;
  }
}

function getCurrentUserId() {
  const token = getAccessToken();
  if (!token) return null;

  const payload = parseJwt(token);
  return payload ? payload["nameid"] || payload["http://schemas.xmlsoap.org/ws/2005/05/identity/claims/nameidentifier"] : null;
}


async function assignAgent(threadId, agentId) {

  const confirm = await Swal.fire({
    title: 'Assign Agent?',
    text: "Are you sure you want to assign this agent to the chat thread?",
    icon: 'question',
    showCancelButton: true,
    confirmButtonText: 'Yes, assign',
    cancelButtonText: 'Cancel',
  });

  if (!confirm.isConfirmed) return;

  try {
    const res = await fetch(`${apiBaseUrl}/ChatThreads/${threadId}/assign/${agentId}`, {
      method: 'PUT',
      headers: {
        'Authorization': `Bearer ${sessionStorage.getItem('accessToken')}`,
        'Content-Type': 'application/json'
      }
    });

    const data = await res.json();

    if (res.ok) {
      Swal.fire({
        title: 'Assigned!',
        text: data.message || 'Agent has been assigned successfully.',
        icon: 'success'
      });
      continueThread(threadId);
      return true;
    } else {
      Swal.fire({
        title: 'Failed!',
        text: data.message || 'Could not assign agent.',
        icon: 'error'
      });
      return false;
    }

  } catch (err) {
    Swal.fire({
      title: 'Error!',
      text: err.message || 'Something went wrong.',
      icon: 'error'
    });
    return false;
  } 
}

