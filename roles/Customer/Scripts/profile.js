const tabs = document.querySelectorAll(".tab-btn");
    const contents = document.querySelectorAll(".tab-content");

    tabs.forEach(tab => {
      tab.addEventListener("click", () => {
        tabs.forEach(t => t.classList.remove("text-blue-600", "border-blue-600", "active"));
        tab.classList.add("text-blue-600", "border-blue-600", "active");

        contents.forEach(c => c.classList.add("hidden"));
        document.getElementById(tab.dataset.tab).classList.remove("hidden");
      });
    });


document.addEventListener("DOMContentLoaded", async () => {
  await renderProfile();
});

let apiBaseUrl = "https://localhost:7124/api/v1";


async function renderProfile(){
    const customer = await currentCustomer();
    console.log("Customer:"+ customer);
    const user = await currentUser();
    console.log(user);

    document.querySelector("#profile-container").innerHTML = `
      <img src="${user.profilepicture ?? `https://ui-avatars.com/api/?name=${encodeURIComponent(user.fullName)}&size=150&background=0D8ABC&color=fff&rounded=true`}" 
     alt="Profile Picture" 
     class="w-24 h-24 rounded-full shadow-md border-2 border-gray-200">

      <div>
        <h1 class="text-2xl font-bold">${user.fullName}</h1>
        <p class="text-gray-600">${user.email}</p>
      </div>
    `;
    document.querySelector("#userName").textContent = user.fullName;
    document.querySelector("#user-profile-pic").src = user.profilepicture

    document.querySelector("#contact-info").innerHTML = `
        <li><strong>Username:</strong> ${user.fullName}</li>
        <li><strong>Email:</strong> ${user.email}</li>
        <li><strong>Phone:</strong> ${user.phoneNumber}</li>
        <li><strong>Date of Birth:</strong> ${new Date(user.dob).toLocaleDateString()}</li>
        <li><strong>Address:</strong>${customer.address === "" || null? "N/A" : customer.address}</li>
        <li><strong>Age:</strong> ${user.age}</li>
        <li><strong>Gender:</strong> ${user.gender}</li>
    `;
    
    document.querySelector("#account-info").innerHTML = `
        <li><strong>Role:</strong> ${user.role}</li>
        <li><strong>Last Logged In:</strong> ${new Date(user.lastLoggedIn).toLocaleDateString()}</li>
        <li><strong>Email Verified:</strong> ${user.isEmailVerified ? "✅" : "❌"}</li>
        <li><strong>Phone Verified:</strong> ${user.isEmailVerified ? "✅" : "❌"}</li>
        <li><strong>Two-Factor Enabled:</strong> ${user.isTwoFactorEnabled ? "🔒 Enabled" : "🔒 Disabled"}</li>
        `;
    
    document.querySelector("#business-info").innerHTML = `
        <li><strong>Customer Type:</strong> ${customer.customerType}</li>
        <li><strong>Business Name:</strong> ${customer.businessName ?? "N/A"}</li>
        <li><strong>Tax ID:</strong> ${customer.taxId ?? "N/A"}</li>
        <li><strong>State:</strong> ${customer.state?? "N/A"}</li>
    `
};


let currentCustomer = async () => {
  try {
    const request = await fetch(`${apiBaseUrl}/Customers/current`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${sessionStorage.getItem("accessToken")}`
    }});
    const response = await request.json();
    console.log(response);
    if(response.isSuccess)
      return response.data;
    else
      return null;
  } catch (error) {
    console.log(error);
    return null;
  }
}



  //const toggleBtn = document.getElementById("edit-profile");
  const editContainer = document.getElementById("edit-container");

//   toggleBtn.addEventListener("click", (e) => {
//     e.preventDefault();
//     editContainer.classList.toggle("hidden");

//     if (editContainer.classList.contains("hidden")) {
//       toggleBtn.textContent = "Edit Profile";
//       toggleBtn.classList.remove("bg-red-600", "hover:bg-red-700");
//       toggleBtn.classList.add("bg-blue-600", "hover:bg-blue-700");
//     } else {
//       toggleBtn.textContent = "Close Edit Profile";
//       toggleBtn.classList.remove("bg-blue-600", "hover:bg-blue-700");
//       toggleBtn.classList.add("bg-red-600", "hover:bg-red-700");
//     }
//   });


  function openModal(id) {
    document.getElementById('overlay').classList.remove('hidden');
    document.getElementById(id).classList.remove('hidden');
    document.getElementById(id).classList.remove('modal-hidden');
    
  }

  function closeModal(id) {
    document.getElementById('overlay').classList.add('hidden');
    document.getElementById(id).classList.add('hidden');
    document.getElementById(id).classList.add('modal-hidden');
  }



  document.querySelector("#update-nameBtn").addEventListener("click", async () => {
    const firstname = document.querySelector("#firstName").value.trim();
    const lastname = document.querySelector("#lastName").value.trim();

 
    const nameRegex = /^[A-Za-z]{2,}$/; 
    if (!firstname || !lastname) {
        Swal.fire({icon: 'warning', title: 'Name is required', text: 'Please enter your first and last name', confirmButtonText: 'OK'});
        return;
    }
    if (!nameRegex.test(firstname) || !nameRegex.test(lastname)) {
        Swal.fire({icon: 'warning', title: 'Invalid Name', text: "First name and last name must contain only letters and be at least 2 characters long", confirmButtonText: 'OK'});
        return;
    }

    const dto = {
        Firstname: firstname,
        Lastname: lastname
    };

    try {
        const response = await fetch(`${apiBaseUrl}/Users/full-name`, {
            method: "PUT", 
            headers: {
                "Content-Type": "application/json",
                "Authorization": `Bearer ${sessionStorage.getItem("accessToken")}`
            },
            body: JSON.stringify(dto)
        });

        const data = await response.json();
        if (data.isSuccess) {
            Swal.fire({icon: 'success', title: 'Success', text: 'Name updated successfully!', confirmButtonText: 'OK'});
            document.querySelector(".userName").textContent = `${firstname} ${lastname}`;
        } else {
            Swal.fire({icon: 'error', title: 'Error', text: data.message || "Failed to update name", confirmButtonText: 'OK'});
        }
    } catch (err) {
        console.error(err);
        Swal.fire({icon: 'error', title: 'Error', text: "An error occurred while updating name", confirmButtonText: 'OK'});
    }
});

