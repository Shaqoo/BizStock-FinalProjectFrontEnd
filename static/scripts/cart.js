
const itemsPerPage = 8;
let currentPage = 1;
const apiBaseUrl = "https://localhost:7124/api/v1";
const cartCount = document.getElementById('cart-count-desktop');
const cartCount2 = document.getElementById('cart-count-mobile');
let totalPages = "";




async function renderCart() {
  console.log("Rendering cart...");
  const cartContainer = document.getElementById("cart-items");

  const paginatedItems = await getCart(currentPage,itemsPerPage);

 cartContainer.innerHTML = ""; 
if (paginatedItems.items.items.length === 0) {
  cartContainer.innerHTML = `
    <div class="text-center py-10 text-gray-500">
      <p class="text-lg font-medium">🛒 Your cart is empty.</p>
      <p class="text-sm mt-2">Start adding products to see them here.</p>
    </div>
  `;
} else {
  paginatedItems.items.items.forEach(item => {
    cartContainer.insertAdjacentHTML("beforeend", `
  <div class="flex items-center justify-between bg-gray-50 p-4 rounded-xl shadow-sm">
    <img src="${item.productImg}" alt="${item.productName}" class="w-20 h-20 object-contain rounded-lg">

    <div class="flex-1 ml-4">
      <h4 class="font-semibold text-lg">${item.productName}</h4>
      <p class="text-gray-600">Unit: $${item.unitPrice.toLocaleString()}</p>
      <p class="text-gray-800 font-medium">Total: $${item.subTotal.toLocaleString()}</p>
    </div>

    <div class="flex items-center gap-2">
    <button class="px-3 py-1 bg-blue-500 text-white rounded-md hover:bg-blue-600"
      onclick="decreaseQuantity('${item.productId}', '${item.cartId}')">-</button>
    <span id="${item.productId}-quantity" class="px-2 font-medium">${item.quantity}</span>
    <button class="px-3 py-1 bg-blue-500 text-white rounded-md hover:bg-blue-600"
      onclick="updateQuantity('${item.productId}')">+</button>
  </div>

<button class="ml-4 text-red-500 hover:text-red-700"
        onclick="removeProduct('${item.cartId}', '${item.productId}')"
        title="Remove item">
  <i class="fas fa-trash-alt"></i>
</button>
`);

  });
}
  document.getElementById("total-price").innerText = paginatedItems.totalPrice.toLocaleString();

  totalPages = paginatedItems.items.totalPages;

  document.getElementById("pageInfo").innerText = `Page ${currentPage} of ${totalPages == 0 ? 1 : totalPages}`;
}

function updateQuantity(id) {
  cartAddition(id);
}

function decreaseQuantity(id,cartId) {
  decreaseItem(id,cartId);
}

function removeProduct(cartId,id) {
  removeItem(cartId,id)
  renderCart();
}

document.getElementById("prevPage").addEventListener("click", () => {
  if (currentPage > 1) {
    currentPage--;
    renderCart();
  }
});

document.getElementById("nextPage").addEventListener("click", () => {
  if (currentPage < totalPages) {
    currentPage++;
    renderCart();
  }
});

document.addEventListener("DOMContentLoaded", renderCart);



let getCart = async (page, pageSize) => {
  try {
    let url = `https://localhost:7124/api/v1/Carts/session?Page=${page}&PageSize=${pageSize}`;
    let accessToken = sessionStorage.getItem("accessToken");
    const headers = new Headers();
    headers.append("Content-Type", "application/json");

    let fetchOptions = {
      method: "GET",
      headers: headers,
    };
    var user = await currentUser();
    if (user !== null) {
      headers.append("Authorization", `Bearer ${accessToken}`);
      url = `https://localhost:7124/api/v1/Carts/current?Page=${page}&PageSize=${pageSize}`;
    } else {
      fetchOptions.credentials = "include";
    }

    console.log("Fetching cart from:", url);

    const response = await fetch(url, fetchOptions);
    const data = await response.json();

    if (!response.ok) {
      console.error("❌ Failed to fetch cart:", data.message || data);
      return null;
    }

    console.log("✅ Cart Data:", data);
    return data?.data ?? null;

  } catch (err) {
    console.error("⚠️ getCart error:", err);
    return null;
  }
};


async function cartAddition(productId) {
  let accessToken = sessionStorage.getItem("accessToken");
  const headers = new Headers();
  headers.append("Content-Type", "application/json");
  if (accessToken) {
    headers.append("Authorization", `Bearer ${accessToken}`);
  }

  try {
    const res = await fetch(`${apiBaseUrl}/Carts/item`, {
      method: "POST",
      headers: headers,
      credentials: "include",
      body: JSON.stringify({
        productId: productId,
        quantity: 1,
        cartId: null
      })
    });

    const data = await res.json();
    console.log(data);
    console.log(cartCount)
    console.log(cartCount2)
    if(cartCount){
      cartCount.innerText = data.data.totalQuantity;
    }
    if(cartCount2){
      cartCount2.innerText = data.data.totalQuantity;
    }
    const cart = document.querySelectorAll('.cart-count');
    console.log(cart)
     
    if(cart.length > 0){
      cart.forEach(item => item.textContent = data.data.totalQuantity)
    }
    console.log(data.data.totalQuantity)

    const el = document.getElementById(`${productId}-quantity`);
    let currentQty = parseInt(el.innerText) || 0;
    let newQty = currentQty + 1;
    el.innerText = newQty;
    if (data.isSuccess) {
      Swal.fire({
        icon: 'success',
        title: 'Product Added',
        text: 'The product was added to your cart successfully.',
        timer: 2000,
        showConfirmButton: false
      });
      return data.data.totalQuantity;

    } else {
      Swal.fire({
        icon: 'error',
        title: 'Failed to Add',
        text: data.message || 'Failed to add product to cart.',
        timer: 2000,
        showConfirmButton: false
      });
    }

  } catch (err) {
    console.error(err);
    Swal.fire({
      icon: 'error',
      title: 'Error',
      text: 'An unexpected error occurred. Please try again.',
      timer: 2000,
      showConfirmButton: false
    });
  }
}


