async function initHeader() {
const btn = document.getElementById('menu-btn');
const menu = document.getElementById('mobile-menu');


btn.addEventListener('click', () => {
  menu.classList.toggle('hidden');
});

// async function () {
  const user = await currentUser();

  if (user) {
    isLoggedIn = true;
    console.log("✅ Logged in user:", user);

    renderUserUI(user);
  } else {
    isLoggedIn = false;
    console.log("❌ Not logged in");

    renderGuestUI();
  }

  setupDropdowns();
  getCartCount(isLoggedIn);
//};


function renderUserUI(user) {
  const authSection = document.getElementById("auth-section");
  const userMenuBtnMobile = document.getElementById("userMenuBtnMobile");
  const userMenuDropdownMobile = document.getElementById("userMenuDropdownMobile");
  let userDropdownDesktop = `
      <div class="relative" id="user-menu-desktop">
        <button id="userMenuBtnDesktop" class="flex items-center gap-2 focus:outline-none">
          <img src="${user.profilepicture ?? "https://i.pravatar.cc/40"}" alt="User" class="rounded-full w-10 h-10 border-2 border-white">
          <span class="font-medium">Hi, ${user.fullName.split(" ")[0]} 👋</span>
          <svg class="w-4 h-4 text-white transition-transform" id="userMenuArrowDesktop"
              xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7" />
          </svg>
        </button>
        <div id="userMenuDropdownDesktop" class="absolute right-0 mt-2 w-48 bg-white text-gray-800 rounded-xl shadow-lg hidden">
          <a href="/roles/Customer/Pages/Profile.html" class="block px-4 py-2 hover:bg-gray-100">Profile</a>
          <a href="/roles/Customer/Pages/wishlist.html" class="block px-4 py-2 hover:bg-gray-100">Wishlist</a>
          <a href="/roles/Customer/Pages/notifications.html" class="block px-4 py-2 hover:bg-gray-100">Notifications</a>
          <a href="orders.html" class="block px-4 py-2 hover:bg-gray-100">Orders</a>
          <a href="/roles/Customer/Pages/customersSupport.html" class="block px-4 py-2 hover:bg-gray-100">Help</a>
          <button onclick="logout()" class="w-full text-left px-4 py-2 text-red-500 hover:bg-gray-100">Logout</button>
        </div>
      </div>
      <a href="/general/Cart.html" id="cart-icon" class="relative bg-white text-black px-3 py-1 rounded-lg shadow hover:bg-gray-200">
        🛒 Cart
        <span id="cart-count-desktop" class="absolute -top-2 -right-2 bg-red-600 text-white text-xs font-bold px-2 py-0.5 rounded-full">0</span>
      </a>
    `;
     
    userMenuBtnMobile.innerHTML = `<img src="${user.profilepicture ?? "https://i.pravatar.cc/40"}" alt="User" class="rounded-full w-8 h-8 border-2 border-white">
          <span class="font-medium">Hi, ${user.fullName.split(" ")[0]} 👋</span>
          <svg class="w-4 h-4 text-white transition-transform" id="userMenuArrowDesktop"
              xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7" />
          </svg>
           <a href="/general/Cart.html" id="cart-icon" class="relative bg-white text-black px-3 py-1 rounded-lg shadow hover:bg-gray-200">
        🛒 Cart
        <span id="cart-count-mobile" class="absolute -top-2 -right-2 bg-red-600 text-white text-xs font-bold px-2 py-0.5 rounded-full">0</span>
      </a>
          `
     
    userMenuDropdownMobile.innerHTML = `
          <a href="/roles/Customer/Pages/Profile.html" class="block px-4 py-2 hover:bg-gray-100">Profile</a>
          <a href="/roles/Customer/Pages/wishlist.html" class="block px-4 py-2 hover:bg-gray-100">Wishlist</a>
          <a href="/roles/Customer/Pages/notifications.html" class="block px-4 py-2 hover:bg-gray-100">Notifications</a>
          <a href="orders.html" class="block px-4 py-2 hover:bg-gray-100">Orders</a>
          <a href="/roles/Customer/Pages/customersSupport.html" class="block px-4 py-2 hover:bg-gray-100">Help</a>
          <button onclick="logout()" class="w-full text-left px-4 py-2 text-red-500 hover:bg-gray-100">Logout</button>`;
    

    authSection.innerHTML = userDropdownDesktop;
 
}

function renderGuestUI() {
  const authSection = document.getElementById("auth-section");
  const userMenuBtnMobile = document.getElementById("userMenuBtnMobile");

  let guestLinks = `
    <nav class="flex items-center gap-2">
  <a href="/general/Products.htm"
     class="inline-flex items-center gap-2 rounded-full px-3 py-1.5 text-sm
            bg-blue-600 text-white shadow hover:bg-blue-700 transition">
    🛒 <span>Back to Products</span>
  </a>

  <a href="/general/login.html"
     class="inline-flex items-center gap-2 rounded-full px-3 py-1.5 text-sm
            border border-blue-200 text-blue-700 bg-white hover:bg-blue-50 transition">
    <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" viewBox="0 0 24 24" fill="currentColor">
      <path d="M12 12c2.21 0 4-1.79 4-4S14.21 4 12 4 8 5.79 8 8s1.79 4 4 4Zm0 2c-3.31 0-6 2.02-6 4.5V20h12v-1.5c0-2.48-2.69-4.5-6-4.5Z"/>
    </svg>
    <span>Login</span>
  </a>
</nav>

    <a href="/general/Cart.html" id="cart-icon" class="relative bg-white text-black px-3 py-1 rounded-lg shadow hover:bg-gray-200">
        🛒 Cart
        <span id="cart-count-mobile" class="cart-count absolute -top-2 -right-2 bg-red-600 text-white text-xs font-bold px-2 py-0.5 rounded-full">0</span>
      </a>
  `;
  authSection.innerHTML = guestLinks;
  userMenuBtnMobile.innerHTML = guestLinks;
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

function logout() {
  alert("Logging out...");
  window.location.href = "/general/login.html";
  sessionStorage.clear();
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
})

};

