/**
 * Priyanshu Bhatta Developer Portfolio - Interactive Scripts
 * Handles: Theme toggle, Project filtering, Architecture modals, Toast notifications, Clipboard copy
 */

// Toast notification helper
function showToast(message) {
  const toast = document.getElementById('toast');
  const msg = document.getElementById('toast-msg');
  if (!toast || !msg) return;
  msg.textContent = message;
  toast.classList.remove('opacity-0', 'translate-y-20', 'pointer-events-none');
  setTimeout(() => {
    toast.classList.add('opacity-0', 'translate-y-20', 'pointer-events-none');
  }, 3000);
}

// Copy Email Helper
const EMAIL = 'priyanshubhatta2007@gmail.com';
function copyEmailToClipboard() {
  if (navigator.clipboard && navigator.clipboard.writeText) {
    navigator.clipboard.writeText(EMAIL).then(() => {
      showToast('Copied ' + EMAIL + ' to clipboard!');
    }).catch(() => fallbackCopy(EMAIL));
  } else {
    fallbackCopy(EMAIL);
  }
}

function fallbackCopy(text) {
  try {
    const temp = document.createElement('textarea');
    temp.value = text;
    document.body.appendChild(temp);
    temp.select();
    document.execCommand('copy');
    document.body.removeChild(temp);
    showToast('Copied ' + text + ' to clipboard!');
  } catch (err) {
    showToast('Direct email: ' + text);
  }
}

// Attach email copy handlers
const quickCopyBtn = document.getElementById('quick-copy-email-btn');
if (quickCopyBtn) quickCopyBtn.addEventListener('click', copyEmailToClipboard);

const cardCopyBtn = document.getElementById('copy-email-card-btn');
if (cardCopyBtn) cardCopyBtn.addEventListener('click', copyEmailToClipboard);

// Theme Toggle Handler
const themeToggleBtn = document.getElementById('theme-toggle');
const sunIcon = document.getElementById('theme-icon-sun');
const moonIcon = document.getElementById('theme-icon-moon');

function initTheme() {
  let isDark = true;
  try {
    isDark = localStorage.getItem('pb_theme') !== 'light';
  } catch (e) {}
  applyTheme(isDark);
}

function applyTheme(isDark) {
  if (isDark) {
    document.documentElement.classList.add('dark');
    document.documentElement.classList.remove('light');
    if (sunIcon) sunIcon.classList.remove('hidden');
    if (moonIcon) moonIcon.classList.add('hidden');
  } else {
    document.documentElement.classList.remove('dark');
    document.documentElement.classList.add('light');
    if (sunIcon) sunIcon.classList.add('hidden');
    if (moonIcon) moonIcon.classList.remove('hidden');
  }
  try {
    localStorage.setItem('pb_theme', isDark ? 'dark' : 'light');
  } catch (e) {}
}

if (themeToggleBtn) {
  themeToggleBtn.addEventListener('click', () => {
    const isCurrentDark = document.documentElement.classList.contains('dark');
    applyTheme(!isCurrentDark);
    showToast(!isCurrentDark ? 'Dark mode enabled' : 'Light mode enabled');
  });
}
initTheme();

// Projects Filter Logic
const filterButtons = document.querySelectorAll('.filter-btn');
const projectCards = document.querySelectorAll('.project-card');

filterButtons.forEach(btn => {
  btn.addEventListener('click', () => {
    filterButtons.forEach(b => {
      b.classList.remove('active', 'bg-blue-600', 'text-white');
      b.classList.add('bg-slate-800', 'text-slate-300');
    });
    btn.classList.add('active', 'bg-blue-600', 'text-white');
    btn.classList.remove('bg-slate-800', 'text-slate-300');

    const filter = btn.getAttribute('data-filter') || 'all';
    projectCards.forEach(card => {
      const category = card.getAttribute('data-category') || '';
      if (filter === 'all' || category.includes(filter)) {
        card.style.display = 'flex';
      } else {
        card.style.display = 'none';
      }
    });
  });
});

