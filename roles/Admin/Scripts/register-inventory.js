  const steps = document.querySelectorAll('.form-step');
  const next1 = document.getElementById('next1');
  const next2 = document.getElementById('next2');
  const prev1 = document.getElementById('prev1');
  const prev2 = document.getElementById('prev2');
  const passwordInput = document.getElementById('password');
  const confirmPasswordInput = document.getElementById('confirmPassword');
  const strengthBar = document.getElementById('strengthBar');
  const strengthText = document.getElementById('strengthText');
  const matchBar = document.getElementById('matchBar');
  const matchStatus = document.getElementById('matchStatus');
  const form = document.getElementById('registerForm');
  const buttonWrapper = document.getElementById('buttonWrapper');
  const loadingMessage = document.getElementById('loadingMessage');
  let currentStep = 0;

  function showStep(i) {
    steps.forEach((s, idx) => s.classList.toggle('hidden', idx !== i));
  }

  function showError(input, msg) {
    const errorEl = input.parentElement.querySelector('p');
    errorEl.textContent = msg;
    errorEl.classList.remove('hidden');
    input.classList.add('shake');
    setTimeout(() => input.classList.remove('shake'), 300);
  }
  function clearError(input) {
    const errorEl = input.parentElement.querySelector('p');
     if (errorEl) {
    errorEl.textContent = '';
    errorEl.classList.add('hidden');
    }
  }

  function validateStep1() {
    const fn = form.firstName, ln = form.lastName, em = form.email, ph = form.phoneNumber;
    const nameRegex = /^[A-Za-z]+$/;
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    let valid = true;

    if (!nameRegex.test(fn.value)) { showError(fn, 'First name must contain only letters'); valid = false; } else clearError(fn);
    if (!nameRegex.test(ln.value)) { showError(ln, 'Last name must contain only letters'); valid = false; } else clearError(ln);
    if (!emailRegex.test(em.value)) { showError(em, 'Invalid email'); valid = false; } else clearError(em);
    if (!ph.value.trim()) { showError(ph, 'Phone is required'); valid = false; } else clearError(ph);

    return valid;
  }

  function validateStep2() {
    const pw = form.password, cpw = form.confirmPassword, pin = form.pin;
    const pwRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[\W_]).{8,}$/;
    let valid = true;

    if (!pwRegex.test(pw.value)) { showError(pw, 'Password too weak'); valid = false; } else clearError(pw);
    if (pw.value !== cpw.value) { showError(cpw, 'Passwords do not match'); valid = false; } else clearError(cpw);
   // if (!/^\d{4}$/.test(pin.value)) { showError(pin, 'PIN must be 4 digits'); valid = false; } else clearError(pin);

    return valid;
  }

  function validateStep3() {
    let valid = true;
     if (!form.dob.value) {
    showError(form.dob, "Date of birth is required");
    valid = false;
  } else {
    const dob = new Date(form.dob.value);
    const today = new Date();
    const minDate = new Date();
    minDate.setFullYear(today.getFullYear() - 13);

    if (dob > minDate) {
      showError(form.dob, "You must be at least 13 years old");
      valid = false;
    } else {
      clearError(form.dob);
    }
}

if (!form.gender.value) {
  showError(form.gender, "Please select gender");
  valid = false;
} else {
  clearError(form.gender);
}
    return valid;
  }

  next1.addEventListener('click', () => { if (validateStep1()) { currentStep = 1; showStep(currentStep); } });
  next2.addEventListener('click', () => { if (validateStep2()) { currentStep = 2; showStep(currentStep); } });
  prev1.addEventListener('click', () => { currentStep = 0; showStep(currentStep); });
  prev2.addEventListener('click', () => { currentStep = 1; showStep(currentStep); });

  passwordInput.addEventListener('input', () => {
      const val = passwordInput.value;

  const hasUpper = /[A-Z]/.test(val);
  const hasNumber = /[0-9]/.test(val);
  const hasSpecial = /[#!@$%^&*]/.test(val);
  const isLong = val.length >= 8;

  const checksPassed = [hasUpper, hasNumber, hasSpecial, isLong].filter(Boolean).length;
  if (val.length === 0) {
    strengthBar.className = "h-2 rounded mt-1 bg-gray-300 w-0";
    strengthText.textContent = "";
    return;
  }

  if (!hasSpecial) {
    strengthBar.className = "h-2 rounded mt-1 bg-red-500 w-1/3";
    strengthText.textContent = "Weak (missing special character)";
    strengthText.className = "text-red-600 text-sm font-medium mt-1";
    return;
  }

  if (checksPassed < 3) {
    strengthBar.className = "h-2 rounded mt-1 bg-yellow-500 w-2/3";
    strengthText.textContent = "Medium";
    strengthText.className = "text-yellow-600 text-sm font-medium mt-1";
    return;
  }

  if (checksPassed === 4) {
    strengthBar.className = "h-2 rounded mt-1 bg-green-500 w-full";
    strengthText.textContent = "Strong";
    strengthText.className = "text-green-600 text-sm font-medium mt-1";
    return;
  }

    });

  confirmPasswordInput.addEventListener('input', () => {
      const match = passwordInput.value === confirmPasswordInput.value;
      matchStatus.textContent = match ? "✔ Passwords match" : "✘ Passwords do not match";
      matchStatus.className = match
        ? "text-green-600 text-sm mt-1"
        : "text-red-500 text-sm mt-1";
      const val = passwordInput.value;
      let strength = 0;
      if (val.length >= 8) strength++;
      if (/[A-Z]/.test(val)) strength++;
      if (/[0-9]/.test(val)) strength++;
      if (/[^A-Za-z0-9]/.test(val)) strength++;

      switch (strength) {
    case 0:
    case 1:
      matchBar.className = "h-2 rounded mt-1 bg-red-500 w-1/3";
      break;
    case 2:
      matchBar.className = "h-2 rounded mt-1 bg-yellow-500 w-2/3";
      break;
    case 3:
    case 4:
      matchBar.className = "h-2 rounded mt-1 bg-green-500 w-full";
      break;
      }
    });

  document.querySelectorAll('.toggle-password').forEach(btn => {
    btn.addEventListener('click', () => {
      const input = btn.parentElement.querySelector('input');
      input.type = input.type === 'password' ? 'text' : 'password';
    });
  });

  form.addEventListener('submit', async e => {
    e.preventDefault();
    if (!validateStep3()) return;
    buttonWrapper.innerHTML = `
        <div class="w-full flex justify-center">
          <div class="spinner"></div>
        </div>
      `;
    const data = Object.fromEntries(new FormData(form).entries());

    try {
      const res = await fetch('https://localhost:7124/api/v1/InventoryManagers', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${sessionStorage.getItem('accessToken')}`},
        body: JSON.stringify(data)
      });
      const result = await res.json();
      loadingMessage.classList.remove('hidden');
        setTimeout(() => {
        loadingMessage.classList.add('hidden');
      }, 3000);

      console.log(result); 
      if (!res.ok) 
        {

           Swal.fire({
            icon: 'error',
            title: 'Registration Failed',
            text: result.message || 'Something went wrong'
            });
            buttonWrapper.innerHTML = ` <button type="button" id="prev2" class="bg-gray-500 text-white px-4 py-2 rounded-lg hover:bg-gray-600 transition">Back</button>
        <button type="submit" class="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition">Register</button>
         <p id="loadingMessage" class="text-green-700 text-center hidden">Creating your account...</p>`;
            return;
        }
       const swalResult = await Swal.fire({
  title: 'Registration Successful!',
  width: 600,
  html: `
    <div class="text-left">
      <p class="mb-2 font-bold">Scan this QR Code in your Authenticator App:</p>
      <img src="${result.data.qrCodeImageUrl}" class="mx-auto mb-4 w-40 h-40 border p-2 rounded"/>

      <p><b>Manual Key:</b></p>
      <pre id="manualKey" class="bg-gray-100 p-2 rounded font-mono text-sm">${result.data.manualEntryKey}</pre>
      <button id="copyManualKey" class="bg-blue-600 text-white px-2 py-1 rounded mt-1 text-xs">📋 Copy</button>

      <p class="mt-4"><b>Recovery Codes:</b></p>
      <pre id="recoveryCodes" class="bg-gray-100 p-2 rounded font-mono text-sm whitespace-pre-line">
${result.data.recoveryCodes.join('\n')}
      </pre>
      <div class="flex gap-2 mt-1">
        <button id="copyRecoveryCodes" class="bg-green-600 text-white px-2 py-1 rounded text-xs">📋 Copy</button>
        <button id="downloadRecoveryCodes" class="bg-gray-700 text-white px-2 py-1 rounded text-xs">⬇ Download</button>
      </div>
    </div>
  `,
  icon: 'success',
  confirmButtonText: 'Done',
  allowOutsideClick: false,
  allowEscapeKey: false,
  didOpen: () => {
    document.getElementById('copyManualKey').addEventListener('click', () => {
      const key = document.getElementById('manualKey').innerText.trim();
      navigator.clipboard.writeText(key).then(() => {
        Swal.showValidationMessage('✅ Manual Key copied!');
        setTimeout(() => Swal.resetValidationMessage(), 1500);
      });
    });

    document.getElementById('copyRecoveryCodes').addEventListener('click', () => {
      const codes = document.getElementById('recoveryCodes').innerText.trim();
      navigator.clipboard.writeText(codes).then(() => {
        Swal.showValidationMessage('✅ Recovery Codes copied!');
        setTimeout(() => Swal.resetValidationMessage(), 1500);
      });
    });

    document.getElementById('downloadRecoveryCodes').addEventListener('click', () => {
      const codes = document.getElementById('recoveryCodes').innerText.trim();
      const blob = new Blob([codes], { type: "text/plain" });
      const url = window.URL.createObjectURL(blob);

      const a = document.createElement("a");
      a.href = url;
      a.download = "recovery-codes.txt";
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);

      Swal.showValidationMessage('✅ Recovery Codes downloaded!');
      setTimeout(() => Swal.resetValidationMessage(), 1500);
    });
  }
});

if (swalResult.isConfirmed) {
  form.reset();
  currentStep = 0;
  showStep(currentStep);
  window.location.href = '/general/verifyemail.html';
}

    } catch (err) {
        Swal.fire({
          icon: 'error',
          title: 'Oops...',
          text: err.message
        });
        buttonWrapper.innerHTML = ` <button type="button" id="prev2" class="bg-gray-500 text-white px-4 py-2 rounded-lg hover:bg-gray-600 transition">Back</button>
        <button type="submit" class="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition">Register</button>
         <p id="loadingMessage" class="text-green-700 text-center hidden">Creating your account...</p>`
         return;
      }
  });

  showStep(0);

const dobInput = document.getElementById("dob");
const today = new Date();
const minDate = new Date();
minDate.setFullYear(today.getFullYear() - 13);


const maxDate = minDate.toISOString().split("T")[0];
dobInput.setAttribute("max", maxDate);

