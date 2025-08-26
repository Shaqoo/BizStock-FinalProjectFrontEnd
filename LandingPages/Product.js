// 🌐 Mobile Menu Toggle
const btn = document.getElementById('menu-btn');
const menu = document.getElementById('mobile-menu');

btn.addEventListener('click', () => {
  menu.classList.toggle('hidden');
});

const params = new URLSearchParams(window.location.search);
const productId = params.get("id");

const products = [
  { id: "101", name: "Wireless Headphones", price: 120, desc: "Experience crystal clear sound with noise cancellation and 20-hour battery life.", img: "images/product1.jpg" },
  { id: "102", name: "Smart Watch", price: 90, desc: "Track your fitness, monitor your heart rate, and stay connected with notifications.", img: "images/product2.jpg" },
  { id: "103", name: "Gaming Laptop", price: 1500, desc: "High-performance laptop with RTX graphics, 16GB RAM, and 1TB SSD.", img: "images/product3.jpg" },
  { id: "104", name: "Bluetooth Speaker", price: 75, desc: "Portable speaker with powerful bass and 12-hour battery life.", img: "images/product4.jpg" },
];

const product = products.find(p => p.id === productId);

if (product) {
  document.getElementById("productImg").src = product.img;
  document.getElementById("productName").textContent = product.name;
  document.getElementById("productPrice").textContent = `$${product.price}`;
  document.getElementById("productDesc").textContent = product.desc;
} else {
  document.getElementById("productContainer").innerHTML = `
    <p class="text-center text-red-600 text-xl">Product not found.</p>
  `;
}

function addToCart() {
  const productImage = document.getElementById('product-image');
  const cartIcon = document.getElementById('cart-icon');
  const cartSound = document.getElementById('cart-sound');
  const cartCount = document.getElementById('cart-count');

  const imageRect = productImage.getBoundingClientRect();
  const cartRect = cartIcon.getBoundingClientRect();

  const scrollTop = window.scrollY || document.documentElement.scrollTop;
  const scrollLeft = window.scrollX || document.documentElement.scrollLeft;

  const flyingImage = productImage.cloneNode(true);
  flyingImage.style.position = 'absolute';
  flyingImage.style.zIndex = '1000';
  flyingImage.style.width = productImage.offsetWidth + 'px';
  flyingImage.style.height = productImage.offsetHeight + 'px';
  flyingImage.style.left = imageRect.left + scrollLeft + 'px';
  flyingImage.style.top = imageRect.top + scrollTop + 'px';
  flyingImage.style.transition = 'transform 0.8s ease-in-out, opacity 0.8s ease-in-out';

  document.body.appendChild(flyingImage);

  const deltaX = cartRect.left + scrollLeft - (imageRect.left + scrollLeft);
  const deltaY = cartRect.top + scrollTop - (imageRect.top + scrollTop);

  
  requestAnimationFrame(() => {
    flyingImage.style.transform = `translate(${deltaX}px, ${deltaY}px) scale(0.3)`;
    flyingImage.style.opacity = '0';
  });

  flyingImage.addEventListener('transitionend', () => {
    flyingImage.remove();
     
    cartSound.currentTime = 0;
    cartSound.play();

    cartIcon.classList.add('shake');
    setTimeout(() => {
      cartIcon.classList.remove('shake');
    }, 400);

    

    cartCount.classList.add('cart-count-animate');
    setTimeout(() => {
      cartCount.classList.remove('cart-count-animate');
    }, 400);
  });
}
