document.addEventListener('DOMContentLoaded', () => {
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
      'Agentic AI & Cloud Vision Builder',
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
    { name: 'Google AI Studio & Gemini', cat: 'ai-cloud', tag: 'Multimodal AI', level: 91 },
    { name: 'Cloud Vision, Speech & NLP APIs', cat: 'ai-cloud', tag: 'Pre-Trained AI', level: 90 },
    { name: 'Leaflet / Mappls GIS', cat: 'ai-cloud', tag: 'Geospatial', level: 85 },
    { name: 'GCP (Compute, Storage, IAM, Pub/Sub)', cat: 'ai-cloud', tag: 'Cloud & Security', level: 88 },
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

  // 6b. Certification Category Filtering
  const certFilterBtns = document.querySelectorAll('.cert-filter-btn');
  const certCards = document.querySelectorAll('.cert-card');

  certFilterBtns.forEach((btn) => {
    btn.addEventListener('click', () => {
      certFilterBtns.forEach((b) => b.classList.remove('active'));
      btn.classList.add('active');
      const filter = btn.dataset.certFilter;

      certCards.forEach((card) => {
        const cats = card.dataset.certCat || '';
        if (filter === 'all' || cats.includes(filter)) {
          card.classList.remove('hidden-card');
        } else {
          card.classList.add('hidden-card');
        }
      });
    });
  });

  // 7. Mouse Spotlight & 3D Card Tilt Effect
  document.querySelectorAll('.spotlight-card').forEach((card) => {
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

  // 8. Intersection Observer for Scroll Reveals
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

  // 9. Interactive Neural Constellation Background Canvas
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

  // 10. Interactive Resume Role-Focus Switcher
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
        'Computer Science (AI/ML & Cloud Computing) undergraduate specializing in agentic AI workflows, Google AI Studio prototyping, Cloud Vision & Speech APIs, geospatial ML (ISRO-IIRS), and GCP cloud infrastructure (Compute Engine, Cloud Storage, Cloud Functions, Cloud Pub/Sub, IAM). Holder of the 5-course Google AI Essentials Specialization and 100%-scored Google Cloud Challenge Lab Skill Badges.'
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