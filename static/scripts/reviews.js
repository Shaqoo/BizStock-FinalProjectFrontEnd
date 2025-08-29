const apiBaseUrl = "https://localhost:7124/api/v1";
let currentPage = 1;
const pageSize = 10;
let totalPages = 1;
const prevPageBtn = document.getElementById("prev-page");
const nextPageBtn = document.getElementById("next-page");
const pageInfo = document.getElementById("page-info");

let currentQuery = "";

document.addEventListener("DOMContentLoaded", async () => {
  const params = new URLSearchParams(window.location.search);
  let id = params.get("productid") || "";
  currentQuery = id;
  console.log("Current Product ID:", currentQuery);
  loadProductReviews(currentQuery);
  getReview(currentQuery);
});



let getReview = async (productId) => {
    try {
        const response = await fetch(`${apiBaseUrl}/Reviews/product/${productId}?Page=1&PageSize=${pageSize}`);
        const data = await response.json();

        if (data && data.data) {
            renderReviews(data.data.items);       
            totalPages = data.data.totalPages;    
            updatePagination();                   
        } else {
            console.warn("No review data received");
        }
    } catch (error) {
        console.error("Error fetching reviews:", error);
    }
};


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
        <span class="mr-2">
  ${r.reviewedAt ? new Date(r.reviewedAt).toLocaleDateString() : 'N/A'}
</span>
        <div class="flex text-yellow-500">${renderStars(r.rating)}</div>
      </div>
    </div>
  </div>
  <p class="text-gray-700">${r.comment}</p>
`;
    container.appendChild(div);
  });
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