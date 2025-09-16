    const form = document.getElementById("categoryForm");
    const status = document.getElementById("status");
    const parentSelect = document.getElementById("parentCategory");

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

  let loadCategories = async () =>{
  try{
  const res = await fetch(`https://localhost:7124/api/v1/Categories/tree`);
  const categories = await res.json();
  console.log(categories);
  renderCategories(categories.data);
  }catch{
    parentSelect.innerHTML += `<option class="text-red-500">Could not load Categories.</option>`;
  }
}


    loadCategories();
    form.addEventListener("submit", async (e) => {
      e.preventDefault();

      const payload = {
        name: document.getElementById("name").value,
        description: document.getElementById("description").value || null,
        parentCategoryId: parentSelect.value || null
      };

      try {
        const response = await fetch("https://localhost:7124/api/v1/Categories", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${sessionStorage.getItem("accessToken")}`
          },
          body: JSON.stringify(payload)
        });

        if (response.ok) {
          const result = await response.json();
          status.textContent = "✅ Category created successfully!";
          status.className = "text-green-600 text-center mt-4";
          form.reset();
          parentSelect.value = "";
        } else {
          const error = await response.json();
          status.textContent = `❌ Failed: ${error.message || "Something went wrong"}`;
          status.className = "text-red-600 text-center mt-4";
        }
      } catch (err) {
        status.textContent = "⚠️ Network error, please try again.";
        status.className = "text-orange-600 text-center mt-4";
      }
    });
