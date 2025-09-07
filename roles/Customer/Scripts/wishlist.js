
const itemsPerPage = 10;
let currentPage = 1;
const apiBaseUrl = "https://localhost:7124/api/v1";
let cartCount = document.getElementById('cart-count-desktop');
let cartCount2 = document.getElementById('cart-count-mobile');
let totalPages = "";
let container = document.querySelector("#wishlist-container");

document.addEventListener("DOMContentLoaded",async () => {
   await getItems();
   const itemCount = document.getElementById("wishlistCount");
        console.log(itemCount); 
});



function renderItems(items) {
  const container = document.getElementById("wishlist-container");

  if (!items || items.length === 0) {
    container.innerHTML = `<p class="text-gray-500">No items in your wishlist.</p>`;
    return;
  }

  container.innerHTML = ""; 
  container.innerHTML += `<h2 class="text-xl font-semibold text-gray-700 border-b pb-3 mb-4 flex items-center gap-2">
        Saved Items 
        <span id="wishlistCount" class="bg-blue-600 text-white text-xs font-bold px-2 py-0.5 rounded-full">0</span>
      </h2>`;

  items.forEach(item => {
    container.insertAdjacentHTML("beforeend", `
      <div id="${item.productId}" class="flex items-center gap-6 border-b pb-4 mb-4">
        <img src="${item.productImageUrl ? item.productImageUrl : "https://via.placeholder.com/150"}" 
             alt="Product" class="w-28 h-28 rounded-lg object-cover">
        
        <div class="flex-grow">
          <h3 class="text-lg font-bold text-gray-800">${item.productName}</h3>
          <p class="text-gray-500 text-sm">Brand: ${item.brandName ?? "Unknown"}</p>
          <p class="text-blue-600 font-semibold mt-2">$${item.productPrice.toFixed(2)}</p>
        </div>

        <div class="flex flex-col gap-2">
          <button onclick="cartAddition('${item.productId}')" 
                  class="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-500">
            Add to Cart
          </button>
          <button onclick="removeItem('${item.productId}')" 
                  class="bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-500">
            Remove
          </button>
        </div>
      </div>
    `);
  });
}

let getItems = async () => {
    let accessToken = sessionStorage.getItem("accessToken");
    try{
    const response = await fetch(`${apiBaseUrl}/Wishlists/items?Page=${currentPage}&PageSize=${itemsPerPage}`, {
        method: "GET",
        headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${accessToken}`
        }
    });
    const data = await response.json();
    console.log(data);
    if (data.isSuccess) {
        renderItems(data.data.items);
        console.log("Total Count",data.data.totalCount);
        const itemCount = document.getElementById("wishlistCount");
        console.log(itemCount);
        if (itemCount) {
        itemCount.innerText = data.data.totalCount;
      }
        totalPages = data.data.totalPages ?? 1;
        document.getElementById("pageInfo").innerText = `Page ${currentPage} of ${totalPages}`;
    }}
    catch(error){
        console.log(error);
    }
}


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
      let count = data.data.totalQuantity;
      cartCount = count;
      cartCount2 = count;
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

document.getElementById("prevPage").addEventListener("click",async () => {
  if (currentPage > 1) {
    currentPage--;
    await getItems();
  }
});

document.getElementById("nextPage").addEventListener("click",async () => {
  if (currentPage < totalPages) {
    currentPage++;
    getItems();
  }
});

async function removeItem(productId) {
  const result = await Swal.fire({
    title: "Are you sure?",
    text: "This item will be removed from your wishlist.",
    icon: "warning",
    showCancelButton: true,
    confirmButtonColor: "#2563eb",  
    cancelButtonColor: "#d33",
    confirmButtonText: "Yes, remove it"
  });

  if (!result.isConfirmed) {
    return; 
  }

  try {
    const response = await fetch("https://localhost:7124/api/v1/Wishlists/remove-item", {
      method: "DELETE",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${sessionStorage.getItem("accessToken")}`
      },
      body: JSON.stringify({ productId })
    });

    const data = await response.json();

    if (response.ok) {
      Swal.fire({
        icon: "success",
        title: "Removed!",
        text: "The item has been removed from your wishlist.",
        confirmButtonColor: "#2563eb"
      });
      document.getElementById(`${productId}`)?.remove();
      await getItems();
      return data;
    } else {
      Swal.fire({
        icon: "error",
        title: "Failed",
        text: data.message || "Could not remove item.",
        confirmButtonColor: "#2563eb"
      });
      return null;
    }
  } catch (err) {
    console.error("⚠️ Error:", err);
    Swal.fire({
      icon: "error",
      title: "Error",
      text: "Something went wrong while removing the item.",
      confirmButtonColor: "#2563eb"
    });
    return null;
  }
}


