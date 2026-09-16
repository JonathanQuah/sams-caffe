/* ============================================================
   SAM'S CAFFÉ — Main JavaScript
   ============================================================ */

// ── Language Toggle ───────────────────────────────────────────
const langBtn = document.getElementById('langBtn');
let currentLang = localStorage.getItem('sc-lang') || 'en';

function setLang(lang) {
  currentLang = lang;
  localStorage.setItem('sc-lang', lang);
  document.body.classList.toggle('lang-bm', lang === 'bm');
  if (langBtn) langBtn.textContent = lang === 'en' ? 'BM' : 'EN';
}

if (langBtn) {
  setLang(currentLang);
  langBtn.addEventListener('click', () => setLang(currentLang === 'en' ? 'bm' : 'en'));
}

// ── Navbar Scroll ─────────────────────────────────────────────
const navbar = document.getElementById('navbar');
function handleScroll() {
  if (!navbar) return;
  navbar.classList.toggle('scrolled', window.scrollY > 40);
}
window.addEventListener('scroll', handleScroll, { passive: true });
handleScroll();

// ── Mobile Menu ───────────────────────────────────────────────
const hamburger = document.getElementById('hamburger');
const mobileNav = document.getElementById('mobileNav');
if (hamburger && mobileNav) {
  hamburger.addEventListener('click', () => {
    mobileNav.classList.toggle('open');
    const isOpen = mobileNav.classList.contains('open');
    hamburger.setAttribute('aria-expanded', isOpen);
  });
  // Close on outside click
  document.addEventListener('click', (e) => {
    if (!hamburger.contains(e.target) && !mobileNav.contains(e.target)) {
      mobileNav.classList.remove('open');
    }
  });
}

// ── Scroll Reveal ─────────────────────────────────────────────
const revealObserver = new IntersectionObserver((entries) => {
  entries.forEach((entry, i) => {
    if (entry.isIntersecting) {
      setTimeout(() => entry.target.classList.add('visible'), i * 80);
      revealObserver.unobserve(entry.target);
    }
  });
}, { threshold: 0.12, rootMargin: '0px 0px -40px 0px' });

document.querySelectorAll('.reveal, .reveal-left, .reveal-right').forEach(el => {
  revealObserver.observe(el);
});

// ── Active Nav Link ───────────────────────────────────────────
const currentPage = window.location.pathname.split('/').pop() || 'index.html';
document.querySelectorAll('.nav-links a, .mobile-nav a').forEach(link => {
  const href = link.getAttribute('href');
  if (href === currentPage || (currentPage === '' && href === 'index.html')) {
    link.classList.add('active');
  }
});

// ── Smooth Scroll for # links ─────────────────────────────────
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
  anchor.addEventListener('click', (e) => {
    const target = document.querySelector(anchor.getAttribute('href'));
    if (target) {
      e.preventDefault();
      const offset = target.getBoundingClientRect().top + window.scrollY - 80;
      window.scrollTo({ top: offset, behavior: 'smooth' });
      mobileNav?.classList.remove('open');
    }
  });
});
