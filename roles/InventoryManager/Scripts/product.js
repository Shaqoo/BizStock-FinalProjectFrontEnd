const apiBaseUrl = "https://localhost:7124/api/v1";
let apiBase = "https://localhost:7124/api/v1/Notifications";

let productId = "";
document.addEventListener("DOMContentLoaded",async () => {
  const params = new URLSearchParams(window.location.search);
  productId = params.get("id");
  displayProduct(productId); 
  if (!productId) {
    console.warn("No product ID found in URL.");
    return;
  }
});

document.querySelector("#edit-details").addEventListener("click", () => {
  window.location.href = `/roles/InventoryManager/Pages/productmanagement.html?id=${productId}`;
});




const getProduct = async (productId) =>{
  let product = await fetch(`${apiBaseUrl}/Products/by-id/${productId}`);
  return product.json();
}

let getCategory = async (id) =>{
  let category = await fetch(`${apiBaseUrl}/Categories/${id}`);
  return category.json();
}

let getBrand = async (id) =>{
  let brand = await fetch(`${apiBaseUrl}/Brands/${id}`);
  return brand.json();
}

let getSpecifications = async (productId) =>{
  let specifications = await fetch(`${apiBaseUrl}/Specifications/product/${productId}`);
  return specifications.json();
}


let getAvgRating = async (productId) =>{
  let rating = await fetch(`${apiBaseUrl}/Reviews/product-ratings/${productId}`);
  return rating.json();
} 

const additionalinfocontainer = document.getElementById('additional-info');


async function displayProduct(productId) {
try
{
 const product = await getProduct(productId);
 if(product.data !== null)
 {
   const category = await getCategory(product.data.categoryId);
   const brand = await getBrand(product.data.brandId);
   const specifications = await getSpecifications(productId);
   const avgRating = await getAvgRating(productId);
  loadRelatedProducts(productId, product.data.categoryId);
  loadRelatedBrandProducts(productId, product.data.brandId);
  getReview(productId);
  loadProductReviews(productId);
  




  console.log(product);
  console.log(category);
  console.log(brand);
  console.log(specifications);
  console.log(avgRating);
  
    document.querySelector("#product-name").textContent = `${product.data.name}`;
    document.querySelector("#product-price").textContent = `#${product.data.sellingPrice.toFixed(2)}`;
    document.querySelector("#cost-price").textContent = `#${product.data.costPrice.toFixed(2)}`;
    

    document.querySelector("#product-rating").innerHTML = `
  <span class="flex space-x-1">${renderStars(avgRating.data.item1)}</span>
  <a href="reviews.html?productid=${productId}" class="text-sm text-blue-600 hover:underline">(${avgRating.data.item2} rating(s))</a>
`;
    
    document.querySelector("#product-brand").innerHTML = `
    Brand: <a href="${brand.data.websiteUrl}" target="_blank" 
     class="text-black hover:underline"><span class="text-xl text-black font-semibold">${brand.data.name}</span>
  </a>`;

    document.querySelector("#product-image").src = product.data.imageUrl;
    document.querySelector("#product-description").textContent = product.data.description;

    additionalinfocontainer.innerHTML = `<li><strong>Category:</strong> ${category.data.name}</li>
      <li><strong>Quantity Left:</strong> ${product.data.quantity}</li>
      <li><strong>Unit of Measure:</strong> ${product.data.unitOfMeasure}</li>
      <li><strong>QR Code Value:</strong> ${product.data.qrCodeValue}</li>
      <li><strong>Brand:</strong> ${brand.data.name}</li>
      <li><strong>Barcode:</strong> ${product.data.barcode}</li>
      <li><strong>SKU:</strong> ${product.data.sku}</li>
      <li><a href="${brand.data.websiteUrl}" target="_blank"><strong>Website URL:</strong> ${brand.data.websiteUrl}</a></li>`;
     
    if(specifications.isSuccess == true)
    {
     specifications.data.specifications.forEach(spec => {
      document.querySelector('#specifications').innerHTML += ` <li>${capitalizeFirst(spec.specificationName)}: ${spec.value}</li>
    `});
    } else{
        document.querySelector('#specifications').textContent = "No specifications available";
     }


 } else{
     document.querySelector("#product-details").innerHTML = `
    <p class="text-center text-red-600 text-xl">Product not found.</p>
  `;
 }}
 catch(error)
 {
    console.error(error)
    Swal.fire({
    icon: "error",
    title: "Product Not Found",
    text: "The product you are looking for does not exist.",
    confirmButtonText: "Go Back",
    confirmButtonColor: "#3085d6"
  }).then(() => {
    window.location.href = "products.html";
  });
}
}


function renderStars(rating) {
  const maxStars = 5;
  let starsHtml = "";

  for (let i = 1; i <= maxStars; i++) {
    if (i <= Math.floor(rating)) {
      starsHtml += `<i class="fa-solid fa-star text-yellow-500"></i><br>`;
    } else if (i - rating <= 0.5) {
      starsHtml += `<i class="fa-solid fa-star-half-stroke text-yellow-500"></i><br>`;
    } else {
      starsHtml += `<i class="fa-regular fa-star text-yellow-500"></i><br>`;
    }
  }

  return starsHtml;
}


