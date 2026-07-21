/* ==========================================
   Tarumi Landing Page JavaScript - Behaviors
   ========================================== */

document.addEventListener('DOMContentLoaded', () => {

  // 1. Mobile Menu Toggle
  const menuToggle = document.getElementById('menu-toggle');
  const navMenu = document.getElementById('nav-menu');
  const navLinks = document.querySelectorAll('.nav-link');

  const setMenuOpen = (open) => {
    if (!menuToggle || !navMenu) return;
    menuToggle.classList.toggle('active', open);
    navMenu.classList.toggle('active', open);
    menuToggle.setAttribute('aria-expanded', open ? 'true' : 'false');
    document.body.classList.toggle('nav-open', open);
  };

  if (menuToggle && navMenu) {
    menuToggle.addEventListener('click', () => {
      const willOpen = !menuToggle.classList.contains('active');
      setMenuOpen(willOpen);
    });

    // Close menu when tapping any link/CTA inside the drawer
    navMenu.querySelectorAll('a').forEach(link => {
      link.addEventListener('click', () => setMenuOpen(false));
    });

    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && navMenu.classList.contains('active')) {
        setMenuOpen(false);
      }
    });

    window.addEventListener('resize', () => {
      if (window.innerWidth > 992 && navMenu.classList.contains('active')) {
        setMenuOpen(false);
      }
    });
  }

  // 2. Sticky Header Scroll Effect
  const header = document.getElementById('site-header');
  window.addEventListener('scroll', () => {
    if (window.scrollY > 20) {
      header.classList.add('scrolled');
    } else {
      header.classList.remove('scrolled');
    }
  });

  // 3. Scroll spy - Highlight active navbar link
  const sections = document.querySelectorAll('section[id]');
  const scrollSpy = () => {
    const scrollY = window.pageYOffset;

    sections.forEach(current => {
      const sectionHeight = current.offsetHeight;
      const sectionTop = current.offsetTop - 100;
      const sectionId = current.getAttribute('id');
      const activeLink = document.querySelector(`.nav-menu a[href*=${sectionId}]`);

      if (activeLink) {
        if (scrollY > sectionTop && scrollY <= sectionTop + sectionHeight) {
          activeLink.classList.add('active');
        } else {
          activeLink.classList.remove('active');
        }
      }
    });
  };
  window.addEventListener('scroll', scrollSpy);

  // 4. Interactive Slide Carousel (Screenshots) + mobile swipe
  const slides = document.querySelectorAll('.slide');
  const dots = document.querySelectorAll('.dot');
  const prevBtn = document.getElementById('prev-btn');
  const nextBtn = document.getElementById('next-btn');
  const sliderWrapper = document.getElementById('slider-wrapper');
  let currentSlide = 0;
  let isAnimating = false;

  const showSlide = (index, direction = 'next') => {
    if (!slides.length) return;
    if (index === currentSlide && slides[index].classList.contains('active')) return;
    if (isAnimating) return;

    const total = slides.length;
    index = ((index % total) + total) % total;

    const prev = slides[currentSlide];
    const next = slides[index];

    isAnimating = true;

    // Clear residual animation classes
    slides.forEach(slide => {
      slide.classList.remove(
        'active',
        'slide-in-left',
        'slide-in-right',
        'slide-out-left',
        'slide-out-right'
      );
    });
    dots.forEach(dot => dot.classList.remove('active'));

    const outClass = direction === 'next' ? 'slide-out-left' : 'slide-out-right';
    const inClass = direction === 'next' ? 'slide-in-right' : 'slide-in-left';

    if (prev) {
      prev.classList.add(outClass);
    }
    next.classList.add('active', inClass);
    if (dots[index]) dots[index].classList.add('active');
    currentSlide = index;

    const cleanup = () => {
      slides.forEach(slide => {
        slide.classList.remove(
          'slide-in-left',
          'slide-in-right',
          'slide-out-left',
          'slide-out-right'
        );
      });
      isAnimating = false;
    };

    // Fallback if animationend doesn't fire
    const timer = setTimeout(cleanup, 450);
    next.addEventListener('animationend', () => {
      clearTimeout(timer);
      cleanup();
    }, { once: true });
  };

  const goPrev = () => showSlide(currentSlide - 1, 'prev');
  const goNext = () => showSlide(currentSlide + 1, 'next');

  if (prevBtn && nextBtn) {
    prevBtn.addEventListener('click', goPrev);
    nextBtn.addEventListener('click', goNext);

    dots.forEach(dot => {
      dot.addEventListener('click', () => {
        const slideIndex = parseInt(dot.getAttribute('data-slide'), 10);
        if (Number.isNaN(slideIndex)) return;
        const direction = slideIndex > currentSlide ? 'next' : 'prev';
        showSlide(slideIndex, direction);
      });
    });
  }

  // Touch / pointer swipe on the gallery
  if (sliderWrapper && slides.length) {
    let startX = 0;
    let startY = 0;
    let deltaX = 0;
    let tracking = false;
    let lockedAxis = null; // 'x' | 'y' | null
    const SWIPE_THRESHOLD = 45;
    const DRAG_RESISTANCE = 0.35;

    const resetDragVisual = () => {
      sliderWrapper.style.setProperty('--drag-x', '0px');
      sliderWrapper.classList.remove('is-dragging');
      slides.forEach(slide => {
        slide.style.transform = '';
      });
    };

    const onPointerDown = (clientX, clientY) => {
      if (isAnimating) return;
      tracking = true;
      lockedAxis = null;
      startX = clientX;
      startY = clientY;
      deltaX = 0;
      sliderWrapper.classList.add('is-dragging');
    };

    const onPointerMove = (clientX, clientY, event) => {
      if (!tracking) return;
      const dx = clientX - startX;
      const dy = clientY - startY;

      if (!lockedAxis) {
        if (Math.abs(dx) < 8 && Math.abs(dy) < 8) return;
        lockedAxis = Math.abs(dx) > Math.abs(dy) ? 'x' : 'y';
      }

      // Vertical intent → let the page scroll
      if (lockedAxis === 'y') {
        tracking = false;
        resetDragVisual();
        return;
      }

      if (event && event.cancelable) event.preventDefault();
      deltaX = dx;
      const offset = deltaX * DRAG_RESISTANCE;
      sliderWrapper.style.setProperty('--drag-x', `${offset}px`);

      const active = slides[currentSlide];
      if (active) {
        active.style.transform = `translateX(${offset}px)`;
      }
    };

    const onPointerUp = () => {
      if (!tracking && deltaX === 0) {
        resetDragVisual();
        return;
      }
      tracking = false;

      const active = slides[currentSlide];
      if (active) active.style.transform = '';

      if (Math.abs(deltaX) >= SWIPE_THRESHOLD) {
        if (deltaX < 0) {
          goNext(); // swipe left → next
        } else {
          goPrev(); // swipe right → previous
        }
      }
      deltaX = 0;
      lockedAxis = null;
      resetDragVisual();
    };

    // Touch events (mobile)
    sliderWrapper.addEventListener('touchstart', (e) => {
      const t = e.changedTouches[0];
      onPointerDown(t.clientX, t.clientY);
    }, { passive: true });

    sliderWrapper.addEventListener('touchmove', (e) => {
      const t = e.changedTouches[0];
      onPointerMove(t.clientX, t.clientY, e);
    }, { passive: false });

    sliderWrapper.addEventListener('touchend', onPointerUp, { passive: true });
    sliderWrapper.addEventListener('touchcancel', () => {
      tracking = false;
      deltaX = 0;
      lockedAxis = null;
      resetDragVisual();
    }, { passive: true });

    // Mouse drag (desktop convenience)
    let mouseDown = false;
    sliderWrapper.addEventListener('mousedown', (e) => {
      if (e.button !== 0) return;
      mouseDown = true;
      onPointerDown(e.clientX, e.clientY);
    });
    window.addEventListener('mousemove', (e) => {
      if (!mouseDown) return;
      onPointerMove(e.clientX, e.clientY, e);
    });
    window.addEventListener('mouseup', () => {
      if (!mouseDown) return;
      mouseDown = false;
      onPointerUp();
    });
  }

  // 5. Timeline Changelog Accordions
  const changelogItems = document.querySelectorAll('.timeline-accordion .accordion-item');

  changelogItems.forEach(item => {
    const headerEl = item.querySelector('.accordion-header');
    const contentEl = item.querySelector('.accordion-content');

    // Initialize height for pre-expanded active item
    if (item.classList.contains('active')) {
      contentEl.style.maxHeight = contentEl.scrollHeight + 'px';
    }

    headerEl.addEventListener('click', () => {
      const isActive = item.classList.contains('active');

      // Close all items
      changelogItems.forEach(innerItem => {
        innerItem.classList.remove('active');
        innerItem.querySelector('.accordion-header').setAttribute('aria-expanded', 'false');
        innerItem.querySelector('.accordion-content').style.maxHeight = null;
      });

      // Expand current if it wasn't active
      if (!isActive) {
        item.classList.add('active');
        headerEl.setAttribute('aria-expanded', 'true');
        contentEl.style.maxHeight = contentEl.scrollHeight + 'px';
      }
    });
  });

  // 6. FAQ Accordions
  const faqCards = document.querySelectorAll('.faq-card');

  faqCards.forEach(card => {
    const questionBtn = card.querySelector('.faq-question');
    const answerEl = card.querySelector('.faq-answer');

    questionBtn.addEventListener('click', () => {
      const isActive = card.classList.contains('active');

      // Close all FAQs in the same column (optional, but makes layout cleaner)
      const column = card.parentElement;
      column.querySelectorAll('.faq-card').forEach(innerCard => {
        innerCard.classList.remove('active');
        innerCard.querySelector('.faq-answer').style.maxHeight = null;
      });

      // Expand if it wasn't active
      if (!isActive) {
        card.classList.add('active');
        answerEl.style.maxHeight = answerEl.scrollHeight + 'px';
      }
    });
  });

  // Automatically recalculate heights on window resize (fixes accordion cuts on window changes)
  window.addEventListener('resize', () => {
    // Re-adjust expanded timeline accordion heights
    changelogItems.forEach(item => {
      if (item.classList.contains('active')) {
        const contentEl = item.querySelector('.accordion-content');
        contentEl.style.maxHeight = contentEl.scrollHeight + 'px';
      }
    });

    // Re-adjust expanded FAQ cards
    faqCards.forEach(card => {
      if (card.classList.contains('active')) {
        const answerEl = card.querySelector('.faq-answer');
        answerEl.style.maxHeight = answerEl.scrollHeight + 'px';
      }
    });
  });

  // 7. Hero phone — 3D tilt (mouse on desktop, touch + idle float on mobile)
  const mockupScene = document.getElementById('mockup-scene');
  const heroPhone = document.getElementById('hero-phone');
  const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const coarsePointer = window.matchMedia('(hover: none) and (pointer: coarse)').matches;

  if (mockupScene && heroPhone && !prefersReducedMotion) {
    let targetRX = 0;
    let targetRY = 0;
    let currentRX = 0;
    let currentRY = 0;
    let interacting = false;
    let rafId = null;
    let idleTime = 0;
    let lastTs = 0;

    const maxTilt = coarsePointer ? 14 : 12;
    // Mobile keeps a continuous idle loop so the phone always animates
    const alwaysAnimate = coarsePointer || window.matchMedia('(max-width: 992px)').matches;

    const applyTiltFromPoint = (clientX, clientY) => {
      const rect = mockupScene.getBoundingClientRect();
      if (rect.width === 0 || rect.height === 0) return;
      const px = (clientX - rect.left) / rect.width;
      const py = (clientY - rect.top) / rect.height;
      // Clamp so off-edge touches don't over-rotate
      const cx = Math.min(1, Math.max(0, px));
      const cy = Math.min(1, Math.max(0, py));
      targetRY = (cx - 0.5) * maxTilt * 2;
      targetRX = (0.5 - cy) * maxTilt * 2;
    };

    const animate = (ts) => {
      if (!lastTs) lastTs = ts;
      const dt = Math.min(0.05, (ts - lastTs) / 1000);
      lastTs = ts;

      // Gentle floating idle motion when not interacting (especially mobile)
      if (!interacting && alwaysAnimate) {
        idleTime += dt;
        targetRX = Math.sin(idleTime * 0.9) * 5 + Math.sin(idleTime * 0.35) * 1.5;
        targetRY = Math.cos(idleTime * 0.7) * 6 + Math.sin(idleTime * 0.45) * 2;
      }

      const ease = alwaysAnimate ? 0.08 : 0.1;
      currentRX += (targetRX - currentRX) * ease;
      currentRY += (targetRY - currentRY) * ease;

      heroPhone.style.transform =
        `rotateX(${currentRX.toFixed(3)}deg) rotateY(${currentRY.toFixed(3)}deg)`;

      const stillMoving =
        Math.abs(targetRX - currentRX) > 0.04 ||
        Math.abs(targetRY - currentRY) > 0.04;

      if (interacting || stillMoving || alwaysAnimate) {
        rafId = requestAnimationFrame(animate);
      } else {
        rafId = null;
        lastTs = 0;
      }
    };

    const startLoop = () => {
      if (rafId == null) {
        lastTs = 0;
        rafId = requestAnimationFrame(animate);
      }
    };

    // Desktop pointer tracking
    mockupScene.addEventListener('mouseenter', () => {
      interacting = true;
      startLoop();
    });

    mockupScene.addEventListener('mousemove', (e) => {
      interacting = true;
      applyTiltFromPoint(e.clientX, e.clientY);
      startLoop();
    });

    mockupScene.addEventListener('mouseleave', () => {
      interacting = false;
      if (!alwaysAnimate) {
        targetRX = 0;
        targetRY = 0;
      }
      startLoop();
    });

    // Mobile / touch tracking — tilt follows finger on the phone
    mockupScene.addEventListener('touchstart', (e) => {
      const t = e.changedTouches[0];
      if (!t) return;
      interacting = true;
      applyTiltFromPoint(t.clientX, t.clientY);
      startLoop();
    }, { passive: true });

    mockupScene.addEventListener('touchmove', (e) => {
      const t = e.changedTouches[0];
      if (!t) return;
      interacting = true;
      applyTiltFromPoint(t.clientX, t.clientY);
      startLoop();
    }, { passive: true });

    const endTouch = () => {
      interacting = false;
      // Return to idle float on mobile; settle flat on desktop-only
      if (!alwaysAnimate) {
        targetRX = 0;
        targetRY = 0;
      }
      startLoop();
    };

    mockupScene.addEventListener('touchend', endTouch, { passive: true });
    mockupScene.addEventListener('touchcancel', endTouch, { passive: true });

    // Kick off idle animation immediately on mobile / small screens
    if (alwaysAnimate) {
      heroPhone.classList.add('is-animated');
      startLoop();
    }

    // If user rotates/resizes into a mobile layout, start idle motion
    window.addEventListener('resize', () => {
      const shouldIdle =
        window.matchMedia('(hover: none) and (pointer: coarse)').matches ||
        window.matchMedia('(max-width: 992px)').matches;
      if (shouldIdle) {
        heroPhone.classList.add('is-animated');
        startLoop();
      }
    });
  }

});
