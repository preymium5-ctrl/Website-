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

  // 5. Timeline Changelog Accordions (works with static + dynamically loaded items)
  const changelogRoot = document.getElementById('changelog-list');

  const bindChangelogAccordions = (root) => {
    if (!root) return;
    const items = root.querySelectorAll('.accordion-item');

    items.forEach(item => {
      const headerEl = item.querySelector('.accordion-header');
      const contentEl = item.querySelector('.accordion-content');
      if (!headerEl || !contentEl) return;

      // Avoid double-binding after re-render
      if (headerEl.dataset.bound === '1') return;
      headerEl.dataset.bound = '1';

      if (item.classList.contains('active')) {
        contentEl.style.maxHeight = contentEl.scrollHeight + 'px';
      }

      headerEl.addEventListener('click', () => {
        const isActive = item.classList.contains('active');
        const allItems = root.querySelectorAll('.accordion-item');

        allItems.forEach(innerItem => {
          innerItem.classList.remove('active');
          const h = innerItem.querySelector('.accordion-header');
          const c = innerItem.querySelector('.accordion-content');
          if (h) h.setAttribute('aria-expanded', 'false');
          if (c) c.style.maxHeight = null;
        });

        if (!isActive) {
          item.classList.add('active');
          headerEl.setAttribute('aria-expanded', 'true');
          contentEl.style.maxHeight = contentEl.scrollHeight + 'px';
        }
      });
    });
  };

  bindChangelogAccordions(changelogRoot);

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
    if (changelogRoot) {
      changelogRoot.querySelectorAll('.accordion-item.active').forEach(item => {
        const contentEl = item.querySelector('.accordion-content');
        if (contentEl) contentEl.style.maxHeight = contentEl.scrollHeight + 'px';
      });
    }

    // Re-adjust expanded FAQ cards
    faqCards.forEach(card => {
      if (card.classList.contains('active')) {
        const answerEl = card.querySelector('.faq-answer');
        answerEl.style.maxHeight = answerEl.scrollHeight + 'px';
      }
    });
  });

  // 8. Live GitHub Releases → download buttons, version labels, changelog
  const GITHUB_REPO = 'preymium5-ctrl/Tarumi';
  const RELEASES_API = `https://api.github.com/repos/${GITHUB_REPO}/releases?per_page=10`;
  const CACHE_KEY = 'tarumi_releases_cache_v1';
  const CACHE_TTL_MS = 15 * 60 * 1000; // 15 minutes

  const escapeHtml = (str) =>
    String(str)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#39;');

  const formatBytes = (bytes) => {
    if (!bytes || bytes <= 0) return '—';
    const mb = bytes / (1024 * 1024);
    return `~${mb.toFixed(1)} MB`;
  };

  const formatDate = (iso) => {
    if (!iso) return '—';
    try {
      return new Date(iso).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      });
    } catch {
      return '—';
    }
  };

  const pickApkAsset = (release) => {
    const assets = release.assets || [];
    return (
      assets.find(a => /app-release\.apk$/i.test(a.name)) ||
      assets.find(a => /\.apk$/i.test(a.name)) ||
      null
    );
  };

  /** Lightweight markdown → HTML for GitHub release notes */
  const markdownToHtml = (md) => {
    if (!md) return '<p class="changelog-summary">No release notes provided.</p>';

    const lines = md.replace(/\r\n/g, '\n').split('\n');
    let html = '';
    let inList = false;
    let paraBuf = [];

    const flushPara = () => {
      if (!paraBuf.length) return;
      const text = paraBuf.join(' ').trim();
      paraBuf = [];
      if (text) html += `<p class="changelog-summary">${inlineMd(text)}</p>`;
    };

    const closeList = () => {
      if (inList) {
        html += '</ul>';
        inList = false;
      }
    };

    const inlineMd = (text) => {
      let t = escapeHtml(text);
      // links [text](url)
      t = t.replace(/\[([^\]]+)\]\((https?:[^)\s]+)\)/g, '<a href="$2" target="_blank" rel="noopener">$1</a>');
      // bold **text**
      t = t.replace(/\*\*([^*]+)\*\*/g, '<strong>$1</strong>');
      // inline code
      t = t.replace(/`([^`]+)`/g, '<code>$1</code>');
      return t;
    };

    for (const raw of lines) {
      const line = raw.trimEnd();
      const trimmed = line.trim();

      if (!trimmed) {
        flushPara();
        closeList();
        continue;
      }

      if (/^---+$/.test(trimmed)) {
        flushPara();
        closeList();
        html += '<hr class="changelog-hr">';
        continue;
      }

      const heading = trimmed.match(/^(#{1,4})\s+(.*)$/);
      if (heading) {
        flushPara();
        closeList();
        const level = Math.min(heading[1].length + 2, 5); // h3–h5
        html += `<h${level} class="changelog-heading">${inlineMd(heading[2])}</h${level}>`;
        continue;
      }

      const bullet = trimmed.match(/^[-*+]\s+(.*)$/);
      if (bullet) {
        flushPara();
        if (!inList) {
          html += '<ul class="changelog-details">';
          inList = true;
        }
        html += `<li>${inlineMd(bullet[1])}</li>`;
        continue;
      }

      const numbered = trimmed.match(/^\d+\.\s+(.*)$/);
      if (numbered) {
        flushPara();
        if (!inList) {
          html += '<ul class="changelog-details">';
          inList = true;
        }
        html += `<li>${inlineMd(numbered[1])}</li>`;
        continue;
      }

      closeList();
      paraBuf.push(trimmed);
    }

    flushPara();
    closeList();
    return html || '<p class="changelog-summary">No release notes provided.</p>';
  };

  const readCache = () => {
    try {
      const raw = sessionStorage.getItem(CACHE_KEY);
      if (!raw) return null;
      const parsed = JSON.parse(raw);
      if (!parsed || !parsed.ts || !parsed.data) return null;
      if (Date.now() - parsed.ts > CACHE_TTL_MS) return null;
      return parsed.data;
    } catch {
      return null;
    }
  };

  const writeCache = (data) => {
    try {
      sessionStorage.setItem(CACHE_KEY, JSON.stringify({ ts: Date.now(), data }));
    } catch {
      /* ignore quota / private mode */
    }
  };

  const applyReleaseMeta = (latest) => {
    const tag = latest.tag_name || 'latest';
    const apk = pickApkAsset(latest);
    const downloadUrl =
      (apk && apk.browser_download_url) ||
      `https://github.com/${GITHUB_REPO}/releases/latest/download/app-release.apk`;
    const apkName = (apk && apk.name) || 'app-release.apk';
    const sizeLabel = formatBytes(apk && apk.size);
    const dateLabel = formatDate(latest.published_at || latest.created_at);

    document.querySelectorAll('[data-release-download]').forEach(el => {
      el.setAttribute('href', downloadUrl);
    });

    const versionBadge = document.querySelector('[data-release-version-label]');
    if (versionBadge) versionBadge.textContent = `${tag} Out Now`;

    const heroLabel = document.querySelector('[data-release-hero-label]');
    if (heroLabel) heroLabel.textContent = `Download ${tag} APK`;

    const mainLabel = document.querySelector('[data-release-main-label]');
    if (mainLabel) mainLabel.textContent = `Download ${apkName} (${tag})`;

    const statVersion = document.querySelector('[data-release-version]');
    if (statVersion) statVersion.textContent = tag;

    const statSize = document.querySelector('[data-release-size]');
    if (statSize) statSize.textContent = sizeLabel;

    const statDate = document.querySelector('[data-release-date]');
    if (statDate) statDate.textContent = dateLabel;

    const footer = document.querySelector('[data-release-footer]');
    if (footer) footer.textContent = `Current Version: ${tag} (Stable)`;

    const headerBtn = document.getElementById('download-header-btn');
    if (headerBtn) headerBtn.textContent = `Download ${tag}`;

    document.title = `Tarumi ${tag} – Premium, Ad-Free Manga & Webtoon Reader for Android`;
  };

  const renderChangelog = (releases) => {
    const list = document.getElementById('changelog-list');
    if (!list) return;

    const published = releases.filter(r => !r.draft && !r.prerelease);
    if (!published.length) {
      list.innerHTML =
        '<p class="changelog-loading">No public releases found. <a href="https://github.com/preymium5-ctrl/Tarumi/releases" target="_blank" rel="noopener">View on GitHub</a></p>';
      return;
    }

    list.innerHTML = published
      .map((release, index) => {
        const tag = escapeHtml(release.tag_name || 'release');
        const title = escapeHtml(release.name || `Tarumi ${release.tag_name || ''}`);
        const date = escapeHtml(formatDate(release.published_at || release.created_at));
        const isLatest = index === 0;
        const latestBadge = isLatest
          ? ' <span class="badge-tag latest-tag">Latest</span>'
          : '';
        const bodyHtml = markdownToHtml(release.body || '');
        // All changelogs start minimized by default
        const expanded = '';
        const aria = 'false';

        return `
          <div class="accordion-item ${expanded}">
            <button class="accordion-header" aria-expanded="${aria}" type="button">
              <span class="accordion-version">${title || `Tarumi ${tag}`}${latestBadge}</span>
              <span class="accordion-date">${date}</span>
              <svg class="accordion-arrow" viewBox="0 0 24 24" width="24" height="24" aria-hidden="true"><path fill="currentColor" d="M7.41 8.59L12 13.17l4.59-4.58L18 10l-6 6l-6-6 1.41-1.41z"/></svg>
            </button>
            <div class="accordion-content">
              <div class="accordion-content-inner changelog-body">
                ${bodyHtml}
                <p class="changelog-release-link">
                  <a href="${escapeHtml(release.html_url)}" target="_blank" rel="noopener">View full release on GitHub →</a>
                </p>
              </div>
            </div>
          </div>
        `;
      })
      .join('');

    bindChangelogAccordions(list);
  };

  const loadReleases = async () => {
    const loadingEl = document.getElementById('changelog-loading');

    try {
      let releases = readCache();

      if (!releases) {
        const res = await fetch(RELEASES_API, {
          headers: {
            Accept: 'application/vnd.github+json'
          }
        });
        if (!res.ok) throw new Error(`GitHub API ${res.status}`);
        releases = await res.json();
        if (!Array.isArray(releases)) throw new Error('Unexpected API response');
        writeCache(releases);
      }

      const latest =
        releases.find(r => !r.draft && !r.prerelease) || releases[0];
      if (latest) applyReleaseMeta(latest);
      renderChangelog(releases);
    } catch (err) {
      console.warn('Failed to load GitHub releases:', err);
      if (loadingEl) {
        loadingEl.innerHTML =
          'Could not load live releases. <a href="https://github.com/preymium5-ctrl/Tarumi/releases" target="_blank" rel="noopener">Open GitHub Releases</a> instead.';
      } else if (changelogRoot) {
        changelogRoot.innerHTML =
          '<p class="changelog-loading">Could not load live releases. <a href="https://github.com/preymium5-ctrl/Tarumi/releases" target="_blank" rel="noopener">Open GitHub Releases</a></p>';
      }
    }
  };

  loadReleases();

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

  // 10. Scroll Reveal Animations (Intersection Observer)
  const initScrollReveal = () => {
    // Hero Elements
    const heroLeft = document.querySelector('.hero-content');
    if (heroLeft && !heroLeft.classList.contains('reveal-left')) heroLeft.classList.add('reveal-left');

    const heroRight = document.querySelector('.hero-mockup-wrapper');
    if (heroRight && !heroRight.classList.contains('reveal-right')) heroRight.classList.add('reveal-right');

    // Section Titles & Subtitles
    const sectionTitles = document.querySelectorAll('.section-title, .section-subtitle, .section-tag, .section-header');
    sectionTitles.forEach(el => {
      if (!el.classList.contains('reveal') && !el.classList.contains('reveal-pop')) {
        el.classList.add('reveal');
      }
    });

    // Grid Containers (Feature cards, FAQ cards, Stats, Tech stacks)
    const gridContainers = document.querySelectorAll('.features-grid, .faq-grid, .stats-grid, .tech-grid');
    gridContainers.forEach(container => {
      const items = container.children;
      Array.from(items).forEach((item, index) => {
        if (!item.classList.contains('reveal') && !item.classList.contains('reveal-pop')) {
          item.classList.add('reveal-pop');
          const delayClass = `delay-${Math.min((index + 1) * 100, 500)}`;
          item.classList.add(delayClass);
        }
      });
    });

    // Timeline Changelog Container
    const changelogContainer = document.getElementById('changelog-list');
    if (changelogContainer && !changelogContainer.classList.contains('reveal')) {
      changelogContainer.classList.add('reveal');
    }

    // Gallery Carousel Section
    const galleryContainer = document.querySelector('.gallery-section .slider-container');
    if (galleryContainer && !galleryContainer.classList.contains('reveal-pop')) {
      galleryContainer.classList.add('reveal-pop');
    }

    // Community / Download CTA Cards
    const ctaCards = document.querySelectorAll('.cta-banner, .github-community-banner, .community-card, .footer-content');
    ctaCards.forEach(card => {
      if (!card.classList.contains('reveal') && !card.classList.contains('reveal-pop')) {
        card.classList.add('reveal-pop');
      }
    });

    // IntersectionObserver Setup
    if ('IntersectionObserver' in window) {
      const observerOptions = {
        root: null,
        rootMargin: '0px 0px -60px 0px',
        threshold: 0.1
      };

      const revealObserver = new IntersectionObserver((entries, observer) => {
        entries.forEach(entry => {
          if (entry.isIntersecting) {
            entry.target.classList.add('active');
            observer.unobserve(entry.target);
          }
        });
      }, observerOptions);

      const revealElements = document.querySelectorAll('.reveal, .reveal-left, .reveal-right, .reveal-pop');
      revealElements.forEach(el => revealObserver.observe(el));
    } else {
      // Fallback for older browsers without IntersectionObserver
      const revealElements = document.querySelectorAll('.reveal, .reveal-left, .reveal-right, .reveal-pop');
      revealElements.forEach(el => el.classList.add('active'));
    }
  };

  initScrollReveal();

});