const colors = [
  "bg-blue-100",
  "bg-pink-100",
  "bg-yellow-100",
  "bg-purple-100",
  "bg-green-100",
  "bg-indigo-100",
  "bg-red-100"
];



document.addEventListener("DOMContentLoaded",async () => {

 await loadCategories();
const allCategoriesBtn = document.getElementById("allCategoriesBtn");
const allCategoriesList = document.getElementById("all-categories");

allCategoriesBtn.addEventListener("mouseenter", () => {
  allCategoriesList.classList.remove("hidden");
});
allCategoriesBtn.addEventListener("mouseleave", () => {
  setTimeout(() => {
    if (!allCategoriesList.matches(":hover")) {
      allCategoriesList.classList.add("hidden");
    }
  }, 200);
});
allCategoriesList.addEventListener("mouseleave", () => {
  allCategoriesList.classList.add("hidden");
});

document.getElementById("mobile-categories-btn").addEventListener("click", () => {
    document.getElementById("mobile-menu-cat").classList.remove("-translate-x-full");
  });
  document.getElementById("close-mobile").addEventListener("click", () => {
    document.getElementById("mobile-menu-cat").classList.add("-translate-x-full");
  });

});


function createFlyoutItem(category) {
  const li = document.createElement("li");
  li.className = "relative group";
  console.log(category.subCategories.length);
  li.innerHTML = `
    <a href="/general/category.html?id=${encodeURIComponent(category.id)}"
       class="flex justify-between items-center px-3 py-2 hover:bg-blue-100 rounded-md">
       <span>${category.icon || "📦"} ${category.name}</span>
       ${category.subCategories?.length ? "▶" : ""}
    </a>
  `;

  if (category.subCategories?.length) {
    const subUl = document.createElement("ul");
    subUl.className =
      "absolute left-full top-0 hidden group-hover:block bg-white shadow-lg rounded-md w-56 z-50";
    console.log(category.name)
    category.subCategories.forEach(child => subUl.appendChild(createFlyoutItem(child)));
    li.appendChild(subUl);
  }
  return li;
}

