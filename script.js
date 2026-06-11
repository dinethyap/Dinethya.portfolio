/**
 * DINETHYA PERERA — CHEMISTRY PORTFOLIO
 * JavaScript: navigation, scroll spy, animations, form validation
 */

(function () {
  'use strict';

  /* ==========================================================
     DOM REFERENCES
     Cache frequently used elements once on load
     ========================================================== */
  const header      = document.getElementById('site-header');
  const navToggle   = document.getElementById('nav-toggle');
  const navMenu     = document.getElementById('nav-menu');
  const navLinks    = document.querySelectorAll('.nav-link');
  const sections    = document.querySelectorAll('section[id]');
  const fadeEls     = document.querySelectorAll('.fade-in');
  const contactForm = document.getElementById('contact-form');
  const footerYear  = document.getElementById('footer-year');

  /* ==========================================================
     FOOTER YEAR
     Automatically set the current copyright year
     ========================================================== */
  if (footerYear) {
    footerYear.textContent = new Date().getFullYear();
  }

  /* ==========================================================
     MOBILE NAVIGATION TOGGLE
     Opens/closes the hamburger menu on small screens
     ========================================================== */
  if (navToggle && navMenu) {
    navToggle.addEventListener('click', function () {
      const isOpen = navMenu.classList.toggle('open');
      navToggle.setAttribute('aria-expanded', isOpen);
      navToggle.setAttribute('aria-label', isOpen ? 'Close navigation menu' : 'Open navigation menu');
    });

    /* Close menu when a nav link is clicked (mobile UX) */
    navLinks.forEach(function (link) {
      link.addEventListener('click', function () {
        navMenu.classList.remove('open');
        navToggle.setAttribute('aria-expanded', 'false');
        navToggle.setAttribute('aria-label', 'Open navigation menu');
      });
    });

    /* Close menu when clicking outside */
    document.addEventListener('click', function (e) {
      if (!navMenu.contains(e.target) && !navToggle.contains(e.target)) {
        navMenu.classList.remove('open');
        navToggle.setAttribute('aria-expanded', 'false');
      }
    });
  }

  /* ==========================================================
     STICKY HEADER SHADOW
     Adds a subtle shadow when the user scrolls past the hero
     ========================================================== */
  function updateHeaderShadow() {
    if (window.scrollY > 20) {
      header.classList.add('scrolled');
    } else {
      header.classList.remove('scrolled');
    }
  }

  /* ==========================================================
     ACTIVE SECTION HIGHLIGHT (Scroll Spy)
     Highlights the nav link matching the section in view
     ========================================================== */
  function updateActiveNavLink() {
    const scrollPos = window.scrollY + header.offsetHeight + 80;

    let currentSection = 'home';

    sections.forEach(function (section) {
      if (section.offsetTop <= scrollPos) {
        currentSection = section.id;
      }
    });

    navLinks.forEach(function (link) {
      const href = link.getAttribute('href');
      if (href === '#' + currentSection) {
        link.classList.add('active');
        link.setAttribute('aria-current', 'page');
      } else {
        link.classList.remove('active');
        link.removeAttribute('aria-current');
      }
    });
  }

  /* Combined scroll handler (debounced via rAF for performance) */
  let ticking = false;

  function onScroll() {
    if (!ticking) {
      window.requestAnimationFrame(function () {
        updateHeaderShadow();
        updateActiveNavLink();
        ticking = false;
      });
      ticking = true;
    }
  }

  window.addEventListener('scroll', onScroll, { passive: true });
  updateHeaderShadow();
  updateActiveNavLink();

  /* ==========================================================
     FADE-IN ANIMATIONS (Intersection Observer)
     Elements with .fade-in become visible when scrolled into view
     ========================================================== */
  if ('IntersectionObserver' in window) {
    const fadeObserver = new IntersectionObserver(
      function (entries) {
        entries.forEach(function (entry) {
          if (entry.isIntersecting) {
            entry.target.classList.add('visible');
            fadeObserver.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.15, rootMargin: '0px 0px -40px 0px' }
    );

    fadeEls.forEach(function (el) {
      fadeObserver.observe(el);
    });

    /* Also observe project cards and timeline items for staggered reveal */
    document.querySelectorAll('.project-card, .timeline-item, .skill-badge').forEach(function (el, i) {
      el.classList.add('fade-in');
      el.style.transitionDelay = (i % 6) * 0.08 + 's';
      fadeObserver.observe(el);
    });
  } else {
    /* Fallback: show everything immediately */
    fadeEls.forEach(function (el) {
      el.classList.add('visible');
    });
  }

  /* Trigger hero fade-ins immediately on page load */
  window.addEventListener('load', function () {
    document.querySelectorAll('.hero-content .fade-in').forEach(function (el) {
      el.classList.add('visible');
    });
  });

  /* ==========================================================
     CONTACT FORM VALIDATION
     Validates name, email, and message before submission
     ========================================================== */
  if (contactForm) {
    const nameInput    = document.getElementById('name');
    const emailInput   = document.getElementById('email');
    const messageInput = document.getElementById('message');
    const formSuccess  = document.getElementById('form-success');

    /* Validation rules */
    const validators = {
      name: function (value) {
        if (!value.trim()) return 'Please enter your name.';
        if (value.trim().length < 2) return 'Name must be at least 2 characters.';
        return '';
      },
      email: function (value) {
        if (!value.trim()) return 'Please enter your email address.';
        /* Basic email pattern */
        const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailPattern.test(value.trim())) return 'Please enter a valid email address.';
        return '';
      },
      message: function (value) {
        if (!value.trim()) return 'Please enter a message.';
        if (value.trim().length < 10) return 'Message must be at least 10 characters.';
        return '';
      }
    };

    /**
     * Show or clear an inline error for a form field
     * @param {HTMLElement} input - The input/textarea element
     * @param {string} errorMsg   - Error message (empty string = no error)
     */
    function setFieldError(input, errorMsg) {
      const errorEl = document.getElementById(input.id + '-error');
      if (errorMsg) {
        input.classList.add('error');
        input.setAttribute('aria-invalid', 'true');
        if (errorEl) errorEl.textContent = errorMsg;
      } else {
        input.classList.remove('error');
        input.removeAttribute('aria-invalid');
        if (errorEl) errorEl.textContent = '';
      }
    }

    /** Validate a single field on blur */
    function validateField(input) {
      const validator = validators[input.name];
      if (!validator) return true;
      const error = validator(input.value);
      setFieldError(input, error);
      return error === '';
    }

    /* Live validation on blur */
    [nameInput, emailInput, messageInput].forEach(function (input) {
      if (!input) return;
      input.addEventListener('blur', function () {
        validateField(input);
      });

      /* Clear error styling as user types */
      input.addEventListener('input', function () {
        if (input.classList.contains('error')) {
          validateField(input);
        }
      });
    });

    /* Form submission handler */
    contactForm.addEventListener('submit', function (e) {
      e.preventDefault();

      /* Validate all fields */
      const isNameValid    = validateField(nameInput);
      const isEmailValid   = validateField(emailInput);
      const isMessageValid = validateField(messageInput);

      if (!isNameValid || !isEmailValid || !isMessageValid) {
        /* Focus the first invalid field for accessibility */
        const firstInvalid = contactForm.querySelector('.error');
        if (firstInvalid) firstInvalid.focus();
        return;
      }

      /*
       * In a production site, you would send the form data to a backend
       * or service like Formspree, Netlify Forms, or EmailJS here.
       * For this static portfolio, we show a success message instead.
       */
      if (formSuccess) {
        formSuccess.textContent = 'Thank you! Your message has been received. I\'ll get back to you soon.';
      }

      contactForm.reset();
      [nameInput, emailInput, messageInput].forEach(function (input) {
        setFieldError(input, '');
      });

      /* Clear success message after 6 seconds */
      setTimeout(function () {
        if (formSuccess) formSuccess.textContent = '';
      }, 6000);
    });
  }

})();
