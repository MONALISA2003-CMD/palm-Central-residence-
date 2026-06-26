/* ═══════════════════════════════════════════════
   PALM CENTRAL PRIVATE RESIDENCES
   main.js — Interactions, Motion & Utility
   ═══════════════════════════════════════════════ */

'use strict';

/* ── LOADING ANIMATION ── */
(function initLoader() {
  const loader   = document.getElementById('loader');
  const progress = loader && loader.querySelector('.loader__progress');
  if (!loader || !progress) return;

  let pct = 0;
  const tick = setInterval(() => {
    pct += Math.random() * 18;
    if (pct >= 100) {
      pct = 100;
      clearInterval(tick);
      progress.style.width = '100%';
      setTimeout(() => {
        loader.classList.add('hidden');
        document.body.style.overflow = '';
        startHeroAnimations();
      }, 500);
    } else {
      progress.style.width = pct + '%';
    }
  }, 60);

  document.body.style.overflow = 'hidden';
})();

/* ── HERO ENTRANCE ── */
function startHeroAnimations() {
  const els = document.querySelectorAll('.hero .reveal-up');
  els.forEach((el, i) => {
    setTimeout(() => {
      el.style.opacity    = '1';
      el.style.transform  = 'none';
      el.style.transition = 'opacity 1.1s cubic-bezier(0.16,1,0.3,1), transform 1.1s cubic-bezier(0.16,1,0.3,1)';
    }, 200 + i * 140);
  });

  // Cards
  const cards = document.querySelectorAll('.hero__card');
  cards.forEach((c, i) => {
    setTimeout(() => {
      c.style.opacity   = '1';
      c.style.transform = 'none';
    }, 900 + i * 100);
    c.style.opacity   = '0';
    c.style.transform = 'translateX(20px)';
    c.style.transition = 'opacity 0.9s cubic-bezier(0.16,1,0.3,1), transform 0.9s cubic-bezier(0.16,1,0.3,1)';
  });
}

/* ── SCROLL-BASED NAV ── */
(function initNav() {
  const nav = document.getElementById('nav');
  if (!nav) return;

  const update = () => {
    if (window.scrollY > 60) {
      nav.classList.add('scrolled');
    } else {
      nav.classList.remove('scrolled');
    }
  };
  window.addEventListener('scroll', update, { passive: true });
  update();
})();

/* ── MOBILE MENU ── */
(function initMobileMenu() {
  const burger   = document.getElementById('navBurger');
  const menu     = document.getElementById('mobileMenu');
  const close    = document.getElementById('mobileClose');
  const links    = document.querySelectorAll('.mobile-link');
  if (!burger || !menu) return;

  const openMenu  = () => menu.classList.add('open');
  const closeMenu = () => menu.classList.remove('open');

  burger.addEventListener('click', openMenu);
  close && close.addEventListener('click', closeMenu);
  links.forEach(l => l.addEventListener('click', closeMenu));

  document.addEventListener('keydown', e => {
    if (e.key === 'Escape') closeMenu();
  });
})();

/* ── INTERSECTION OBSERVER — REVEAL ── */
(function initReveal() {
  const items = document.querySelectorAll('.reveal-up, .reveal-scale');
  if (!items.length) return;

  // Don't observe hero items — handled by loader
  const nonHero = Array.from(items).filter(el => !el.closest('.hero'));

  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('in-view');
        observer.unobserve(entry.target);
      }
    });
  }, {
    threshold: 0.12,
    rootMargin: '0px 0px -40px 0px'
  });

  nonHero.forEach(el => observer.observe(el));
})();

/* ── LAZY VIDEO LOADING ── */
(function initLazyVideos() {
  const videos = document.querySelectorAll('video[data-src]');
  if (!videos.length) return;

  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        const video = entry.target;
        const src   = video.getAttribute('data-src');
        if (src) {
          video.src = src;
          video.load();
          video.play().catch(() => {}); // Autoplay may be restricted
        }
        observer.unobserve(video);
      }
    });
  }, { rootMargin: '200px' });

  videos.forEach(v => observer.observe(v));
})();

/* ── LIFESTYLE REEL — DRAG SCROLL ── */
(function initDragScroll() {
  const reel = document.querySelector('.lifestyle__reel');
  if (!reel) return;

  let isDown = false, startX, scrollLeft;

  reel.addEventListener('mousedown', e => {
    isDown    = true;
    startX    = e.pageX - reel.offsetLeft;
    scrollLeft = reel.scrollLeft;
    reel.style.cursor = 'grabbing';
  });
  reel.addEventListener('mouseleave', () => { isDown = false; reel.style.cursor = 'grab'; });
  reel.addEventListener('mouseup',    () => { isDown = false; reel.style.cursor = 'grab'; });
  reel.addEventListener('mousemove', e => {
    if (!isDown) return;
    e.preventDefault();
    const x    = e.pageX - reel.offsetLeft;
    const walk = (x - startX) * 1.2;
    reel.scrollLeft = scrollLeft - walk;
  });

  // Touch
  let touchStartX = 0, touchScrollLeft = 0;
  reel.addEventListener('touchstart', e => {
    touchStartX    = e.touches[0].pageX;
    touchScrollLeft = reel.scrollLeft;
  }, { passive: true });
  reel.addEventListener('touchmove', e => {
    const dx = touchStartX - e.touches[0].pageX;
    reel.scrollLeft = touchScrollLeft + dx;
  }, { passive: true });
})();

