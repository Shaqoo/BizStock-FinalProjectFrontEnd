 function initHeader() {
const btn = document.getElementById('menu-btn');
const menu = document.getElementById('mobile-menu');


btn.addEventListener('click', () => {
  menu.classList.toggle('hidden');
});

let isLoggedIn = true;
let user = {
  name: "Shaqo",
  profilePic: "https://i.pravatar.cc/40"
};

window.onload = function () {
  const authSection = document.getElementById("auth-section");
  const userMenuBtnMobile = document.getElementById("userMenuBtnMobile");
  const userMenuDropdownMobile = document.getElementById("userMenuDropdownMobile");
  

  if (isLoggedIn) {
    let userDropdownDesktop = `
      <div class="relative" id="user-menu-desktop">
        <button id="userMenuBtnDesktop" class="flex items-center gap-2 focus:outline-none">
          <img src="${user.profilePic}" alt="User" class="rounded-full w-10 h-10 border-2 border-white">
          <span class="font-medium">Hi, ${user.name} 👋</span>
          <svg class="w-4 h-4 text-white transition-transform" id="userMenuArrowDesktop"
              xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7" />
          </svg>
        </button>
        <div id="userMenuDropdownDesktop" class="absolute right-0 mt-2 w-48 bg-white text-gray-800 rounded-xl shadow-lg hidden">
          <a href="profile.html" class="block px-4 py-2 hover:bg-gray-100">Profile</a>
          <a href="wishlist.html" class="block px-4 py-2 hover:bg-gray-100">Wishlist</a>
          <a href="notifications.html" class="block px-4 py-2 hover:bg-gray-100">Notifications</a>
          <a href="orders.html" class="block px-4 py-2 hover:bg-gray-100">Orders</a>
          <a href="help.html" class="block px-4 py-2 hover:bg-gray-100">Help</a>
          <button onclick="logout()" class="w-full text-left px-4 py-2 text-red-500 hover:bg-gray-100">Logout</button>
        </div>
      </div>
      <a href="cart.html" class="relative bg-white text-black px-3 py-1 rounded-lg shadow hover:bg-gray-200">
        🛒 Cart
        <span class="absolute -top-2 -right-2 bg-red-600 text-white text-xs font-bold px-2 py-0.5 rounded-full">0</span>
      </a>
    `;
     
    userMenuBtnMobile.innerHTML = `<img src="${user.profilePic}" alt="User" class="rounded-full w-8 h-8 border-2 border-white">
          <span class="font-medium">Hi, ${user.name}</span>
          <svg class="w-4 h-4 text-white transition-transform" id="userMenuArrowDesktop"
              xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7" />
          </svg>
          `
     
    userMenuDropdownMobile.innerHTML = `
          <a href="profile.html" class="block px-4 py-2 hover:bg-gray-100">Profile</a>
          <a href="wishlist.html" class="block px-4 py-2 hover:bg-gray-100">Wishlist</a>
          <a href="notifications.html" class="block px-4 py-2 hover:bg-gray-100">Notifications</a>
          <a href="orders.html" class="block px-4 py-2 hover:bg-gray-100">Orders</a>
          <a href="help.html" class="block px-4 py-2 hover:bg-gray-100">Help</a>
          <button onclick="logout()" class="w-full text-left px-4 py-2 text-red-500 hover:bg-gray-100">Logout</button>`;
    

    authSection.innerHTML = userDropdownDesktop;
  } else {
    let guestLinks = `
      <a href="Products.htm" class="text-white font-medium hover:underline">Back to Products</a>
      <a href="login.html" class="font-medium hover:underline">Login</a>
      <a href="register.html" class="font-medium hover:underline">Register</a>
    `;
    authSection.innerHTML = guestLinks;
  }

  setupDropdowns();
};

function logout() {
  alert("Logging out...");
  location.reload();
}

function setupDropdowns() {
  ["Desktop", "Mobile"].forEach((type) => {
    const btn = document.getElementById(`userMenuBtn${type}`);
    const dropdown = document.getElementById(`userMenuDropdown${type}`);
    const arrow = document.getElementById(`userMenuArrow${type}`);

    if (btn && dropdown) {
      btn.addEventListener("click", (e) => {
        e.stopPropagation();
        dropdown.classList.toggle("hidden");
        if (arrow) arrow.classList.toggle("rotate-180");
      });

      document.addEventListener("click", (e) => {
        if (!btn.contains(e.target) && !dropdown.contains(e.target)) {
          dropdown.classList.add("hidden");
          if (arrow) arrow.classList.remove("rotate-180");
        }
      });
    }
  });
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


const searchBox = document.querySelector("#search-box");
  const suggestionsDiv = document.getElementById("suggestions");

searchBox.addEventListener("input", async () => {
  const query = searchBox.value.trim();

  if (query.length < 2) { 
    suggestionsDiv.classList.add("hidden");
    suggestionsDiv.innerHTML = "";
    return;
  }

  try {
    const response = await fetch(`https://localhost:7124/api/v1/Products/search-suggestions?keyword=${encodeURIComponent(query)}`);
    const suggestions = await response.json();
    console.log(suggestions);

    if (!suggestions.data || suggestions.data.length === 0) {
      suggestionsDiv.classList.add("hidden");
      suggestionsDiv.innerHTML = "";
      return;
    }

    suggestionsDiv.innerHTML = suggestions.data
      .map(s => `<div class="p-2 hover:bg-blue-500 cursor-pointer">${s}</div>`)
      .join("");

    suggestionsDiv.classList.remove("hidden");

    Array.from(suggestionsDiv.children).forEach(suggestion => {
      suggestion.addEventListener("click", () => {
        searchBox.value = suggestion.textContent;
        suggestionsDiv.classList.add("hidden");
        window.location.href = `search.html?query=${encodeURIComponent(suggestion.textContent)}`;
      });
    });
  } catch (error) {
    console.error("Error fetching products:", error);
  }
});

  document.getElementById("search-btn").addEventListener("click", () => {
  const query = document.getElementById("search-box").value.trim();
  if(query) {
    window.location.href = `search.html?query=${encodeURIComponent(query)}`;
  }
});

document.getElementById("search-btn-mobile").addEventListener("click", () => {
  const query = document.getElementById("search-box-mobile").value.trim();
  if(query) {
    window.location.href = `search.html?query=${encodeURIComponent(query)}`;
  }
});


  const searchBoxMobile = document.querySelector("#search-box-mobile");
  const suggestionsDivMobile = document.getElementById("suggestions-mobile");

searchBoxMobile.addEventListener("input", async () => {
  const query = searchBoxMobile.value.trim();

  if (query.length < 2) { 
    suggestionsDivMobile.classList.add("hidden");
    suggestionsDivMobile.innerHTML = "";
    return;
  }

  try {
    const response = await fetch(`https://localhost:7124/api/v1/Products/search-suggestions?keyword=${encodeURIComponent(query)}`);
    const suggestions = await response.json();
    console.log(suggestions);

    if (!suggestions.data || suggestions.data.length === 0) {
      suggestionsDivMobile.classList.add("hidden");
      suggestionsDivMobile.innerHTML = "";
      return;
    }

    suggestionsDivMobile.innerHTML = suggestions.data
      .map(s => `<div class="p-2 hover:bg-blue-500 cursor-pointer">${s}</div>`)
      .join("");

    suggestionsDivMobile.classList.remove("hidden");

    Array.from(suggestionsDivMobile.children).forEach(suggestion => {
      suggestion.addEventListener("click", () => {
        searchBoxMobile.value = suggestion.textContent;
        suggestionsDivMobile.classList.add("hidden");
        window.location.href = `search.html?query=${encodeURIComponent(suggestion.textContent)}`;
      });
    });
  } catch (error) {
    console.error("Error fetching products:", error);
  }
})};


