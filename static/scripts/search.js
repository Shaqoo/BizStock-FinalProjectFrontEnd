 const apiBaseUrl = "https://localhost:7124/api/v1";  

const searchBox = document.getElementById("search-box");
const searchBtn = document.getElementById("search-btn");
const searchResults = document.getElementById("search-results");
const searchSummary = document.getElementById("search-summary");
const searchQuerySpan = document.getElementById("search-query");

const prevPageBtn = document.getElementById("prev-page");
const nextPageBtn = document.getElementById("next-page");
const pageInfo = document.getElementById("page-info");

let currentPage = 1;
const pageSize = 12;
let currentQuery = "";
let currentCategory = "all";
let totalPages = 1;

document.addEventListener("DOMContentLoaded", async () => {
  const params = new URLSearchParams(window.location.search);
  const query = params.get("query") || "";
  console.log(query);
  currentQuery = query;
  fetchProducts();});



async function fetchProducts() {
  try {
    let url = `${apiBaseUrl}/Products/search?pageNumber=${currentPage}&pageSize=${pageSize}&keyword=${encodeURIComponent(currentQuery)}`;
    console.log(currentQuery)
    if (currentCategory && currentCategory !== "all") url += `&category=${encodeURIComponent(currentCategory)}`;

    const response = await fetch(url);
    if (!response.ok) throw new Error("Failed to fetch");

    const data = await response.json();
    const products = data.data.items;
    totalPages = data.data.totalPages;

    renderResults(products);
    updatePagination();
    updateSummary();
  } catch (err) {
    console.error("Error:", err);
    searchResults.innerHTML = `<p class="text-red-500">❌ Could not load results.</p>`;
  }
}


function renderResults(products) {
  searchResults.innerHTML = "";
  console.log(products);


  if (!products || products.length === 0) {
    searchResults.innerHTML = `<p class="text-gray-500">No products found.</p>`;
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
    searchResults.appendChild(card);
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


function updateSummary() {
  searchQuerySpan.textContent = currentQuery || "All Products";
}