// Detailed Project Architectures Data
const projectDetails = {
  civicpulse: {
    title: 'CivicPulse — Hyperlocal Municipal Issue Tracker',
    category: 'Full-Stack Web & Geospatial Engineering',
    overview: 'A mobile-first web app architected to bridge citizens and municipal administrators. Users photograph civic issues (potholes, water leaks, broken streetlights), which are geotagged and classified using computer vision before automated dispatching.',
    tech: ['React.js', 'Tailwind CSS', 'Node.js', 'Express.js', 'Leaflet.js', 'Mappls APIs', 'Image ML Classifier', 'REST APIs'],
    architecture: [
      'Frontend: Mobile-optimized React UI with instant geolocation capture and camera photo uploads.',
      'Geospatial: Leaflet.js and Mappls map layers rendering live ward-level issue heatmaps.',
      'ML Verification: Automated image classification verifying civic defect categories before routing.',
      'Backend: Node.js/Express.js REST API layer handling complaint lifecycle states (Reported -> Verified -> In Progress -> Resolved).'
    ],
    links: [
      { text: 'GitHub Profile', url: 'https://github.com/Priyanshu568' },
      { text: 'Portfolio Database', url: 'https://gemini.google.com/notebook/b6896f92-5c0c-4076-8c1b-beb34671ef7f' },
      { text: 'LinkedIn Profile', url: 'https://www.linkedin.com/in/priyanshubhatta69' }
    ]
  },
  orbyt: {
    title: 'AI Social Media (Orbyt) — Polyglot Platform',
    category: 'Distributed Polyglot Architecture',
    overview: 'An applied AI social networking engine combining multi-language microservices: an interactive web frontend, a Python REST coordinator, a high-throughput C++ text moderation engine, and a Java recommendation service.',
    tech: ['Python (main.py)', 'C++ (moderate.cpp)', 'Java (Suggest.java)', 'HTML5/CSS3/JavaScript', 'SQLite (social.db, orbyt.db)'],
    architecture: [
      'Python Core: main.py orchestration layer serving REST endpoints and managing user session authentication.',
      'C++ Moderation Service: Compiled native binary executing sub-millisecond keyword and regex content moderation.',
      'Java Recommendation Engine: Suggest.java processing graph connections to recommend relevant user connections and feeds.',
      'Dual SQLite Architecture: Isolated social.db (user profiles & messaging) and orbyt.db (feed metrics & graph telemetry).'
    ],
    links: [
      { text: 'GitHub Profile', url: 'https://github.com/Priyanshu568' },
      { text: 'Portfolio Database', url: 'https://gemini.google.com/notebook/b6896f92-5c0c-4076-8c1b-beb34671ef7f' },
      { text: 'LinkedIn Profile', url: 'https://www.linkedin.com/in/priyanshubhatta69' }
    ]
  },
  mdr: {
    title: 'MDR Validator (mdr_validator) — Master Data Validation Engine',
    category: 'Data Engineering & Schema Validation',
    overview: 'A configuration-driven Python validation framework created to enforce data integrity across heterogeneous enterprise datasets using declarative YAML rule definitions.',
    tech: ['Python', 'YAML Configuration', 'Data Normalization', 'Database Connectors', 'PyTest Suite', 'Automated Reporting'],
    architecture: [
      'Declarative Rules: settings.yaml and mappings.yaml specifying schema rules, type constraints, and value bounds.',
      'Core Module: Normalizers sanitizing input strings, dates, and currency fields into standard representations.',
      'Engine Logic: Pluggable validator components executing cross-field consistency checks.',
      'Automated Reports: Summary report generation outputting pass/fail statistics and error breakdown logs.'
    ],
    links: [
      { text: 'GitHub Repository Account', url: 'https://github.com/Priyanshu568' },
      { text: 'Portfolio Database', url: 'https://gemini.google.com/notebook/b6896f92-5c0c-4076-8c1b-beb34671ef7f' },
      { text: 'LinkedIn Profile', url: 'https://www.linkedin.com/in/priyanshubhatta69' }
    ]
  },
  shopdesk: {
    title: 'ShopDesk AI — Agentic Customer Support System',
    category: 'Agentic AI & LLM Systems',
    overview: 'Shipped for the Build, Ship, Shape: Amazon Developer Hackathon on Devpost. An autonomous AI agent resolving Tier-1 e-commerce customer queries with seamless human escalation.',
    tech: ['Agentic AI', 'LLM Function Calling', 'Python', 'Node.js', 'Full-Stack Web UI', 'Devpost'],
    architecture: [
      'Agent Workflow: Understands user order queries, retrieves tracking/refund data via tool calls, and synthesizes answers.',
      'Escalation Protocol: Automatically transfers conversations exceeding confidence thresholds with full context history to human agents.',
      'Hackathon Milestone: Built, evaluated, and deployed within competition timeframe on Devpost.'
    ],
    links: [
      { text: 'Devpost Project Page', url: 'https://devpost.com/software/shopdesk-ai' },
      { text: 'Devpost Portfolio', url: 'https://devpost.com/Priyanshu568' },
      { text: 'LinkedIn Profile', url: 'https://www.linkedin.com/in/priyanshubhatta69' }
    ]
  },
  energy: {
    title: 'AI Energy Copilot — Smart Electricity Bill Forecaster',
    category: 'Applied Machine Learning & Cleantech',
    overview: 'Developed for Schneider Electric’s Yuva Yodha Energy Tech Hackathon. Uses computer vision and predictive analytics to parse utility bills and predict next-month household energy consumption.',
    tech: ['OCR Bill Parser', 'Predictive Modeling', 'Python', 'Web Dashboard', 'Schneider Electric Challenge'],
    architecture: [
      'Bill Parsing: Automated extraction of tariff tiers, baseline kWh consumption, and seasonal billing cycles.',
      'Predictive Engine: Time-series forecasting predicting next month’s consumption and alerting users on tariff spikes.',
      'Conservation Advisory: Generates personalized, appliance-level actionable load reduction tips.'
    ],
    links: [
      { text: 'Competition Submission Thread', url: 'https://mail.google.com/mail/?authuser=priyanshubhatta2007@gmail.com#all/thread-f:1877665483185316009' },
      { text: 'GitHub Profile', url: 'https://github.com/Priyanshu568' },
      { text: 'LinkedIn Profile', url: 'https://www.linkedin.com/in/priyanshubhatta69' }
    ]
  }
};

