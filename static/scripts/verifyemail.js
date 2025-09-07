const page = document.getElementById('verificationPage');
  const sendCodeBtn = document.getElementById('sendCodeBtn');
  const backToEmail = document.getElementById('backToEmail');
  const codeDigits = document.querySelectorAll('.code-digit');

  sendCodeBtn.addEventListener('click',async () => {
    const email = document.getElementById('emailInput').value;
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    sessionStorage.setItem('email', email);
    if(!email) {
      Swal.fire({ icon: 'warning', title: 'Enter Email', text: 'Please enter your email before sending code.' });
      return;
    }
    else if(!emailRegex.test(email)){
    Swal.fire({ icon: 'warning', title: 'Enter Email', text: 'Please enter a valid email before sending code.' });
    return;
  }
    if (!email) {
  Swal.fire({
    icon: 'warning',
    title: 'Enter Email',
    text: 'Please enter your email before sending code.'
  });
  return;
}
else if (!emailRegex.test(email)) {
  Swal.fire({
    icon: 'warning',
    title: 'Invalid Email',
    text: 'Please enter a valid email before sending code.'
  });
  return;
}

try {
  let sendingEmail = await sendEmail(email);
  console.log(sendingEmail)
  if (sendingEmail.isSuccess) {
    Swal.fire({
      icon: 'success',
      title: 'Code Sent!',
      text: `A secure verification code has been sent to ${email}.`,
      timer: 2000,
      showConfirmButton: false
    }).then(() => {
      page.style.transform = 'rotateY(180deg)';
      codeDigits[0].focus();
    });
  } else {
    Swal.fire({
      icon: 'warning',
      title: 'Send Failed',
      text: sendingEmail.message ?? 'Unable to send verification code. Please try again.'
    });
    return;
  }
} catch {
  Swal.fire({
    icon: 'error',
    title: 'Error Sending Mail',
    text: 'Failed to send verification code. Please try again later.' 
  });
  return;
}

  });

  backToEmail.addEventListener('click', () => {
    page.style.transform = 'rotateY(0deg)';
    document.getElementById('emailInput').focus();
  });

  codeDigits.forEach((input, index) => {
    input.addEventListener('input', () => {
      if(input.value.length === 1 && index < codeDigits.length - 1) {
        codeDigits[index + 1].focus();
      }
    });
    input.addEventListener('keydown', (e) => {
      if(e.key === 'Backspace' && input.value === '' && index > 0) {
        codeDigits[index - 1].focus();
      }
    });
  });

  document.getElementById('verifyCodeBtn').addEventListener('click', async () => {
  const code = Array.from(codeDigits).map(i => i.value).join('');

  if (!/^\d{8}$/.test(code)) {
    Swal.fire({
      icon: 'error',
      title: 'Invalid Code',
      text: 'Please enter the full 8-digit verification code before submitting.'
    });
    codeDigits.forEach(i => i.classList.add('shake'));
    setTimeout(() => codeDigits.forEach(i => i.classList.remove('shake')), 300);
    return;
  }

  try {
    let result = await verifyEmail(sessionStorage.getItem('email'), code); 
    console.log(result);
    if (result.isSuccess) {
      Swal.fire({
        icon: 'success',
        title: 'Email Verified',
        text: 'Your email has been successfully verified. You can now continue.',
        timer: 2000,
        showConfirmButton: false
      }).then(() => {
        window.location.href = "/general/login.html";
      });
    } else {
      Swal.fire({
        icon: 'error',
        title: 'Verification Failed',
        text: result.message ?? 'Invalid or expired code. Please try again.'
      });
    }
  } catch (error) {
    Swal.fire({
      icon: 'error',
      title: 'Server Error',
      text: 'Unable to verify email right now. Please try again later.'
    });
  }
});

let sendEmail = async (mail) => {
  const response = await fetch(`https://localhost:7124/api/v1/Users/send-email-verification`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify({  
      email: mail
    })
  });
  const result = await response.json();
  return result;
}


let verifyEmail = async (mail, token) => {
  const response = await fetch(`https://localhost:7124/api/v1/Users/verify-email`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify({
      email: mail,
      token: token
    })
  });

  return await response.json();
};

