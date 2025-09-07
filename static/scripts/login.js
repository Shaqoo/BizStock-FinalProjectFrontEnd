if (window.location.hostname === "localhost") {
    const originalWarn = console.warn;
    console.warn = function (...args) {
        if (
            args[0] &&
            typeof args[0] === "string" &&
            args[0].includes("-ms-high-contrast")
        ) {
            return; 
        }
        originalWarn.apply(console, args);
    };
}
//const apiBaseUrl = "https://localhost:7124/api/v1"

const form = document.getElementById('loginForm');
const grpEmail = document.getElementById('grp-email');
const grpPassword = document.getElementById('grp-password');
const email = document.getElementById('email');
const password = document.getElementById('password');
const formError = document.getElementById('formError');
const captchaWrap = document.getElementById('captchaWrap');
const webauthnBtn = document.getElementById('webauthnBtn');

let failed = 0;
let captchaToken = null;

function setError(group, message){
  group.classList.add('has-error');
  const msg = group.querySelector('.error-msg');
  if(msg) msg.textContent = message;
  const input = group.querySelector('input');
  input.classList.add('shake');
  setTimeout(() => input.classList.remove('shake'), 300);
}

function clearError(group){
  group.classList.remove('has-error');
  const msg = group.querySelector('.error-msg');
  if(msg) msg.textContent = '';
}

email.addEventListener('input', ()=> clearError(grpEmail));
password.addEventListener('input', ()=> clearError(grpPassword));

document.getElementById('togglePass').addEventListener('click', () => {
  const isPwd = password.getAttribute('type') === 'password';
  password.setAttribute('type', isPwd ? 'text' : 'password');
});

form.addEventListener('submit', async (e) => {
  e.preventDefault();
  formError.classList.add('hidden');
  formError.textContent = '';

  let ok = true;


  const emailValue = email.value.trim();
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if(!emailValue){
    setError(grpEmail, 'Email is required.');
    ok = false;
  } else if(!emailRegex.test(emailValue)){
    setError(grpEmail, 'Please enter a valid email address.');
    ok = false;
  }


  const passwordValue = password.value.trim();
  if(!passwordValue){
    setError(grpPassword, 'Password is required.');
    ok = false;
  }

  if(!ok) return;


  let token = null;
  
  if(!captchaWrap.classList.contains('hidden') && window.grecaptcha){
      token = grecaptcha.getResponse();
      if(!token){
          formError.textContent = 'Please complete the captcha to continue.';
          formError.classList.remove('hidden');
          return; 
      }
  }

  const bodyData = {
      email: emailValue,
      password: passwordValue,
      CaptchaToken: token 
  };

  console.log('Sending CaptchaToken:', bodyData.CaptchaToken);

  try {
    const response = await fetch(`${apiBaseUrl}/Users/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(bodyData)
    });

    const text = await response.text();
    let result;
    try {
        result = JSON.parse(text);
    } catch {
        result = { ok: false, message: text };
    }

    if(result.isSuccess){
       console.log(result)
        captchaWrap.classList.add('hidden');   
        Swal.fire({ 
            icon: 'success', 
            title: 'Login Successful', 
            timer: 2000, 
            showConfirmButton: false 
        });
        captchaToken = null;
        if(window.grecaptcha) grecaptcha.reset();
        sessionStorage.setItem("tempToken", result.data.token);
        window.location.href = "/general/mfa.html";

    } else {
        if(result.message?.includes('CAPTCHA validation failed.')){
            captchaWrap.classList.remove('hidden');
            if(window.grecaptcha) grecaptcha.reset(); 
            formError.textContent = 'Captcha failed. Please complete the captcha and try again.';
            formError.classList.remove('hidden');
            Swal.fire({ icon: 'warning', title: 'Captcha Required', text: result.message });
            return;
        }

        if(result.message?.includes('Unverified Email')){
            captchaWrap.classList.add('hidden');
            formError.textContent = 'Your email is not verified. Redirecting to verification page...';
            formError.classList.remove('hidden');
            Swal.fire({ 
                icon: 'warning', 
                title: 'Email Not Verified', 
                text: 'Redirecting shortly...' 
            });
            setTimeout(() => {
                window.location.href = "/general/verifyemail.html";
            }, 3000);
            return;
        }

        
        if(result.message?.includes('Account locked')){
       captchaWrap.classList.add('hidden');
    let remaining = result.data.remaining || { Minutes: 0, Seconds: 0 };
    console.log(remaining);
    console.log(result.data.remaining)
    Swal.fire({ 
    icon: 'error',
    title: 'Account Locked',
    html: `Account locked. Try again in <b>${remaining.minutes}m ${remaining.seconds}s</b>.`,
    allowOutsideClick: false,
    showConfirmButton: false,
    didOpen: () => {
        const timerInterval = setInterval(() => {
            remaining.seconds--;
            if (remaining.seconds < 0) {
                if (remaining.minutes > 0) {
                    remaining.minutes--;
                    remaining.seconds = 59;
                } else {
                    clearInterval(timerInterval);
                    Swal.close();
                    formError.textContent = 'You can try logging in now.';
                    formError.classList.remove('hidden');
                    return;
                }
            }

           
            Swal.getHtmlContainer().querySelector('b').textContent = `${remaining.minutes}m ${remaining.seconds}s`;
            formError.textContent = `Account locked. Try again in ${remaining.minutes}m ${remaining.seconds}s.`;
            formError.classList.remove('hidden');
        }, 1000);
    }
});

    return;
}


       
    captchaWrap.classList.add('hidden');
    formError.textContent = result.message || 'Invalid email or password.';
    formError.classList.remove('hidden');
    Swal.fire({ icon: 'error', title: 'Login Failed', text: result.message || 'Invalid email or password.' });
}

} catch(error){
    console.log(error);
    captchaWrap.classList.add('hidden');
    Swal.fire({ icon: 'error', title: 'Login Failed', text: 'Something went wrong. Please try again.' });
}
});
 



