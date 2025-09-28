 const apiBaseUrl = "https://localhost:7124/api/v1";
    const params = new URLSearchParams(window.location.search);
    const userId = params.get("id");

    async function loadUser() {
      const res = await fetch(`${apiBaseUrl}/Users/${userId}`,{
        headers: {
            "Authorization": `Bearer ${sessionStorage.getItem("accessToken")}`
        }
      });
      const { data } = await res.json();

 document.getElementById("fullName").textContent = data.fullName;
document.getElementById("email").textContent = "Email: " + data.email;
document.getElementById("phoneNumber").textContent = "Phone: " + data.phoneNumber;
document.getElementById("role").textContent = "Role: " + data.role;

document.getElementById("lastLogin").textContent = 
  "Last Login: " + (data.lastLoggedIn ? new Date(data.lastLoggedIn).toLocaleString() : "N/A");

document.getElementById("dob").textContent = 
  "DOB: " + (data.dob ? new Date(data.dob).toLocaleDateString() : "N/A");

document.getElementById("gender").textContent = 
  "Gender: " + (data.gender ?? "N/A");

document.getElementById("emailVerified").textContent = 
  "Email Verified: " + (data.isEmailVerified ? "✅" : "❌");

document.getElementById("phoneVerified").textContent = 
  "Phone Verified: " + (data.isEmailVerified ? "✅" : "❌");

document.getElementById("twoFactorAuth").textContent = 
  "2FA Enabled: " + (data.isTwoFactorAuthEnabled ? "✅ Enabled" : "❌ Disabled");

      document.getElementById("profilePic").src = data.profilepicture || getAvatarUrl(data.fullName);

      const statusEl = document.getElementById("status");
      if (data.isActive) {
        statusEl.textContent = "Active";
        statusEl.className = "mt-1 inline-block px-3 py-1 rounded-full text-sm font-semibold bg-green-100 text-green-700";
        document.getElementById("toggleStatusBtn").style.display = "none";
      } else {
        statusEl.textContent = "Inactive";
        statusEl.className = "mt-1 inline-block px-3 py-1 rounded-full text-sm font-semibold bg-red-100 text-red-700";
        document.getElementById("deleteBtn").style.display = "none";
      }

      if (["Supplier", "DeliveryAgent", "Customer"].includes(data.role)) {
         
        const extraRes = await fetch(`${apiBaseUrl}/${data.role}s/by-email/${data.email}`,{
            headers:{
                "Authorization": `Bearer ${sessionStorage.getItem("accessToken")}`
            }
        });
        const extra = (await extraRes.json()).data;

        let html = "";
        if (data.role === "Supplier") {
          html = `
            <p>Company: ${extra.companyName}</p>
            <p>Address: ${extra.address}</p>
            <p>Phone: ${extra.phoneNumber}</p>
            <p>Tax ID: ${extra.taxId}</p>
            <p>Contact: ${extra.contactPerson}</p>`;
        } else if (data.role === "DeliveryAgent") {
          html = `
            <p>Vehicle No: ${extra.vehicleNo}</p>
            <p>Contact: ${extra.contact}</p>
            <p>Status: ${extra.availabilityStatus}</p>`;
        } else if (data.role === "Customer") {
          html = `
            <p>Type: ${extra.customerType}</p>
            <p>Business: ${extra.businessName == null || extra.businessName === ""? "N/A" : extra.businessName}</p>
            <p>Address: ${extra.address == null || extra.address === ""? "N/A" : extra.address}</p>
            <p>Tax ID: ${extra.taxId == null || extra.taxId === ""? "N/A" : extra.taxId}</p>`;
        }

        document.getElementById("extraDetails").classList.remove("hidden");
        document.getElementById("detailsContent").innerHTML = html;
      }

      document.getElementById("toggleStatusBtn").onclick = async () => {
        const confirm = await Swal.fire({
          icon: "question",
          title: "Confirm",
          text: `Are you sure you want to ${data.isActive ? "deactivate" : "activate"} this user?`,
          showCancelButton: true,
          confirmButtonText: "Yes",
          cancelButtonText: "No"
        });

        if (confirm.isConfirmed) {
          await fetch(`${apiBaseUrl}/Users/${userId}/deactivate`, { method: "DELETE",
            headers:{
               "Authorization": `Bearer ${sessionStorage.getItem("accessToken")}`
            }
           });
          location.reload();
        }
      };

    document.getElementById("deleteBtn").onclick = async () => {
        const step1 = await Swal.fire({
        title: "Are you sure?",
        text: "This action cannot be undone.",
        icon: "warning",
        showCancelButton: true,
        confirmButtonText: "Yes, continue"
      });
      if (!step1.isConfirmed) return;

      
      const step2 = await Swal.fire({
        title: "Final Confirmation",
        text: "Deleting this user will permanently remove all data.",
        icon: "error",
        showCancelButton: true,
        confirmButtonText: "Yes, I understand"
      });
      if (!step2.isConfirmed) return;

     
      const step3 = await Swal.fire({
        title: "Type DELETE to confirm",
        input: "text",
        inputPlaceholder: "Type DELETE",
        showCancelButton: true,
        preConfirm: (val) => {
          if (val !== "DELETE") {
            Swal.showValidationMessage("You must type DELETE exactly");
            return false;
          }
          return true;
        }
      });
      if (!step3.isConfirmed) return;


       try {
        const res = await fetch(`${apiBaseUrl}/Users/${userId}/deactivate`, {
          method: "DELETE",
          headers: { "Authorization": `Bearer ${sessionStorage.getItem("accessToken")}` }
        });
        if (!res.ok) throw new Error("Failed to delete user");

        Swal.fire("Deleted", "User has been deleted", "success")
          .then(() => window.location.href = "/roles/Admin/Pages/users.html");
      } catch (err) {
        Swal.fire("Error", "Could not delete user", "error");
      }
        };
    }

    function getAvatarUrl(name) {
  return `https://ui-avatars.com/api/?name=${encodeURIComponent(name)}&background=0D8ABC&color=fff&size=128&rounded=true`;
}

document.addEventListener("DOMContentLoaded", loadUser);
