const apiBaseUrl = "https://localhost:7124/api/v1"

let productId = "";
document.addEventListener("DOMContentLoaded",async () => {
  const params = new URLSearchParams(window.location.search);
  productId = params.get("id");
  displayProduct(productId); 
  if (!productId) {
    console.warn("No product ID found in URL.");
    return;
  }
 
  try{
    const headers = new Headers();
    headers.append("Content-Type", "application/json");
  
    const token = sessionStorage.getItem("accessToken");
    if (token) {
      headers.append("Authorization", `Bearer ${token}`);
    }
    const res = await fetch(`${apiBaseUrl}/RecentlyViewedProducts`, {
      method: "POST",
      headers: headers,
      credentials: "include",
      body: JSON.stringify({
         userId: null,
         sessionId: "string",
         productId: productId
        })
    });
    const data = await res.json();
    console.log("Recently viewed product added:", data);

  } catch (err) {
    console.error("Error adding recently viewed product:", err);
  }

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
    document.querySelector("#product-price").textContent = `$${product.data.sellingPrice.toFixed(2)}`;
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
    window.location.href = "Products.htm";
  });
}
}


async function addToCart(productId) {
  const productImage = document.getElementById('product-image');
  const cartIcon = document.getElementById('cart-icon');
  const cartSound = document.getElementById('cart-sound');
  const cartCount = document.getElementsByClassName('cart-count-desktop');
  const cartCount2 = document.getElementById('cart-count-mobile');
  const cart = document.querySelector('.cart-count');
  console.log(cartCount)
  console.log(cartCount2)


  if (!productImage) {
    console.error("Missing required DOM elements for addToCart animation.");
    return;
  }
  console.log(cartIcon)
  const imageRect = productImage.getBoundingClientRect();
  const cartRect = cartIcon.getBoundingClientRect();


  const scrollTop = window.scrollY || document.documentElement.scrollTop;
  const scrollLeft = window.scrollX || document.documentElement.scrollLeft;

  const flyingImage = productImage.cloneNode(true);
  flyingImage.style.position = 'absolute';
  flyingImage.style.zIndex = '1000';
  flyingImage.style.width = productImage.offsetWidth + 'px';
  flyingImage.style.height = productImage.offsetHeight + 'px';
  flyingImage.style.left = imageRect.left + scrollLeft + 'px';
  flyingImage.style.top = imageRect.top + scrollTop + 'px';
  flyingImage.style.transition = 'transform 0.8s ease-in-out, opacity 0.8s ease-in-out';

  document.body.appendChild(flyingImage);

  const deltaX = cartRect.left + scrollLeft - (imageRect.left + scrollLeft);
  const deltaY = cartRect.top + scrollTop - (imageRect.top + scrollTop);

  requestAnimationFrame(() => {
    flyingImage.style.transform = `translate(${deltaX}px, ${deltaY}px) scale(0.3)`;
    flyingImage.style.opacity = '0';
  });
flyingImage.addEventListener('transitionend', (function () {
  const finished = new Set();

  return async function (e) {
    finished.add(e.propertyName);

    if (finished.has('transform') && finished.has('opacity')) {

      flyingImage.remove();

      if (cartSound) {
        cartSound.currentTime = 0;
        cartSound.play();
      }

      cartIcon.classList.add('shake');
      setTimeout(() => {
        cartIcon.classList.remove('shake');
      }, 400);

      let count = await cartAddition(productId);
      console.log(count);
      console.log(cartCount)
      if (cartCount !== null && cartCount !== undefined && cartCount.length > 0) {
        cartCount.classList.add('cart-count-animate');
        console.log('Incrementing cart count');
        console.log(count);
        cartCount.textContent = count;
        cartCount2.textContent = count;
      
        setTimeout(() => {
          cartCount.classList.remove('cart-count-animate');
        }, 400);
      }
      const cart = document.querySelectorAll('.cart-count');
      console.log(cart)
      
      if(cart.length > 0){
        cart.forEach(item => item.textContent = count)
      }
      else{
        cart.classList.add('cart-count-animate');
        console.log('Incrementing cart count');
        console.log(count);
        cart.textContent = count;
        setTimeout(() => {
          cart.classList.remove('cart-count-animate');
        }, 400);
      }
    }
  };
})());

}
let cartAdditionCalls = 0;
async function cartAddition(productId) {
  cartAdditionCalls++;
  console.log(`cartAddition called ${cartAdditionCalls} time(s) ${new Date().toLocaleTimeString()}`);
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
      return null;
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



async function loadRelatedBrandProducts(currentProductId, brandId) {
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

    relatedProductsContainer.insertAdjacentHTML("beforeend", `
      <a href="brand.html?id=${brandId}" 
         class="bg-gray-100 flex items-center justify-center rounded-lg shadow hover:bg-gray-200 transition text-blue-600 font-bold">
        See All ➝
      </a>
    `);

  } catch (err) {
    console.error("Failed to load related products", err);
  }
}


