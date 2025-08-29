
  function initAi(){
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
  }};