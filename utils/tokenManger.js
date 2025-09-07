function getAccessToken(){
    return sessionStorage.getItem("accessToken");
}

function setAccessToken(accessToken){
    sessionStorage.setItem("accessToken", accessToken);
}

function removeAccessToken(){
    sessionStorage.removeItem("accessToken");
}

function parseJwt(token){
    try{
        return JSON.parse(atob(token.split('.')[1]));
    }catch(err){
        return null;
    }
}

function isTokenExpired(token){
    const payload = parseJwt(token);
    console.log(payload);
    if(!payload || !payload.exp){
        return true;
    }
    const now = Math.ceil(Date.now() / 1000);
    return now > payload.exp;
}

async function refreshAccessToken() {
    try {
        const response = await fetch("https://localhost:7124/api/v1/Users/refresh-token", {
        method: "POST",
        credentials: "include", 
        headers: { "Content-Type": "application/json" }
        });

        const data = await response.json();
        console.log("Refresh response: "+ data)
        if (response.ok) {
          console.log("✅ Refresh successful: "+ data);
          console.log("🔄 Access token refreshed.");
          setAccessToken(data.data.accessToken);
          return data.data.accessToken;

        } else {
         console.error("No access token returned");
         return null;
        }
    } catch (err) {
        console.error("❌ Refresh failed:", err);
        clearAccessToken();
        return null;
    }
}

async function getValidAccessToken() {
    let accessToken = getAccessToken();
    console.log(accessToken);
    console.log(isTokenExpired(accessToken));
    if (!accessToken || isTokenExpired(accessToken)) {
        console.log("⚠️ Token missing or expired, refreshing...");
        accessToken = await refreshAccessToken();
    } 
    return accessToken;
}


setInterval(async () => {
    console.log("⏳ Auto-refresh check...");
    await refreshAccessToken();
},12 * 60 * 1000)

