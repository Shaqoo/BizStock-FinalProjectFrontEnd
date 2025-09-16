let apiBase = "https://localhost:7124/api/v1/Notifications";
let apiBaseUrl = "https://localhost:7124/api/v1";

let currentPage = 1;
const pageSize = 10;
let totalPages = 1;
const desktopTableBody = document.querySelector('#productTableBody');
const mobileProducts = document.querySelector('#productModal');
let currentMode = "all";
let ascendingSort = true;
let currentMinPrice = 0;
let currentMaxPrice = 999999;
const sort = document.querySelector("#sort-price");
const applyPriceFilter = document.getElementById("apply-price-filter");
const minPriceInput = document.getElementById("min-price");
const maxPriceInput = document.getElementById("max-price");
const categoriesContainer = document.getElementById("categoryFilter");
const brandsContainer = document.getElementById("brandFilter");
let categoryId = "";
let brandId = "";

let statusValue = "";

const searchInput = document.getElementById("searchInput");
let searchDebounceTimeout;

function fetchByCurrentMode() {
    if (currentMode === "all") fetchProducts();
    else if (currentMode === "search"){
        const searchTerm = searchInput.value.trim();   
        searchProducts(searchTerm);
    }
    else if (currentMode === "priceRange") fetchProductsByPriceRange(currentMinPrice, currentMaxPrice);
    else if (currentMode === "sorted") fetchProductsSorted(ascendingSort);
    else if (currentMode === "top-Rated") fetchTopRatedProducts();
    else if (currentMode === "recentlyAdded") fetchRecentlyAddedProducts();
    else if (currentMode === "lowStock") fetchLowStockProducts();
    else if (currentMode === "status") fetchProductsByStatus(statusValue);
    else if (currentMode === "categories") fetchProductsByCategories(categoryId);
    else if (currentMode === "brands") fetchProductsByBrands(brandId);
}

let isFetching = false;


const addProductBtn = document.getElementById("addProductBtn");
  addProductBtn.addEventListener("click", () => {
    window.location.href = "/roles/InventoryManager/Pages/createproduct.html";
  });

const addBrandBtn = document.getElementById("addBrandBtn");
   addBrandBtn.addEventListener("click", () => {
    window.location.href = "/roles/InventoryManager/Pages/brandmanagement.html";
  });

const addCategoryBtn = document.getElementById("addCategoryBtn");
   addCategoryBtn.addEventListener("click", () => {
    window.location.href = "/roles/InventoryManager/Pages/categorymanagement.html";
  });

const addSpecBtn = document.getElementById("addSpecBtn");
   addSpecBtn.addEventListener("click", () => {
    window.location.href = "/roles/InventoryManager/Pages/specificationmanagement.html";
  });


function updatePagination() {
  const paginationInfo = document.querySelector('.paginationInfo');
  const paginationButtonsContainer = document.querySelector('.paginationContainer');

  const startItem = (currentPage - 1) * pageSize + 1;
  const endItem = Math.min(currentPage * pageSize, pageSize * totalPages); 
  paginationInfo.textContent = `Showing ${startItem}-${endItem} of ${pageSize * totalPages}`;

  paginationButtonsContainer.innerHTML = "";

  const prevBtn = document.createElement("button");
  prevBtn.innerHTML = "&laquo;";
  prevBtn.className = "px-3 py-1 border rounded hover:bg-gray-100";
  prevBtn.disabled = currentPage === 1;
  prevBtn.onclick = () => {
    if (currentPage > 1) {
      currentPage--;
      fetchByCurrentMode();
    }
  };
  paginationButtonsContainer.appendChild(prevBtn);

  for (let i = 1; i <= totalPages; i++) {
    if (i < currentPage - 1 || i > currentPage + 1) continue;

    const pageBtn = document.createElement("button");
    pageBtn.textContent = i;
    pageBtn.className = "px-3 py-1 border rounded hover:bg-gray-100";
    if (i === currentPage) {
      pageBtn.classList.add("bg-blue-600", "text-white");
    }

    pageBtn.onclick = () => {
      currentPage = i;
      fetchByCurrentMode();
    };

    paginationButtonsContainer.appendChild(pageBtn);
  }

  const nextBtn = document.createElement("button");
  nextBtn.innerHTML = "&raquo;";
  nextBtn.className = "px-3 py-1 border rounded hover:bg-gray-100";
  nextBtn.disabled = currentPage === totalPages;
  nextBtn.onclick = () => {
    if (currentPage < totalPages) {
      currentPage++;
      fetchByCurrentMode();
    }
  };
  paginationButtonsContainer.appendChild(nextBtn);
}

