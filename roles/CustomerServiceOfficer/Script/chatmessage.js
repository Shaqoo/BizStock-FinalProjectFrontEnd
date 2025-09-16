let apiBaseUrl = "https://localhost:7124/api/v1";

const textarea = document.getElementById("messageInput");
    textarea.addEventListener("input", () => {
      textarea.style.height = "auto";
      textarea.style.height = (textarea.scrollHeight) + "px";
    });

function initWaveform(msg) {
  setTimeout(() => {
    const container = document.getElementById(`waveform-${msg.id}`);
    if (!container) return;

    const wavesurfer = WaveSurfer.create({
      container,
      waveColor: '#cfe0fc',      
      progressColor: '#1d4ed8',  
      cursorColor: '#2563eb',     
      height: 15,
      barWidth: 50,
      responsive: true,
    });


    wavesurfer.load(msg.audioUrl);

    const playBtn = container.parentNode.querySelector('.play-btn');
    const durationEl = document.getElementById(`duration-${msg.id}`);

      wavesurfer.on('ready', () => {
      const total = Math.floor(wavesurfer.getDuration());
      durationEl.textContent = formatTime(total);
    });

    wavesurfer.on('audioprocess', () => {
      const current = Math.floor(wavesurfer.getCurrentTime());
      currentTimeEl.textContent = formatTime(current);
    });


    playBtn.addEventListener('click', () => {
      if (wavesurfer.isPlaying()) {
        wavesurfer.pause();
        playBtn.textContent = '▶';  
      } else {
        wavesurfer.play();
        playBtn.textContent = '⏸';   
      }
    });

    wavesurfer.on('finish', () => {
      playBtn.textContent = '▶';
    });
  }, 0);
}

function formatTime(seconds) {
  const mins = Math.floor(seconds / 60);
  const secs = Math.floor(seconds % 60);
  return `${String(mins).padStart(2, "0")}:${String(secs).padStart(2, "0")}`;
}


  const chatMessages = document.getElementById("chat-messages");
  const sendBtn = document.getElementById("sendBtn");

  const urlParams = new URLSearchParams(window.location.search);
  const threadId = urlParams.get("threadId");

  if (!threadId) {
    Swal.fire({
      icon: "error",
      title: "No Thread",
      text: "Chat thread not found!",
    }).then(() => {
      window.location.href = "/"; 
    });
  }



  let pageNumber = 1;
  const pageSize = 20;
  let hasMore = true;
  let isLoading = false;

chatMessages.addEventListener("scroll", async () => {
  if (chatMessages.scrollTop === 0 && hasMore && !isLoading) {
    isLoading = true;
    pageNumber++;
    await loadOlderMessages(threadId);
    isLoading = false;
  }
});

async function loadOlderMessages(threadId) {
  try {
    const res = await fetch(
    `${apiBaseUrl}/ChatMessages/thread/${threadId}?Page=${pageNumber}&PageSize=${pageSize}`,
    {
      headers: {
        "Authorization": `Bearer ${sessionStorage.getItem("accessToken")}`,
        "Content-Type": "application/json"
      }
    }
);

    console.log(pageNumber)
    if (!res.ok) throw new Error("Failed to load messages");

    const data = await res.json();
    console.log(data);

    if (data && data.data.totalCount > 0) {
      const oldHeight = chatMessages.scrollHeight;

      renderOldMessages(data.data.items);

      chatMessages.scrollTop = chatMessages.scrollHeight - oldHeight;

      hasMore = data.data.hasNextPage;
    }
  } catch (err) {
    console.error("Error loading older messages:", err);
  }
}
const msgSound = document.querySelector('#messageSound');
  loadOlderMessages(threadId);
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


  const connection = new signalR.HubConnectionBuilder()
    .withUrl("https://localhost:7124/hubs/chatmessagehub", { accessTokenFactory: () => sessionStorage.getItem("accessToken") })
    .build();

  connection.on("ReceiveMessage", (message) => {
    renderNewMessage(message);
    msgSound.play();
  });

