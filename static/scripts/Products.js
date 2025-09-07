
  document.addEventListener("DOMContentLoaded", async () => {
  const topRatedContainer = document.querySelector("#top-rated-products");
  const recentlyViewedContainer = document.querySelector("#recently-viewed-products");
  const otherProductsContainer = document.getElementById("other-products");
  

  console.log("Fetching products...");

  try {
    let response = await fetch("https://localhost:7124/api/v1/Products/top-rated?pageNumber=1&pageSize=4");
    let topRatedProducts = await response.json();

    if (topRatedProducts.data !== null) {
  topRatedContainer.innerHTML = topRatedProducts.data.items.map(p => `
    <div class="product-card bg-white rounded-xl shadow p-4">
      <a href="product.html?id=${p.id}">
        <img src="${p.imageUrl}" alt="${p.name}" class="w-full h-40 object-cover rounded-lg">
      </a>
      <h3 class="mt-2 font-semibold text-lg">${p.name}</h3>
      <p class="text-gray-500">$${p.sellingPrice}</p>
    </div>
  `).join("");
} else {
  topRatedContainer.innerHTML = `<p>No top-rated products available.</p>`;
}


     
    let previewResponse = await fetch("https://localhost:7124/api/v1/Products?Page=1&PageSize=12");
    let previewProducts = await previewResponse.json();

    if (previewProducts.data !== null || previewProducts.data.items.length > 0) {
      otherProductsContainer.innerHTML = previewProducts.data.items.map(p => `
        <div class="product-card bg-white rounded-xl shadow p-4">
          <a href="product.html?id=${p.id}">
            <img src="${p.imageUrl || 'placeholder.jpg'}" alt="${p.name}" class="w-full h-40 object-cover rounded-lg">
          </a>
          <h3 class="mt-2 font-semibold text-lg">${p.name}</h3>
          <p class="text-gray-500">$${p.sellingPrice}</p>
        </div>
      `).join("");
    } else {
      otherProductsContainer.innerHTML = `<p class="text-gray-500">No products available.</p>`;
    }

     loadRecentlyViewed();

  } catch (err) {
    console.error("Error fetching products:", err);

    topRatedContainer.innerHTML = `<p class="text-red-500">⚠️ Failed to load top-rated products.</p>`;
    otherProductsContainer.innerHTML = `<p class="text-red-500">⚠️ Failed to load products.</p>`;
    recentlyViewedContainer.innerHTML = `<p class="text-red-500">⚠️ Failed to load recently viewed products.</p>`;
  }
});


async function loadRecentlyViewed() {
   const headers = new Headers();
    headers.append("Content-Type", "application/json");
  
    const token = sessionStorage.getItem("accessToken");
    if (token) {
      headers.append("Authorization", `Bearer ${token}`);
    }
  const recentResponse = await fetch("https://localhost:7124/api/v1/RecentlyViewedProducts", {
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
  //}
  }
  else {
      container.innerHTML = `<p class="text-gray-500">No recently viewed products yet.</p>`;
    }
}

const getProduct = async (productId) =>{
  let product = await fetch(`https://localhost:7124/api/v1/Products/by-id/${productId}`);
  return product.json();
}



  


