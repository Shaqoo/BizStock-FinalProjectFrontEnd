const apiBaseUrl = "https://localhost:7124/api/v1";
const productList = document.querySelector("#products-list");
const accessToken = localStorage.getItem("accessToken");

async function loadRecentlyViewed() {
const headers = {
  "Content-Type": "application/json"
};

if (accessToken) {
  headers["Authorization"] = `Bearer ${accessToken}`;
}

const recentResponse = await fetch("https://localhost:7124/api/v1/RecentlyViewedProducts", {
  method: "GET",
  headers,
  credentials: "include" 
});
  const recentProducts = await recentResponse.json();
  console.log(recentProducts.data.items);

  const productFetches = recentProducts.data.items.map(item => getProduct(item.productId));
  const products = await Promise.all(productFetches)

  console.log(products);
  renderResults(products);
}

document.addEventListener("DOMContentLoaded", loadRecentlyViewed);


function renderResults(products) {
  productList.innerHTML = "";
  console.log(products);


  if (!products || products.length === 0) {
    productList.innerHTML = `<p class="text-gray-500">No products found.</p>`;
    return;
  }
  
  try
  {
  products.forEach(p => {
    const card = document.createElement("div");
    card.className = "bg-white rounded-lg shadow p-4";
    card.onclick = () => window.location.href = `Product.html?id=${p.id}`;
    card.classList.add("cursor-pointer");
    
    card.innerHTML = `
      <img src="${p.data.imageUrl || 'placeholder.jpg'}" alt="${p.data.name}" 
           class="w-full h-40 object-cover rounded">
      <h3 class="text-lg font-semibold mt-2">${p.data.name}</h3>
      <p class="text-sm text-gray-500">${p.data.name} • ${p.data.name}</p>
      <p class="text-blue-600 font-bold mt-1">$${p.data.sellingPrice.toFixed(2)}</p>
      <button class="mt-2 px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600">Add to Cart</button>
    `;
    productList.appendChild(card);
  });
}
    catch(error){
    productList.innerHTML = `<p class="text-gray-500">No products found.</p>`;
  }
}

const getProduct = async (productId) =>{
  let product = await fetch(`https://localhost:7124/api/v1/Products/by-id/${productId}`);
  return product.json();
}
