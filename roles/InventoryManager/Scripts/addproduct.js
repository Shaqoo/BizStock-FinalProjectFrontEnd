let apiBaseUrl = "https://localhost:7124/api/v1";
const apiBase = "https://localhost:7124/api/v1/Notifications";

const fileInput = document.getElementById("imageInput");
const previewContainer = document.getElementById("previewContainer");
const previewImg = document.getElementById("previewImg");
const qrCanvas = document.getElementById("qrCanvas");
const categoriesContainer = document.getElementById("categoryId");
const brandsContainer = document.getElementById("brandId");


fileInput.addEventListener("change", () => {
  const file = fileInput.files[0];
  if (!file) return;

  if (file.size > 3 * 1024 * 1024) { 
    Swal.fire({ icon: "error", title: "File Too Large", text: "Image must be under 3MB." });
    fileInput.value = "";
    previewContainer.classList.add("hidden");
    return;
  }

  const reader = new FileReader();
  reader.onload = (e) => {
    previewImg.src = e.target.result;
    previewContainer.classList.remove("hidden");
  };
  reader.readAsDataURL(file);
});

document.getElementById("productForm").addEventListener("submit", async (e) => {
  e.preventDefault();

  const name = document.getElementById("name").value.trim();
  const categoryId = document.getElementById("categoryId").value;
  const brandId = document.getElementById("brandId").value;
  const sku = document.getElementById("sku").value.trim();
  const barcode = document.getElementById("barcode").value.trim();
  const description = document.getElementById("description").value.trim();
  const costPrice = parseFloat(document.getElementById("costPrice").value);
  const sellingPrice = parseFloat(document.getElementById("sellingPrice").value);
  const unit = document.getElementById("unit").value.trim();
  const imageFile = fileInput.files[0];

  if (!name || !categoryId || !brandId || !sku || !barcode || !description || !unit || !imageFile) {
    Swal.fire({ icon: "warning", title: "Missing Fields", text: "Please fill all fields and upload an image." });
    return;
  }

  if(isNaN(costPrice) || isNaN(sellingPrice) || costPrice <= 0 || sellingPrice <= 0){
    Swal.fire({ icon: "warning", title: "Invalid Price", text: "Please enter valid prices." })
    return;
  }

  if(costPrice > sellingPrice){
    Swal.fire({ icon: "warning", title: "Invalid Price", text: "Cost price cannot be greater than selling price." })
    return;
  }



  const qrData = JSON.stringify({
    name,
    sellingPrice,
    costPrice,
    image: imageFile.name
  });

  await QRCode.toCanvas(qrCanvas, qrData, { width: 200 });
  const qrBase64 = await QRCode.toDataURL(qrData, { width: 200 });
  const blob = await (await fetch(qrBase64)).blob();

  const formData = new FormData();
  formData.append("Name", name);
  formData.append("CategoryId", categoryId);
  formData.append("BrandId", brandId);
  formData.append("SKU", sku);
  formData.append("Barcode", barcode);
  formData.append("QrCodeValue",blob,"qrcode.png");
  formData.append("Description", description);
  formData.append("CostPrice", costPrice);
  formData.append("SellingPrice", sellingPrice);
  formData.append("UnitOfMeasure", unit);
  formData.append("ImageUrl", imageFile);

  try {
    const response = await fetch(`${apiBaseUrl}/Products/create-product`, {
      method: "POST",
      headers: { "Authorization": `Bearer ${sessionStorage.getItem("accessToken")}` },
      body: formData
    });

    const data = await response.json();
    if (data.isSuccess) {
      Swal.fire({ icon: "success", title: "Product Added", text: "Product created successfully!" });
      document.getElementById("productForm").reset();
      previewContainer.classList.add("hidden");
      qrCanvas.getContext("2d").clearRect(0, 0, qrCanvas.width, qrCanvas.height);
    } else {
      Swal.fire({ icon: "error", title: "Error", text: data.message || "Failed to create product." });
    }
  } catch (err) {
    console.error(err);
    Swal.fire({ icon: "error", title: "Error", text: "Something went wrong while saving product." });
  }
});


 async function renderCategories(categories){
    console.log("Categories",categories);
     if(categories.length === 0){
        return;
     }
     categories.forEach(category => {
        const option = document.createElement("option");
        option.textContent = category.name;
        option.value = category.id;
        categoriesContainer.appendChild(option);
        if(category.subCategories.length > 0)
          renderCategories(category.subCategories);
     });
  }

  async function renderBrands(brands){
    console.log("Brands",brands);
     if(brands.length === 0){
        return;
     }
     brands.forEach(brand => {
        const option = document.createElement("option");
        option.textContent = brand.name;
        option.value = brand.id;
        brandsContainer.appendChild(option);
     });
  }


  
let loadCategories = async () =>{
  try{
  const res = await fetch(`${apiBaseUrl}/Categories/tree`);
  const categories = await res.json();
  console.log(categories);
  renderCategories(categories.data);
  }catch{
    categoriesContainer.innerHTML = `<option class="text-red-500">Could not load Categories.</option>`;
  }
}

let loadBrands = async () =>{
  try{
  const res = await fetch(`${apiBaseUrl}/Brands/paginated?pageNumber=${1}&pageSize=${20}`);
  const brands = await res.json();
  console.log(brands);
  renderBrands(brands.data.items);
  }catch{
    brandsContainer.innerHTML = `<option class="text-red-500">Could not load Brands.</option>`;
  }
}

document.addEventListener("DOMContentLoaded", () => {
  loadCategories();
  loadBrands();
});

