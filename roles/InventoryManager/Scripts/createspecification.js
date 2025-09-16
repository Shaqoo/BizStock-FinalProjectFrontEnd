    const form = document.getElementById("specForm");
    const status = document.getElementById("status");

    form.addEventListener("submit", async (e) => {
      e.preventDefault();

      const payload = {
        name: document.getElementById("name").value,
        description: document.getElementById("description").value
      };

      try {
        const response = await fetch("https://localhost:7124/api/v1/Specifications", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${sessionStorage.getItem("accessToken")}`
          },
          body: JSON.stringify(payload)
        });

        if (response.ok) {
          const result = await response.json();
          status.textContent = "✅ Specification created successfully!";
          status.className = "text-green-600 text-center mt-4";
          form.reset();
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
