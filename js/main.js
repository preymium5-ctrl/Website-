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

  // 4. Interactive Slide Carousel (Screenshots)
  const slides = document.querySelectorAll('.slide');
  const dots = document.querySelectorAll('.dot');
  const prevBtn = document.getElementById('prev-btn');
  const nextBtn = document.getElementById('next-btn');
  let currentSlide = 0;

  const showSlide = (index) => {
    slides.forEach(slide => slide.classList.remove('active'));
    dots.forEach(dot => dot.classList.remove('active'));
    
    slides[index].classList.add('active');
    dots[index].classList.add('active');
    currentSlide = index;
  };

  if (prevBtn && nextBtn) {
    prevBtn.addEventListener('click', () => {
      let index = currentSlide - 1;
      if (index < 0) index = slides.length - 1;
      showSlide(index);
    });

    nextBtn.addEventListener('click', () => {
      let index = currentSlide + 1;
      if (index >= slides.length) index = 0;
      showSlide(index);
    });

    dots.forEach(dot => {
      dot.addEventListener('click', () => {
        const slideIndex = parseInt(dot.getAttribute('data-slide'));
        showSlide(slideIndex);
      });
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

  // 7. Hero phone — cursor-tracking 3D tilt (desktop pointer only)
  const mockupScene = document.getElementById('mockup-scene');
  const heroPhone = document.getElementById('hero-phone');
  const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const coarsePointer = window.matchMedia('(hover: none) and (pointer: coarse)').matches;

  if (mockupScene && heroPhone && !prefersReducedMotion && !coarsePointer) {
    let targetRX = 0;
    let targetRY = 0;
    let currentRX = 0;
    let currentRY = 0;
    let hovering = false;
    let rafId = null;

    const maxTilt = 12; // degrees

    const animate = () => {
      currentRX += (targetRX - currentRX) * 0.1;
      currentRY += (targetRY - currentRY) * 0.1;

      heroPhone.style.transform =
        `rotateX(${currentRX}deg) rotateY(${currentRY}deg)`;

      const stillMoving =
        Math.abs(targetRX - currentRX) > 0.05 ||
        Math.abs(targetRY - currentRY) > 0.05;

      if (hovering || stillMoving) {
        rafId = requestAnimationFrame(animate);
      } else {
        rafId = null;
      }
    };

    const startLoop = () => {
      if (rafId == null) rafId = requestAnimationFrame(animate);
    };

    mockupScene.addEventListener('mouseenter', () => {
      hovering = true;
      startLoop();
    });

    mockupScene.addEventListener('mousemove', (e) => {
      const rect = mockupScene.getBoundingClientRect();
      const px = (e.clientX - rect.left) / rect.width;
      const py = (e.clientY - rect.top) / rect.height;
      targetRY = (px - 0.5) * maxTilt * 2;
      targetRX = (0.5 - py) * maxTilt * 2;
      startLoop();
    });

    mockupScene.addEventListener('mouseleave', () => {
      hovering = false;
      targetRX = 0;
      targetRY = 0;
      startLoop();
    });
  }

});