async function decreaseItem(productId,cartId) {
  let accessToken = sessionStorage.getItem("accessToken");
  const headers = new Headers();
  headers.append("Content-Type", "application/json");
  if (accessToken) {
    headers.append("Authorization", `Bearer ${accessToken}`);
  }

  try {
    const res = await fetch(`${apiBaseUrl}/Carts/item/decrease`, {
      method: "PATCH",
      headers: headers,
      body: JSON.stringify({
        productId: productId,
        quantity: 1,
        cartId: cartId
      })
    });

    const data = await res.json();
    console.log(data);
     if(cartCount){
      cartCount.innerText = data.data.totalQuantity;
    }
    if(cartCount2){
      cartCount2.innerText = data.data.totalQuantity;
    }
    const cart = document.querySelectorAll('.cart-count');
    console.log(cart)
     
    if(cart.length > 0){
      cart.forEach(item => item.textContent = data.data.totalQuantity)
    }
    const el = document.getElementById(`${productId}-quantity`);
    let currentQty = parseInt(el.innerText) || 0;
    let newQty = currentQty - 1;

    el.innerText = newQty < 0 ? 0 : newQty;



     if (data.isSuccess) {
      Swal.fire({
          icon: 'info',
          title: 'Quantity Decreased',
          timer: 1500,
          showConfirmButton: false
        });
      return data.data.totalQuantity;

    } else {
      Swal.fire({
        icon: 'error',
        title: 'Failed to DecreaseItem',
        text: data.message || 'Failed to decrease product in cart.',
        timer: 2000,
        showConfirmButton: false
      });
    }

  } catch (err) {
    console.error(err);
    Swal.fire({
      icon: 'error',
      title: 'Error',
      text: 'An unexpected error occurred. Please try again.',
      timer: 2000,
      showConfirmButton: false
    });
  }
}


let removeItem = async (cartId,productId) => {
  let accessToken = sessionStorage.getItem("accessToken");
  const headers = new Headers();
  headers.append("Content-Type", "application/json");
  if (accessToken) {
    headers.append("Authorization", `Bearer ${accessToken}`);
  }

  try {
    const res = await fetch(`${apiBaseUrl}/Carts/item`, {
      method: "DELETE",
      headers: headers,
      body: JSON.stringify({
        productId: productId,
        cartId: cartId
      })
    });

    const data = await res.json();
    console.log(data);
     if (data.isSuccess) {
        Swal.fire({
          icon: 'success',
          title: 'Item Removed',
          text: 'The item was removed from your cart.',
          timer: 1500,
          showConfirmButton: false
        });
      } else {
        Swal.fire({
          icon: 'error',
          title: 'Failed to Remove Item',
          text: data.message || 'Failed to remove item from cart.',
          timer: 2000,
          showConfirmButton: false
        });
      }

  } catch (err) {
    console.error(err);
    Swal.fire({
      icon: 'error',
      title: 'Error',
      text: 'An unexpected error occurred. Please try again.',
      timer: 2000,
      showConfirmButton: false
    });
  }
}

async function loadRecentlyViewed() {
  let accessToken = sessionStorage.getItem("accessToken");
  const headers = new Headers();
  headers.append("Content-Type", "application/json");
  if (accessToken) {
    headers.append("Authorization", `Bearer ${accessToken}`);
  }

  const recentResponse = await fetch(`${apiBaseUrl}/RecentlyViewedProducts`, {
    method: "GET",
    headers: headers,
    credentials: "include"
});

  const recentlyViewed = await recentResponse.json();
 console.log(recentlyViewed);
  const container = document.querySelector("#recently-viewed-products");

  if(recentlyViewed.data !== null && recentlyViewed.data.items.length > 0)
  {
  const firstFour = recentlyViewed.data.items.slice(0, 4);

  const productFetches = firstFour.map(items => getProduct(items.productId));
  const products = await Promise.all(productFetches)
  console.log(products);

    container.innerHTML = "";
    container.innerHTML += products.map(product => `
    <div class="product-card bg-white rounded-xl shadow p-4">
      <a href="product.html?id=${product.data.id}">
        <img src="${product.data.imageUrl}" alt="${product.data.name}" class="w-full h-40 object-cover rounded-lg">
      </a>
      <h3 class="mt-2 font-semibold text-lg">${product.data.name}</h3>
      <p class="text-gray-500">$${product.data.sellingPrice}</p>
    </div>
  `).join("");

    const seeAllBtn = document.createElement("button");
    seeAllBtn.textContent = "See All";
    seeAllBtn.className = "mt-4 px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600";
    seeAllBtn.onclick = () => window.location.href = "recentlyviewed.html";
    container.appendChild(seeAllBtn);
  }
  else {
      container.innerHTML = `<p class="text-gray-500">No recently viewed products yet.</p>`;
    }
}

loadRecentlyViewed();

const getProduct = async (productId) =>{
  let product = await fetch(`${apiBaseUrl}/Products/by-id/${productId}`);
  return product.json();
}


