  const steps = document.querySelectorAll('.form-step');
  const next1 = document.getElementById('next1');
  const next2 = document.getElementById('next2');
  const prev1 = document.getElementById('prev1');
  const prev2 = document.getElementById('prev2');
  const form = document.getElementById('registerForm');
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
    errorEl.textContent = '';
    errorEl.classList.add('hidden');
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
    if (!/^\d{4}$/.test(pin.value)) { showError(pin, 'PIN must be 4 digits'); valid = false; } else clearError(pin);

    return valid;
  }

  function validateStep3() {
    const type = form.customerType.value;
    let valid = true;
    if (type === 'Wholesale') {
      if (!form.businessName.value.trim()) { showError(form.businessName, 'Business name required'); valid = false; } else clearError(form.businessName);
      if (!form.taxId.value.trim()) { showError(form.taxId, 'Tax ID required'); valid = false; } else clearError(form.taxId);
    }
    return valid;
  }

  next1.addEventListener('click', () => { if (validateStep1()) { currentStep = 1; showStep(currentStep); } });
  next2.addEventListener('click', () => { if (validateStep2()) { currentStep = 2; showStep(currentStep); } });
  prev1.addEventListener('click', () => { currentStep = 0; showStep(currentStep); });
  prev2.addEventListener('click', () => { currentStep = 1; showStep(currentStep); });

  document.querySelectorAll('.toggle-password').forEach(btn => {
    btn.addEventListener('click', () => {
      const input = btn.parentElement.querySelector('input');
      input.type = input.type === 'password' ? 'text' : 'password';
    });
  });

  form.addEventListener('submit', async e => {
    e.preventDefault();
    if (!validateStep3()) return;
    const data = Object.fromEntries(new FormData(form).entries());
    data.pin = parseInt(data.pin);

    try {
      const res = await fetch('https://localhost:7124/api/v1/Customers', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
      });
      const result = await res.json();
      console.log(result);
      if (!res.ok) 
        {
           Swal.fire({
            icon: 'error',
            title: 'Registration Failed',
            text: result.message || 'Something went wrong'
            });
            return;
        }
        Swal.fire({
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


      form.reset();
      window.location.href = '/general/verifyemail.html';
      currentStep = 0;
      showStep(currentStep);
    } catch (err) {
        Swal.fire({
          icon: 'error',
          title: 'Oops...',
          text: err.message
        });
      }
  });

  showStep(0);