connection.on("MessageRead", (data) => {
  const msgDiv = document.querySelector(`[data-id="${data.messageId}"]`);
  if (msgDiv) {
    const status = msgDiv.querySelector(".message-status");
    if (status) {
      status.textContent = "✔✔"; 
      status.style.color = "green";
    }
  }
  console.log("Message read:", data);
});

 connection.on("MessageReactionReceived", (data) => {
    messageSound.play();
  console.log("Reaction received:", data);

  const msgDiv = document.querySelector(`[data-id="${data.messageId}"]`);
  if (!msgDiv) return;

  const bubble = msgDiv.querySelector(".message-bubble");
  if (!bubble) return;

  let reactionsContainer = bubble.querySelector(".reactions-container");
  if (!reactionsContainer) {
    reactionsContainer = document.createElement("div");
    reactionsContainer.className = "reactions-container flex space-x-1 mt-1 text-sm";
    bubble.appendChild(reactionsContainer);
  }


  const oldReaction = reactionsContainer.querySelector(`[data-user-id="${data.userId}"]`);
  if (oldReaction) {
    if (oldReaction.dataset.emoji === data.emoji) return;

    oldReaction.textContent = data.emoji;
    oldReaction.dataset.emoji = data.emoji;
    return;
  }

  
  const emojiEl = document.createElement("span");
  emojiEl.dataset.emoji = data.emoji;
  emojiEl.dataset.userId = data.userId;
  emojiEl.className = "bg-gray-200 rounded-full px-1";
  emojiEl.textContent = data.emoji;
  emojiEl.style.cursor = "pointer";
  emojiEl.title = data.userId == getCurrentUserId() ? "You" : "Customer Service Officer";

  reactionsContainer.appendChild(emojiEl);
});
  async function startConnection() {
    try {
      await connection.start();
      await connection.invoke("JoinThread", threadId);
    } catch (err) {
      console.error("SignalR Connection Error: ", err);
      setTimeout(startConnection, 5000);  
    }
  }

  startConnection();

let lastMessageDate = null;

function formatDay(date) {
  const today = new Date();
  const yesterday = new Date();
  yesterday.setDate(today.getDate() - 1);

  if (date.toDateString() === today.toDateString()) return "Today";
  if (date.toDateString() === yesterday.toDateString()) return "Yesterday";

  return date.toLocaleDateString([], { month: "short", day: "numeric", year: "numeric" });
}


function renderNewMessage(msg) {
  const msgDate = new Date(msg.sentAt);
  const msgDay = formatDay(msgDate);

  if (lastMessageDate !== msgDay) {
    const dayDiv = document.createElement("div");
    dayDiv.className = "text-center my-3";
    dayDiv.innerHTML = `<span class="bg-gray-300 text-gray-700 text-xs px-3 py-1 rounded-full">${msgDay}</span>`;
    chatMessages.appendChild(dayDiv);
    lastMessageDate = msgDay;
  }

  const div = buildMessageDiv(msg, msgDate);
  chatMessages.appendChild(div);
  chatMessages.scrollTop = chatMessages.scrollHeight;
}

function renderOldMessages(items) {
  const fragment = document.createDocumentFragment();

  items.forEach(msg => {
    const msgDate = new Date(msg.sentAt);
    const msgDay = formatDay(msgDate);
   
    if (lastMessageDate !== msgDay) {
      const dayDiv = document.createElement("div");
      dayDiv.className = "text-center my-3";
      dayDiv.innerHTML = `<span class="bg-gray-300 text-gray-700 text-xs px-3 py-1 rounded-full">${msgDay}</span>`;
      fragment.prepend(dayDiv);
      lastMessageDate = msgDay;
    }
  
     
    const div = buildMessageDiv(msg, msgDate);
    fragment.prepend(div);
  });

  chatMessages.prepend(fragment);
}