async function fetchProducts() {
     if (isFetching) return;
     isFetching = true;
  try {
    let url = `${apiBaseUrl}/Products?Page=${currentPage}&PageSize=${pageSize}`;

    const response = await fetch(url);
    if (!response.ok) throw new Error("Failed to fetch");

    const data = await response.json();
    const products = data.data.items;
    totalPages = data.data.totalPages;

    renderResults(products);
    updatePagination();
  } catch (err) {
    console.error("Error:", err);
    desktopTableBody.innerHTML = `<p class="text-red-500">❌ Could not load Products.</p>`;
    mobileProducts.innerHTML = `<p class="text-red-500">❌ Could not load Products.</p>`;
  }finally {
    isFetching = false;
  }
}


async function renderResults(products) {
  console.log(products.length)
  if (!products || products.length === 0) {
    desktopTableBody.innerHTML = `<p class="text-gray-500">No Products Found.</p>`;
    mobileProducts.innerHTML = `<p class="text-gray-500">No Products Found.</p>`;
    return;
  }

  desktopTableBody.innerHTML = "";
  mobileProducts.innerHTML = "";

  for (const p of products) {
    const brand = await getBrand(p.brandId);
    const category = await getCategory(p.categoryId);
    const avgRating = await getAvgRating(p.id);
    console.log(avgRating);


    desktopTableBody.insertAdjacentHTML("beforeend", `
      <tr onclick="window.location.href='/roles/InventoryManager/Pages/Product.html?id=${p.id}'" class="border-t">
          <td class="px-4 py-3"><img src="${p.imageUrl || 'https://i.pravatar.cc/40?img=1'}" alt="${p.name}"  class="rounded"></td>
          <td class="px-4 py-3">${p.name}</td>
          <td class="px-4 py-3">${p.sku}</td>
          <td class="px-4 py-3">${brand?.data?.name || '—'}</td>
          <td class="px-4 py-3">${category?.data?.name || '—'}</td>
          <td class="px-4 py-3">$${p.sellingPrice}</td>
          <td class="px-4 py-3">
            ${p.quantity > p.reorderLevel 
              ? `<span class="text-green-600 font-semibold">${p.quantity}</span>`
              : `<span class="text-red-600 font-semibold">${p.quantity}</span>`}
          </td>
          <td class="px-4 py-3">${renderStars(avgRating?.data?.item1 || 0)}</td>
          <td class="px-4 py-3">
            <button onclick="location.href='/roles/InventoryManager/Pages/editproduct.html?id=${p.id}'" class="text-blue-600 hover:underline">Edit</button>
          </td>
      </tr>
    `);

   
    mobileProducts.insertAdjacentHTML("beforeend", `
      <div onclick="window.location.href='/roles/InventoryManager/Pages/Product.html?id=${p.id}'" class="bg-white p-4 rounded-lg shadow">
        <img src="${p.imageUrl || 'https://i.pravatar.cc/40?img=1'}" alt="${p.name}" class="rounded mb-3">
        <h3 class="font-bold">${p.name}</h3>
        <p class="text-sm text-gray-600">${p.sku} • ${brand?.data?.name || '—'} • ${category?.data?.name || '—'}</p>
        <p class="mt-2 font-semibold">$${p.sellingPrice}</p>
        <p class="${p.quantity > p.reorderLevel ? "text-green-600" : "text-red-600"} text-sm">Stock: ${p.quantity}</p>
        <p class="text-yellow-500">${renderStars(avgRating?.data?.item1 || 0)}</p>
        <button onclick="location.href='/roles/InventoryManager/Pages/productmanagement.html?id=${p.id}'" class="mt-3 text-blue-600 hover:underline">Edit</button>
      </div>
    `);
  }
}

let getCategory = async (id) =>{
  let category = await fetch(`${apiBaseUrl}/Categories/${id}`);
  return category.json();
}

let getBrand = async (id) =>{
  let brand = await fetch(`${apiBaseUrl}/Brands/${id}`);
  return brand.json();
}

let getAvgRating = async (productId) =>{
  let rating = await fetch(`${apiBaseUrl}/Reviews/product-ratings/${productId}`);
  return rating.json();
} 