/* ── GALLERY LIGHTBOX ── */
(function initGallery() {
  const items     = document.querySelectorAll('.gallery__item');
  const lightbox  = document.getElementById('lightbox');
  const mediaWrap = document.getElementById('lightboxMedia');
  const closeBtn  = document.getElementById('lightboxClose');
  const prevBtn   = document.getElementById('lightboxPrev');
  const nextBtn   = document.getElementById('lightboxNext');
  const counter   = document.getElementById('lightboxCounter');
  if (!lightbox || !items.length) return;

  const gallery = Array.from(items);
  let current   = 0;

  function showItem(idx) {
    const item = gallery[idx];
    const src  = item.getAttribute('data-src');
    const type = item.getAttribute('data-type') || 'image';

    mediaWrap.innerHTML = '';

    if (type === 'image') {
      const img   = document.createElement('img');
      img.src     = src;
      img.alt     = item.querySelector('img') ? item.querySelector('img').alt : '';
      mediaWrap.appendChild(img);
    } else {
      const vid         = document.createElement('video');
      vid.src           = src;
      vid.controls      = true;
      vid.autoplay      = true;
      vid.style.maxWidth  = '90vw';
      vid.style.maxHeight = '86vh';
      mediaWrap.appendChild(vid);
    }

    counter.textContent = `${idx + 1} / ${gallery.length}`;
    current = idx;
  }

  function openLightbox(idx) {
    lightbox.classList.add('open');
    document.body.style.overflow = 'hidden';
    showItem(idx);
  }

  function closeLightbox() {
    lightbox.classList.remove('open');
    document.body.style.overflow = '';
    mediaWrap.innerHTML = '';
  }

  gallery.forEach((item, i) => {
    item.addEventListener('click', () => openLightbox(i));
  });

  closeBtn && closeBtn.addEventListener('click', closeLightbox);
  prevBtn  && prevBtn.addEventListener('click', () => showItem((current - 1 + gallery.length) % gallery.length));
  nextBtn  && nextBtn.addEventListener('click', () => showItem((current + 1) % gallery.length));

  // Keyboard nav
  document.addEventListener('keydown', e => {
    if (!lightbox.classList.contains('open')) return;
    if (e.key === 'ArrowLeft')  showItem((current - 1 + gallery.length) % gallery.length);
    if (e.key === 'ArrowRight') showItem((current + 1) % gallery.length);
    if (e.key === 'Escape')     closeLightbox();
  });

  // Click backdrop
  lightbox.addEventListener('click', e => {
    if (e.target === lightbox) closeLightbox();
  });
})();

/* ── CONTACT FORM ── */
(function initContactForm() {
  const form = document.getElementById('contactForm');
  if (!form) return;

  form.addEventListener('submit', e => {
    e.preventDefault();

    const btn  = form.querySelector('button[type="submit"]');
    const orig = btn.textContent;

    btn.textContent = 'Sending…';
    btn.disabled    = true;

    // Simulate submission — replace with actual endpoint
    setTimeout(() => {
      btn.textContent = '✓ Message Received';
      btn.style.background = '#2c5a72';
      form.reset();
      setTimeout(() => {
        btn.textContent = orig;
        btn.style.background = '';
        btn.disabled = false;
      }, 4000);
    }, 1200);
  });
})();

/* ── AI ASSISTANT BUTTON ── */
(function initAI() {
  const btn = document.getElementById('aiBtn');
  if (!btn) return;

  // Opens ChatGPT — replace later with custom OpenAI integration
  btn.addEventListener('click', () => {
    window.open('https://chat.openai.com', '_blank', 'noopener,noreferrer');
  });
})();

/* ── SMOOTH ANCHOR SCROLL ── */
(function initSmoothScroll() {
  document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', e => {
      const target = document.querySelector(anchor.getAttribute('href'));
      if (!target) return;
      e.preventDefault();
      const navH = document.getElementById('nav')?.offsetHeight || 80;
      const top  = target.getBoundingClientRect().top + window.scrollY - navH;
      window.scrollTo({ top, behavior: 'smooth' });
    });
  });
})();

/* ── PARALLAX — ABOUT IMAGE ── */
(function initParallax() {
  const wrap = document.querySelector('.about__img-wrap img');
  if (!wrap || window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

  const update = () => {
    const rect   = wrap.getBoundingClientRect();
    const center = rect.top + rect.height / 2;
    const vMid   = window.innerHeight / 2;
    const offset = (center - vMid) * 0.06;
    wrap.style.transform = `translateY(${offset}px)`;
  };

  window.addEventListener('scroll', update, { passive: true });
})();

/* ── RESIDENCE CARD ENQUIRY → CONTACT SECTION ── */
(function initResCardLinks() {
  document.querySelectorAll('.res-card').forEach(card => {
    card.addEventListener('click', () => {
      const contact = document.getElementById('contact');
      if (!contact) return;
      const navH = document.getElementById('nav')?.offsetHeight || 80;
      const top  = contact.getBoundingClientRect().top + window.scrollY - navH;
      window.scrollTo({ top, behavior: 'smooth' });
    });
    card.style.cursor = 'pointer';
  });
})();