function buildMessageDiv(msg, msgDate) {
  const isMe = msg.senderId == getCurrentUserId();
  const time = msgDate.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });

  const div = document.createElement("div");
  div.dataset.id = msg.id;
  div.className = "relative"; 

  if (msg.audioUrl) {
    initWaveform(msg);
  }

  if (!isMe) {
    if(!msg.isRead){
      markAsRead(msg.id);
    }
    div.className += " flex items-start space-x-2";
    div.innerHTML = `
      <img src="${getAvatarUrl(msg.senderName)}" alt="CSO" class="w-8 h-8 rounded-full">
      <div class="bg-gray-100 p-3 rounded-2xl shadow max-w-xs message-bubble">
        ${msg.message ? `<p class="text-sm text-gray-800">${msg.message}</p>` : ""}
        ${msg.pictureUrl ? `<img src="${msg.pictureUrl}" class="mt-2 rounded-lg max-w-[200px]">` : ""}
        ${
          msg.audioUrl
            ? `
          <div class="flex items-center space-x-2 mt-2">
            <button class="play-btn text-blue-500 w-8 h-8 flex items-center justify-center">▶</button>
            <div id="waveform-${msg.id}" class="flex-1"></div>
            <span id="duration-${msg.id}" class="text-xs text-gray-600"></span>
          </div>
        `
            : ""
        }
        <span class="text-xs text-gray-400 block mt-1">${msg.senderName} • ${time}</span>
      </div>
    `;
  } else {
    div.className += " flex items-start justify-end space-x-2";
    div.innerHTML = `
      <div class="bg-blue-500 text-white p-3 rounded-2xl shadow max-w-xs message-bubble">
        ${msg.message ? `<p class="text-sm">${msg.message}</p>` : ""}
        ${msg.pictureUrl ? `<img src="${msg.pictureUrl}" class="mt-2 rounded-lg max-w-[200px]">` : ""}
        ${
          msg.audioUrl
            ? `
          <div class="flex items-center space-x-2 mt-2">
            <button class="play-btn text-white w-8 h-8 flex items-center justify-center">▶</button>
            <div id="waveform-${msg.id}" class="flex-1"></div>
            <span id="duration-${msg.id}" class="text-xs text-white"></span>
          </div>
        `
            : ""
        }
        <span class="text-xs text-blue-100 block mt-1">
          ${!msg.senderName ? "Customer" : msg.senderName} • ${time}
          <span class="message-status">${isMe ? (msg.isRead ? "✔✔" : "✔") : ""}</span>
        </span>
      </div>
      <img src="${getAvatarUrl(msg.senderName)}" alt="You" class="w-8 h-8 rounded-full">
    `;
  }

  const bubble = div.querySelector(".message-bubble");

  if(msg.reactions.length > 0){
    const reactionsContainer = document.createElement("div");
  reactionsContainer.className = "reactions-container flex space-x-1 mt-1 text-sm";

  msg.reactions.forEach(r => {
    const emojiEl = document.createElement("span");
    emojiEl.dataset.emoji = r.emoji;
    emojiEl.className = "bg-gray-200 rounded-full px-1";
    emojiEl.textContent = `${r.emoji}`;
    emojiEl.style.cursor = "pointer";
    emojiEl.title = r.userId == getCurrentUserId() ? "You" : "Customer";
    reactionsContainer.appendChild(emojiEl);
  });

  bubble.appendChild(reactionsContainer);
  }

  bubble.addEventListener("click", (e) => {
    e.stopPropagation();
    showMessageActions(bubble, msg.id);
  });

  return div;
}




function showMessageActions(messageEl, messageId) {
   
  const existing = messageEl.querySelector(".message-actions-dropdown");
  if (existing) {
    existing.remove();
    return; 
  }

  const menu = document.createElement("div");
  menu.className = "message-actions-dropdown bg-white shadow rounded-lg p-2 flex items-center space-x-2 mt-1";


  const reactBtn = document.createElement("button");
  reactBtn.textContent = "😀";
  reactBtn.className = "text-lg";
  reactBtn.onclick = () => {
    menu.remove();
    showEmojiPicker(messageEl, messageId); 
  };


  const replyBtn = document.createElement("button");
  replyBtn.textContent = "↩️";
  replyBtn.className = "text-lg";
  replyBtn.style.color = "black";
  replyBtn.onclick = () => {
    menu.remove();
    setReplyingTo(messageId);
  };

  menu.appendChild(reactBtn);
  menu.appendChild(replyBtn);

   const handleClickOutside = (e) => {
    if (!messageEl.contains(e.target)) {
      menu.remove();
      document.removeEventListener("click", handleClickOutside);
    }
  };

  document.addEventListener("click", handleClickOutside);

  messageEl.appendChild(menu);
}