const fileInput = document.querySelector("#profilePicInput");
const previewImg = document.querySelector("#profilePreview");
const updateBtn = document.querySelector("#update-picBtn");

fileInput.addEventListener("change", () => {
    const file = fileInput.files[0];
    if (!file) return;

    if (!file.type.startsWith("image/")) {
        Swal.fire("Error", "Only image files are allowed", "error");
        fileInput.value = "";
        previewImg.classList.add("hidden");
        return;
    }

    
    const maxSize = 4 * 1024 * 1024; 
    if (file.size > maxSize) {
        Swal.fire("Error", "File size must be 4MB or less", "error");
        fileInput.value = "";
        previewImg.classList.add("hidden");
        return;
    }

    previewImg.src = URL.createObjectURL(file);
    previewImg.classList.remove("hidden");
});


updateBtn.addEventListener("click", async () => {
    const file = fileInput.files[0];
    if (!file) {
        Swal.fire("Info", "Please select a file to upload", "info");
        return;
    }

    const formData = new FormData();
    formData.append("File", file);

    try {
        const response = await fetch(`${apiBaseUrl}/Users/profile-picture`, {
            method: "PUT",
            headers: {
                "Authorization": `Bearer ${sessionStorage.getItem("accessToken")}`
            },
            body: formData
        });

        const data = await response.json();

        if (data.isSuccess) {
            Swal.fire("Success", "Profile picture updated!", "success");
            fileInput.value = "";
            previewImg.classList.add("hidden");
        } else {
            Swal.fire("Error", data.message || "Failed to upload picture", "error");
        }
    } catch (err) {
        console.error(err);
        Swal.fire("Error", "An error occurred while uploading", "error");
    }
});




// ---- Fingerprint registration script (complete) ----
const startBtn = document.getElementById('startFingerprintBtn');
const loader = document.getElementById('fingerprintLoader');

let abortController = null;

// COSE alg map (string -> integer)
const COSE_ALG_MAP = {
  ES256: -7,  RS256: -257, PS256: -37,
  ES384: -35, RS384: -258, PS384: -38,
  ES512: -36, RS512: -259, PS512: -39,
  EdDSA: -8
};

function mapAlgToInt(alg) {
  if (typeof alg === 'number') return alg;
  if (!alg) return -7;
  // Normalize string like "ES256", "es256", or "-7"
  const s = String(alg).trim();
  // try direct map
  const key = s.toUpperCase();
  if (COSE_ALG_MAP[key] !== undefined) return COSE_ALG_MAP[key];
  // try parse integer (in case backend already provided stringified number)
  const parsed = parseInt(s, 10);
  if (!Number.isNaN(parsed)) return parsed;
  console.warn('Unknown COSE alg:', alg, '-> defaulting to ES256 (-7)');
  return -7; // safe default
}

function base64UrlToUint8Array(base64UrlString) {
  if (!base64UrlString) return new Uint8Array();
  const padding = '='.repeat((4 - (base64UrlString.length % 4)) % 4);
  const base64 = (base64UrlString + padding).replace(/-/g, '+').replace(/_/g, '/');
  const raw = window.atob(base64);
  const out = new Uint8Array(raw.length);
  for (let i = 0; i < raw.length; ++i) out[i] = raw.charCodeAt(i);
  return out;
}

function bufferToBase64(buffer) {
  const bytes = new Uint8Array(buffer);
  let binary = '';
  for (let i = 0; i < bytes.byteLength; i++) binary += String.fromCharCode(bytes[i]);
  return btoa(binary).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
}

