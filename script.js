/* ============================================================
   PORTFOLIO SCRIPT — Ziad Bassam (MOSH)
============================================================ */

// ── NAV: fixed header pill on scroll ────────────────────────────
const header      = document.getElementById('site-header');
const allNavLinks = document.querySelectorAll('.nav-link');
const sections    = document.querySelectorAll('[id]');

let prevScrollY   = 0;
let hasScrolled   = false;

function activateLink(current) {
  allNavLinks.forEach(l => l.classList.toggle('active', l.dataset.section === current));
}

window.addEventListener('scroll', () => {
  const sy = window.scrollY;
  hasScrolled = true;
  
  // Responsive header height calculation
  const headerHeight = window.innerWidth < 600 ? 120 : 160;

  // Sync active section
  let current = '';
  sections.forEach(s => {
    if (sy >= s.offsetTop - headerHeight) current = s.id;
  });
  activateLink(current);

  // Toggle compact state: collapse header to pills only when scrolling past 80px
  // Expand back at 60px to give smooth hysteresis
  if (sy > 80) {
    if (!header.classList.contains('compact')) {
      header.classList.add('compact');
    }
    header.classList.add('scrolled');
  } else if (sy < 50) {
    if (header.classList.contains('compact')) {
      header.classList.remove('compact');
    }
    header.classList.remove('scrolled');
  } else if (sy > 50) {
    header.classList.add('scrolled');
  }

  prevScrollY = sy;
}, { passive: true });

// Smooth scroll for BOTH nav instances
allNavLinks.forEach(link => {
  link.addEventListener('click', e => {
    e.preventDefault();
    const target = document.getElementById(link.dataset.section);
    if (target) target.scrollIntoView({ behavior: 'smooth' });
  });
});


// ── SCROLL REVEAL ──────────────────────────────────────────
const revealEls = document.querySelectorAll('[data-reveal]');

const revealObs = new IntersectionObserver(entries => {
  entries.forEach(entry => {
    const el    = entry.target;
    const delay = parseFloat(el.dataset.delay || 0) * 1000;
    const isAlreadyIn = el.classList.contains('in');
    const lockReveal = el.classList.contains('project-big-card');
    
    if (entry.isIntersecting && !isAlreadyIn) {
      setTimeout(() => el.classList.add('in'), delay);
      if (lockReveal) {
        revealObs.unobserve(el);
      }
    } else if (!entry.isIntersecting && isAlreadyIn && !lockReveal) {
      el.classList.remove('in');
    }
  });
}, { threshold: 0.12, rootMargin: '0px 0px -60px 0px' });

revealEls.forEach(el => revealObs.observe(el));


// ── SKILL BARS ─────────────────────────────────────────────
const skillItems = document.querySelectorAll('.sbc-skill');
const skillObs = new IntersectionObserver(entries => {
  entries.forEach(entry => {
    const fill = entry.target.querySelector('.sbc-fill');
    const targetWidth = entry.isIntersecting ? entry.target.dataset.level + '%' : '0%';
    const currentWidth = fill.style.width;
    
    if (currentWidth !== targetWidth) {
      fill.style.width = targetWidth;
    }
  });
}, { threshold: 0.3 });
skillItems.forEach(item => skillObs.observe(item));


// ── PROJECT CARD 3D TILT ───────────────────────────────────
document.querySelectorAll('.project-big-card').forEach(card => {
  card.addEventListener('mousemove', e => {
    const r = card.getBoundingClientRect();
    const x = ((e.clientX - r.left)  / r.width  - 0.5) * 6;
    const y = ((e.clientY - r.top)   / r.height - 0.5) * -6;
    card.style.transform = `translateY(-8px) rotateY(${x}deg) rotateX(${y}deg)`;
    card.style.transition = 'transform .08s';
    card.style.transformStyle = 'preserve-3d';
  });
  card.addEventListener('mouseleave', () => {
    card.style.transform = '';
    card.style.transition = 'transform .5s cubic-bezier(.34,1.56,.64,1)';
  });
});


// ── TECH TAGS STAGGER ──────────────────────────────────────
const tags = document.querySelectorAll('.tech-tag');
tags.forEach(t => { t.style.opacity = '0'; t.style.transform = 'translateY(12px)'; });
const tagObs = new IntersectionObserver(entries => {
  if (entries[0].isIntersecting) {
    tags.forEach((t, i) => {
      const isAlreadyAnimated = parseFloat(t.style.opacity) === 1;
      if (!isAlreadyAnimated) {
        setTimeout(() => {
          t.style.transition = `opacity .4s ease ${i*40}ms, transform .4s cubic-bezier(.34,1.56,.64,1) ${i*40}ms`;
          t.style.opacity   = '1';
          t.style.transform = 'translateY(0)';
        }, i * 40);
      }
    });
  } else {
    tags.forEach(t => { 
      t.style.opacity = '0'; 
      t.style.transform = 'translateY(12px)'; 
    });
  }
}, { threshold: 0.2 });
const tagsWrap = document.querySelector('.tech-tags');
if (tagsWrap) tagObs.observe(tagsWrap);


// ── CONTACT FORM ───────────────────────────────────────────
const form = document.getElementById('contact-form');
if (form) {
  form.addEventListener('submit', e => {
    e.preventDefault();
    const btn  = form.querySelector('button[type="submit"]');
    const orig = btn.textContent;
    btn.textContent = 'Sent! ✓';
    btn.style.background = '#10b981';
    setTimeout(() => {
      btn.textContent = orig;
      btn.style.background = '';
      form.reset();
    }, 3000);
  });
}


// ── PARALLAX HERO PILLS on mousemove ──────────────────────
const pills = document.querySelectorAll('.float-pill');
document.addEventListener('mousemove', e => {
  const xp = (e.clientX / window.innerWidth  - 0.5);
  const yp = (e.clientY / window.innerHeight - 0.5);
  pills.forEach((pill, i) => {
    const s = (i + 1) * 10;
    pill.style.transform = `translateY(calc(-14px * ${i % 2 === 0 ? 1 : -1})) translate(${xp * s * 0.3}px, ${yp * s * 0.3}px)`;
  });
});


// ── HEADLINE REVEAL on load ────────────────────────────────
window.addEventListener('load', () => {
  const lines = document.querySelectorAll('.headline-line');
  lines.forEach((line, i) => {
    line.style.opacity   = '0';
    line.style.transform = 'translateY(40px)';
    setTimeout(() => {
      line.style.transition = `opacity .8s ease ${i * 0.15}s, transform .8s cubic-bezier(.34,1.56,.64,1) ${i * 0.15}s`;
      line.style.opacity   = '1';
      line.style.transform = 'translateY(0)';
    }, 100);
  });
});


// ── HAMBURGER ─────────────────────────────────────────────
const hamburger = document.getElementById('nav-hamburger');
if (hamburger) {
  hamburger.addEventListener('click', () => {
    const open = document.body.classList.toggle('nav-open');
    hamburger.setAttribute('aria-expanded', open);
  });
}
