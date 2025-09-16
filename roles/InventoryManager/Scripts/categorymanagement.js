   const apiBase = "https://localhost:7124/api/v1/Categories"; 
    const parentSelect = document.getElementById("moveParentId");


    async function fetchCategories() {
      const res = await fetch(`${apiBase}/tree`);
      const data = await res.json();
      renderCategoryTree(data.data, document.getElementById("categoryTree"));
      renderCategories(data.data);
    }

    function renderCategoryTree(categories, container) {
      container.innerHTML = "";
      categories.forEach(cat => {
        const div = document.createElement("div");
        div.className = "border rounded-lg p-3";
        div.innerHTML = `
          <div class="flex justify-between items-center">
            <div>
              <p class="font-medium">${cat.name}</p>
              <p class="text-sm text-gray-500">${cat.description || ""}</p>
            </div>
            <div class="flex space-x-2">
              <button class="text-blue-600 hover:underline" onclick="openUpdateModal('${cat.id}', '${cat.name}', '${cat.description || ""}')">Update</button>
              <button class="text-yellow-600 hover:underline" onclick="openMoveModal('${cat.id}')">Move</button>
              <button class="text-red-600 hover:underline" onclick="openDeleteModal('${cat.id}')">Delete</button>
            </div>
          </div>
        `;
        if (cat.subCategories && cat.subCategories.length > 0) {
          const childContainer = document.createElement("div");
          childContainer.className = "ml-6 mt-2 space-y-2";
          renderCategoryTree(cat.subCategories, childContainer);
          div.appendChild(childContainer);
        }
        container.appendChild(div);
      });
    }

    async function renderCategories(categories){
    console.log("Categories",categories);
     if(categories.length === 0){
        return;
     }
     categories.forEach(category => {
        const option = document.createElement("option");
        option.textContent = category.name;
        option.value = category.id;
        parentSelect.appendChild(option);
        if(category.subCategories.length > 0)
          renderCategories(category.subCategories);
     });
  }

    function openUpdateModal(id, name, description) {
      document.getElementById("updateId").value = id;
      document.getElementById("updateName").value = name;
      document.getElementById("updateDescription").value = description;
      document.getElementById("updateModal").classList.remove("hidden");
    }
    function openMoveModal(id) {
      document.getElementById("moveId").value = id;
      document.getElementById("moveModal").classList.remove("hidden");
    }
    function openDeleteModal(id) {
      document.getElementById("deleteId").value = id;
      document.getElementById("deleteModal").classList.remove("hidden");
    }
    function closeModal(id) {
      document.getElementById(id).classList.add("hidden");
    }

    document.getElementById("updateForm").addEventListener("submit", async e => {
    e.preventDefault();

    const id = document.getElementById("updateId").value;
    const name = document.getElementById("updateName").value;
    const description = document.getElementById("updateDescription").value;

    try {
        const response = await fetch(`${apiBase}/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json",
            "Authorization": `Bearer ${sessionStorage.getItem("accessToken")}`
         },
        body: JSON.stringify({ name, description })
        });

        const result = await response.json();

        if (response.ok) {
        Swal.fire({
            icon: "success",
            title: "Category Updated",
            text: result.message || "The category was updated successfully!"
        });
        closeModal("updateModal");
        fetchCategories();
        } else {
        Swal.fire({
            icon: "error",
            title: "Update Failed",
            text: result.message || "Something went wrong while updating."
        });
        }
    } catch (err) {
        Swal.fire({
        icon: "error",
        title: "Error",
        text: err.message || "Network error occurred"
        });
    }
    });


    document.getElementById("moveForm").addEventListener("submit", async e => {
    e.preventDefault();

    const id = document.getElementById("moveId").value;
    const parentId = document.getElementById("moveParentId").value || null;

    try {
        const response = await fetch(`${apiBase}/${id}/move`, {
        method: "PUT",
        headers: { "Content-Type": "application/json","Authorization": `Bearer ${sessionStorage.getItem("accessToken")}` },
        body: JSON.stringify({ parentCategoryId: parentId })
        });

        const result = await response.json();

        if (response.ok) {
        Swal.fire({
            icon: "success",
            title: "Category Moved",
            text: result.message || "Category moved successfully!"
        });
        closeModal("moveModal");
        fetchCategories();
        } else {
        Swal.fire({
            icon: "error",
            title: "Move Failed",
            text: result.message || "Could not move the category."
        });
        }
    } catch (err) {
        Swal.fire({
        icon: "error",
        title: "Error",
        text: err.message || "Network error occurred."
        });
    }
    });


    async function confirmDelete() {
    const id = document.getElementById("deleteId").value;

    const confirm = await Swal.fire({
        title: "Are you sure?",
        text: "This will permanently delete the category!",
        icon: "warning",
        showCancelButton: true,
        confirmButtonColor: "#d33",
        cancelButtonColor: "#3085d6",
        confirmButtonText: "Yes, delete it!"
    });

    if (!confirm.isConfirmed) return;

    try {
        const response = await fetch(`${apiBase}/${id}`, { method: "DELETE",
            headers: {
        "Authorization": `Bearer ${sessionStorage.getItem("accessToken")}`
        }});
        const result = await response.json();

        if (response.ok) {
        Swal.fire({
            icon: "success",
            title: "Deleted!",
            text: result.message || "The category has been deleted."
        });
        closeModal("deleteModal");
        fetchCategories();
        } else {
        Swal.fire({
            icon: "error",
            title: "Delete Failed",
            text: result.message || "Could not delete category."
        });
        }
    } catch (err) {
        Swal.fire({
        icon: "error",
        title: "Error",
        text: err.message || "Network error occurred."
        });
    }
    }


    fetchCategories();
 