const emojis = ["😀","😂","😍","😎","😢","😡","👍","👎","🙏","👏","🎉","🔥","💯","❤️","🥰","🤔","🤯","😴","🙌","🤝"];
function showEmojiPicker(messageEl, messageId) {
  const existing = messageEl.querySelector(".message-actions-dropdown");
  if (existing) {
    existing.remove();
    return; 
  }
  document.querySelectorAll(".emoji-picker").forEach(p => p.remove());

  const picker = document.createElement("div");
  picker.className = "emoji-picker absolute bg-white shadow rounded-lg p-2 grid grid-cols-5 gap-2 z-50";

  emojis.forEach(emoji => {
    const btn = document.createElement("button");
    btn.textContent = emoji;
    btn.className = "text-xl";
    btn.onclick = () => {
      picker.remove();
      reactToMessage(messageId, emoji);
    };
    picker.appendChild(btn);
  });

  picker.style.top = `${messageEl.offsetHeight + 4}px`;
 

  messageEl.appendChild(picker);

  const handleClickOutside = (e) => {
    if (!messageEl.contains(e.target)) {
      picker.remove();
      document.removeEventListener("click", handleClickOutside);
    }
  };

  document.addEventListener("click", handleClickOutside);
}



async function reactToMessage(messageId, emoji) {
  await fetch(`${apiBaseUrl}/ChatMessages/react`, {
    method: "POST",
    headers: {
      "Authorization": `Bearer ${sessionStorage.getItem("accessToken")}`,
      "Content-Type": "application/json"
    },
    body: JSON.stringify({ messageId, emoji })
  });
}


function getAvatarUrl(name) {
  return `https://ui-avatars.com/api/?name=${encodeURIComponent(name)}&background=0D8ABC&color=fff&size=128&rounded=true`;
}



const previewArea = document.getElementById("previewArea");
const messageInput = document.getElementById("messageInput");
const imageBtn = document.getElementById("imageBtn");
const imageInput = document.getElementById("imageInput");
const audioBtn = document.getElementById("audioBtn");
const recordingControls = document.getElementById("recordingControls");
const recordingTimer = document.getElementById("recordingTimer");
const stopRecordingBtn = document.getElementById("stopRecordingBtn");
const deleteRecordingBtn = document.getElementById("deleteRecordingBtn");

let mediaRecorder;
let audioChunks = [];
let recordingInterval;
let seconds = 0;
let recordedBlob = null;


function createPreviewElement(contentEl, type) {
  const wrapper = document.createElement("div");
  wrapper.className =
    type === "audio"
      ? "relative w-full bg-gray-100 p-2 rounded-lg"
      : "relative inline-block";

  const closeBtn = document.createElement("button");
  closeBtn.innerHTML = "✕";
  closeBtn.className =
    "absolute -top-2 -right-2 bg-gray-700 text-white text-xs rounded-full px-1";
  closeBtn.onclick = () => {
    wrapper.remove();
    if (type === "image") imageInput.value = "";
    if (type === "audio") recordedBlob = null;
    if (previewArea.children.length === 0) previewArea.classList.add("hidden");
    updateSendButtonState();
  };

  wrapper.appendChild(contentEl);
  wrapper.appendChild(closeBtn);
  return wrapper;
}


function updateSendButtonState() {
  const hasText = messageInput.value.trim().length > 0;
  const hasImage = imageInput.files.length > 0;
  const hasAudio = !!recordedBlob;

  if (hasText || hasImage || hasAudio) {
    sendBtn.disabled = false;
    sendBtn.classList.remove("cursor-not-allowed");
  } else {
    sendBtn.disabled = true;
    sendBtn.classList.add("cursor-not-allowed");
  }
}

function showPreview(element, type) {
  previewArea.classList.remove("hidden");
  previewArea.innerHTML = ""; 
  previewArea.appendChild(createPreviewElement(element, type));
  updateSendButtonState();
}


function clearPreviews() {
  previewArea.innerHTML = "";
  previewArea.classList.add("hidden");
  imageInput.value = "";
  recordedBlob = null;
  updateSendButtonState();
}


imageBtn.addEventListener("click", () => imageInput.click());

imageInput.addEventListener("change", () => {
  if (imageInput.files[0]) {
    const img = document.createElement("img");
    img.src = URL.createObjectURL(imageInput.files[0]);
    img.className = "max-h-40 rounded-lg border";
    showPreview(img, "image");
  }
});


