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
