function loadComponent(id, file,callback) {
  fetch(file)
    .then(res => res.text())
    .then(html => {
      document.getElementById(id).innerHTML = html;
      if (callback) {
        callback();
      }
    })
    .catch(err => console.error('Error loading component:', err));
}

document.addEventListener('DOMContentLoaded', () => {
  loadComponent('header-container',  "/common/header.html",initHeader);
  loadComponent('footer-container', '/common/footer.html',initFooter);
  loadComponent('ai-container', '/common/aichat.html',initAi);
});
