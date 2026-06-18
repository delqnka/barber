(function () {
  'use strict';

  const $ = (s, c = document) => c.querySelector(s);
  const $$ = (s, c = document) => Array.from(c.querySelectorAll(s));

  const haptic = (ms = 8) => {
    if ('vibrate' in navigator) {
      try { navigator.vibrate(ms); } catch (e) {}
    }
  };

  // Year
  const y = $('#year');
  if (y) y.textContent = new Date().getFullYear();

  // Header scroll state
  const header = $('#siteHeader');
  const onScroll = () => {
    if (window.scrollY > 24) header.classList.add('scrolled');
    else header.classList.remove('scrolled');

    const toTop = $('#toTop');
    if (window.scrollY > 600) {
      toTop.hidden = false;
      requestAnimationFrame(() => toTop.classList.add('show'));
    } else {
      toTop.classList.remove('show');
    }
  };
  window.addEventListener('scroll', onScroll, { passive: true });
  onScroll();

  // To top
  $('#toTop').addEventListener('click', () => {
    haptic(10);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  });

  // Mobile menu
  const menuToggle = $('#menuToggle');
  const drawer = $('#mobileDrawer');
  const toggleMenu = (open) => {
    const state = open ?? !menuToggle.classList.contains('open');
    menuToggle.classList.toggle('open', state);
    drawer.classList.toggle('open', state);
    drawer.setAttribute('aria-hidden', String(!state));
    menuToggle.setAttribute('aria-expanded', String(state));
    document.body.style.overflow = state ? 'hidden' : '';
    haptic(6);
  };
  menuToggle.addEventListener('click', () => toggleMenu());
  $$('#mobileDrawer a').forEach(a => a.addEventListener('click', () => toggleMenu(false)));
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && drawer.classList.contains('open')) toggleMenu(false);
  });

  // Reveal animation
  const revealEls = $$('.reveal, .reveal-line');
  if ('IntersectionObserver' in window) {
    const io = new IntersectionObserver((entries) => {
      entries.forEach(en => {
        if (en.isIntersecting) {
          en.target.classList.add('in');
          io.unobserve(en.target);
        }
      });
    }, { threshold: 0.12, rootMargin: '0px 0px -60px 0px' });
    revealEls.forEach(el => io.observe(el));
  } else {
    revealEls.forEach(el => el.classList.add('in'));
  }

  // Stagger reveal for grouped items
  ['.about-points li', '.services-grid .service-card', '.styles-row .style-card', '.gallery-mosaic .g-item'].forEach(sel => {
    $$(sel).forEach((el, i) => {
      el.style.transitionDelay = `${Math.min(i * 70, 420)}ms`;
    });
  });

  // Reviews carousel
  const track = $('#reviewsTrack');
  if (track) {
    const step = () => {
      const card = track.querySelector('.review-card');
      if (!card) return 320;
      const style = window.getComputedStyle(track);
      const gap = parseInt(style.columnGap || style.gap || '20', 10);
      return card.getBoundingClientRect().width + gap;
    };
    $('#revPrev').addEventListener('click', () => {
      haptic(8);
      track.scrollBy({ left: -step(), behavior: 'smooth' });
    });
    $('#revNext').addEventListener('click', () => {
      haptic(8);
      track.scrollBy({ left: step(), behavior: 'smooth' });
    });
  }

  // Booking form
  const form = $('#bookForm');
  if (form) {
    // Set min date to today
    const dateInput = $('#bdate');
    if (dateInput) {
      const today = new Date();
      const iso = today.toISOString().split('T')[0];
      dateInput.min = iso;
    }

    form.addEventListener('submit', (e) => {
      e.preventDefault();
      if (!form.checkValidity()) {
        haptic([20, 40, 20]);
        const firstInvalid = form.querySelector(':invalid');
        if (firstInvalid) firstInvalid.focus();
        form.reportValidity();
        return;
      }

      const btn = form.querySelector('button[type="submit"]');
      const original = btn.innerHTML;
      btn.disabled = true;
      btn.innerHTML = '<span>Изпращане</span>';

      setTimeout(() => {
        const success = $('#formSuccess');
        success.hidden = false;
        form.reset();
        btn.disabled = false;
        btn.innerHTML = original;
        haptic([10, 30, 60]);
        success.scrollIntoView({ behavior: 'smooth', block: 'nearest' });

        setTimeout(() => { success.hidden = true; }, 6500);
      }, 900);
    });
  }

  // Haptic on key tappable elements
  document.addEventListener('click', (e) => {
    const el = e.target.closest('.btn, .service-book, .rev-btn, .socials a, .g-item, .nav-link');
    if (el) haptic(6);
  });

  // Light parallax on hero image
  const heroBg = $('.hero-bg img');
  if (heroBg && !matchMedia('(prefers-reduced-motion: reduce)').matches) {
    let ticking = false;
    window.addEventListener('scroll', () => {
      if (!ticking) {
        requestAnimationFrame(() => {
          const y = window.scrollY;
          if (y < window.innerHeight) {
            heroBg.style.transform = `scale(1) translateY(${y * 0.25}px)`;
          }
          ticking = false;
        });
        ticking = true;
      }
    }, { passive: true });
  }

  // Active nav link on scroll
  const navLinks = $$('.primary-nav a');
  const sections = navLinks
    .map(a => document.querySelector(a.getAttribute('href')))
    .filter(Boolean);
  if (sections.length) {
    const so = new IntersectionObserver((entries) => {
      entries.forEach(en => {
        if (en.isIntersecting) {
          const id = '#' + en.target.id;
          navLinks.forEach(a => {
            a.style.color = a.getAttribute('href') === id ? 'var(--text)' : '';
          });
        }
      });
    }, { rootMargin: '-40% 0px -50% 0px' });
    sections.forEach(s => so.observe(s));
  }
})();
