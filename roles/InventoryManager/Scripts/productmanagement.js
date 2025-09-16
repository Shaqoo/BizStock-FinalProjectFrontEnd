const apiBase = "https://localhost:7124/api/v1"; 

const urlParams = new URLSearchParams(window.location.search);
const productId = urlParams.get("id");
document.getElementById("productId").value = productId;

async function loadProduct() {
  const res = await fetch(`${apiBase}/Products/by-id/${productId}`);
  if (!res.ok) {
    Swal.fire("Error", "Product not found", "error");
    return;
  }
  const data = await res.json();
  const p = data.data ?? data;
  document.getElementById("name").value = p.name;
  document.getElementById("description").value = p.description;
  document.getElementById("unit").value = p.unitOfMeasure;
  document.getElementById("costPrice").value = p.costPrice;
  document.getElementById("sellingPrice").value = p.sellingPrice;
  if (p.imageUrl) {
    document.getElementById("preview").src = p.imageUrl;
    document.getElementById("preview").classList.remove("hidden");
  }
  loadSpecifications();
}


document.getElementById("detailsForm").addEventListener("submit", async e => {
  e.preventDefault();
  const name = document.getElementById("name").value;
  const description = document.getElementById("description").value;
  const unit = document.getElementById("unit").value;
try {
  const res = await fetch(`${apiBase}/Products/update-product-details/${productId}`, {
    method: "PUT",
    headers: { 
      "Content-Type": "application/json",
      "Authorization": `Bearer ${sessionStorage.getItem("accessToken")}`
    },
    body: JSON.stringify({ name, description, unitOfMeasure: unit })
  });

  const message = await res.text();

  if (res.ok) {
    Swal.fire({
      icon: "success",
      title: "Updated Successfully",
      text: message,
      confirmButtonColor: "#2563eb" 
    });
    document.getElementById("name").value = "";
    document.getElementById("description").value = "";
    document.getElementById("unit").value = "";
  } else {
    Swal.fire({
      icon: "error",
      title: "Update Failed",
      text: message,
      confirmButtonColor: "#dc2626"
    });
  }
} catch (error) {
  Swal.fire({
    icon: "error",
    title: "Unexpected Error",
    text: error.message || "Something went wrong. Please try again.",
    confirmButtonColor: "#dc2626"
  });
}
  
});


document.getElementById("priceForm").addEventListener("submit", async e => {
  e.preventDefault();
 const costPrice = parseFloat(document.getElementById("costPrice").value);
const sellingPrice = parseFloat(document.getElementById("sellingPrice").value);

if (isNaN(costPrice) || isNaN(sellingPrice)) {
  Swal.fire({
    icon: "warning",
    title: "Missing Values",
    text: "Please enter both Cost Price and Selling Price.",
    confirmButtonColor: "#f59e0b"
  });
  return;
}

if (costPrice > sellingPrice) {
  Swal.fire({
    icon: "warning",
    title: "Invalid Prices",
    text: "Cost Price cannot be greater than Selling Price.",
    confirmButtonColor: "#f59e0b"
  });
  return;
}

try {
  const res = await fetch(`${apiBase}/Products/change-product-price`, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
      "Authorization": `Bearer ${sessionStorage.getItem("accessToken")}`
    },
    body: JSON.stringify({ productId, costPrice, sellingPrice })
  });

  const message = await res.text();

  if (res.ok) {
    Swal.fire({
      icon: "success",
      title: "Price Updated",
      text: message,
      confirmButtonColor: "#2563eb"
    });
    document.getElementById("costPrice").value = "";
    document.getElementById("sellingPrice").value = "";
  } else {
    Swal.fire({
      icon: "error",
      title: "Update Failed",
      text: message,
      confirmButtonColor: "#dc2626"
    });
  }
} catch (error) {
  Swal.fire({
    icon: "error",
    title: "Unexpected Error",
    text: error.message || "Something went wrong. Please try again.",
    confirmButtonColor: "#dc2626"
  });
}

  
});


document.getElementById("picture").addEventListener("change", e => {
  const file = e.target.files[0];
  if (file) {
    if (file.size > 3 * 1024 * 1024) {
      Swal.fire("Error", "Image must be less than 3MB", "error");
      e.target.value = "";
      return;
    }
    const reader = new FileReader();
    reader.onload = ev => {
      document.getElementById("preview").src = ev.target.result;
      document.getElementById("preview").classList.remove("hidden");
    };
    reader.readAsDataURL(file);
  }
});

document.getElementById("pictureForm").addEventListener("submit", async e => {
  e.preventDefault();
  const file = document.getElementById("picture").files[0];
  if (!file) return Swal.fire("Error", "Please select an image", "error");
  try {
  const formData = new FormData();
  formData.append("ProductId", productId);
  formData.append("Picture", file);

  const res = await fetch(`${apiBase}/Products/update-product-picture`, {
    method: "PUT",
    headers: {
      "Authorization": `Bearer ${sessionStorage.getItem("accessToken")}`
    },
    body: formData
  });

  const message = await res.text();
  Swal.fire(
    res.ok ? "Updated" : "Error",
    message || (res.ok ? "Picture updated successfully" : "Something went wrong"),
    res.ok ? "success" : "error"
  );
} catch (err) {
  Swal.fire("Error", err.message || "Unexpected error occurred", "error");
}finally{
  document.getElementById("picture").value = "";
  document.getElementById("preview").classList.add("hidden");
}});


