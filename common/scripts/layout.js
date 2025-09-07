function loadComponent(id, file, callback) {
  fetch(file)
    .then(res => res.text())
    .then(html => {
      const container = document.getElementById(id);
      if (!container) return;

      container.innerHTML = html;

      if (typeof callback === "function") {
        callback();
      }
      document.dispatchEvent(new CustomEvent(`${id}Loaded`, {
        detail: { id, file }
      }));
    })
    .catch(err => console.error('Error loading component:', err));
}



document.addEventListener('DOMContentLoaded', () => {
  loadComponent('header-container',  "/common/header.html",initHeader);
  loadComponent('footer-container', '/common/footer.html',initFooter);
  loadComponent('ai-container', '/common/aichat.html',initAi);
});
