const inputs = document.querySelectorAll('.mfa-input');
    const verifyBtn = document.getElementById('verifyBtn');
    const message = document.getElementById('message');

    inputs.forEach((input, idx) => {
      input.addEventListener('input', () => {
        if (input.value.length === 1 && idx < inputs.length - 1) {
          inputs[idx + 1].focus();
        }
      });

      input.addEventListener('keydown', (e) => {
        if (e.key === 'Backspace' && !input.value && idx > 0) {
          inputs[idx - 1].focus();
        }
      });
    });

    verifyBtn.addEventListener('click', async () => {
      message.textContent = '';
      const code = Array.from(inputs).map(i => i.value).join('');

      if (!/^\d{6}$/.test(code)) {
        message.textContent = 'Please enter a valid 6-digit code.';
        inputs.forEach(i => i.classList.add('shake'));
        setTimeout(() => inputs.forEach(i => i.classList.remove('shake')), 300);
        return;
      }

      try {
        const response = await fetch('https://localhost:7124/api/v1/Users/verify-mfa', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json',
            'Authorization': `Bearer ${sessionStorage.getItem('tempToken')}`
          },
          body: JSON.stringify({
            mfaCode: code,
            tempToken: sessionStorage.getItem('tempToken')
        })
        });

        const data = await response.json();
        console.log(data)
        if (data.isSuccess) {
          message.classList.remove('text-red-500');
          message.classList.add('text-green-500');
          message.textContent = 'MFA verified! Redirecting...';
          let token = data.data.accesstoken;
          sessionStorage.setItem('accessToken', data.data.accesstoken);
          sessionStorage.removeItem('tempToken');
          if(getRole(token) === "Customer"){
            setTimeout(() => window.location.href = '/general/Products.htm', 2000);
          }else if(getRole(token) === "CustomerService"){
            setTimeout(() => window.location.href = '/roles/CustomerServiceOfficer/Dashboard.html', 2000);
          }
          setTimeout(() => window.location.href = '/general/Products.htm', 2000);
        } else {
          if (data.message && data.message.toLowerCase().includes("user not found")) {
            Swal.fire({
              icon: "error",
              title: "User Not Found",
              text: "We couldn't find your account. Please log in again.",
              confirmButtonText: "Go to Login"
            }).then(() => {
              window.location.href = "/general/login.html"; 
            });
          } else {
            message.textContent = data.message || 'Invalid code. Try again.';
            inputs.forEach(i => i.classList.add('shake'));
            setTimeout(() => inputs.forEach(i => i.classList.remove('shake')), 600);
          }
        }

      } catch (err) {
        console.error(err);
        message.textContent = 'Something went wrong. Try again.';
      }
    });

    inputs[0].focus();

function parseJwt(token) {
  try {
    const base64Url = token.split(".")[1];
    const base64 = base64Url.replace(/-/g, "+").replace(/_/g, "/");
    const jsonPayload = decodeURIComponent(
      atob(base64)
        .split("")
        .map(c => "%" + ("00" + c.charCodeAt(0).toString(16)).slice(-2))
        .join("")
    );
    return JSON.parse(jsonPayload);
  } catch (e) {
    console.error("Error parsing JWT:", e);
    return null;
  }
}

let getRole = (token) =>{
   let decodedJwt = parseJwt(token);
   console.log(decodedJwt)
   return decodedJwt["Role"];
}