async function loadSpecifications() {
  const res = await fetch(`${apiBase}/Specifications/product/${productId}`);
  const data = await res.json();
  const specs = data.data?.specifications ?? [];
  const container = document.getElementById("specList");
  container.innerHTML = "";
  specs.forEach(s => {
    const div = document.createElement("div");
    div.className = "flex justify-between items-center border p-2 rounded";
    div.innerHTML = `
      <span><b>${s.specificationName}</b>: ${s.value}</span>
      <div class="space-x-2">
        <button onclick="editSpec('${s.id}','${s.value}')" class="px-2 py-1 bg-yellow-500 text-white rounded">Edit</button>
        <button onclick="deleteSpec('${s.id}')" class="px-2 py-1 bg-red-600 text-white rounded">Delete</button>
      </div>
    `;
    container.appendChild(div);
  });
}


document.getElementById("addSpecForm").addEventListener("submit", async e => {
  e.preventDefault();
  try {
  const specId = document.getElementById("specId").value;
  const value = document.getElementById("specValue").value;
  if (!specId || !value) {
    Swal.fire("Error", "Please select a specification and enter a value", "error");
    return;
  }
  console.log(specId)
  console.log(value)

  const res = await fetch(`${apiBase}/Specifications/productspecifications`, {
    method: "POST",
    headers: { 
      "Content-Type": "application/json",
      "Authorization": `Bearer ${sessionStorage.getItem("accessToken")}`
    },
    body: JSON.stringify({ productId, specificationId: specId, value })
  });

  const message = await res.text();
  Swal.fire(
    res.ok ? "Added" : "Error",
    message || (res.ok ? "Specification added successfully" : "Something went wrong"),
    res.ok ? "success" : "error"
  );

  if (res.ok) {
    loadSpecifications();
  }
} catch (err) {
  Swal.fire("Error", err.message || "Unexpected error occurred", "error");
}

});


async function editSpec(id, oldValue) {
  try {
    const { value } = await Swal.fire({
      title: "Edit Specification",
      input: "text",
      inputValue: oldValue,
      showCancelButton: true
    });

    if (!value || value === oldValue) return;  

    const res = await fetch(`${apiBase}/Specifications/productspecifications/${id}`, {
      method: "PUT",
      headers: { 
        "Content-Type": "application/json",
        "Authorization": `Bearer ${sessionStorage.getItem("accessToken")}`
      },
      body: JSON.stringify({ productSpecificationId: id, value })
    });

    const message = await res.text();
    Swal.fire(
      res.ok ? "Updated" : "Error",
      message || (res.ok ? "Specification updated successfully" : "Something went wrong"),
      res.ok ? "success" : "error"
    );

    if (res.ok) {
      loadSpecifications();
    }
  } catch (err) {
    Swal.fire("Error", err.message || "Unexpected error occurred", "error");
  }
}


async function deleteSpec(id) {
  try {
    const confirm = await Swal.fire({
      title: "Are you sure?",
      text: "This will permanently delete the specification.",
      icon: "warning",
      showCancelButton: true,
      confirmButtonText: "Yes, delete it",
      cancelButtonText: "Cancel"
    });

    if (!confirm.isConfirmed) return;

    const res = await fetch(`${apiBase}/Specifications/productspecifications/${id}`, {
      method: "DELETE",
      headers: {
        "Authorization": `Bearer ${sessionStorage.getItem("accessToken")}`
      }
    });

    const message = await res.text();
    Swal.fire(
      res.ok ? "Deleted" : "Error",
      message || (res.ok ? "Specification deleted successfully" : "Failed to delete specification"),
      res.ok ? "success" : "error"
    );

    if (res.ok) {
      loadSpecifications();
    }
  } catch (err) {
    Swal.fire("Error", err.message || "Unexpected error occurred", "error");
  }
}


loadProduct();


const specContainer = document.getElementById("specId");

async function renderSpecifications(specifications){
    console.log("Specifications",specifications);
     if(specifications.length === 0){
        return;
     }
     specifications.forEach(specification => {
        const option = document.createElement("option");
        option.textContent = specification.name;
        option.value = specification.id;
        specContainer.appendChild(option);
     });
  }

  let loadAllSpecifications = async () =>{
  try{
  const res = await fetch(`${apiBase}/Specifications`);
  const specifications = await res.json();
  console.log(specifications);
  renderSpecifications(specifications.data);
  }catch{
    specContainer.innerHTML += `<option class="text-red-500">Could not load Specifications.</option>`;
  }
}

loadAllSpecifications();


