let apiBaseUrl = "https://localhost:7124/api/v1";

document.querySelector("#brandForm").addEventListener("submit", async (e) => {
  e.preventDefault();

  const dto = {
    name: document.getElementById("brandName").value.trim(),
    websiteUrl: document.getElementById("websiteUrl").value.trim(),
    logoUrl: document.getElementById("logoUrl").value.trim(),
    description: document.getElementById("description").value.trim()
  };

  if (!dto.name || !dto.websiteUrl || !dto.logoUrl) {
    Swal.fire({ icon: "warning", title: "Missing Fields", text: "Please fill in all required fields." });
    return;
  }

  try {
    const response = await fetch(`${apiBaseUrl}/Brands`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${sessionStorage.getItem("accessToken")}`
      },
      body: JSON.stringify(dto)
    });

    const data = await response.json();

    if (response.status === 201) {
      Swal.fire({
        icon: "success",
        title: "Brand Created!",
        text: "Your brand has been added successfully.",
        confirmButtonText: "OK"
      }).then(() => {
        window.location.href = "/roles/InventoryManager/brands.html";
      });
    } else {
      Swal.fire({
        icon: "error",
        title: "Error",
        text: data.message || "Failed to create brand."
      });
    }
  } catch (err) {
    console.error(err);
    Swal.fire({ icon: "error", title: "Error", text: "Something went wrong while creating brand." });
  }
});
