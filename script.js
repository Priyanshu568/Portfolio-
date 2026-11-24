document.addEventListener('DOMContentLoaded', async () => {
  // 1. Dynamic Footer Year
  const yearEl = document.getElementById('currentYear');
  if (yearEl) yearEl.textContent = new Date().getFullYear();

  // 2. Mobile Navigation Toggle
  const menuToggle = document.getElementById('menuToggle');
  const navLinks = document.getElementById('navLinks');
  if (menuToggle && navLinks) {
    menuToggle.addEventListener('click', () => {
      navLinks.classList.toggle('open');
    });
    navLinks.querySelectorAll('a').forEach((link) => {
      link.addEventListener('click', () => navLinks.classList.remove('open'));
    });
  }

  // 3. Navbar Scroll State, Scroll Progress & Active Section Highlight
  const navbar = document.getElementById('navbar');
  const scrollProgress = document.getElementById('scrollProgress');
  const timeline = document.getElementById('timeline');
  const timelineLine = document.getElementById('timelineLine');
  const sections = document.querySelectorAll('section[id]');

  window.addEventListener('scroll', () => {
    const scrollTop = window.scrollY;
    const docHeight = document.documentElement.scrollHeight - window.innerHeight;

    if (navbar) {
      navbar.classList.toggle('scrolled', scrollTop > 30);
    }

    if (scrollProgress && docHeight > 0) {
      scrollProgress.style.width = `${(scrollTop / docHeight) * 100}%`;
    }

    // Timeline animated fill
    if (timeline && timelineLine) {
      const rect = timeline.getBoundingClientRect();
      const windowH = window.innerHeight;
      if (rect.top < windowH * 0.85) {
        const progress = Math.min(1, Math.max(0, (windowH * 0.75 - rect.top) / rect.height));
        timelineLine.style.height = `${progress * 100}%`;
      }
    }

    // Active nav link
    sections.forEach((sec) => {
      const top = sec.offsetTop - 140;
      const height = sec.offsetHeight;
      const id = sec.getAttribute('id');
      const link = document.querySelector(`.nav-link[href="#${id}"]`);
      if (link) {
        if (scrollTop >= top && scrollTop < top + height) {
          link.classList.add('active');
        } else {
          link.classList.remove('active');
        }
      }
    });
  });

  // 4. Role Typewriter Animation
  const typewriterEl = document.getElementById('typewriterText');
  if (typewriterEl) {
    const roles = [
      'CSE (AI/ML & Cloud) Undergrad @ SVU',
      'Full-Stack & Backend Developer',
      'Vertex AI, Gemini & Cloud Vision Builder',
      'Hackathon Team Leader & Freelancer'
    ];
    let roleIdx = 0;
    let charIdx = 0;
    let isDeleting = false;

    const tick = () => {
      const current = roles[roleIdx];
      typewriterEl.textContent = isDeleting
        ? current.substring(0, charIdx - 1)
        : current.substring(0, charIdx + 1);

      charIdx += isDeleting ? -1 : 1;
      let speed = isDeleting ? 38 : 72;

      if (!isDeleting && charIdx === current.length) {
        speed = 1800;
        isDeleting = true;
      } else if (isDeleting && charIdx === 0) {
        isDeleting = false;
        roleIdx = (roleIdx + 1) % roles.length;
        speed = 350;
      }
      setTimeout(tick, speed);
    };
    tick();
  }

  // 5. Interactive Skills Matrix
  const skillsData = [
    { name: 'Python', cat: 'languages', tag: 'AI & Backend', level: 92 },
    { name: 'JavaScript (ES6+)', cat: 'languages', tag: 'Full-Stack', level: 90 },
    { name: 'TypeScript', cat: 'languages', tag: 'Type-Safe JS', level: 84 },
    { name: 'Java', cat: 'languages', tag: 'OOP & Core', level: 84 },
    { name: 'C++', cat: 'languages', tag: 'DSA', level: 80 },
    { name: 'SQL / PostgreSQL / SQLite', cat: 'languages', tag: 'Databases', level: 88 },
    { name: 'Node.js & Express.js', cat: 'web', tag: 'Backend APIs', level: 90 },
    { name: 'React & Tailwind CSS', cat: 'web', tag: 'Frontend UI', level: 87 },
    { name: 'HTML5 & CSS3', cat: 'web', tag: 'Modern Web', level: 94 },
    { name: 'REST APIs & YAML Validation', cat: 'web', tag: 'Architecture', level: 89 },
    { name: 'Vertex AI Gemini API & Function Calling', cat: 'ai-cloud', tag: 'Generative AI', level: 92 },
    { name: 'Google AI Studio & Gemini Enterprise', cat: 'ai-cloud', tag: 'Multimodal AI', level: 91 },
    { name: 'Cloud Vision, Speech & NLP APIs', cat: 'ai-cloud', tag: 'Pre-Trained AI', level: 90 },
    { name: 'Cloud Run, GKE & Cloud Build', cat: 'ai-cloud', tag: 'Cloud Native', level: 87 },
    { name: 'GCP (Compute, Storage, IAM, Pub/Sub)', cat: 'ai-cloud', tag: 'Cloud & Security', level: 89 },
    { name: 'Leaflet / Mappls GIS', cat: 'ai-cloud', tag: 'Geospatial', level: 85 },
    { name: 'Git, GitHub & Netlify', cat: 'ai-cloud', tag: 'CI/CD & Ops', level: 91 }
  ];

  const skillsGrid = document.getElementById('skillsGrid');
  const skillTabs = document.querySelectorAll('.skill-tab');

  function renderSkills(filter = 'all') {
    if (!skillsGrid) return;
    const filtered = filter === 'all' ? skillsData : skillsData.filter((s) => s.cat === filter);
    skillsGrid.innerHTML = filtered
      .map(
        (s) => `
        <div class="skill-chip">
          <div class="skill-chip-top">
            <span class="skill-name">${s.name}</span>
            <span class="skill-tag">${s.tag}</span>
          </div>
          <div class="skill-bar-track">
            <div class="skill-bar-fill" style="width: ${s.level}%"></div>
          </div>
        </div>
      `
      )
      .join('');
  }

  if (skillsGrid) {
    renderSkills('all');
    skillTabs.forEach((tab) => {
      tab.addEventListener('click', () => {
        skillTabs.forEach((t) => t.classList.remove('active'));
        tab.classList.add('active');
        renderSkills(tab.dataset.skillCat);
      });
    });
  }

  // 6. Project Category Filtering
  const filterBtns = document.querySelectorAll('.filter-btn');
  const projectCards = document.querySelectorAll('.project-card');

  filterBtns.forEach((btn) => {
    btn.addEventListener('click', () => {
      filterBtns.forEach((b) => b.classList.remove('active'));
      btn.classList.add('active');
      const filter = btn.dataset.filter;

      projectCards.forEach((card) => {
        const cats = card.dataset.category || '';
        if (filter === 'all' || cats.includes(filter)) {
          card.classList.remove('hidden-card');
        } else {
          card.classList.add('hidden-card');
        }
      });
    });
  });

  // 7. Mouse Spotlight & 3D Card Tilt Effect Helper
  function attachSpotlightAndTilt(root = document) {
    root.querySelectorAll('.spotlight-card').forEach((card) => {
      if (card.dataset.spotlightBound === '1') return;
      card.dataset.spotlightBound = '1';

      card.addEventListener('mousemove', (e) => {
        const rect = card.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;
        card.style.setProperty('--mouse-x', `${x}px`);
        card.style.setProperty('--mouse-y', `${y}px`);

        if (card.classList.contains('tilt-card')) {
          const rotateX = ((y - rect.height / 2) / rect.height) * -6;
          const rotateY = ((x - rect.width / 2) / rect.width) * 6;
          card.style.transform = `perspective(900px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) translateY(-4px)`;
        }
      });

      card.addEventListener('mouseleave', () => {
        if (card.classList.contains('tilt-card')) {
          card.style.transform = 'perspective(900px) rotateX(0deg) rotateY(0deg) translateY(0px)';
        }
      });
    });
  }

  attachSpotlightAndTilt(document);

  // 8. Dynamic Certification Renderer from PortfolioDB (database.js)
  const certsGrid = document.getElementById('certsGrid');
  const certFilterBtns = document.querySelectorAll('.cert-filter-btn');
  let allCertifications = [];

  function buildCertCardHTML(cert) {
    const isCoursera = (cert.category || '').includes('coursera');
    const isProgram = (cert.category || '').includes('programs');
    const sealTitle = isProgram ? 'GOVT / ISRO' : isCoursera ? 'GOOGLE / COURSERA' : 'GOOGLE DEVELOPERS';
    const sealSub = isProgram ? 'FELLOWSHIP' : isCoursera ? '5-COURSE CERT' : 'DEV BADGE';
    const isCertImg = (cert.badgeImage || '').includes('certificate');
    const emblemHTML = cert.badgeImage
      ? `<button type="button" class="cert-badge-wrap ${isCertImg ? 'cert-doc-wrap' : ''}" data-preview-src="${cert.badgeImage}" data-preview-title="${cert.title.replace(/"/g, '&quot;')}" data-preview-issuer="${cert.issuer.replace(/"/g, '&quot;')} • ${cert.date}" data-preview-verify="${cert.verifyUrl || ''}" data-preview-pdf="${cert.pdfUrl || ''}" aria-label="Preview ${cert.title.replace(/"/g, '&quot;')}" title="Click to view full certificate">
           <img src="${cert.badgeImage}" alt="${cert.title}" class="cert-badge-thumb" loading="lazy" />
         </button>`
      : `<div class="cert-seal-box ${isProgram ? 'program-seal' : 'coursera-seal'}">
           <span>${sealTitle}</span>
           <small>${sealSub}</small>
         </div>`;

    const skillsHTML =
      Array.isArray(cert.skills) && cert.skills.length
        ? `<div class="cert-skill-tags">
             ${cert.skills.map((sk) => `<span>${sk}</span>`).join('')}
           </div>`
        : '';

    const subCoursesHTML =
      Array.isArray(cert.subCourses) && cert.subCourses.length
        ? `<details class="cert-subcourses">
             <summary>View 5 Individual Course Certificates &amp; PDFs</summary>
             <ul>
               ${cert.subCourses
                 .map(
                   (sc) => `
                   <li>
                     <span>${sc.title} (<code>${sc.id}</code>)</span>
                     <span class="subcourse-links">
                       <a href="${sc.verifyUrl}" target="_blank" rel="noopener noreferrer">Verify &nearr;</a>
                       ${sc.pdfUrl ? `<a href="${sc.pdfUrl}" target="_blank" rel="noopener noreferrer">PDF</a>` : ''}
                     </span>
                   </li>
                 `
                 )
                 .join('')}
             </ul>
           </details>`
        : '';

    const idBadgeHTML =
      Array.isArray(cert.credentialIds) && cert.credentialIds.length && !cert.verifyUrl
        ? `<span class="cert-id-text">IDs: ${cert.credentialIds.join(' &bull; ')}</span>`
        : '';

    return `
      <article class="cert-card spotlight-card" data-cert-cat="${cert.category || 'gcp'}">
        <div>
          <div class="cert-top">
            <span class="cert-issuer">${cert.issuer} &bull; ${cert.date}</span>
            <span class="cert-score-tag">${cert.score || 'Verified'}</span>
          </div>
          <div class="cert-badge-header">
            ${emblemHTML}
            <div>
              <h4>${cert.title}</h4>
              <p>${cert.description || ''}</p>
            </div>
          </div>
          ${skillsHTML}
          ${subCoursesHTML}
        </div>
        <div class="cert-footer-actions">
          ${
            cert.verifyUrl
              ? `<a href="${cert.verifyUrl}" target="_blank" rel="noopener noreferrer" class="cert-verify-link">
                   Verify Credential &nearr;
                 </a>`
              : idBadgeHTML
          }
          ${
            cert.pdfUrl
              ? `<a href="${cert.pdfUrl}" target="_blank" rel="noopener noreferrer" class="cert-pdf-link">
                   Certificate PDF &nearr;
                 </a>`
              : ''
          }
        </div>
      </article>
    `;
  }

  function renderCertifications(filter = 'all') {
    if (!certsGrid) return;
    const filtered =
      filter === 'all'
        ? allCertifications
        : allCertifications.filter((c) => (c.category || '').includes(filter));

    certsGrid.innerHTML = filtered.map(buildCertCardHTML).join('');
    attachSpotlightAndTilt(certsGrid);
    bindCertPreviewTriggers(certsGrid);
  }

  function ensureCertLightbox() {
    let modal = document.getElementById('certLightboxBackdrop');
    if (modal) return modal;
    modal = document.createElement('div');
    modal.id = 'certLightboxBackdrop';
    modal.className = 'cert-lightbox-backdrop';
    modal.setAttribute('role', 'dialog');
    modal.setAttribute('aria-modal', 'true');
    modal.innerHTML = `
      <div class="cert-lightbox-card">
        <div class="cert-lightbox-header">
          <div>
            <span class="cert-lightbox-issuer" id="certLightboxIssuer"></span>
            <h3 id="certLightboxTitle"></h3>
          </div>
          <button type="button" class="cert-lightbox-close" id="certLightboxClose" aria-label="Close preview">&times;</button>
        </div>
        <div class="cert-lightbox-body">
          <img id="certLightboxImg" src="" alt="Certificate Preview" />
        </div>
        <div class="cert-lightbox-footer">
          <a id="certLightboxVerify" href="#" target="_blank" rel="noopener noreferrer" class="btn btn-secondary">Verify Credential &nearr;</a>
          <a id="certLightboxPdf" href="#" target="_blank" rel="noopener noreferrer" class="btn btn-primary">Open Certificate PDF &nearr;</a>
        </div>
      </div>
    `;
    document.body.appendChild(modal);

    const close = () => modal.classList.remove('open');
    modal.querySelector('#certLightboxClose').addEventListener('click', close);
    modal.addEventListener('click', (e) => {
      if (e.target === modal) close();
    });
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && modal.classList.contains('open')) close();
    });
    return modal;
  }

  function bindCertPreviewTriggers(root) {
    root.querySelectorAll('.cert-badge-wrap[data-preview-src]').forEach((btn) => {
      btn.addEventListener('click', () => {
        const modal = ensureCertLightbox();
        modal.querySelector('#certLightboxImg').src = btn.dataset.previewSrc;
        modal.querySelector('#certLightboxImg').alt = btn.dataset.previewTitle;
        modal.querySelector('#certLightboxTitle').textContent = btn.dataset.previewTitle;
        modal.querySelector('#certLightboxIssuer').textContent = btn.dataset.previewIssuer;

        const verifyLink = modal.querySelector('#certLightboxVerify');
        const pdfLink = modal.querySelector('#certLightboxPdf');
        if (btn.dataset.previewVerify) {
          verifyLink.href = btn.dataset.previewVerify;
          verifyLink.style.display = 'inline-flex';
        } else {
          verifyLink.style.display = 'none';
        }
        if (btn.dataset.previewPdf) {
          pdfLink.href = btn.dataset.previewPdf;
          pdfLink.style.display = 'inline-flex';
        } else {
          pdfLink.style.display = 'none';
        }
        modal.classList.add('open');
      });
    });
  }

  if (certsGrid) {
    if (window.PortfolioDB) {
      allCertifications = await window.PortfolioDB.getAllCertifications();
    } else if (window.VERIFIED_CERTIFICATIONS) {
      allCertifications = window.VERIFIED_CERTIFICATIONS;
    }
    renderCertifications('all');

    certFilterBtns.forEach((btn) => {
      btn.addEventListener('click', () => {
        certFilterBtns.forEach((b) => b.classList.remove('active'));
        btn.classList.add('active');
        renderCertifications(btn.dataset.certFilter);
      });
    });
  }

  // 9. Intersection Observer for Scroll Reveals
  const revealObserver = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          const delay = entry.target.dataset.delay || 0;
          setTimeout(() => {
            entry.target.classList.add('revealed');
          }, Number(delay));
          revealObserver.unobserve(entry.target);
        }
      });
    },
    { threshold: 0.12 }
  );

  document.querySelectorAll('[data-reveal]').forEach((el) => revealObserver.observe(el));

  // 10. Interactive Neural Constellation Background Canvas
  const canvas = document.getElementById('neuralCanvas');
  if (canvas) {
    const ctx = canvas.getContext('2d');
    let particles = [];
    const mouse = { x: null, y: null, radius: 140 };

    const resizeCanvas = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };
    resizeCanvas();
    window.addEventListener('resize', resizeCanvas);

    window.addEventListener('mousemove', (e) => {
      mouse.x = e.clientX;
      mouse.y = e.clientY;
    });

    const count = Math.min(65, Math.floor(window.innerWidth / 22));
    for (let i = 0; i < count; i++) {
      particles.push({
        x: Math.random() * canvas.width,
        y: Math.random() * canvas.height,
        vx: (Math.random() - 0.5) * 0.45,
        vy: (Math.random() - 0.5) * 0.45,
        size: Math.random() * 1.8 + 0.8
      });
    }

    function animateCanvas() {
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      for (let i = 0; i < particles.length; i++) {
        const p = particles[i];
        p.x += p.vx;
        p.y += p.vy;

        if (p.x < 0 || p.x > canvas.width) p.vx *= -1;
        if (p.y < 0 || p.y > canvas.height) p.vy *= -1;

        ctx.beginPath();
        ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
        ctx.fillStyle = 'rgba(56, 189, 248, 0.45)';
        ctx.fill();

        for (let j = i + 1; j < particles.length; j++) {
          const p2 = particles[j];
          const dx = p.x - p2.x;
          const dy = p.y - p2.y;
          const dist = Math.hypot(dx, dy);
          if (dist < 130) {
            ctx.beginPath();
            ctx.strokeStyle = `rgba(56, 189, 248, ${0.14 * (1 - dist / 130)})`;
            ctx.lineWidth = 0.8;
            ctx.moveTo(p.x, p.y);
            ctx.lineTo(p2.x, p2.y);
            ctx.stroke();
          }
        }

        if (mouse.x !== null) {
          const mdx = p.x - mouse.x;
          const mdy = p.y - mouse.y;
          const mDist = Math.hypot(mdx, mdy);
          if (mDist < mouse.radius) {
            ctx.beginPath();
            ctx.strokeStyle = `rgba(52, 211, 153, ${0.28 * (1 - mDist / mouse.radius)})`;
            ctx.lineWidth = 1;
            ctx.moveTo(p.x, p.y);
            ctx.lineTo(mouse.x, mouse.y);
            ctx.stroke();
          }
        }
      }
      requestAnimationFrame(animateCanvas);
    }
    animateCanvas();
  }

  // 11. Interactive Resume Role-Focus Switcher
  const resumeModes = {
    default: {
      headline: 'Frontend and Backend Developer | AI & Cloud Engineer',
      summary:
        'Computer Science and Engineering (AI/ML & Cloud Computing) undergraduate at Swami Vivekananda University trained in React.js, Tailwind CSS, TypeScript, Python, Java, C++, Node.js, Express.js, and SQL/PostgreSQL. Experienced in shipping end-to-end systems (CivicPulse, Orbyt, MDR Validator, ShopDesk AI) while delivering freelance Upwork solutions and leading national hackathon teams.'
    },
    hybrid: {
      headline: 'Full-Stack & Freelance Software Engineer | React • Node.js • Python • PostgreSQL',
      summary:
        'Freelance Full-Stack & AI Developer on Upwork and B.Tech CSE (AI/ML & Cloud Computing) undergraduate at Swami Vivekananda University. Experienced in architecting responsive frontend interfaces (React.js, Tailwind CSS, TypeScript, Three.js/WebGL), RESTful APIs (Node.js, Express.js, Python), and relational databases (PostgreSQL, SQLite, Supabase) across civic, social, and enterprise systems.'
    },
    aiml: {
      headline: 'Applied AI, Agentic Systems & Google Cloud Engineer',
      summary:
        'Computer Science (AI/ML & Cloud Computing) undergraduate specializing in agentic AI workflows, Vertex AI Gemini API, Google AI Studio prototyping, Cloud Vision & Speech APIs, geospatial ML (ISRO-IIRS), and GCP cloud infrastructure (Cloud Run, GKE, Compute Engine, Cloud Storage, Cloud Functions, Cloud Pub/Sub, IAM). Holder of the 5-course Google AI Essentials Specialization and 11 Google Cloud Skill Badges.'
    }
  };

  const modeBtns = document.querySelectorAll('.resume-mode-btn');
  const previewHeadline = document.getElementById('previewHeadline');
  const previewSummary = document.getElementById('previewSummary');
  const openResumeBtn = document.getElementById('openResumeBtn');

  modeBtns.forEach((btn) => {
    btn.addEventListener('click', () => {
      modeBtns.forEach((b) => b.classList.remove('active'));
      btn.classList.add('active');
      const mode = btn.dataset.resumeMode;
      const data = resumeModes[mode];
      if (data && previewHeadline && previewSummary) {
        previewHeadline.textContent = data.headline;
        previewSummary.textContent = data.summary;
      }
      if (openResumeBtn) openResumeBtn.href = `resume.html?mode=${mode}`;
    });
  });
});