function renderStars(rating) {
  const maxStars = 5;
  let starsHtml = "";

  for (let i = 1; i <= maxStars; i++) {
    if (i <= Math.floor(rating)) {
      starsHtml += `<i class="fa-solid fa-star text-yellow-500"></i>`;
    } else if (i - rating <= 0.5) {
      starsHtml += `<i class="fa-solid fa-star-half-stroke text-yellow-500"></i>`;
    } else {
      starsHtml += `<i class="fa-regular fa-star text-yellow-500"></i>`;
    }
  }

  return starsHtml;
}


searchInput.addEventListener("input", () => {
  const inputValue = searchInput.value.trim();

  clearTimeout(searchDebounceTimeout);

  searchDebounceTimeout = setTimeout(() => {
  currentMode = inputValue === "" ? "all" : "search";
  currentPage = 1;

    fetchByCurrentMode();
  }, 300); 
});

let searchProducts = async (input) =>{
    if (isFetching) return;
     isFetching = true;
    let url = `${apiBaseUrl}/Products/search?pageNumber=${currentPage}&pageSize=${pageSize}&keyword=${encodeURIComponent(input)}`;
    try {
        const response = await fetch(url);
    if (!response.ok) throw new Error("Failed to fetch");

    const data = await response.json();
    const products = data.data.items;
    totalPages = data.data.totalPages;

    renderResults(products);
    updatePagination();
  } catch (err) {
    console.error("Error:", err);
    desktopTableBody.innerHTML = `<p class="text-red-500">❌ Could not load Products.</p>`;
    mobileProducts.innerHTML = `<p class="text-red-500">❌ Could not load Products.</p>`;
  }finally {
    isFetching = false;
  }
}

sort.addEventListener("change", () => {
   if(sort.value === ""){
     currentMode = "all";
     currentPage = 1;
     return;
    }
    currentPage = 1;
    ascendingSort = sort.value === "asc";
    currentMode = "sorted";
    fetchProductsSorted(ascendingSort);
});


async function fetchProductsSorted(ascending = true) {
   if (isFetching) return;
     isFetching = true;
    try {
        const url = `${apiBaseUrl}/Products/ordered-by-price?ascending=${ascending}&Page=${currentPage}&PageSize=${pageSize}`;
        const response = await fetch(url);
        if (!response.ok) throw new Error("Failed to fetch sorted products");

        const data = await response.json();
        totalPages = data.data.totalPages;
        console.log(data.data.items);
        renderResults(data.data.items);
        updatePagination();
  } catch (err) {
    console.error("Error:", err);
    desktopTableBody.innerHTML = `<p class="text-red-500">❌ Could not load Products.</p>`;
    mobileProducts.innerHTML = `<p class="text-red-500">❌ Could not load Products.</p>`;
  }finally {
    isFetching = false;
  }
}


document.getElementById("apply-price-filter").addEventListener("click", () => {
    currentPage = 1;
    currentMinPrice = Number(document.getElementById("min-price").value) || 0;
    currentMaxPrice = Number(document.getElementById("max-price").value) || 999999;

    if (currentMinPrice < 0 || currentMaxPrice < 0) {
        Swal.fire({
            icon: 'error',
            title: 'Invalid Price',
            text: 'Prices cannot be negative',
            confirmButtonText: 'OK'
        });
        return;
    }
    currentMode = "priceRange";
    fetchProductsByPriceRange(currentMinPrice, currentMaxPrice);
});


async function fetchProductsByPriceRange(min, max) {
    if (isFetching) return;
     isFetching = true;
    try {
        if (!min) min = 0;
        if (!max) max = 999999; 
        const url = `${apiBaseUrl}/Products/price-range?minPrice=${min}&maxPrice=${max}&Page=${currentPage}&PageSize=${pageSize}`;
        const response = await fetch(url);
        if (!response.ok) throw new Error("Failed to fetch products by price range");

        const data = await response.json();
        totalPages = data.data.totalPages;
       renderResults(data.data.items);
       updatePagination();
  } catch (err) {
    console.error("Error:", err);
    desktopTableBody.innerHTML = `<p class="text-red-500">❌ Could not load Products.</p>`;
    mobileProducts.innerHTML = `<p class="text-red-500">❌ Could not load Products.</p>`;
  }finally {
    isFetching = false;
  }
}


document.addEventListener("DOMContentLoaded", () => {
  fetchByCurrentMode();
  loadCategories();
  loadBrands();
});