audioBtn.addEventListener("click", async () => {
  if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
    alert("Audio recording not supported in this browser.");
    return;
  }

  const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
  mediaRecorder = new MediaRecorder(stream);
  audioChunks = [];
  seconds = 0;

  mediaRecorder.start();
  recordingControls.classList.remove("hidden");
  audioBtn.classList.add("hidden");

  recordingInterval = setInterval(() => {
    seconds++;
    recordingTimer.textContent = `${Math.floor(seconds / 60)}:${String(seconds % 60).padStart(2, "0")}`;
  }, 1000);

  mediaRecorder.ondataavailable = e => audioChunks.push(e.data);

  mediaRecorder.onstop = () => {
    recordedBlob = new Blob(audioChunks, { type: "audio/webm" });

    const audioEl = document.createElement("audio");
    audioEl.controls = true;
    audioEl.src = URL.createObjectURL(recordedBlob);
    audioEl.className = "w-full";
    showPreview(audioEl, "audio");
    recordingControls.classList.add("hidden");
    audioBtn.classList.remove("hidden");
  };
});

stopRecordingBtn.addEventListener("click", () => {
  clearInterval(recordingInterval);
  mediaRecorder.stop();
});

deleteRecordingBtn.addEventListener("click", () => {
  clearInterval(recordingInterval);
  mediaRecorder.stop();
  recordedBlob = null;
  recordingControls.classList.add("hidden");
  audioBtn.classList.remove("hidden");
  clearPreviews();
});


messageInput.addEventListener("input", updateSendButtonState);

sendBtn.addEventListener("click", async () => {
  if (sendBtn.disabled) return; 

  const formData = new FormData();
  formData.append("ChatThreadId", threadId);

  if (messageInput.value.trim()) formData.append("Message", messageInput.value);
  if (imageInput.files[0]) formData.append("Picture", imageInput.files[0]);
  if (recordedBlob) {
    formData.append("Audio", new File([recordedBlob], "recording.webm", { type: "audio/webm" }));
  }

  try {
    const res = await fetch(`${apiBaseUrl}/ChatMessages`, {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${sessionStorage.getItem("accessToken")}`
      },
      body: formData
    });
    const result = await res.json();
    
     if (!result.isSuccess && result.message == "Cannot send message to a closed thread.") {
      sendBtn.style.display = "none";
      document.querySelector('#messageBar').style.display = "none";

      Swal.fire({
        title: 'Cannot send',
        text: result.message,
        icon: 'error'
      });

      return;
    }

    if (!result.isSuccess) {
      console.error("Message send failed:", result.message);
    }
    console.log(result);
    messageInput.value = "";
    clearPreviews();
    updateSendButtonState();
  } catch (err) {
    console.error("Error sending message:", err);
  }
});




 const closeBtn = document.getElementById("closeChatBtn");
  closeBtn.addEventListener("click", async () => {
    const result = await Swal.fire({
      title: 'Close Chat?',
      text: "Are you sure you want to close this chat?",
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#d33',
      cancelButtonColor: '#3085d6',
      confirmButtonText: 'Yes, close it!',
      cancelButtonText: 'Cancel'
    });

    if (result.isConfirmed) {
      try {
        const response = await fetch(`${apiBaseUrl}/ChatThreads/${threadId}/close`, {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${sessionStorage.getItem("accessToken")}`
          }
        });

        const data = await response.json();

        if (response.ok) {
          Swal.fire({
            title: 'Closed!',
            text: data.data || 'Chat closed successfully.',
            icon: 'success',
            timer: 2000,
            showConfirmButton: false
          });
 

        } else {
          Swal.fire({
            title: 'Failed',
            text: data.message || 'Failed to close chat.',
            icon: 'error'
          });
        }
      } catch (err) {
        console.error(err);
        Swal.fire({
          title: 'Error',
          text: 'An error occurred while closing the chat.',
          icon: 'error'
        });
      }
    }
  });


async function markAsRead(messageId) {
  try {
    await fetch(`${apiBaseUrl}/ChatMessages/${messageId}/read`, {
      method: "PATCH",
      headers: {
        "Authorization": `Bearer ${sessionStorage.getItem("accessToken")}`,
        "Content-Type": "application/json"
      }
    });
  } catch (err) {
    console.error("Failed to mark as read", err);
  }
}