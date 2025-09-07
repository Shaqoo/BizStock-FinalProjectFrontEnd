const apiBase = "https://localhost:7124/api/v1/Users";

  const inputs = Array.from(document.querySelectorAll('.digit-input'));
  inputs.forEach((input, idx) => {
    input.addEventListener('input', () => { if(input.value && idx < inputs.length - 1) inputs[idx+1].focus(); });
    input.addEventListener('keydown', e => { if(e.key === 'Backspace' && !input.value && idx > 0) inputs[idx-1].focus(); });
  });

  const toggleBtn = document.getElementById('toggleVisibility');
  let visible = false;
  toggleBtn.addEventListener('click', () => {
    visible = !visible;
    inputs.forEach(i => i.type = visible ? 'text' : 'password');
    toggleBtn.textContent = visible ? 'Hide' : 'Show';
  });

  document.getElementById('loginBtn').addEventListener('click', async () => {
    const email = document.getElementById('email').value.trim();
    if(!email) return Swal.fire("Error", "Please enter your email.", "error");

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if(!emailRegex.test(email)) return Swal.fire("Error", "Invalid email format.", "error");

    const token = inputs.map(i => i.value).join('');
    if(token.length !== 10) return Swal.fire("Error", "Enter the 10-digit recovery code.", "error");

    try {
      const res = await fetch(`${apiBase}/recovery-login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json',"Authorization" : `Bearer ${sessionStorage.getItem("tempToken")}` },
        body: JSON.stringify({ email, recoveryCode: token,tempToken: sessionStorage.getItem("tempToken") })
      });
      const data = await res.json();

      if(res.ok) {
        Swal.fire("Success", data.message || "Logged in successfully!", "success")
          .then(() => window.location.href = "/general/Products.htm");
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
      Swal.fire("Error", data.message || "Invalid recovery code.", "error");
    }
  }

    } catch(err) {
      console.error(err);
      Swal.fire("Error", "Something went wrong. Try again.", "error");
    }
  });