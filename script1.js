// ============================================================
// STUDIO SA — script1.js
//
// THE MECHANIC:
//   Sheet (beige) covers screen. Page is hidden below.
//   On exit: sheet slides UP, page slides UP — same speed/ease.
//   Sheet bottom edge = page top edge — they are one seam.
//   Logo flips to a line exactly when seam passes center.
//   When done: page is at translateY(0), hero fills screen.
//   User then scrolls normally.
//
// KEY: We use JS to drive both animations via requestAnimationFrame
// with a shared easing function so they are perfectly in sync
// and the page ends up in the correct position with no snap.
// ============================================================

// Always start at top on refresh
if ('scrollRestoration' in history) {
  history.scrollRestoration = 'manual';
}

window.scrollTo(0, 0);
document.body.style.top = '0';

const intro     = document.getElementById('intro');
const sheet     = document.getElementById('sheet');
const page      = document.getElementById('page');
const logo      = document.getElementById('logo');
const logoInner = document.getElementById('logoInner');

const HOLD      = 400;   // ms before logo appears
const LOGO_REST = 900;   // ms logo is visible before exit
const DUR       = 2600;  // ms for the curtain drag

// Easing: slow start, fast finish (Studio Dado feel)
function ease(t) {
  // cubic-bezier approximation: slow in, fast out
  return t < 0.5
    ? 4 * t * t * t
    : 1 - Math.pow(-2 * t + 2, 3) / 2;
}

window.addEventListener('load', () => {
  if (!intro || !sheet || !page || !logo || !logoInner) return;

  // Page starts below viewport — use position fixed so it doesn't affect scroll
  page.style.position = '';
page.style.top = '';
page.style.left = '';
page.style.right = '';
page.style.bottom = '';
page.style.transform = '';
page.style.zIndex = '';
page.style.overflow = '';
  // 1. Logo pops in
  setTimeout(() => {
    logo.classList.add('is-visible');

    // 2. After logo settled, start the drag
    setTimeout(() => {
      logoInner.classList.add('is-exit');

      page.style.willChange = 'transform';   // cleared when the curtain finishes

      let start = null;
      const logoWrap = document.querySelector('.intro__logo');
      let logoHidden = false;

      function animate(ts) {
        if (!start) start = ts;
        const elapsed = ts - start;
        const t = Math.min(elapsed / DUR, 1);
        const e = ease(t);
        if (e > 0.82 && !window.__heroRevealed) {
  window.__heroRevealed = true;

  const heroContent = document.querySelector('.hero__content');
  const heroBottom  = document.querySelector('.hero__bottom');

  if (heroContent) heroContent.classList.add('is-visible');

  setTimeout(() => {
    if (heroBottom) heroBottom.classList.add('is-visible');
  }, 200);
}
        // Sheet slides up: 0 → -100vh
        sheet.style.transform = `translateY(${-e * 100}vh)`;

        // Page slides up in sync: 100vh → 0
        page.style.transform = `translateY(${(1 - e) * 100}vh)`;

        // Hide logo once sheet bottom edge passes viewport center (50vh traveled = e > 0.5)
        // At that point the page top edge is above center and logo would show over the hero
        if (!logoHidden && e > 0.52) {
          logoHidden = true;
          if (logoWrap) logoWrap.style.opacity = '0';
        }

        if (t < 1) {
          requestAnimationFrame(animate);
        } else {
          // Animation done — restore page to normal document flow
       page.style.position = 'relative';
page.style.transform = 'none';   // not translateY(0): any transform here
page.style.willChange = 'auto';  // would trap position:fixed children
page.style.overflow = '';
          document.body.classList.remove('no-scroll');
          document.body.style.top = '';
          intro.remove(); // removes sheet + logo wrap

          // Start hero video after intro completes
const heroVideo = document.getElementById('heroBgVideo');
if (heroVideo) {
  heroVideo.currentTime = 0;
  heroVideo.play().catch(() => {});
}

          const heroContent = document.querySelector('.hero__content');
if (heroContent) {
  setTimeout(() => {
    heroContent.classList.add('is-visible');
  }, 150);
}

          initScrollReveal();
          initStickyHeader();
        }
      }

      requestAnimationFrame(animate);

    }, LOGO_REST);
  }, HOLD);
});


function initScrollReveal() {
  const obs = new IntersectionObserver((entries) => {
    entries.forEach(e => {
      if (e.isIntersecting) {
        e.target.classList.add('in-view');
        obs.unobserve(e.target);
      }
    });
  }, { threshold: 0.1 });
  document.querySelectorAll('.reveal').forEach(el => obs.observe(el));
}

function initStickyHeader() {
  const heroEl = document.getElementById('hero');
  const header = document.getElementById('siteHeader');
  if (!heroEl || !header) return;
  const sticky = header.cloneNode(true);
  sticky.removeAttribute('id');
  sticky.classList.add('site-header--sticky');
  sticky.style.display = 'none';
  document.body.appendChild(sticky);

  // The clone's menu button lost its #id (and listener) — re-wire it.
  const stickyMenuBtn = sticky.querySelector('.menu-btn');
  if (stickyMenuBtn) {
    stickyMenuBtn.removeAttribute('id');
    stickyMenuBtn.addEventListener('click', openMenu);
  }

  // Show the sticky header (with its menu button) as soon as the user
  // scrolls a little. Toggle a class (transform-based) rather than
  // flipping `display` on every scroll, which avoids layout reflow/jank.
  sticky.style.display = 'flex';
  sticky.classList.remove('is-shown'); // starts hidden via transform
  const SHOW_AFTER = 80; // px
  let ticking = false;
  function update() {
    if (window.scrollY > SHOW_AFTER) {
      sticky.classList.add('is-shown');
    } else {
      sticky.classList.remove('is-shown');
    }
    ticking = false;
  }
  window.addEventListener('scroll', () => {
    if (!ticking) {
      requestAnimationFrame(update);
      ticking = true;
    }
  }, { passive: true });
  update(); // set correct state on init
}


