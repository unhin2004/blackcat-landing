/* ============================================
   BLACK CAT ANALYTICS — APP JS
   ============================================ */

(function () {
  'use strict';

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

  function toggleMobileMenu() {
    mobileMenuBtn.classList.toggle('active');
    mobileMenu.classList.toggle('open');
    document.body.style.overflow = mobileMenu.classList.contains('open') ? 'hidden' : '';
  }

  mobileMenuBtn.addEventListener('click', toggleMobileMenu);

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

  // ---------- Waitlist Form Handling ----------
  function handleFormSubmit(formId, wrapperId, successId) {
    const form = document.getElementById(formId);
    const wrapper = document.getElementById(wrapperId);
    const success = document.getElementById(successId);

    if (!form || !wrapper || !success) return;

    form.addEventListener('submit', function (e) {
      e.preventDefault();

      const email = form.querySelector('input[type="email"]').value;
      if (!email) return;

      // Hide form, show success
      wrapper.classList.add('hidden');
      success.classList.remove('hidden');

      // Also update the other form if it hasn't been submitted
      const otherFormIds = {
        'hero-form': { wrapper: 'bottom-form-wrapper', success: 'bottom-form-success' },
        'bottom-form': { wrapper: 'hero-form-wrapper', success: 'hero-form-success' }
      };

      const other = otherFormIds[formId];
      if (other) {
        const otherWrapper = document.getElementById(other.wrapper);
        const otherSuccess = document.getElementById(other.success);
        if (otherWrapper && !otherWrapper.classList.contains('hidden')) {
          otherWrapper.classList.add('hidden');
          otherSuccess.classList.remove('hidden');
        }
      }
    });
  }

  handleFormSubmit('hero-form', 'hero-form-wrapper', 'hero-form-success');
  handleFormSubmit('bottom-form', 'bottom-form-wrapper', 'bottom-form-success');

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

})();