startBtn.addEventListener('click', async () => {
  if (abortController) {
    abortController.abort();
    Swal.fire({ icon: 'info', title: 'Registration Cancelled' });
    loader.classList.add('hidden');
    startBtn.textContent = 'Start';
    startBtn.classList.replace('bg-gray-600', 'bg-green-600');
    abortController = null;
    return;
  }

  abortController = new AbortController();
  loader.classList.remove('hidden');
  startBtn.textContent = 'Cancel Registration';
  startBtn.classList.replace('bg-green-600', 'bg-gray-600');

  try {
    const token = sessionStorage.getItem("accessToken");
    if (!token) throw new Error("Please login first.");

    const res = await fetch(`${apiBaseUrl}/Users/biometrics/generate-registration-options`, {
      method: "POST",
      headers: { "Authorization": `Bearer ${token}` },
      signal: abortController.signal
    });

    if (!res.ok) {
      const text = await res.text();
      throw new Error("Failed to generate registration options: " + text);
    }

    let options = await res.json();
    console.log('raw options from server:', options);

    // If backend wrapped in { value: ... } or JsonResult wrapper, unpack it
    if (options && options.value) options = options.value;

    // Basic sanity: must have rp and user
    if (!options.rp || !options.user) {
      throw new Error("Invalid options from server (rp/user missing). Check backend.");
    }

    // Normalize binary fields and case-sensitive strings
    const publicKey = {};

    // challenge -> Uint8Array
    publicKey.challenge = base64UrlToUint8Array(options.challenge);

    // rp -> keep id & name as strings (rp.id is required)
    publicKey.rp = {
      id: options.rp.id || window.location.hostname, // fallback if server forgot
      name: options.rp.name || ""
    };

    // user -> id must be Uint8Array, name and displayName strings
    publicKey.user = {
      id: base64UrlToUint8Array(options.user.id),
      name: options.user.name,
      displayName: options.user.displayName
    };

    // pubKeyCredParams -> ensure { type: 'public-key', alg: -7 } etc.
    if (!options.pubKeyCredParams || !Array.isArray(options.pubKeyCredParams) || options.pubKeyCredParams.length === 0) {
      throw new Error("pubKeyCredParams missing or empty in server response.");
    }
    publicKey.pubKeyCredParams = options.pubKeyCredParams.map(p => ({
      type: (p.type || 'public-key').toLowerCase() === 'publickey' ? 'public-key' : String(p.type || 'public-key').toLowerCase(),
      alg: mapAlgToInt(p.alg)
    }));

    // timeout
    if (options.timeout) publicKey.timeout = options.timeout;

    // attestation -> lowercase 'none' etc.
    publicKey.attestation = options.attestation ? String(options.attestation).toLowerCase() : 'none';

    // authenticatorSelection -> normalize lowercase fields where required
    if (options.authenticatorSelection) {
      publicKey.authenticatorSelection = {};
      if (options.authenticatorSelection.authenticatorAttachment) {
        publicKey.authenticatorSelection.authenticatorAttachment =
          String(options.authenticatorSelection.authenticatorAttachment).toLowerCase();
      }
      if (options.authenticatorSelection.requireResidentKey !== undefined) {
        publicKey.authenticatorSelection.requireResidentKey = Boolean(options.authenticatorSelection.requireResidentKey);
      }
      if (options.authenticatorSelection.userVerification) {
        publicKey.authenticatorSelection.userVerification =
          String(options.authenticatorSelection.userVerification).toLowerCase();
      }
    }

    // excludeCredentials -> ensure id is Uint8Array and type is 'public-key'
    if (options.excludeCredentials && Array.isArray(options.excludeCredentials)) {
      publicKey.excludeCredentials = options.excludeCredentials.map(c => ({
        id: base64UrlToUint8Array(c.id),
        type: (c.type || 'public-key').toLowerCase() === 'publickey' ? 'public-key' : String(c.type || 'public-key').toLowerCase(),
        transports: c.transports // optional
      }));
    }

    console.log("Normalized publicKey (about to call navigator.credentials.create):", publicKey);

    // Create credential (this must run on a secure context: https or localhost)
    const credential = await navigator.credentials.create({ publicKey });
    if (!credential) throw new Error("navigator.credentials.create returned null/undefined.");

    // Prepare attestation for backend
    const attestationResponse = {
      id: credential.id,
      rawId: bufferToBase64(credential.rawId),
      type: credential.type,
      response: {
        clientDataJSON: bufferToBase64(credential.response.clientDataJSON),
        attestationObject: bufferToBase64(credential.response.attestationObject)
      }
    };

    const verifyRes = await fetch(`${apiBaseUrl}/Users/biometrics/verify-registration`, {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${token}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify(attestationResponse),
      signal: abortController.signal
    });

    const verifyResult = await verifyRes.json();
    if (!verifyRes.ok) throw new Error(verifyResult.message || JSON.stringify(verifyResult));

    Swal.fire({ icon: 'success', title: 'Fingerprint Registered!' });
    closeModal('fingerprintModal');

  } catch (err) {
    if (err && err.name === 'AbortError') {
      console.log('Registration aborted');
    } else {
      console.error(err);
      Swal.fire({ icon: 'error', title: 'Error', text: err.message || String(err) });
    }
  } finally {
    loader.classList.add('hidden');
    startBtn.textContent = 'Start';
    startBtn.classList.replace('bg-gray-600', 'bg-green-600');
    abortController = null;
  }
});
