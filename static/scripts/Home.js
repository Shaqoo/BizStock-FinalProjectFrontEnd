const themeToggle = document.getElementById('themeToggle');
const rootElement = document.body;

 
if (localStorage.getItem('theme') === 'dark') {
  rootElement.classList.add('dark');
  themeToggle.textContent = '☀️';
} else {
  themeToggle.textContent = '🌙';
}

 
themeToggle.addEventListener('click', () => {
  if (rootElement.classList.contains('dark')) {
    rootElement.classList.remove('dark');
    localStorage.setItem('theme', 'light');
    themeToggle.textContent = '🌙';
  } else {
    rootElement.classList.add('dark');
    localStorage.setItem('theme', 'dark');
    themeToggle.textContent = '☀️';
  }
});


document.addEventListener("DOMContentLoaded", () => {
  const reveals = document.querySelectorAll(".reveal");

  const options = {
    threshold: 0.1
  };

  const observer = new IntersectionObserver((entries, observer) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add("active");
        observer.unobserve(entry.target);
      }
    });
  }, options);

  reveals.forEach(reveal => {
    observer.observe(reveal);
  });
});


document.querySelector('#getStartedBtn2').addEventListener('click',() =>{
  window.location.href = '/general/Products.htm';
})

