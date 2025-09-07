const apiBaseUrl = "https://localhost:7124/api/v1";
let currentPage = 1;
const pageSize = 20;
let currentCategory = "all";
let totalPages = 1;
const prevPageBtn = document.getElementById("prev-page");
const nextPageBtn = document.getElementById("next-page");
const pageInfo = document.getElementById("page-info");
const productList = document.getElementById("products-results");

let currentQuery = "";

document.addEventListener("DOMContentLoaded", async () => {
  const params = new URLSearchParams(window.location.search);
  let id = params.get("id") || "";
  currentQuery = id; 
  console.log("Current category ID:", currentQuery);
  fetchProducts();
});



async function fetchProducts() {
  try {
    let url = `${apiBaseUrl}/Products/category/${currentQuery}?Page=${currentPage}&PageSize=${pageSize}`;
    console.log(currentQuery)
  
    const response = await fetch(url);
    if (!response.ok) throw new Error("Failed to fetch");

    const data = await response.json();
    const products = data.data.items;
    totalPages = data.data.totalPages;

    renderResults(products);
    updatePagination();
  } catch (err) {
    console.error("Error:", err);
    productList.innerHTML = `<p class="text-red-500">❌ Could not load Products.</p>`;
  }
}


function renderResults(products) {
  productList.innerHTML = "";
  console.log(products);


  if (!products || products.length === 0) {
    productList.innerHTML = `<p class="text-gray-500">No products found.</p>`;
    return;
  }

  products.forEach(p => {
    const card = document.createElement("div");
    card.className = "bg-white rounded-lg shadow p-4";
    card.onclick = () => window.location.href = `Product.html?id=${p.id}`;
    card.classList.add("cursor-pointer");
    
    card.innerHTML = `
      <img src="${p.imageUrl || 'placeholder.jpg'}" alt="${p.name}" 
           class="w-full h-40 object-cover rounded">
      <h3 class="text-lg font-semibold mt-2">${p.name}</h3>
      <p class="text-sm text-gray-500">${p.name} • ${p.name}</p>
      <p class="text-blue-600 font-bold mt-1">$${p.sellingPrice.toFixed(2)}</p>
      <button class="mt-2 px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600">Add to Cart</button>
    `;
    productList.appendChild(card);
  });
}


function updatePagination() {
  pageInfo.textContent = `Page ${currentPage} of ${totalPages}`;
  prevPageBtn.disabled = currentPage === 1;
  nextPageBtn.disabled = currentPage === totalPages;
}

prevPageBtn.addEventListener("click", () => {
  if (currentPage > 1) {
    currentPage--;
    fetchProducts();
  }
});

nextPageBtn.addEventListener("click", () => {
  if (currentPage < totalPages) {
    currentPage++;
    fetchProducts();
  }
});


