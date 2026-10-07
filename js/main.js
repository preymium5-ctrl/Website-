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
      if (window.innerWidth > 850 && navMenu.classList.contains('active')) {
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

  // Accessible slideshow: manual controls, swipe, and optional rotation.
  const carousel = document.querySelector('.showcase-slider');
  const slides = Array.from(document.querySelectorAll('.slide'));
  const dots = Array.from(document.querySelectorAll('.dot'));
  const sliderWrapper = document.getElementById('slider-wrapper');
  const rotationBtn = document.getElementById('rotation-btn');
  const slideStatus = document.getElementById('slide-status');
  const motionPreference = window.matchMedia('(prefers-reduced-motion: reduce)');
  let currentSlide = 0;
  let autoPlay = !motionPreference.matches;
  let inView = !('IntersectionObserver' in window);
  let hovered = false;
  let rotationTimer;

  const updateRotation = () => {
    clearInterval(rotationTimer);
    if (rotationBtn) {
      rotationBtn.textContent = autoPlay ? 'Pause' : 'Play';
      rotationBtn.setAttribute('aria-label', autoPlay ? 'Pause slideshow' : 'Play slideshow');
    }
    if (autoPlay && inView && !hovered && !document.hidden) {
      rotationTimer = setInterval(() => showSlide(currentSlide + 1), 7000);
    }
  };

  const showSlide = (index, announce = false) => {
    if (!slides.length) return;
    currentSlide = (index + slides.length) % slides.length;
    slides.forEach((slide, i) => {
      slide.hidden = i !== currentSlide;
      slide.classList.toggle('active', i === currentSlide);
    });
    dots.forEach((dot, i) => {
      dot.classList.toggle('active', i === currentSlide);
      dot.setAttribute('aria-pressed', String(i === currentSlide));
    });
    if (announce && slideStatus) {
      slideStatus.textContent = `Slide ${slides[currentSlide].getAttribute('aria-label')}`;
    }
  };

  const manualSlide = (index) => {
    autoPlay = false;
    showSlide(index, true);
    updateRotation();
  };

  document.getElementById('prev-btn')?.addEventListener('click', () => manualSlide(currentSlide - 1));
  document.getElementById('next-btn')?.addEventListener('click', () => manualSlide(currentSlide + 1));
  dots.forEach(dot => dot.addEventListener('click', () => manualSlide(Number(dot.dataset.slide))));
  rotationBtn?.addEventListener('click', () => {
    autoPlay = !autoPlay;
    updateRotation();
  });

  if (carousel && sliderWrapper) {
    carousel.addEventListener('keydown', (event) => {
      if (event.key === 'ArrowRight' || event.key === 'ArrowLeft') {
        event.preventDefault();
        manualSlide(currentSlide + (event.key === 'ArrowRight' ? 1 : -1));
      }
    });
    carousel.addEventListener('focusin', () => {
      autoPlay = false;
      updateRotation();
    });
    carousel.addEventListener('mouseenter', () => { hovered = true; updateRotation(); });
    carousel.addEventListener('mouseleave', () => { hovered = false; updateRotation(); });
    let swipeStart = null;
    sliderWrapper.addEventListener('pointerdown', event => {
      if (event.button !== 0) return;
      swipeStart = { x: event.clientX, y: event.clientY };
    });
    sliderWrapper.addEventListener('pointerup', event => {
      if (!swipeStart) return;
      const dx = event.clientX - swipeStart.x;
      const dy = event.clientY - swipeStart.y;
      if (Math.abs(dx) > 45 && Math.abs(dx) > Math.abs(dy)) {
        manualSlide(currentSlide + (dx < 0 ? 1 : -1));
      }
      swipeStart = null;
    });
    sliderWrapper.addEventListener('pointercancel', () => { swipeStart = null; });
    sliderWrapper.addEventListener('dragstart', event => event.preventDefault());
    if ('IntersectionObserver' in window) {
      new IntersectionObserver(entries => {
        inView = entries[0].isIntersecting;
        updateRotation();
      }, { threshold: 0.25 }).observe(carousel);
    }
  }
  document.addEventListener('visibilitychange', updateRotation);
  motionPreference.addEventListener('change', () => {
    if (motionPreference.matches) autoPlay = false;
    updateRotation();
  });
  updateRotation();

  // Original comic art in an illustrative page/scroll reader.
  const readerModes = document.querySelectorAll('[data-reader-mode]');
  const readerViewport = document.getElementById('reader-viewport');
  const readerArtwork = document.getElementById('reader-artwork');
  readerModes.forEach(button => button.addEventListener('click', () => {
    const webtoon = button.dataset.readerMode === 'webtoon';
    readerModes.forEach(mode => {
      const selected = mode === button;
      mode.classList.toggle('active', selected);
      mode.setAttribute('aria-pressed', String(selected));
    });
    readerViewport.classList.toggle('webtoon-mode', webtoon);
    readerViewport.setAttribute('aria-label', webtoon ? 'Scrollable webtoon preview' : 'Manga page preview');
    readerArtwork.hidden = webtoon;
    document.getElementById('webtoon-panels').hidden = !webtoon;
    readerViewport.scrollTop = 0;
    document.getElementById('reader-story-title').textContent = webtoon ? 'A Rooftop Away' : 'The Lantern Keeper';
    document.getElementById('reader-mode-label').textContent = webtoon ? 'Webtoon mode' : 'Page mode';
    document.getElementById('reader-position').textContent = webtoon ? 'Scroll to explore' : '1 / 1';
    document.getElementById('reader-hint').textContent = webtoon ? 'Scroll inside the screen to follow the story.' : 'A complete page, at a glance.';
    document.getElementById('reader-status').textContent = webtoon ? 'Webtoon preview selected. Scroll inside the phone to read.' : 'Manga page preview selected.';
  }));

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
          if (c) { c.style.maxHeight = null; c.inert = true; }
        });

        if (!isActive) {
          item.classList.add('active');
          headerEl.setAttribute('aria-expanded', 'true');
          contentEl.inert = false;
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
    const answerId = `faq-answer-${Array.from(faqCards).indexOf(card) + 1}`;
    answerEl.id = answerId;
    answerEl.inert = true;
    questionBtn.setAttribute('aria-controls', answerId);
    questionBtn.setAttribute('aria-expanded', 'false');

    questionBtn.addEventListener('click', () => {
      const isActive = card.classList.contains('active');

      // Close all FAQs in the same column (optional, but makes layout cleaner)
      const column = card.parentElement;
      column.querySelectorAll('.faq-card').forEach(innerCard => {
        innerCard.classList.remove('active');
        innerCard.querySelector('.faq-answer').style.maxHeight = null;
        innerCard.querySelector('.faq-answer').inert = true;
        innerCard.querySelector('.faq-question').setAttribute('aria-expanded', 'false');
      });

      // Expand if it wasn't active
      if (!isActive) {
        card.classList.add('active');
        questionBtn.setAttribute('aria-expanded', 'true');
        answerEl.inert = false;
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
  const CACHE_KEY = 'tarumi_releases_cache_v3';
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

  const applyReleaseMeta = (latest, releases = []) => {
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

    // Dynamic Release & Upgrade Alert Box
    const upgradeTitle = document.querySelector('[data-release-upgrade-title]');
    if (upgradeTitle) upgradeTitle.textContent = `Release & Upgrade Info (${tag} Out Now)`;

    const upgradeBody = document.querySelector('[data-release-upgrade-body]');
    if (upgradeBody) {
      const prevRelease = releases.find(r => !r.draft && !r.prerelease && r.tag_name !== tag);
      const prevTag = prevRelease ? prevRelease.tag_name : '';
      if (prevTag) {
        upgradeBody.innerHTML = `Users on <strong>${escapeHtml(prevTag)}</strong> can install <strong>${escapeHtml(tag)}</strong> directly as a seamless in-place update. If upgrading from an old debug build (<code>com.tarumi.reader.debug</code>), follow these steps to preserve your reading data:`;
      } else {
        upgradeBody.innerHTML = `Users on previous release builds can install <strong>${escapeHtml(tag)}</strong> directly as a seamless in-place update. If upgrading from an old debug build (<code>com.tarumi.reader.debug</code>), follow these steps to preserve your reading data:`;
      }
    }

    // Dynamic FAQ release update references
    const faqCompat = document.querySelectorAll('[data-release-faq-version]');
    faqCompat.forEach(el => {
      el.textContent = tag;
    });

    const faqNewTitle = document.querySelector('[data-release-faq-new-title]');
    if (faqNewTitle) faqNewTitle.textContent = `What is new in Tarumi ${tag}?`;

    const faqNewDesc = document.querySelector('[data-release-faq-new-desc]');
    if (faqNewDesc && latest.body) {
      const lines = latest.body.replace(/\r\n/g, '\n').split('\n');
      const firstPara = lines.find(l => {
        const trimmed = l.trim();
        return (
          trimmed &&
          !trimmed.startsWith('#') &&
          !trimmed.startsWith('>') &&
          !trimmed.startsWith('*') &&
          !trimmed.startsWith('-') &&
          !trimmed.startsWith('[!') &&
          !trimmed.startsWith('**Package:**')
        );
      });
      if (firstPara) {
        faqNewDesc.textContent = firstPara.replace(/\*\*/g, '').replace(/`/g, '').trim();
      }
    }

    document.title = `Tarumi ${tag} – Free, Ad-Free Manga, Manhwa & Manhua Reader for Android`;
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
            <div class="accordion-content" inert>
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

      const published = releases.filter(r => !r.draft && !r.prerelease);
      const latest =
        published[0] || releases.find(r => !r.draft && !r.prerelease) || releases[0];
      if (latest) applyReleaseMeta(latest, published);
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


});
