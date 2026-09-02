/* ============================================
   BLACK CAT ANALYTICS — APP JS
   ============================================ */

(function () {
  'use strict';

  // ---------- GA4 helpers ----------
  function trackEvent(name, params) {
    try {
      if (typeof window.gtag === 'function') {
        window.gtag('event', name, params || {});
      }
    } catch (e) { /* noop */ }
  }

  // Persist first-touch UTM params for cross-domain attribution into the app.
  // Stored in sessionStorage; appended to every outbound link to app.tryblackcat.com.
  var UTM_KEYS = ['utm_source', 'utm_medium', 'utm_campaign', 'utm_content', 'utm_term'];
  var UTM_STORE = 'bc_utm_v1';

  function captureUtmFromUrl() {
    try {
      var params = new URLSearchParams(window.location.search);
      var existing = sessionStorage.getItem(UTM_STORE);
      if (existing) return; // first-touch wins
      var payload = {};
      var hasAny = false;
      UTM_KEYS.forEach(function (k) {
        var v = params.get(k);
        if (v) { payload[k] = v.slice(0, 200); hasAny = true; }
      });
      if (document.referrer && document.referrer.indexOf(window.location.origin) !== 0) {
        payload.referrer = document.referrer.slice(0, 500);
        hasAny = true;
      }
      if (hasAny) sessionStorage.setItem(UTM_STORE, JSON.stringify(payload));
    } catch (e) { /* noop */ }
  }

  function readUtm() {
    try {
      var raw = sessionStorage.getItem(UTM_STORE);
      if (!raw) return {};
      var parsed = JSON.parse(raw);
      return (parsed && typeof parsed === 'object') ? parsed : {};
    } catch (e) { return {}; }
  }

  function appendUtmToUrl(url) {
    try {
      var u = new URL(url);
      if (u.hostname.indexOf('tryblackcat.com') === -1) return url;
      var utm = readUtm();
      UTM_KEYS.forEach(function (k) {
        if (utm[k] && !u.searchParams.has(k)) u.searchParams.set(k, utm[k]);
      });
      return u.toString();
    } catch (e) { return url; }
  }

  captureUtmFromUrl();

  // Hook conversion clicks on every signup / demo CTA. Also rewrites the href
  // to carry UTM params across the app subdomain.
  document.querySelectorAll('a[href*="app.tryblackcat.com/signup"]').forEach(function (a) {
    a.href = appendUtmToUrl(a.href);
    a.addEventListener('click', function () {
      var location = a.getAttribute('data-cta-location') || 'unknown';
      trackEvent('signup_cta_click', { cta_location: location });
    });
  });

  document.querySelectorAll('a[href*="app.tryblackcat.com/demo"]').forEach(function (a) {
    a.href = appendUtmToUrl(a.href);
    a.addEventListener('click', function () {
      var location = a.getAttribute('data-cta-location') || 'unknown';
      trackEvent('demo_cta_click', { cta_location: location });
    });
  });

  // Download clicks (free spreadsheet, checklists). Named 'download_click'
  // (not GA4's auto 'file_download') so it can't collide with Enhanced
  // Measurement if that's enabled on the property. These are the strongest
  // intent signal the landing site produces short of a signup click.
  document.querySelectorAll('a[download], a[href*="/downloads/"]').forEach(function (a) {
    a.addEventListener('click', function () {
      var file = (a.getAttribute('href') || '').split('/').pop().split('?')[0] || 'unknown';
      trackEvent('download_click', { file_name: file, page_path: window.location.pathname });
    });
  });

  // Scroll-depth milestones (one-shot each) — tells us if the hero is failing.
  var scrollMilestones = [25, 50, 75, 100];
  var firedMilestones = {};
  function checkScrollDepth() {
    var docHeight = document.documentElement.scrollHeight - window.innerHeight;
    if (docHeight <= 0) return;
    var pct = Math.round((window.scrollY / docHeight) * 100);
    scrollMilestones.forEach(function (m) {
      if (!firedMilestones[m] && pct >= m) {
        firedMilestones[m] = true;
        trackEvent('scroll_depth', { percent: m });
      }
    });
  }
  window.addEventListener('scroll', checkScrollDepth, { passive: true });

  // ---------- Navbar Scroll Effect ----------
  const navbar = document.getElementById('navbar');
  let lastScroll = 0;

  function handleNavbarScroll() {
    const scrollY = window.scrollY;
    if (scrollY > 40) {
      navbar.classList.add('scrolled');
    } else {
      navbar.classList.remove('scrolled');
    }
    lastScroll = scrollY;
  }

  window.addEventListener('scroll', handleNavbarScroll, { passive: true });

  // ---------- Mobile Menu ----------
  const mobileMenuBtn = document.getElementById('mobile-menu-btn');
  const mobileMenu = document.getElementById('mobile-menu');
  const mobileNavLinks = document.querySelectorAll('.mobile-nav-link, .mobile-menu .cta-button-sm');

  const navbarEl = document.getElementById('navbar');

  function toggleMobileMenu() {
    const open = !mobileMenu.classList.contains('open');
    mobileMenuBtn.classList.toggle('active', open);
    mobileMenu.classList.toggle('open', open);
    if (navbarEl) navbarEl.classList.toggle('menu-open', open);
    mobileMenuBtn.setAttribute('aria-expanded', open ? 'true' : 'false');
    mobileMenuBtn.setAttribute('aria-label', open ? 'Close menu' : 'Menu');
    document.body.style.overflow = open ? 'hidden' : '';
  }

  function closeMobileMenu() {
    if (mobileMenu.classList.contains('open')) toggleMobileMenu();
  }

  mobileMenuBtn.addEventListener('click', toggleMobileMenu);
  document.addEventListener('keydown', (e) => { if (e.key === 'Escape') closeMobileMenu(); });
  // Tapping the logo while the menu is open should get you back to the page, not stay trapped.
  if (navbarEl) navbarEl.querySelectorAll('a').forEach(a => a.addEventListener('click', closeMobileMenu));

  mobileNavLinks.forEach(link => {
    link.addEventListener('click', () => {
      if (mobileMenu.classList.contains('open')) {
        toggleMobileMenu();
      }
    });
  });

  // ---------- Smooth Scroll for Nav Links ----------
  document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
      const targetId = this.getAttribute('href');
      if (targetId === '#') return;

      const target = document.querySelector(targetId);
      if (target) {
        e.preventDefault();
        target.scrollIntoView({ behavior: 'smooth' });
      }
    });
  });

  // ---------- IntersectionObserver — Reveal Animations ----------
  const revealElements = document.querySelectorAll('.reveal');

  const revealObserver = new IntersectionObserver(
    (entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('visible');
          revealObserver.unobserve(entry.target);
        }
      });
    },
    {
      threshold: 0.05,
      rootMargin: '0px 0px -20px 0px'
    }
  );

  revealElements.forEach(el => revealObserver.observe(el));

  // Fallback: make all reveals visible after 3 seconds in case observer doesn't fire
  setTimeout(() => {
    revealElements.forEach(el => el.classList.add('visible'));
  }, 3000);

  // ---------- FAQ Accordion ----------
  const faqItems = document.querySelectorAll('.faq-item');

  faqItems.forEach(item => {
    const trigger = item.querySelector('.faq-trigger');
    trigger.addEventListener('click', () => {
      const isOpen = item.classList.contains('open');

      // Close all
      faqItems.forEach(i => i.classList.remove('open'));

      // Toggle current
      if (!isOpen) {
        item.classList.add('open');
      }
    });
  });

  // ---------- Dashboard Mockup Subtle Animation ----------
  // Animate chart bars on scroll into view
  const chartBars = document.querySelectorAll('.chart-bar');
  const chartObserver = new IntersectionObserver(
    (entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          const bars = entry.target.querySelectorAll('.chart-bar');
          bars.forEach((bar, i) => {
            const height = bar.style.height;
            bar.style.height = '0%';
            bar.style.transition = `height 0.6s cubic-bezier(0.34, 1.56, 0.64, 1) ${i * 0.05}s`;
            requestAnimationFrame(() => {
              requestAnimationFrame(() => {
                bar.style.height = height;
              });
            });
          });
          chartObserver.unobserve(entry.target);
        }
      });
    },
    { threshold: 0.3 }
  );

  const chartContainer = document.querySelector('.chart-bars');
  if (chartContainer) {
    chartObserver.observe(chartContainer);
  }

  // ---------- KPI counter animation ----------
  function animateValue(el, start, end, duration, prefix, suffix) {
    const range = end - start;
    const startTime = performance.now();

    function update(currentTime) {
      const elapsed = currentTime - startTime;
      const progress = Math.min(elapsed / duration, 1);
      // Ease out cubic
      const ease = 1 - Math.pow(1 - progress, 3);
      const current = start + range * ease;

      if (suffix === '%') {
        el.textContent = prefix + current.toFixed(1) + suffix;
      } else {
        el.textContent = prefix + '$' + Math.round(current).toLocaleString();
      }

      if (progress < 1) {
        requestAnimationFrame(update);
      }
    }

    requestAnimationFrame(update);
  }

  const kpiCards = document.querySelectorAll('.kpi-card');
  const kpiObserver = new IntersectionObserver(
    (entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          const valueEl = entry.target.querySelector('.font-bold');
          if (valueEl && !valueEl.dataset.animated) {
            valueEl.dataset.animated = 'true';
            const text = valueEl.textContent.trim();

            if (text.includes('$')) {
              const num = parseFloat(text.replace(/[$,]/g, ''));
              animateValue(valueEl, 0, num, 1200, '', '');
            } else if (text.includes('%')) {
              const num = parseFloat(text.replace('%', ''));
              animateValue(valueEl, 0, num, 1200, '', '%');
            }
          }
          kpiObserver.unobserve(entry.target);
        }
      });
    },
    { threshold: 0.5 }
  );

  kpiCards.forEach(card => kpiObserver.observe(card));

  // ---------- Cookie Consent ----------
  const cookieBanner = document.getElementById('cookie-banner');
  const cookieAccept = document.getElementById('cookie-accept');
  const cookieDecline = document.getElementById('cookie-decline');

  if (cookieBanner && !localStorage.getItem('cookie-consent')) {
    cookieBanner.style.display = '';
    requestAnimationFrame(() => {
      requestAnimationFrame(() => {
        cookieBanner.classList.remove('translate-y-full');
      });
    });
  }

  function hideBanner() {
    if (cookieBanner) {
      cookieBanner.classList.add('translate-y-full');
      setTimeout(() => { cookieBanner.style.display = 'none'; }, 300);
    }
  }

  if (cookieAccept) {
    cookieAccept.addEventListener('click', () => {
      localStorage.setItem('cookie-consent', 'accepted');
      hideBanner();
    });
  }

  if (cookieDecline) {
    cookieDecline.addEventListener('click', () => {
      localStorage.setItem('cookie-consent', 'declined');
      hideBanner();
    });
  }

})();