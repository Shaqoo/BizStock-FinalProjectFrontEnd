    const apiBase = "https://localhost:7124/api/v1/Specifications";

    async function fetchSpecifications() {
      try {
        const res = await fetch(apiBase);
        const data = await res.json();
        console.log(data);
        const specs = data.data || data; 
        const table = document.getElementById("specTable");
        table.innerHTML = "";

        specs.forEach(spec => {
          const row = document.createElement("tr");
          row.innerHTML = `
            <td class="p-3">${spec.name}</td>
            <td class="p-3">${spec.description}</td>
            <td class="p-3 text-center">
              <button class="bg-blue-500 hover:bg-blue-600 text-white px-3 py-1 rounded mr-2" onclick="editSpec('${spec.id}', '${spec.name}', '${spec.description}')">Edit</button>
              <button class="bg-red-500 hover:bg-red-600 text-white px-3 py-1 rounded" onclick="deleteSpec('${spec.id}')">Delete</button>
            </td>
          `;
          table.appendChild(row);
        });
      } catch (err) {
        Swal.fire("Error", "Failed to load specifications", "error");
      }
    }

    async function editSpec(id, currentName, currentDesc) {
      const { value: formValues } = await Swal.fire({
        title: "Edit Specification",
        html: `
          <input id="swal-name" class="swal2-input" placeholder="Name" value="${currentName}">
          <input id="swal-desc" class="swal2-input" placeholder="Description" value="${currentDesc}">
        `,
        focusConfirm: false,
        preConfirm: () => {
          return {
            specificationId: id,
            name: document.getElementById("swal-name").value,
            description: document.getElementById("swal-desc").value
          };
        }
      });

      if (!formValues) return;

      try {
        const res = await fetch(`${apiBase}/${id}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(formValues)
        });
        if (res.ok) {
          Swal.fire("Updated!", "Specification updated successfully", "success");
          fetchSpecifications();
        } else {
          Swal.fire("Error", "Failed to update specification", "error");
        }
      } catch (err) {
        Swal.fire("Error", "Failed to update specification", "error");
      }
    }

    async function deleteSpec(id) {
      Swal.fire({
        title: "Are you sure?",
        text: "This will permanently delete the specification.",
        icon: "warning",
        showCancelButton: true,
        confirmButtonText: "Yes, delete it!"
      }).then(async (result) => {
        if (result.isConfirmed) {
          try {
            const res = await fetch(`${apiBase}/${id}`, { method: "DELETE" });
            if (res.ok) {
              Swal.fire("Deleted!", "Specification deleted successfully", "success");
              fetchSpecifications();
            } else {
              Swal.fire("Error", "Failed to delete specification", "error");
            }
          } catch (err) {
            Swal.fire("Error", "Failed to delete specification", "error");
          }
        }
      });
    }

    fetchSpecifications();
