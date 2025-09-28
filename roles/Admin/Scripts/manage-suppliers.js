const apiBaseUrl = "https://localhost:7124/api/v1";
  const managersList = document.getElementById("managersList");
  const prevPage = document.getElementById("prevPage");
  const nextPage = document.getElementById("nextPage");
  const pageInfo = document.getElementById("pageInfo");
  const registerBtn = document.getElementById("registerManagerBtn");

  let currentPage = 1;
  let totalPages = 1;
  const pageSize = 10;

  async function loadManagers(page = 1) {
    try {
      const res = await fetch(`${apiBaseUrl}/Users/by-role/${encodeURIComponent("Supplier")}?page=${page}&pageSize=${pageSize}`);
      const result = await res.json();

      managersList.innerHTML = "";
      result.data.items.forEach(m => {
        const tr = document.createElement("tr");
        tr.innerHTML = `
           <td class="p-3 border-b">
            <img src="${m.profilepicture ?? getAvatarUrl(m.fullName)}" alt="${m.fullName}" class="w-10 h-10 rounded-full">
          </td>
          <td class="p-3 border-b">${m.fullName}</td>
          <td class="p-3 border-b">${m.email}</td>
          <td class="p-3 border-b">${m.phoneNumber}</td>
          <td class="p-3 border-b">${m.gender}</td>
          <td class="p-3 border-b"> ${m.isActive 
              ? `<span class="text-green-600 font-medium">Active</span>` 
              : `<span class="text-red-500 font-medium">Inactive</span>`}
          </td></td>
          <td class="p-3 border-b"><button class="bg-blue-600 text-white px-3 py-1 rounded hover:bg-blue-700 text-sm" onclick="viewUser('${m.id}')">View</button></td>
        `;
        managersList.appendChild(tr);
      });

      currentPage = result.data.pageNumber;
      totalPages = result.data.totalPages;
      pageInfo.textContent = `Page ${currentPage} of ${totalPages}`;
    } catch (err) {
      console.error("Error loading managers", err);
      Swal.fire("Error", "Could not load managers.", "error");
    }
  }

  prevPage.addEventListener("click", () => {
    if (currentPage > 1) loadManagers(currentPage - 1);
  });

  nextPage.addEventListener("click", () => {
    if (currentPage < totalPages) loadManagers(currentPage + 1);
  });

  document.getElementById('registerManagerBtn').addEventListener('click', () => {
  document.getElementById('signupModal').classList.remove('hidden');
});

document.addEventListener('click', function (event) {
  const modal = document.getElementById('signupModal');
  if (event.target === modal) {
    modal.classList.add('hidden');  
  }
});


   function getAvatarUrl(name) {
      return `https://ui-avatars.com/api/?name=${encodeURIComponent(name)}&background=0D8ABC&color=fff&size=128&rounded=true`;
    }

    function viewUser(id) {
      window.location.href = `viewuser.html?id=${id}`;
    }
  loadManagers();
