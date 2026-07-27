// Dark mode
const darkToggle = document.getElementById('darkToggle');
const body = document.body;
if (localStorage.getItem('darkMode') === 'true') {
  body.classList.add('dark-mode');
  if (darkToggle) darkToggle.textContent = '☀️ Light';
}
if (darkToggle) {
  darkToggle.addEventListener('click', () => {
    body.classList.toggle('dark-mode');
    const isDark = body.classList.contains('dark-mode');
    localStorage.setItem('darkMode', isDark);
    darkToggle.textContent = isDark ? '☀️ Light' : '🌙 Dark';
    const mobileToggle = document.getElementById('darkToggleMobile');
    if (mobileToggle) mobileToggle.textContent = isDark ? '☀️ Light' : '🌙 Dark';
  });
}

const darkToggleMobile = document.getElementById('darkToggleMobile');
if (darkToggleMobile) {
  if (localStorage.getItem('darkMode') === 'true') {
    darkToggleMobile.textContent = '☀️ Light';
  }
  darkToggleMobile.addEventListener('click', () => {
    body.classList.toggle('dark-mode');
    const isDark = body.classList.contains('dark-mode');
    localStorage.setItem('darkMode', isDark);
    if (darkToggle) darkToggle.textContent = isDark ? '☀️ Light' : '🌙 Dark';
    darkToggleMobile.textContent = isDark ? '☀️ Light' : '🌙 Dark';
  });
}

// Back to top
const backToTop = document.getElementById('backToTop');
if (backToTop) {
  window.addEventListener('scroll', () => {
    backToTop.classList.toggle('show', window.scrollY > 400);
  });
  backToTop.addEventListener('click', () => window.scrollTo({ top: 0, behavior: 'smooth' }));
}

// Scroll animations
const observer = new IntersectionObserver((entries) => {
  entries.forEach(e => { if (e.isIntersecting) e.target.classList.add('visible'); });
}, { threshold: 0.1 });
document.querySelectorAll('.fade-in').forEach(el => observer.observe(el));

// Hero slider
const slides = document.querySelectorAll('.hero-slide');
const dots = document.querySelectorAll('.hero-dot');
let current = 0, timer;

function goTo(n) {
  slides[current].classList.remove('active');
  dots[current]?.classList.remove('active');
  current = (n + slides.length) % slides.length;
  slides[current].classList.add('active');
  dots[current]?.classList.add('active');
}

function startTimer() {
  clearInterval(timer);
  timer = setInterval(() => goTo(current + 1), 5000);
}

if (slides.length) {
  slides[0].classList.add('active');
  dots[0]?.classList.add('active');
  startTimer();
  dots.forEach((d, i) => d.addEventListener('click', () => { goTo(i); startTimer(); }));
  document.getElementById('heroPrev')?.addEventListener('click', () => { goTo(current - 1); startTimer(); });
  document.getElementById('heroNext')?.addEventListener('click', () => { goTo(current + 1); startTimer(); });
}

// Gallery lightbox
const lightbox = document.getElementById('lightbox');
const lightboxImg = document.getElementById('lightboxImg');
document.querySelectorAll('.gallery-item').forEach(item => {
  item.addEventListener('click', () => {
    const src = item.querySelector('img')?.src;
    if (src && lightbox) {
      lightboxImg.src = src;
      lightbox.classList.add('open');
    }
  });
});
document.getElementById('lightboxClose')?.addEventListener('click', () => lightbox.classList.remove('open'));
lightbox?.addEventListener('click', (e) => { if (e.target === lightbox) lightbox.classList.remove('open'); });

// Counter animation
function animateCounter(el) {
  const target = parseInt(el.dataset.target);
  let count = 0;
  const step = Math.ceil(target / 60);
  const interval = setInterval(() => {
    count = Math.min(count + step, target);
    el.textContent = count + (el.dataset.suffix || '');
    if (count >= target) clearInterval(interval);
  }, 30);
}

const counterObserver = new IntersectionObserver((entries) => {
  entries.forEach(e => {
    if (e.isIntersecting) {
      animateCounter(e.target);
      counterObserver.unobserve(e.target);
    }
  });
});
document.querySelectorAll('.counter').forEach(el => counterObserver.observe(el));

// Admin sidebar toggle (mobile)
document.getElementById('sidebarToggle')?.addEventListener('click', () => {
  document.querySelector('.admin-sidebar')?.classList.toggle('open');
});

// Flash message auto-dismiss
setTimeout(() => {
  document.querySelectorAll('.alert-dismissible').forEach(el => {
    el.style.transition = 'opacity 0.5s';
    el.style.opacity = '0';
    setTimeout(() => el.remove(), 500);
  });
}, 4000);

// Confirm delete
document.querySelectorAll('.btn-delete').forEach(btn => {
  btn.addEventListener('click', (e) => {
    if (!confirm('Are you sure you want to delete this item?')) e.preventDefault();
  });
});