/* ==============================
   MENU INTERACTION
================================ */

const menuBtn = document.getElementById('menuOpenBtn');
const menuCloseBtn = document.getElementById('menuCloseBtn');
const mobMenu = document.getElementById('mobMenu');

/* OPEN MENU */
function openMenu() {
  if (!mobMenu) return;
  const scrollY = window.scrollY;
  document.body.style.top = `-${scrollY}px`;
  mobMenu.classList.add('is-open');
  document.body.classList.add('no-scroll');
}

if (menuBtn) {
  menuBtn.addEventListener('click', openMenu);
}

/* CLOSE MENU */
function closeMenu() {
  if (!mobMenu) return;
  const scrollY = Math.abs(parseInt(document.body.style.top || '0'));
  mobMenu.classList.remove('is-open');
  document.body.classList.remove('no-scroll');
  document.body.style.top = '';
  // Restore on the next frame: while the lock is on, the page can't scroll
  // that far, so restoring immediately lands short of where the user was.
  requestAnimationFrame(() => window.scrollTo(0, scrollY));
}

if (menuCloseBtn) {
  menuCloseBtn.addEventListener('click', closeMenu);
}

/* Close on Escape */
document.addEventListener('keydown', (e) => {
  if (e.key === 'Escape' && mobMenu && mobMenu.classList.contains('is-open')) {
    closeMenu();
  }
});

/* NAVIGATION LINKS */
document.querySelectorAll('.mob-menu__link').forEach(link => {
  link.addEventListener('click', function (e) {

    e.preventDefault(); // prevent instant jump

    const targetId = this.getAttribute('href');
    // Guard: href="#" or empty would make querySelector throw.
    const target = (targetId && targetId.length > 1)
      ? document.querySelector(targetId)
      : null;

    closeMenu();

    // Wait for menu animation to finish
    setTimeout(() => {
      if (target) {
        target.scrollIntoView({ behavior: 'smooth' });
      }
    }, 500); // match your menu transition timing
  });
});
/* ==============================
   HERO HEADLINE MOVE UP ON SCROLL
================================ */

function initHeroScrollMove() {
  const hero = document.getElementById('hero');
  const headline = document.querySelector('.hero__headline');

  if (!hero || !headline) return;

  let ticking = false;

  window.addEventListener('scroll', () => {
    if (!ticking) {
      requestAnimationFrame(() => {

        const scrollY = window.scrollY;
        const heroHeight = hero.offsetHeight;

        if (scrollY <= heroHeight) {
          const progress = scrollY / heroHeight;

          // Move headline up (adjust 120 for more/less movement)
          headline.style.transform = `translateY(${progress * -120}px)`;
        }

        ticking = false;

      });

      ticking = true;
    }
  }, { passive: true });
}

initHeroScrollMove();

// ============================================================
// PROJECTS — drag scroll + progress bar + card entrance
// ============================================================
function initProjects() {
  const outer   = document.getElementById('projectsOuter');
  const track   = document.getElementById('projectsTrack');
  const progBar = document.getElementById('projectsProgressBar');
  const cards   = document.querySelectorAll('.project-card');

  if (!outer || !track) return;

  // ---- Drag to scroll ----
  let isDragging = false, startX = 0, startScroll = 0;

  outer.addEventListener('mousedown', e => {
    isDragging = true;
    startX = e.pageX - outer.offsetLeft;
    startScroll = outer.scrollLeft;
    outer.classList.add('is-grabbing');
  });
  document.addEventListener('mouseup', () => {
    isDragging = false;
    outer.classList.remove('is-grabbing');
  });
  outer.addEventListener('mousemove', e => {
    if (!isDragging) return;
    e.preventDefault();
    const x    = e.pageX - outer.offsetLeft;
    const walk = (x - startX) * 1.4;
    outer.scrollLeft = startScroll - walk;
  });

  // ---- Smooth wheel scroll (horizontal) ----
  outer.addEventListener('wheel', e => {
    if (Math.abs(e.deltaY) > Math.abs(e.deltaX)) {
      e.preventDefault();
      outer.scrollLeft += e.deltaY * 1.2;
    }
  }, { passive: false });

  // ---- Progress bar ----
  function updateProgress() {
    if (!progBar) return;
    const max  = outer.scrollWidth - outer.clientWidth;
    const pct  = max > 0 ? (outer.scrollLeft / max) * 100 : 0;
    progBar.style.width = pct + '%';
  }
  outer.addEventListener('scroll', updateProgress, { passive: true });
  updateProgress();

  // ---- Staggered card entrance on scroll into view ----
  const cardObs = new IntersectionObserver(entries => {
    entries.forEach((entry, i) => {
      if (entry.isIntersecting) {
        const idx = Array.from(cards).indexOf(entry.target);
        setTimeout(() => {
          entry.target.classList.add('is-visible');
        }, idx * 100);
        cardObs.unobserve(entry.target);
      }
    });
  }, { threshold: 0.15 });

  cards.forEach(card => cardObs.observe(card));
}

// Run after intro or immediately if no intro
document.addEventListener('DOMContentLoaded', () => {
  const checkIntro = setInterval(() => {
    if (!document.getElementById('intro')) {
      clearInterval(checkIntro);
      initProjects();
    }
  }, 100);
  setTimeout(initProjects, 4500); // fallback
});