document.addEventListener("DOMContentLoaded", function () {
  const dropdownFilterBtn = document.getElementById("dropdownFilterBtn");
  const dropdownFilterList = document.getElementById("dropdownFilterList");
  const selectedFilterValue = document.getElementById("selectedFilterValue");

  dropdownFilterBtn.addEventListener("click", function () {
    dropdownFilterList.classList.toggle("hidden");
  });

  document.querySelectorAll(".filter-option").forEach((item) => {
    item.addEventListener("click", function () {
      selectedFilterValue.innerHTML = item.innerHTML;
      dropdownFilterList.classList.add("hidden");
      const value = item.getAttribute("data-value");
      console.log("Filter value:", value);
      if(value === "all"){
        currentMode = "all";
        currentPage = 1;
        fetchByCurrentMode();
        return;
      }
      if (value) {
        currentMode = value;
        currentPage = 1;
        fetchByCurrentMode();
      }
    });
  });

  document.addEventListener("click", function (e) {
    if (!dropdownFilterBtn.contains(e.target) && !dropdownFilterList.contains(e.target)) {
      dropdownFilterList.classList.add("hidden");
    }
  });

  const dropdownStatusBtn = document.getElementById("dropdownStatusBtn");
  const dropdownStatusList = document.getElementById("dropdownStatusList");
  const selectedStatusValue = document.getElementById("selectedStatusValue");

  dropdownStatusBtn.addEventListener("click", function () {
    dropdownStatusList.classList.toggle("hidden");
  });

  document.querySelectorAll(".status-option").forEach((item) => {
    item.addEventListener("click", function () {
      selectedStatusValue.innerHTML = item.innerHTML;
      dropdownStatusList.classList.add("hidden");
      const value = item.getAttribute("data-value");
      console.log("Status value:", value);
      if(value === "all"){
        currentMode = "all";
        currentPage = 1;
        fetchByCurrentMode();
        return;
      }
      if (value) {
        currentMode = "status";
        statusValue = value;
        currentPage = 1;
        fetchByCurrentMode();
      }
    });
  });

  document.addEventListener("click", function (e) {
    if (!dropdownStatusBtn.contains(e.target) && !dropdownStatusList.contains(e.target)) {
      dropdownStatusList.classList.add("hidden");
    }
  });
});

  async function renderCategories(categories){
    console.log("Categories",categories);
     if(categories.length === 0){
        return;
     }
     categories.forEach(category => {
        const option = document.createElement("option");
        option.textContent = category.name;
        option.value = category.id;
        categoriesContainer.appendChild(option);
        if(category.subCategories.length > 0)
          renderCategories(category.subCategories);
     });
  }

  async function renderBrands(brands){
    console.log("Brands",brands);
     if(brands.length === 0){
        return;
     }
     brands.forEach(brand => {
        const option = document.createElement("option");
        option.textContent = brand.name;
        option.value = brand.id;
        brandsContainer.appendChild(option);
     });
  }


  
let loadCategories = async () =>{
  try{
  const res = await fetch(`${apiBaseUrl}/Categories/tree`);
  const categories = await res.json();
  console.log(categories);
  renderCategories(categories.data);
  }catch{
    categoriesContainer.innerHTML = `<option class="text-red-500">Could not load Categories.</option>`;
  }
}

let loadBrands = async () =>{
  try{
  const res = await fetch(`${apiBaseUrl}/Brands/paginated?pageNumber=${1}&pageSize=${20}`);
  const brands = await res.json();
  console.log(brands);
  renderBrands(brands.data.items);
  }catch{
    brandsContainer.innerHTML = `<option class="text-red-500">Could not load Brands.</option>`;
  }
}

categoriesContainer.addEventListener("change", () => {
  console.log(categoriesContainer.value);
   if(categoriesContainer.value === "" || categoriesContainer.value === "all"){
     currentMode = "all";
     currentPage = 1;
     fetchByCurrentMode();
     return;
    }
    currentPage = 1;
    currentMode = "categories";
    categoryId = categoriesContainer.value;
    fetchByCurrentMode();
});

brandsContainer.addEventListener("change", () => {
  console.log(brandsContainer.value);
   if(brandsContainer.value === "" || brandsContainer.value === "all"){
     currentMode = "all";
     currentPage = 1;
     fetchByCurrentMode();
     return;
    }
    currentPage = 1;
    currentMode = "brands";
    brandId = brandsContainer.value;
    fetchByCurrentMode();
});



