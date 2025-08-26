let cartCount = localStorage.getItem("cartCount") || 0;
  const cartCountSpan = document.getElementById("cart-count");
  const cartIcon = cartCountSpan.closest("a");
  const cartSound = document.getElementById("cart-sound");

  cartCountSpan.innerText = cartCount;

  function addToCart() {
    const button = event.target;
    const productCard = button.closest(".product-card");
    const img = productCard.querySelector("img");

    const imgClone = img.cloneNode(true);
    const imgRect = img.getBoundingClientRect();
    const cartRect = cartIcon.getBoundingClientRect();

    imgClone.classList.add("flying-img");
    imgClone.style.width = "50px";      
    imgClone.style.height = "50px";
    imgClone.style.left = imgRect.left + "px";
    imgClone.style.top = imgRect.top + "px";
    document.body.appendChild(imgClone);

    const deltaX = cartRect.left - imgRect.left;
    const deltaY = cartRect.top - imgRect.top;

    requestAnimationFrame(() => {
      imgClone.style.transform = `translate(${deltaX}px, ${deltaY}px) scale(0.3)`;
      imgClone.style.opacity = "0";
    });

    setTimeout(() => {
      imgClone.remove();
      cartIcon.classList.add("bump");
      cartSound.play();
      setTimeout(() => cartIcon.classList.remove("bump"), 400);
    }, 700);
    cartCount++;
    cartCountSpan.innerText = cartCount;
    cartCountSpan.classList.add("cart-count-animate");

 
setTimeout(() => {
  cartCountSpan.classList.remove("cart-count-animate");
}, 400);

    localStorage.setItem("cartCount", cartCount);
    cartCountSpan.innerText = cartCount;
  }

  const categoryBtns = document.querySelectorAll(".category-btn");
  const products = document.querySelectorAll(".product-card");

  categoryBtns.forEach(btn => {
    btn.addEventListener("click", () => {
      const category = btn.dataset.category;
      products.forEach(prod => {
        prod.style.display = (category === "all" || prod.dataset.category === category) ? "block" : "none";
      });
    });
  });

  const chatToggle = document.getElementById('chat-toggle');
  const chatWindow = document.getElementById('chat-window');
  const chatClose = document.getElementById('chat-close');
  const chatForm = document.getElementById('chat-form');
  const chatInput = document.getElementById('chat-input');
  const chatBody = document.getElementById('chat-body');
  const sound = document.getElementById('chat-sound');
 
  chatToggle.addEventListener('click', () => {
    chatWindow.style.display = "block"
    if (!chatWindow.classList.contains('hidden')) {
      chatInput.focus();
    }
  });

  chatClose.addEventListener('click', () => {
    chatWindow.style.display = "none"
  });

  
  chatForm.addEventListener('submit', function (e) {
    e.preventDefault();
    const message = chatInput.value.trim();
    if (message === "") return;

    
    addMessage(message, 'user');
    chatInput.value = "";
    
    const typing = document.createElement('div');
  typing.classList.add('chat-message', 'bot');
  typing.innerHTML = `
    <div class="typing-indicator">
      <div class="dot"></div>
      <div class="dot"></div>
      <div class="dot"></div>
    </div>
  `;
  chatBody.appendChild(typing);
  chatBody.scrollTop = chatBody.scrollHeight;
     
      setTimeout(() => {
    typing.remove();

    const botText = "I'm your helpful assistant. How can I help?";
    addMessage(botText, 'bot');
    speakBotMessage(botText); 
  }, 1500);
  });

  function speakBotMessage(text) {
  if (!window.speechSynthesis) return;  

  const utterance = new SpeechSynthesisUtterance(text);
  utterance.lang = 'en-US'; 

  const voices = window.speechSynthesis.getVoices();
  const preferredVoice = voices.find(voice => voice.name.includes('Google') || voice.name.includes('Microsoft'));
  if (preferredVoice) {
    utterance.voice = preferredVoice;
  }

  window.speechSynthesis.cancel(); 
  window.speechSynthesis.speak(utterance);
}


  function addMessage(text, sender) {
    const msg = document.createElement('div');
    msg.classList.add('chat-message', sender);
    msg.textContent = text;
    chatBody.appendChild(msg);
    chatBody.scrollTop = chatBody.scrollHeight;
    sound.currentTime = 0;
    sound.play();
  }
