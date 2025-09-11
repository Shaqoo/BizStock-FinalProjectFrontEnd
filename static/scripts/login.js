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
const buttonWrapper = document.getElementById('buttonWrapper');
const loadingMessage = document.getElementById('loadingMessage');
const loginBtn = document.getElementById('loginBtn');

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

 loginBtn.disabled = true;
  buttonWrapper.innerHTML = `
    <div class="w-full flex justify-center">
      <div class="spinner"></div>
    </div>
  `;
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
    console.log(result.data.status);
    const status = "LOGIN_SUCCESS";
    console.log(String(result.data.status) === status);
    loadingMessage.classList.remove('hidden');
    if(result.isSuccess && String(result.data.status) === String(status))
    {
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
        sessionStorage.setItem('accessToken', result.data.accessToken);
        sessionStorage.removeItem('tempToken');

        setTimeout(() => {
        loadingMessage.classList.add('hidden');
        window.location.href = '/general/Products.htm';
      }, 3000);
    }
    else if(result.isSuccess && String(result.data.status) !== String(status)){
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

         setTimeout(() => {
        loadingMessage.classList.add('hidden');
        window.location.href = "/general/mfa.html";
      }, 3000);
    } else {
        loginBtn.disabled = false;
        buttonWrapper.innerHTML = `
          <button id="loginBtn" type="submit" class="w-full bg-blue-600 text-white py-3 rounded-lg font-semibold hover:bg-blue-700 active:bg-blue-800 transition">Login</button>
        `;
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
    loginBtn.disabled = false;
        buttonWrapper.innerHTML = `
          <button id="loginBtn" type="submit" class="w-full bg-blue-600 text-white py-3 rounded-lg font-semibold hover:bg-blue-700 active:bg-blue-800 transition">Login</button>
        `;
    console.log(error);
    captchaWrap.classList.add('hidden');
    Swal.fire({ icon: 'error', title: 'Login Failed', text: 'Something went wrong. Please try again.' });
}
});
 


const webauthnBtn = document.getElementById("webauthnBtn");
const overlay = document.getElementById("webauthnOverlay");
const cancelBtn = document.getElementById("cancelWebauthn");
let abortController = null;

webauthnBtn.addEventListener("click", async () => {
  const { value: email } = await Swal.fire({
    title: 'Enter your email',
    input: 'email',
    inputLabel: 'Email',
    inputPlaceholder: 'Enter your registered email',
    showCancelButton: true
  });

  if (!email) return; 

  sessionStorage.setItem("email", email); 

  overlay.classList.remove("hidden");
  abortController = new AbortController();

  try {
    const optionsRes = await fetch(`${apiBaseUrl}/Users/generate-login-options`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(email),
      signal: abortController.signal
    });

    if (!optionsRes.ok) throw new Error("Failed to get login options");
    const options = await optionsRes.json();

    options.challenge = Uint8Array.from(atob(options.challenge), c => c.charCodeAt(0));
    if (options.allowCredentials) {
      options.allowCredentials = options.allowCredentials.map(cred => ({
        ...cred,
        id: Uint8Array.from(atob(cred.id), c => c.charCodeAt(0))
      }));
    }
    const assertion = await navigator.credentials.get({ publicKey: options, signal: abortController.signal });

    const loginDto = {
      id: assertion.id,
      rawId: btoa(String.fromCharCode(...new Uint8Array(assertion.rawId))),
      type: assertion.type,
      response: {
        clientDataJSON: btoa(String.fromCharCode(...new Uint8Array(assertion.response.clientDataJSON))),
        authenticatorData: btoa(String.fromCharCode(...new Uint8Array(assertion.response.authenticatorData))),
        signature: btoa(String.fromCharCode(...new Uint8Array(assertion.response.signature))),
        userHandle: assertion.response.userHandle ? btoa(String.fromCharCode(...new Uint8Array(assertion.response.userHandle))) : null
      }
    };

    
    const verifyRes = await fetch(`${apiBaseUrl}/Users/verify-login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(loginDto)
    });

    const verifyResult = await verifyRes.json();
    if (!verifyRes.ok) throw new Error(verifyResult.message || "Login failed");

    Swal.fire({ icon: 'success', title: 'Login Successful', text: 'Welcome back!' });
  } catch (err) {
    if (err.name === "AbortError") {
      Swal.fire({ icon: 'info', title: 'Login Cancelled', text: 'You cancelled the fingerprint login.' });
    } else {
      console.error(err);
      Swal.fire({ icon: 'error', title: 'Login Error', text: err.message });
    }
  } finally {
    abortController = null;
    overlay.classList.add("hidden");
  }
});


cancelBtn.addEventListener("click", () => {
  if (abortController) abortController.abort();
});