// Project Modal Logic
const projectModal = document.getElementById('project-modal');
const modalContent = document.getElementById('modal-content');
const closeProjectModalBtn = document.getElementById('close-project-modal-btn');

document.querySelectorAll('.project-modal-trigger').forEach(trigger => {
  trigger.addEventListener('click', () => {
    const pKey = trigger.getAttribute('data-project');
    const data = projectDetails[pKey];
    if (!data || !modalContent) return;

    let linksHtml = data.links.map(l => 
      `<a href="${l.url}" target="_blank" rel="noreferrer" class="px-3 py-1.5 rounded-lg bg-blue-600/20 text-blue-400 border border-blue-500/30 hover:bg-blue-600 hover:text-white transition-all text-xs font-semibold inline-flex items-center space-x-1"><span>${l.text}</span><span>&nearr;</span></a>`
    ).join(' ');

    let archHtml = data.architecture.map(a => 
      `<li class="text-xs text-slate-300 leading-relaxed mb-1.5">• ${a}</li>`
    ).join('');

    let techHtml = data.tech.map(t => 
      `<span class="text-[11px] px-2 py-0.5 rounded bg-slate-800 text-slate-300 border border-slate-700">${t}</span>`
    ).join(' ');

    modalContent.innerHTML = `
      <div class="mb-4">
        <span class="text-xs font-semibold px-2.5 py-1 rounded bg-blue-500/10 text-blue-400 border border-blue-500/20">${data.category}</span>
        <h3 class="text-2xl font-bold text-slate-100 mt-2">${data.title}</h3>
      </div>
      <p class="text-xs text-slate-300 mb-5 leading-relaxed">${data.overview}</p>
      <div class="mb-5">
        <h4 class="text-xs font-bold uppercase tracking-wider text-slate-400 mb-2">Technical Implementation</h4>
        <ul class="space-y-1">${archHtml}</ul>
      </div>
      <div class="mb-6">
        <h4 class="text-xs font-bold uppercase tracking-wider text-slate-400 mb-2">Key Stack</h4>
        <div class="flex flex-wrap gap-1.5">${techHtml}</div>
      </div>
      <div class="pt-4 border-t border-slate-800 flex flex-wrap gap-2">
        ${linksHtml}
      </div>
    `;

    if (projectModal) {
      projectModal.classList.remove('opacity-0', 'pointer-events-none');
    }
  });
});

if (closeProjectModalBtn && projectModal) {
  closeProjectModalBtn.addEventListener('click', () => {
    projectModal.classList.add('opacity-0', 'pointer-events-none');
  });
  projectModal.addEventListener('click', (e) => {
    if (e.target === projectModal) {
      projectModal.classList.add('opacity-0', 'pointer-events-none');
    }
  });
}

// Resume Modal Logic
const resumeModal = document.getElementById('resume-modal');
const openResumeBtn = document.getElementById('open-resume-modal-btn');
const closeResumeBtn = document.getElementById('close-resume-modal-btn');
const closeResumeBottomBtn = document.getElementById('close-resume-modal-bottom-btn');
const copyMdBtn = document.getElementById('copy-markdown-btn');
const downloadCvBtn = document.getElementById('download-cv-btn');

if (openResumeBtn && resumeModal) {
  openResumeBtn.addEventListener('click', () => {
    resumeModal.classList.remove('opacity-0', 'pointer-events-none');
  });
}

[closeResumeBtn, closeResumeBottomBtn].forEach(btn => {
  if (btn && resumeModal) {
    btn.addEventListener('click', () => {
      resumeModal.classList.add('opacity-0', 'pointer-events-none');
    });
  }
});

if (resumeModal) {
  resumeModal.addEventListener('click', (e) => {
    if (e.target === resumeModal) {
      resumeModal.classList.add('opacity-0', 'pointer-events-none');
    }
  });
}

if (downloadCvBtn) {
  downloadCvBtn.addEventListener('click', () => {
    showToast('Priyanshu_Bhatta_CV.pdf ready in your project directory!');
  });
}

if (copyMdBtn) {
  copyMdBtn.addEventListener('click', () => {
    fallbackCopy('Priyanshu Bhatta - CSE Undergrad (AI/ML & Cloud Computing) - GitHub: github.com/Priyanshu568 - LinkedIn: linkedin.com/in/priyanshubhatta69 - Email: priyanshubhatta2007@gmail.com');
  });
}

// Contact Form Submission Handler
const contactForm = document.getElementById('contact-form');
if (contactForm) {
  contactForm.addEventListener('submit', (e) => {
    e.preventDefault();
    const nameInput = document.getElementById('contact-name');
    const nameVal = nameInput ? nameInput.value : 'Recruiter';
    showToast('Thank you, ' + nameVal + '! Message queued.');
    contactForm.reset();
  });
}