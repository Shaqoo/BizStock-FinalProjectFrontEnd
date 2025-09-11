      lucide.createIcons();
    const toggleBtn = document.getElementById("toggleBtn");
    const sidebar = document.getElementById("sidebar");
    const brandText = document.getElementById("brandText");
    const csoDetails = document.getElementById("csoDetails");

    toggleBtn.addEventListener("click", () => {
      sidebar.classList.toggle("w-64");
      sidebar.classList.toggle("w-20");
      brandText.classList.toggle("hidden");
      csoDetails.classList.toggle("hidden");    
      document.querySelectorAll(".link-text").forEach(el => el.classList.toggle("hidden"));
      toggleBtn.querySelector("i").classList.toggle("rotate-180");
    });

async function loadCSOInfo() {
  try {
    const response = await fetch(`${apiBaseUrl}/users/me`, {
      headers: { "Authorization": `Bearer ${sessionStorage.getItem("accessToken")}` }
    });

    if (!response.ok) throw new Error("Failed to fetch CSO info");

    const data = await response.json();
    const user = data.data ?? data;

    document.getElementById("csoName").textContent = user.fullName;
    document.getElementById("csoPic").src = user.profilepicture ?? `https://ui-avatars.com/api/?name=${encodeURIComponent(user.fullName)}&background=0D8ABC&color=fff&size=128&rounded=true`;
  } catch (err) {
    console.error(err);
    document.getElementById("csoName").textContent = "Error loading";
  }
}

loadCSOInfo();