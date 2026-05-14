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
// Initialize EmailJS
emailjs.init('fMXTTiEfH8l_vJN5_');

// Rate limiting: Track submission times
const submissionTimes = [];
const RATE_LIMIT_SECONDS = 5; // Min 5 seconds between submissions
const MAX_SUBMISSIONS_PER_HOUR = 10; // Max 10 emails per hour

function checkRateLimit() {
  const now = Date.now();
  const oneHourAgo = now - (60 * 60 * 1000);
  
  // Remove old entries
  submissionTimes.length = 0;
  
  // Check last submission (min 5 seconds)
  if (submissionTimes.length > 0) {
    const lastSubmission = submissionTimes[submissionTimes.length - 1];
    if ((now - lastSubmission) < (RATE_LIMIT_SECONDS * 1000)) {
      return { allowed: false, reason: `Please wait ${Math.ceil((RATE_LIMIT_SECONDS * 1000 - (now - lastSubmission)) / 1000)}s before submitting again` };
    }
  }
  
  // Check hourly limit
  const recentSubmissions = submissionTimes.filter(time => time > oneHourAgo);
  if (recentSubmissions.length >= MAX_SUBMISSIONS_PER_HOUR) {
    return { allowed: false, reason: 'Too many submissions. Please try again later.' };
  }
  
  return { allowed: true };
}

const form = document.getElementById('contact-form');
if (form) {
  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    
    const btn = form.querySelector('button[type="submit"]');
    const statusDiv = document.getElementById('form-status');
    const origText = btn.textContent;
    
    // Validate form
    if (!form.checkValidity()) {
      statusDiv.textContent = '❌ Please fill in all fields correctly';
      statusDiv.style.color = '#ef4444';
      return;
    }
    
    // Check rate limit
    const rateCheck = checkRateLimit();
    if (!rateCheck.allowed) {
      statusDiv.textContent = `⏱️ ${rateCheck.reason}`;
      statusDiv.style.color = '#f97316';
      return;
    }
    
    // Disable button
    btn.disabled = true;
    btn.textContent = 'Sending...';
    statusDiv.textContent = '';
    
    try {
      // Send email using EmailJS
      await emailjs.sendForm('service_13il0gn', 'template_mrwc2wa', form);
      
      // Success
      btn.textContent = 'Sent! ✓';
      btn.style.background = '#10b981';
      statusDiv.textContent = '✅ Message sent successfully!';
      statusDiv.style.color = '#10b981';
      
      // Record submission time for rate limiting
      submissionTimes.push(Date.now());
      
      // Reset form
      setTimeout(() => {
        form.reset();
        btn.textContent = origText;
        btn.style.background = '';
        btn.disabled = false;
        statusDiv.textContent = '';
      }, 3000);
      
    } catch (error) {
      console.error('Email error:', error);
      btn.textContent = origText;
      btn.disabled = false;
      statusDiv.textContent = '❌ Failed to send. Please try again or email directly.';
      statusDiv.style.color = '#ef4444';
    }
  });
}


// ── PARALLAX HERO PILLS on mousemove ──────────────────────
// Contact CTA buttons handled via native links (no JS needed)
document.addEventListener('mousemove', e => {
