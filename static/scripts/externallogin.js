let apiBaseUrl = "https://localhost:7124/api/v1";
window.onload = () => {
    google.accounts.id.initialize({
        client_id: "889214959740-qn1jg328t1aehb4vt30emvvnfksqhunt.apps.googleusercontent.com",
        callback: async (response) => {
            try {
                const googleAccessToken = response.credential;

                const res = await fetch(`${apiBaseUrl}/ExternalAuth/google/login`, {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({
                        accessToken: googleAccessToken,  
                        provider: "Google"
                    })
                });

                const data = await res.json();
                console.log("Backend response:", data);


                if (data.isSuccess) {
                    localStorage.setItem("authToken", data.data.accessToken);
                    alert("Login successful!");
                } else {
                    alert("Login failed: " + data.message);
                }
            } catch (err) {
                console.error("Google login error:", err);
            }
        }
    });   google.accounts.id.renderButton(
    document.getElementById("googleLoginBtn"),
    { theme: "outline", size: "large" }
);
google.accounts.id.prompt();

};


const msalConfig = {
    auth: {
    clientId: "fb5af295-b050-4198-8865-7db195c6ae18",
    authority: "https://login.microsoftonline.com/common",
    redirectUri: "http://localhost:5500/general/login.html"
  }
};

const msalInstance = new msal.PublicClientApplication(msalConfig);

async function handleMicrosoftLogin() {
    try {
        const loginResponse = await msalInstance.loginPopup({
            scopes: ["openid", "profile", "email"]
        });

        console.log("Microsoft login response:", loginResponse);

         try {
            const tokenResponse = await msalInstance.acquireTokenSilent({
                scopes: ["User.Read"],
                account: loginResponse.account
            });
            microsoftAccessToken = tokenResponse.accessToken;
        } catch (silentError) {
            console.warn("Silent token acquisition failed, falling back to popup.", silentError);

        const tokenResponse = await msalInstance.acquireTokenPopup({
                scopes: ["User.Read"]
            });
            microsoftAccessToken = tokenResponse.accessToken;
        }

        const microsoftAccessToken = tokenResponse.accessToken;
        console.log("Microsoft access token:", microsoftAccessToken);

        const res = await fetch(`${apiBaseUrl}/ExternalAuth/microsoft/login`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                accessToken: microsoftAccessToken,
                provider: "Microsoft"
            })
        });

        const data = await res.json();
        console.log("Backend response:", data);

        if (data.isSuccess) {
            localStorage.setItem("authToken", data.data.token);
            alert("Microsoft Login successful!");
        } else {
            alert("Login failed: " + data.message);
        }
    } catch (err) {
        console.error("Microsoft login error:", err);
    }
}

// document.getElementById("microsoftLoginBtn")
//   .addEventListener("click", handleMicrosoftLogin);




// fbAsyncInit = function() {
//     FB.init({
//       appId      : '1265581792028603',
//       cookie     : true,
//       xfbml      : false,
//       version    : 'v17.0'  
//     });
//   };

//   async function handleFacebookLogin() {
//     FB.login(async function(response) {
//       if (response.authResponse) {
//         console.log("Facebook login response:", response);

//         const fbAccessToken = response.authResponse.accessToken;

//         // Send token to your backend
//         const res = await fetch(`${apiBaseUrl}/ExternalAuth/facebook/login`, {
//           method: "POST",
//           headers: { "Content-Type": "application/json" },
//           body: JSON.stringify({
//             accessToken: fbAccessToken,
//             provider: "Facebook"
//           })
//         });

//         const data = await res.json();
//         console.log("Backend response:", data);

//         if (data.isSuccess) {
//           localStorage.setItem("authToken", data.data.token);
//           alert("Facebook Login successful!");
//         } else {
//           alert("Login failed: " + data.message);
//         }
//       } else {
//         console.log("User cancelled login or did not fully authorize.");
//       }
//     }, {scope: 'email,public_profile'});
//   }

//   document.getElementById("facebookLoginBtn")
//     .addEventListener("click", handleFacebookLogin);


window.fbAsyncInit = function() {
    FB.init({
      appId      : '1265581792028603',
      cookie     : true,
      xfbml      : false,
      version    : 'v17.0'
    });

    document.getElementById("facebookLoginBtn")
      .addEventListener("click", async () => {
        FB.login(async function(response) {
          if (response.authResponse) {
            console.log("Facebook login response:", response);
            const fbAccessToken = response.authResponse.accessToken;

            const res = await fetch(`${apiBaseUrl}/ExternalAuth/facebook/login`, {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({
                accessToken: fbAccessToken,
                provider: "Facebook"
              })
            });

            const data = await res.json();
            console.log("Backend response:", data);

            if (data.isSuccess) {
              localStorage.setItem("authToken", data.data.token);
              alert("Facebook Login successful!");
            } else {
              alert("Login failed: " + data.message);
            }
          } else {
            console.log("User cancelled login or did not fully authorize.");
          }
        }, {scope: 'email,public_profile'});
      });
  };