async function fetchTopRatedProducts() {
  if (isFetching) return;
     isFetching = true;
  try {
    let url = `${apiBaseUrl}/Products/top-rated?pageNumber=${currentPage}&pageSize=${pageSize}`;

    const response = await fetch(url);
    if (!response.ok) throw new Error("Failed to fetch");

    const data = await response.json();
    const products = data.data.items;
    totalPages = data.data.totalPages;

    renderResults(products);
    updatePagination();
 } catch (err) {
    console.error("Error:", err);
    desktopTableBody.innerHTML = `<p class="text-red-500">❌ Could not load Top Rated Products.</p>`;
    mobileProducts.innerHTML = `<p class="text-red-500">❌ Could not load Top Rated Products.</p>`;
  }finally {
    isFetching = false;
  }
}



async function fetchRecentlyAddedProducts() {
  if (isFetching) return;
     isFetching = true;
  try {
    let url = `${apiBaseUrl}/Products/recent?pageNumber=${currentPage}&pageSize=${pageSize}`;

    const response = await fetch(url);
    if (!response.ok) throw new Error("Failed to fetch");

    const data = await response.json();
    const products = data.data.items;
    totalPages = data.data.totalPages;

    renderResults(products);
    updatePagination();
  } catch (err) {
    console.error("Error:", err);
    desktopTableBody.innerHTML = `<p class="text-red-500">❌ Could not load  Recently AddedProducts.</p>`;
    mobileProducts.innerHTML = `<p class="text-red-500">❌ Could not load Recently Added Products.</p>`;
  }finally {
    isFetching = false;
  }
}


async function fetchLowStockProducts() {
  if (isFetching) return;
     isFetching = true;
  try {
    let url = `${apiBaseUrl}/Products/low-stock?pageNumber=${currentPage}&pageSize=${pageSize}`;

    const response = await fetch(url);
    if (!response.ok) throw new Error("Failed to fetch");

    const data = await response.json();
    const products = data.data.items;
    totalPages = data.data.totalPages;

    renderResults(products);
    updatePagination();
  } catch (err) {
    console.error("Error:", err);
    desktopTableBody.innerHTML = `<p class="text-red-500">❌ Could not load Low Stock Products.</p>`;
    mobileProducts.innerHTML = `<p class="text-red-500">❌ Could not load Low Stock Products.</p>`;
  }finally {
    isFetching = false;
  }
}


async function fetchProductsByStatus(status) {
  if (isFetching) return;
     isFetching = true;
  try {
    let url = `${apiBaseUrl}/Products/status/${status}?pageNumber=${currentPage}&pageSize=${pageSize}`;

    const response = await fetch(url);
    if (!response.ok) throw new Error("Failed to fetch");

    const data = await response.json();
    const products = data.data.items;
    totalPages = data.data.totalPages;

    renderResults(products);
    updatePagination();
  } catch (err) {
    console.error("Error:", err);
    desktopTableBody.innerHTML = `<p class="text-red-500">❌ Could not load Low Stock Products.</p>`;
    mobileProducts.innerHTML = `<p class="text-red-500">❌ Could not load Low Stock Products.</p>`;
  }finally {
    isFetching = false;
  }
}

async function fetchProductsByCategories(id) {
  if (isFetching) return;
     isFetching = true;
  if(!id) return;
  try {
    let url = `${apiBaseUrl}/Products/category/${id}?pageNumber=${currentPage}&pageSize=${pageSize}`;

    const response = await fetch(url);
    if (!response.ok) throw new Error("Failed to fetch");

    const data = await response.json();
    const products = data.data.items;
    totalPages = data.data.totalPages;

    renderResults(products);
    updatePagination();
  } catch (err) {
    console.error("Error:", err);
    desktopTableBody.innerHTML = `<p class="text-red-500">❌ Could not load Low Stock Products.</p>`;
    mobileProducts.innerHTML = `<p class="text-red-500">❌ Could not load Low Stock Products.</p>`;
  }finally {
    isFetching = false;
  }
}

async function fetchProductsByBrands(id) {
  if (isFetching) return;
     isFetching = true;
  if(!id) return;
  try {
    let url = `${apiBaseUrl}/Products/brand/${id}?pageNumber=${currentPage}&pageSize=${pageSize}`;

    const response = await fetch(url);
    if (!response.ok) throw new Error("Failed to fetch");

    const data = await response.json();
    const products = data.data.items;
    totalPages = data.data.totalPages;

    renderResults(products);
    updatePagination();
  } catch (err) {
    console.error("Error:", err);
    desktopTableBody.innerHTML = `<p class="text-red-500">❌ Could not load Low Stock Products.</p>`;
    mobileProducts.innerHTML = `<p class="text-red-500">❌ Could not load Low Stock Products.</p>`;
  }finally {
    isFetching = false;
  }
}