function createAccordionItem(category) {
  const li = document.createElement("li");
  li.innerHTML = `
    <div class="flex justify-between items-center">
      <a href="/general/category.html?id=${encodeURIComponent(category.id)}"
         class="block py-2">${category.icon || "📦"} ${category.name}</a>
      ${category.subCategories?.length ? `<button class="toggle">+</button>` : ""}
    </div>
    <ul class="ml-4 hidden"></ul>
  `;
  const toggleBtn = li.querySelector(".toggle");
  if (toggleBtn) {
    const subUl = li.querySelector("ul");
    category.subCategories.forEach(child => subUl.appendChild(createAccordionItem(child)));

    toggleBtn.addEventListener("click", () => {
      subUl.classList.toggle("hidden");
      toggleBtn.textContent = subUl.classList.contains("hidden") ? "+" : "-";
    });
  }
  return li;
}


async function loadCategories() {
  try {
    const res = await fetch("https://localhost:7124/api/v1/Categories/tree");
    const categories = await res.json();

    try {
      const allCategoriesList = document.getElementById("all-categories");
      const mobileCategoriesList = document.getElementById("mobile-categories");

      if (!allCategoriesList || !mobileCategoriesList) {
        throw new Error("Category containers not found in DOM");
      }

      console.log("Categories loaded:", categories);
      allCategoriesList.innerHTML = "";
      mobileCategoriesList.innerHTML = "";

      categories.data.forEach(cat => {
        allCategoriesList.appendChild(createFlyoutItem(cat));
      });

      categories.data.forEach(cat => {
        mobileCategoriesList.appendChild(createAccordionItem(cat));
      });
    } catch (domErr) {
      console.error("Error rendering categories:", domErr);
    }

  } catch (err) {
    console.error("Error loading categories:", err);
  }
}


let getCartCount = async (isLoggedIn) => {
  try {
    let response;
    let access = sessionStorage.getItem("accessToken");
    console.log("Access Token:", access);

    if (isLoggedIn) {
      response = await fetch(`https://localhost:7124/api/v1/Carts/current?Page=0&PageSize=0`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${access}`
        }
      });
    } else {
      response = await fetch(`https://localhost:7124/api/v1/Carts/session?Page=0&PageSize=0`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json"
        },
        credentials: "include"
      });
    }

    const data = await response.json();
    console.log("Cart Data:", data);
    console.log("Total Quantity:", data?.data?.totalQuantity ?? 0);

    const cartCountDesktop = document.getElementById('cart-count-desktop');
    const cartCountMobile = document.getElementById('cart-count-mobile');
    const cart = document.querySelectorAll('.cart-count');
     


    const totalQty = data?.data?.totalQuantity;
    console.log(cart)
    if(cart.length > 0){
      cart.forEach(item => item.textContent = totalQty)
    }
    if (cartCountDesktop) {
      cartCountDesktop.textContent = totalQty;
    }
    if (cartCountMobile) {
      cartCountMobile.textContent = totalQty;
    }

  } catch (err) {
    console.error("Cart fetch failed:", err);
    const cartCountDesktop = document.getElementById("cart-count-desktop");
    const cartCountMobile = document.getElementById("cart-count-mobile");
    if (cartCountDesktop) cartCountDesktop.textContent = 0;
    if (cartCountMobile) cartCountMobile.textContent = 0;
  }
};

let currentUser = async () => {
  const token = sessionStorage.getItem("accessToken");
  if (!token || token === "undefined" || token === null) {
    console.log("No token found, user is not logged in.");
    sessionStorage.removeItem("accessToken"); 
    isLoggedIn = false;
    return null;
  }

  const response = await fetch(`https://localhost:7124/api/v1/Users/me`, {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
      "Authorization": `Bearer ${token}`
    }
  });

  try {
    const data = await response.json();

    if (!response.ok) {
      console.log(data.message || "Unauthorized");
      sessionStorage.removeItem("accessToken"); 
      return null;
    }

    return data.data;
  } catch (err) {
    console.error("Failed to fetch current user:", err);
    sessionStorage.removeItem("accessToken"); 
    return null;
  }
};