async function loadRelatedProducts(currentProductId, categoryId) {
  try {
    const response = await fetch(`${apiBaseUrl}/Products/${currentProductId}/related`);
    const products = await response.json();
    console.log(products);


    const relatedProductsContainer = document.getElementById("related-products");
    relatedProductsContainer.innerHTML = ""; 

    if (products.isSuccess === false || products.data.length === 0) {
      relatedProductsContainer.innerHTML = `
        <p class="text-gray-500 italic">No related products found.</p>
      `;
      return;
    }

    const related = products.data.filter(p => p.id !== currentProductId);

    related.slice(0, 3).forEach(product => {
      const productCard = `
        <a href="product.html?id=${product.id}" 
           class="bg-white p-4 rounded-lg shadow hover:shadow-lg transition block cursor-pointer">
          <img src="${product.imageUrl}" class="rounded-lg mb-2" alt="${product.name}">
          <p class="font-semibold">${product.name}</p>
          <p class="text-gray-500">${product.name}</p>
          <p class="text-blue-600 font-bold">$${product.sellingPrice.toFixed(2)}</p>
        </a>
      `;
      relatedProductsContainer.insertAdjacentHTML("beforeend", productCard);
    });

    relatedProductsContainer.insertAdjacentHTML("beforeend", `
      <a href="category.html?id=${categoryId}" 
         class="bg-gray-100 flex items-center justify-center rounded-lg shadow hover:bg-gray-200 transition text-blue-600 font-bold">
        See All ➝
      </a>
    `);

  } catch (err) {
    console.error("Failed to load related products", err);
  }
}



async function loadRelatedBrandProducts(currentProductId) {
  try {
    const response = await fetch(`${apiBaseUrl}/Products/${currentProductId}/related-brands`);
    const products = await response.json();
    console.log(products);


    const relatedProductsContainer = document.getElementById("related-brand-products");
    relatedProductsContainer.innerHTML = ""; 

    if (products.isSuccess === false || products.data.length === 0) {
      relatedProductsContainer.innerHTML = `
        <p class="text-gray-500 italic">No products found with the same brand.</p>
      `;
      return;
    }

    const related = products.data.filter(p => p.id !== currentProductId);

    related.slice(0, 3).forEach(product => {
      const productCard = `
        <a href="product.html?id=${product.id}" 
           class="bg-white p-4 rounded-lg shadow hover:shadow-lg transition block cursor-pointer">
          <img src="${product.imageUrl}" class="rounded-lg mb-2" alt="${product.name}">
          <p class="font-semibold">${product.name}</p>
          <p class="text-gray-500">${product.name}</p>
          <p class="text-blue-600 font-bold">$${product.sellingPrice.toFixed(2)}</p>
        </a>
      `;
      relatedProductsContainer.insertAdjacentHTML("beforeend", productCard);
    });
  } catch (err) {
    console.error("Failed to load related products", err);
  }
}


let getReview = async (productId) =>{
  return await fetch(`https://localhost:7124/api/v1/Reviews/product/${productId}?Page=1&PageSize=4`)
  .then(res => res.json())
  .then(data => renderReviews(data.data.items));
}

function renderReviews(reviews) {
  console.log(reviews);
  const container = document.getElementById("reviews-container");
  container.innerHTML = "";

  if (!reviews || reviews.length === 0) {
    container.innerHTML = "<p class='text-gray-500'>No reviews yet.</p>";
    return;
  }

  reviews.forEach(r => {
    const div = document.createElement("div");
    div.className = "mb-6";
    div.innerHTML = `
  <div class="flex items-center mb-2">
    <img id="img-${r.user.id}" 
         src="${r.user.profileImageUrl || 'https://i.pravatar.cc/40'}" 
         class="w-10 h-10 rounded-full mr-3" alt="User">
    <div>
      <p class="font-semibold" id="user-${r.user.id}">${r.user.name}</p>
      <div class="flex items-center text-sm text-gray-500">
        <span class="mr-2">${new Date(r.reviewedAt).toLocaleDateString()}</span>
        <div class="flex text-yellow-500">${renderStars(r.rating)}</div>
      </div>
    </div>
  </div>
  <p class="text-gray-700">${r.comment}</p>
`;
    container.appendChild(div);
  });

  const seeAll = document.createElement("a");
  seeAll.href = `reviews.html?productid=${reviews[0].productId}`;
  seeAll.textContent = "See all reviews";
  seeAll.className = "text-blue-600 hover:underline block mt-4";
  container.appendChild(seeAll);
}



  async function loadProductReviews(productId) {
    let res = await fetch(`https://localhost:7124/api/v1/Reviews/summary/${productId}`);
    let stats = await res.json();
    renderRatingSummary(stats.data);
  }

  function renderRatingSummary(stats) {
    document.getElementById("avg-rating").textContent = stats.average.toFixed(1);
    document.getElementById("total-ratings").textContent = `(${stats.total} rating(s))`;

    let breakdownDiv = document.getElementById("rating-breakdown");
    breakdownDiv.innerHTML = "";  

    for (let i = 5; i >= 1; i--) {
      let count = stats.breakdown[i] || 0;
      let percent = stats.total > 0 ? (count / stats.total) * 100 : 0;

      let row = document.createElement("div");
      row.className = "flex items-center";

      row.innerHTML = `
        <span class="w-12 text-sm text-gray-700">${i} ★</span>
        <div class="flex-1 h-3 bg-gray-300 rounded mx-2 overflow-hidden">
          <div class="h-3 bg-yellow-400" style="width:${percent}%;"></div>
        </div>
        <span class="w-10 text-sm text-gray-600">${count}</span>
      `;

      breakdownDiv.appendChild(row);
    }};

function capitalizeFirst(str) {
  return str.charAt(0).toUpperCase() + str.slice(1);
}


