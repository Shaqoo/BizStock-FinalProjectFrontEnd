const apiBase = "https://localhost:7124/api/v1/Brands";
let currentPage = 1;
let pageSize = 6;


async function fetchBrands(page = 1) {
  currentPage = page;
  const res = await fetch(`${apiBase}/paginated?pageNumber=${page}&pageSize=${pageSize}`);
  const data = await res.json();

  renderBrands(data.data.items);
  renderPagination(data.data.totalPages);
}


async function searchBrands() {
  const keyword = document.getElementById("searchInput").value.trim();
  if (!keyword) return fetchBrands(1);

  const res = await fetch(`${apiBase}/search?keyword=${keyword}&pageNumber=1&pageSize=${pageSize}`);
  const data = await res.json();

  renderBrands(data.data.items);
  renderPagination(data.data.totalPages);
}


function renderBrands(brands) {
  const container = document.getElementById("brandList");
  container.innerHTML = "";

  if (!brands || brands.length === 0) {
    container.innerHTML = `<p class="text-gray-500">No brands found.</p>`;
    return;
  }

  brands.forEach(b => {
    const card = document.createElement("div");
    card.className = "bg-white shadow rounded-lg p-4 flex flex-col items-center text-center";

    card.innerHTML = `
      <img src="${b.logoUrl}" alt="${b.name}" class="h-16 w-16 object-contain mb-3">
      <h3 class="font-bold text-lg">${b.name}</h3>
      <p class="text-sm text-gray-500">${b.description || ""}</p>
      <a href="${b.websiteUrl}" target="_blank" class="text-indigo-600 text-sm mt-2">Visit Website</a>
      <div class="flex gap-2 mt-4">
        <button onclick="openUpdateModal('${b.id}', '${b.name}', '${b.websiteUrl}', '${b.logoUrl}', '${b.description || ""}')"
          class="px-3 py-1 bg-yellow-500 text-white rounded">Edit</button>
        <button onclick="deleteBrand('${b.id}')"
          class="px-3 py-1 bg-red-600 text-white rounded">Delete</button>
      </div>
    `;

    container.appendChild(card);
  });
}


function renderPagination(totalPages) {
  const container = document.getElementById("pagination");
  container.innerHTML = "";

  for (let i = 1; i <= totalPages; i++) {
    const btn = document.createElement("button");
    btn.textContent = i;
    btn.className = `px-3 py-1 rounded ${i === currentPage ? "bg-indigo-600 text-white" : "bg-gray-200"}`;
    btn.onclick = () => fetchBrands(i);
    container.appendChild(btn);
  }
}

document.getElementById("updateForm").addEventListener("submit", async e => {
  e.preventDefault();

  const dto = {
    Id: document.getElementById("updateId").value,
    Name: document.getElementById("updateName").value,
    WebsiteUrl: document.getElementById("updateWebsite").value,
    LogoUrl: document.getElementById("updateLogo").value,
    Description: document.getElementById("updateDescription").value
  };

  try {
    const res = await fetch(apiBase, {
      method: "PUT",
      headers: { "Content-Type": "application/json", "Authorization": `Bearer ${sessionStorage.getItem("accessToken")}` },
      body: JSON.stringify(dto)
    });

    if (res.ok) {
      Swal.fire("Updated!", "Brand updated successfully.", "success");
      closeModal("updateModal");
      fetchBrands(currentPage);
    } else {
      const err = await res.text();
      Swal.fire("Error", err || "Update failed.", "error");
    }
  } catch (err) {
    Swal.fire("Error", err.message, "error");
  }
});

async function deleteBrand(id) {
  const confirm = await Swal.fire({
    title: "Are you sure?",
    text: "This will permanently delete the brand.",
    icon: "warning",
    showCancelButton: true,
    confirmButtonColor: "#d33",
    cancelButtonColor: "#3085d6",
    confirmButtonText: "Yes, delete it!"
  });

  if (!confirm.isConfirmed) return;

  try {
    const res = await fetch(`${apiBase}/${id}`, { method: "DELETE",
        headers:{
           "Authorization": `Bearer ${sessionStorage.getItem("accessToken")}`
        }
     });
    if (res.ok) {
      Swal.fire("Deleted!", "Brand removed successfully.", "success");
      fetchBrands(currentPage);
    } else {
      const err = await res.text();
      Swal.fire("Error", err || "Delete failed.", "error");
    }
  } catch (err) {
    Swal.fire("Error", err.message, "error");
  }
}


function openUpdateModal(id, name, website, logo, description) {
  document.getElementById("updateId").value = id;
  document.getElementById("updateName").value = name;
  document.getElementById("updateWebsite").value = website;
  document.getElementById("updateLogo").value = logo;
  document.getElementById("updateDescription").value = description;

  document.getElementById("updateModal").classList.remove("hidden");
}
function closeModal(id) {
  document.getElementById(id).classList.add("hidden");
}


fetchBrands();