let getReview = async (productId) =>{
  return await fetch(`https://localhost:7124/api/v1/Reviews/product/${productId}?Page=1&PageSize=3`)
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

let isAddToCartInitialized = false;

document.addEventListener('header-containerLoaded', () => {
  console.log("✅ headerLoaded event fired");
  console.log(document.querySelectorAll("#add-to-cart-button").length);

  if (isAddToCartInitialized) return;

  const btn = document.getElementById("add-to-cart-button");
  const wishlistbtn = document.getElementById("wishlist-btn-container");
  if (!btn) {
    console.error("❌ Button with ID 'add-to-cart-button' not found.");
    return;
  }

  btn.addEventListener("click", () => {
  console.log("🛒 Button clicked, calling addToCart");
  addToCart(productId);
});


  isAddToCartInitialized = true;
  if(!sessionStorage.getItem("accessToken")){
     wishlistbtn.innerHTML = "";
     return;
   } 
  wishlistbtn.innerHTML = `<button 
  id="wishlist-btn"
  data-in-wishlist="false"
  class="bg-blue-500 text-white mb-2 px-6 py-2 rounded-lg shadow hover:bg-blue-600 transition"
  onclick="toggleWishlist(this, '${productId}')">
  🤍 Add to Wishlist
</button>`
initWishlistButton(wishlistbtn.querySelector("#wishlist-btn"), productId)
});


async function toggleWishlist(button, productId) {
  const isInWishlist = button.dataset.inWishlist === "true";

  try {
    if (isInWishlist) {
      const response = await fetch("https://localhost:7124/api/v1/Wishlists/remove-item", {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${sessionStorage.getItem("accessToken")}`
        },
        body: JSON.stringify({ productId })
      });

      const data = await response.json();
      if (response.ok && data.isSuccess) {
        button.dataset.inWishlist = "false";
        button.innerText = "🤍 Add to Wishlist";
        button.classList.remove("active");
        Swal.fire("Removed!", "Item removed from wishlist.", "success");
      } else {
        Swal.fire("Error", data.message || "Failed to remove item", "error");
      }
    } else {
      const response = await fetch("https://localhost:7124/api/v1/Wishlists/add-item", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${sessionStorage.getItem("accessToken")}`
        },
        body: JSON.stringify({ productId })
      });

      const data = await response.json();
      if (response.ok && data.isSuccess) {
        button.dataset.inWishlist = "true";
        button.innerText = "💖 In Wishlist";
        button.classList.add("active");
        Swal.fire("Added!", "Item added to wishlist.", "success");
      } else {
        Swal.fire("Error", data.message || "Failed to add item", "error");
      }
    }
  } catch (error) {
    console.error("Wishlist error:", error);
    Swal.fire("Error", "Something went wrong.", "error");
  }
}



function capitalizeFirst(str) {
  return str.charAt(0).toUpperCase() + str.slice(1);
}

async function initWishlistButton(button, productId) {
  try {
    const response = await fetch(`https://localhost:7124/api/v1/Wishlists/check/${productId}`, {
      method: "GET",
      headers: {
        "Authorization": `Bearer ${sessionStorage.getItem("accessToken")}`,
        "Content-Type": "application/json"
      }
    });

    const data = await response.json();

    if (response.ok && data.isSuccess) {
      if (data.data === true) {
        button.dataset.inWishlist = "true";
        button.innerText = "💖 In Wishlist";
        button.classList.add("active");
      } else {
        button.dataset.inWishlist = "false";
        button.innerText = "🤍 Add to Wishlist";
        button.classList.remove("active");
      }
    } else {
      console.warn("Wishlist check failed:", data.message);
    }
  } catch (error) {
    console.error("Error checking wishlist:", error);
  }
}

