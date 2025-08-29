
let cart = [
//   { id: 1, name: "Product 1", price: 50, quantity: 1, image: "/Favicon/Favicon.jpg" },
//   { id: 2, name: "Product 2", price: 30, quantity: 2, image: "/Favicon/Favicon.jpg" },
//   { id: 3, name: "Product 3", price: 20, quantity: 1, image: "/Favicon/Favicon.jpg" },
//   { id: 4, name: "Product 4", price: 60, quantity: 1, image: "/Favicon/Favicon.jpg" },
//   { id: 5, name: "Product 5", price: 40, quantity: 1, image: "/Favicon/Favicon.jpg" },
//   { id: 1, name: "Product 1", price: 50, quantity: 1, image: "/Favicon/Favicon.jpg" },
//   { id: 2, name: "Product 2", price: 30, quantity: 2, image: "/Favicon/Favicon.jpg" },
//   { id: 3, name: "Product 3", price: 20, quantity: 1, image: "/Favicon/Favicon.jpg" },
//   { id: 4, name: "Product 4", price: 60, quantity: 1, image: "/Favicon/Favicon.jpg" },
//   { id: 5, name: "Product 5", price: 40, quantity: 1, image: "/Favicon/Favicon.jpg" },
//   { id: 1, name: "Product 1", price: 50, quantity: 1, image: "/Favicon/Favicon.jpg" },
//   { id: 2, name: "Product 2", price: 30, quantity: 2, image: "/Favicon/Favicon.jpg" },
//   { id: 3, name: "Product 3", price: 20, quantity: 1, image: "/Favicon/Favicon.jpg" },
//   { id: 4, name: "Product 4", price: 60, quantity: 1, image: "/Favicon/Favicon.jpg" },
//   { id: 5, name: "Product 5", price: 40, quantity: 1, image: "/Favicon/Favicon.jpg" },
//   { id: 1, name: "Product 1", price: 50, quantity: 1, image: "/Favicon/Favicon.jpg" },
//   { id: 2, name: "Product 2", price: 30, quantity: 2, image: "/Favicon/Favicon.jpg" },
//   { id: 3, name: "Product 3", price: 20, quantity: 1, image: "/Favicon/Favicon.jpg" },
//   { id: 4, name: "Product 4", price: 60, quantity: 1, image: "/Favicon/Favicon.jpg" },
//   { id: 5, name: "Product 5", price: 40, quantity: 1, image: "/Favicon/Favicon.jpg" },
//   { id: 1, name: "Product 1", price: 50, quantity: 1, image: "/Favicon/Favicon.jpg" },
//   { id: 2, name: "Product 2", price: 30, quantity: 2, image: "/Favicon/Favicon.jpg" },
//   { id: 3, name: "Product 3", price: 20, quantity: 1, image: "/Favicon/Favicon.jpg" },
//   { id: 4, name: "Product 4", price: 60, quantity: 1, image: "/Favicon/Favicon.jpg" },
//   { id: 5, name: "Product 5", price: 40, quantity: 1, image: "/Favicon/Favicon.jpg" },
//   { id: 1, name: "Product 1", price: 50, quantity: 1, image: "/Favicon/Favicon.jpg" },
//   { id: 2, name: "Product 2", price: 30, quantity: 2, image: "/Favicon/Favicon.jpg" },
//   { id: 3, name: "Product 3", price: 20, quantity: 1, image: "/Favicon/Favicon.jpg" },
//   { id: 4, name: "Product 4", price: 60, quantity: 1, image: "/Favicon/Favicon.jpg" },
//   { id: 5, name: "Product 5", price: 40, quantity: 1, image: "/Favicon/Favicon.jpg" },
  
];

const itemsPerPage = 5;
let currentPage = 1;

function renderCart() {
  const cartContainer = document.getElementById("cart-items");

  let start = (currentPage - 1) * itemsPerPage;
  let end = start + itemsPerPage;
  let paginatedItems = cart.slice(start, end);

 cartContainer.innerHTML = ""; 
if (paginatedItems.length === 0) {
  cartContainer.innerHTML = `
    <div class="text-center py-10 text-gray-500">
      <p class="text-lg font-medium">🛒 Your cart is empty.</p>
      <p class="text-sm mt-2">Start adding products to see them here.</p>
    </div>
  `;
} else {
  paginatedItems.forEach(item => {
    cartContainer.insertAdjacentHTML("beforeend", `
      <div class="flex items-center justify-between bg-gray-50 p-4 rounded-xl shadow-sm">
        <img src="${item.image}" alt="${item.name}" class="w-20 h-20 object-contain rounded-lg">

        <div class="flex-1 ml-4">
          <h4 class="font-semibold text-lg">${item.name}</h4>
          <p class="text-gray-600">$${item.price}</p>
        </div>

        <div class="flex items-center gap-2">
          <button class="px-3 py-1 bg-blue-500 text-white rounded-md hover:bg-blue-600"
            onclick="updateQuantity(${item.id}, -1)">-</button>
          <span class="px-2 font-medium">${item.quantity}</span>
          <button class="px-3 py-1 bg-blue-500 text-white rounded-md hover:bg-blue-600"
            onclick="updateQuantity(${item.id}, 1)">+</button>
        </div>

        <button class="ml-4 px-4 py-2 bg-red-500 text-white rounded-md hover:bg-red-600"
          onclick="removeItem(${item.id})">Remove</button>
      </div>
    `);
  });
}
  document.getElementById("total-price").innerText = cart.reduce((a, b) => a + b.price * b.quantity, 0);
  let totalPages = Math.ceil(cart.length / itemsPerPage);
  document.getElementById("pageInfo").innerText = `Page ${currentPage} of ${totalPages == 0 ? 1 : totalPages}`;
}

function updateQuantity(id, change) {
  let item = cart.find(i => i.id === id);
  if (item) {
    item.quantity += change;
    if (item.quantity < 1) item.quantity = 1;
  }
  renderCart();
}

function removeItem(id) {
  cart = cart.filter(i => i.id !== id);
  if ((currentPage - 1) * itemsPerPage >= cart.length) {
    currentPage = Math.max(1, currentPage - 1);
  }
  renderCart();
}

document.getElementById("prevPage").addEventListener("click", () => {
  if (currentPage > 1) {
    currentPage--;
    renderCart();
  }
});

document.getElementById("nextPage").addEventListener("click", () => {
  if (currentPage < Math.ceil(cart.length / itemsPerPage)) {
    currentPage++;
    renderCart();
  }
});

renderCart();
