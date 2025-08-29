
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

    if (previewProducts.data !== null) {
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

    
    let recentResponse = await fetch("https://localhost:7124/api/v1/RecentlyViewedProducts");
    let recentlyViewed = await recentResponse.json();

    if (recentlyViewed.data !== null) {
      recentlyViewedContainer.innerHTML = recentlyViewed.data.items.map(p => `
        <div class="product-card bg-white rounded-xl shadow p-4">
          <a href="product.html?id=${p.id}">
            <img src="${p.imageUrl || 'placeholder.jpg'}" alt="${p.name}" class="w-full h-40 object-cover rounded-lg">
          </a>
          <h3 class="mt-2 font-semibold text-lg">${p.name}</h3>
          <p class="text-gray-500">$${p.price}</p>
        </div>
      `).join("");
    } else {
      recentlyViewedContainer.innerHTML = `<p class="text-gray-500">No recently viewed products yet.</p>`;
    }

  } catch (err) {
    console.error("Error fetching products:", err);

    topRatedContainer.innerHTML = `<p class="text-red-500">⚠️ Failed to load top-rated products.</p>`;
    otherProductsContainer.innerHTML = `<p class="text-red-500">⚠️ Failed to load products.</p>`;
    recentlyViewedContainer.innerHTML = `<p class="text-red-500">⚠️ Failed to load recently viewed products.</p>`;
  }
});


  


