/**
 * database.js - Client-Side Database System for Priyanshu Bhatta Portfolio
 *
 * Provides an asynchronous database engine using IndexedDB (v8) with automatic LocalStorage fallback.
 * Stores both recruiter/client form submissions and Priyanshu Bhatta's verified certifications,
 * Google Developer Program milestones, Google Cloud skill badges, Coursera credentials, and local asset links.
 */

(function (global) {
  'use strict';

  const DB_NAME = 'PortfolioClientDB';
  const DB_VERSION = 8;
  const STORE_SUBMISSIONS = 'client_submissions';
  const STORE_CERTIFICATIONS = 'certifications';
  const LS_SUBMISSIONS_KEY = 'pb_client_submissions';
  const LS_CERTS_KEY = 'pb_verified_certifications_v8';

  const VERIFIED_CERTIFICATIONS = [
    {
      id: 'orbion-8hr-hackathon-2026',
      title: 'Orbion 8 Hour Hackathon — Tech Kurukshetra 2026',
      issuer: 'IEM & UEM Kolkata • Unstop',
      category: 'programs',
      date: '2026',
      score: 'Team Quantum Chaos',
      badgeImage: 'assets/badges/orbion-8-hour-hackathon-certificate.png',
      pdfUrl: 'assets/certificates/Orbion_8_Hour_Hackathon_Tech_Kurukshetra_2026.pdf',
      verifyUrl: 'https://unstop.com/',
      description: 'Participated as part of Team Quantum Chaos in the Orbion 8 Hour Hackathon during Tech Kurukshetra 2026, organized by the Dept. of CSE (IoT, CS, BT), Institute of Engineering and Management (IEM), Newtown, Kolkata.',
      skills: ['8-Hour Hackathon', 'Rapid Prototyping', 'Team Quantum Chaos', 'Tech Kurukshetra 2026']
    },
    {
      id: 'gdg-cloud-kolkata-member-2026',
      title: 'Google Developer Groups (GDG) Cloud Kolkata Member',
      issuer: 'Google Developer Program',
      category: 'gcp programs',
      date: 'Nov 25, 2026',
      score: 'Community Badge',
      badgeImage: 'assets/badges/gdg-cloud-kolkata.svg',
      verifyUrl: 'https://me.developers.google.com',
      description: 'Official member of the Google Developer Groups (GDG) Cloud Kolkata chapter, collaborating on cloud-native architecture, AI/ML meetups, and community engineering.',
      skills: ['Google Cloud', 'GDG Cloud Kolkata', 'Cloud Architecture', 'AI/ML Community']
    },
    {
      id: 'google-cloud-badge-google-skills-2026',
      title: 'Google Cloud Skill Badge — Google Skills',
      issuer: 'Google Developer Program',
      category: 'gcp',
      date: 'Nov 25, 2026',
      score: 'Skill Badge',
      badgeImage: 'assets/badges/google-skills-badge.svg',
      verifyUrl: 'https://me.developers.google.com',
      description: 'Verified hands-on Google Cloud lab achievement earned via Google Skills and the Google Developer Program across cloud infrastructure and AI workflows.',
      skills: ['Google Cloud Platform', 'Google Skills', 'Cloud Infrastructure', 'Hands-On Labs']
    },
    {
      id: 'google-developer-program-premium-2026',
      title: 'Google Developer Program — Premium Tier Member',
      issuer: 'Google Developer Program',
      category: 'gcp programs',
      date: 'Nov 25, 2026',
      score: 'Premium Tier',
      badgeImage: 'assets/badges/gdp-premium-tier.svg',
      verifyUrl: 'https://me.developers.google.com',
      description: 'Active subscriber to the Google Developer Program Premium Tier with access to Gemini Code Assist, Google Cloud developer credits, and advanced AI tooling.',
      skills: ['Google Cloud', 'Gemini Code Assist', 'Cloud Credits', 'AI Engineering']
    },
    {
      id: 'gcp-vertex-gemini-api-2026',
      title: 'Explore Generative AI with the Vertex AI Gemini API Skill Badge',
      issuer: 'Google Cloud / Credly',
      category: 'gcp',
      date: 'Nov 18, 2026',
      score: 'Intermediate Badge',
      badgeImage: 'assets/badges/explore-generative-ai-with-the-vertex-ai-gemini-api.png',
      verifyUrl: 'https://www.credly.com/badges/5df60f25-be4b-4730-ac16-754be7839998/public_url',
      description: 'Intermediate Vertex AI Gemini API implementation covering text generation, multimodal image/video analysis, and function calling.',
      skills: ['Vertex AI', 'Gemini API', 'Function Calling', 'Multimodal AI', 'Python']
    },
    {
      id: 'gcp-build-website-2026',
      title: 'Build a Website on Google Cloud Skill Badge',
      issuer: 'Google Cloud / Credly',
      category: 'gcp',
      date: 'Nov 16, 2026',
      score: 'Skill Badge',
      badgeImage: 'assets/badges/build-a-website-on-google-cloud-skill-badge.png',
      verifyUrl: 'https://www.credly.com/badges/8fd32f2f-76c0-402c-9d91-66fa3e473d81/public_url',
      description: 'Deploying and scaling web applications on Cloud Run, Compute Engine, and Google Kubernetes Engine (GKE) with microservices.',
      skills: ['Cloud Run', 'Compute Engine', 'GKE', 'Cloud Build', 'Microservices']
    },
    {
      id: 'gcp-cloud-vision-2026',
      title: 'Analyze Images with the Cloud Vision API Skill Badge',
      issuer: 'Google Cloud / Credly',
      category: 'gcp',
      date: 'Nov 15, 2026',
      score: '100% Lab Score',
      badgeImage: 'assets/badges/analyze-images-with-the-cloud-vision-api-skill-badge.png',
      verifyUrl: 'https://www.credly.com/go/fImRn2Gge8A1849E98XXlQ',
      description: 'Computer vision pipelines for OCR text extraction, label classification, and face & landmark detection in images.',
      skills: ['Cloud Vision API', 'OCR Text Detection', 'Label & Face Detection']
    },
    {
      id: 'gcp-speech-api-2026',
      title: 'Using the Google Cloud Speech API',
      issuer: 'Google Cloud / Credly',
      category: 'gcp',
      date: 'Nov 15, 2026',
      score: 'Skill Badge',
      badgeImage: 'assets/badges/using-the-google-cloud-speech-api.png',
      verifyUrl: 'https://www.credly.com/go/gA59Rnf3Idc3nXIJEQjFJw',
      description: 'Building Speech-to-Text API requests and automated audio-to-text transcription workflows on Google Cloud.',
      skills: ['Speech-to-Text API', 'Audio Transcription', 'Cloud Speech Pipelines']
    },
    {
      id: 'gcp-store-process-data-2026',
      title: 'Store, Process, and Manage Data on Google Cloud - Console',
      issuer: 'Google Cloud / Credly',
      category: 'gcp',
      date: 'Nov 13, 2026',
      score: '100% Lab Score',
      badgeImage: 'assets/badges/store-process-and-manage-data-on-google-cloud-console.png',
      verifyUrl: 'https://www.credly.com/go/Ih7X0eZE9Wxoz6V0qHtTIQ',
      description: 'Cloud Storage bucket administration, event-driven Cloud Functions, and Cloud Pub/Sub messaging workflows.',
      skills: ['Cloud Storage', 'Cloud Functions', 'Cloud Pub/Sub']
    },
    {
      id: 'gcp-ai-studio-2026',
      title: 'Develop AI-Powered Prototypes in Google AI Studio',
      issuer: 'Google Cloud / Credly',
      category: 'gcp',
      date: 'Nov 12, 2026',
      score: '100% Lab Score',
      badgeImage: 'assets/badges/develop-ai-powered-prototypes-in-google-ai-studio.png',
      pdfUrl: 'assets/certificates/Google_AI_Studio_Prototypes_Badge_20261112.pdf',
      verifyUrl: 'https://www.credly.com/go/kFCQa6zQvMeA4awEbDkEQA',
      description: 'System prompt engineering, multimodal image/video analysis, and API-key generative AI prototyping.',
      skills: ['Google AI Studio', 'Multimodal Prototyping', 'Prompt Engineering']
    },
    {
      id: 'gcp-speech-language-2026',
      title: 'Implement Speech and Language Solutions with Pre-trained APIs',
      issuer: 'Google Cloud / Credly',
      category: 'gcp',
      date: 'Nov 12, 2026',
      score: '100% Lab Score',
      badgeImage: 'assets/badges/implement-speech-and-language-solutions-with-pre-trained-apis.png',
      verifyUrl: 'https://www.credly.com/go/GrInb6kGb8mbxBYAkvvtgw',
      description: 'Speech-to-Text transcription, Text-to-Speech synthesis, and Cloud Natural Language entity/sentiment APIs.',
      skills: ['Cloud Natural Language API', 'Speech-to-Text', 'Text-to-Speech']
    },
    {
      id: 'coursera-google-ai-essentials-2026',
      title: 'Google AI Essentials Specialization (5 Courses)',
      issuer: 'Google & Coursera',
      category: 'coursera',
      date: 'Nov 12, 2026',
      score: '5-Course Specialization',
      badgeImage: 'assets/badges/coursera-google-ai-essentials-certificate.png',
      pdfUrl: 'assets/certificates/Coursera_ERYLOPI8Q2KC_Google_AI_Essentials_Specialization.pdf',
      verifyUrl: 'https://coursera.org/verify/specialization/ERYLOPI8Q2KC',
      credentialIds: ['ERYLOPI8Q2KC', 'MEQD6YIAY16P', '6HBXWYU77HYQ', 'VNSOVA9W8ZJB', 'WQOYUYRLQ2ZW', '1DGWKM1OFI7J'],
      subCourses: [
        { title: 'Introduction to AI', id: 'MEQD6YIAY16P', date: 'Oct 24, 2026', verifyUrl: 'https://coursera.org/verify/MEQD6YIAY16P', pdfUrl: 'assets/certificates/Coursera_MEQD6YIAY16P_Introduction_to_AI.pdf' },
        { title: 'Maximize Productivity With AI Tools', id: '6HBXWYU77HYQ', date: 'Oct 26, 2026', verifyUrl: 'https://coursera.org/verify/6HBXWYU77HYQ', pdfUrl: 'assets/certificates/Coursera_6HBXWYU77HYQ_Maximize_Productivity_With_AI_Tools.pdf' },
        { title: 'Discover the Art of Prompting', id: 'VNSOVA9W8ZJB', date: 'Nov 12, 2026', verifyUrl: 'https://coursera.org/verify/VNSOVA9W8ZJB', pdfUrl: 'assets/certificates/Coursera_VNSOVA9W8ZJB_Discover_the_Art_of_Prompting.pdf' },
        { title: 'Stay Ahead of the AI Curve', id: 'WQOYUYRLQ2ZW', date: 'Nov 12, 2026', verifyUrl: 'https://coursera.org/verify/WQOYUYRLQ2ZW', pdfUrl: 'assets/certificates/Coursera_WQOYUYRLQ2ZW_Stay_Ahead_of_the_AI_Curve.pdf' },
        { title: 'Use AI Responsibly', id: '1DGWKM1OFI7J', date: 'Nov 12, 2026', verifyUrl: 'https://coursera.org/verify/1DGWKM1OFI7J', pdfUrl: 'assets/certificates/Coursera_1DGWKM1OFI7J_Use_AI_Responsibly.pdf' }
      ],
      description: 'Completed all 5 Google Career Certificates: Introduction to AI, Maximize Productivity With AI Tools, Discover the Art of Prompting, Stay Ahead of the AI Curve & Use AI Responsibly.',
      skills: ['Introduction to AI', 'Art of Prompting', 'Use AI Responsibly', 'AI Productivity']
    },
    {
      id: 'gcp-ai-boost-gemini-2026',
      title: 'AI Boost Bootcamp: How to Use Gemini at Work 101',
      issuer: 'Google Cloud',
      category: 'gcp coursera',
      date: 'Nov 2026',
      score: 'Completion Badge',
      badgeImage: 'assets/badges/ai-boost-bootcamp-gemini-at-work.png',
      verifyUrl: 'https://www.cloudskillsboost.google/',
      description: 'Applied enterprise Gemini workspace automation, structured prompting frameworks, and AI productivity pipelines.',
      skills: ['Gemini Enterprise Productivity', 'AI Workflow Automation']
    },
    {
      id: 'gcp-iam-roles-2026',
      title: 'Configure Service Accounts and IAM Roles for Google Cloud',
      issuer: 'Google Cloud / Credly',
      category: 'gcp',
      date: 'Oct 24, 2026',
      score: '100% Lab Score',
      badgeImage: 'assets/badges/configure-service-accounts-and-iam-roles-for-google-cloud.png',
      verifyUrl: 'https://www.credly.com/badges/64a013f8-b474-4116-9f51-80ed1056b971/public_url',
      description: 'Custom YAML IAM roles, service account bindings, gcloud CLI policies, and BigQuery Python client authentication.',
      skills: ['Cloud IAM', 'Custom YAML Roles', 'Service Accounts', 'BigQuery Auth']
    },
    {
      id: 'gcp-compute-basics-2026',
      title: 'The Basics of Google Cloud Compute',
      issuer: 'Google Cloud / Credly',
      category: 'gcp',
      date: 'Oct 24, 2026',
      score: '100% Lab Score',
      badgeImage: 'assets/badges/the-basics-of-google-cloud-compute.png',
      verifyUrl: 'https://www.cloudskillsboost.google/',
      description: 'Compute Engine VM provisioning, persistent disk attachment, and Nginx web server deployment.',
      skills: ['Compute Engine VMs', 'Persistent Disks', 'Nginx Web Servers']
    },
    {
      id: 'gcp-gemini-enterprise-2026',
      title: 'Create Your First Gemini Enterprise Application',
      issuer: 'Google Cloud & Coursera',
      category: 'gcp coursera',
      date: 'Oct 23, 2026',
      score: 'Skill Badge',
      badgeImage: 'assets/badges/create-your-first-gemini-enterprise-application.png',
      verifyUrl: 'https://www.credly.com/badges/ea5392d8-44ac-4429-8cd9-52d00cde2d1a/public_url',
      description: 'Deep research agents in Gemini Enterprise, multi-agent ideation workflows, and focused analysis with NotebookLM.',
      skills: ['Deep Research Agents', 'Multi-Agent Ideation', 'NotebookLM']
    },
    {
      id: 'isro-iict-fellowships-2026',
      title: 'ISRO IIRS Geodata ML & IICT AI Skills House Scholar',
      issuer: 'ISRO IIRS • Govt. of India',
      category: 'programs',
      date: 'Jul – Sep 2026',
      score: 'National Fellowships',
      credentialIds: ['20261883026394', 'IICT-16082662223'],
      description: 'ISRO IIRS AI/ML for Geodata Analysis (Reg: 20261883026394), IICT AISH Scholar (ID: IICT-16082662223) & Gemini Quizwar 2026.',
      skills: ['Geospatial Remote Sensing ML', 'Gemini Quizwar 2026', 'MYBharat']
    }
  ];

  class PortfolioDatabase {
    constructor() {
      this.db = null;
      this.isIndexedDBSupported = typeof window !== 'undefined' && 'indexedDB' in window;
      this.defaultCertifications = VERIFIED_CERTIFICATIONS;
    }

    async init() {
      if (this.db) return this.db;
      this._syncCertificationsToLocalStorage();

      if (!this.isIndexedDBSupported) {
        console.warn('[PortfolioDB] IndexedDB not available, using localStorage fallback.');
        return null;
      }

      return new Promise((resolve) => {
        try {
          const request = indexedDB.open(DB_NAME, DB_VERSION);

          request.onupgradeneeded = (event) => {
            const db = event.target.result;

            if (!db.objectStoreNames.contains(STORE_SUBMISSIONS)) {
              const subStore = db.createObjectStore(STORE_SUBMISSIONS, { keyPath: 'id', autoIncrement: true });
              subStore.createIndex('email', 'email', { unique: false });
              subStore.createIndex('created_at', 'created_at', { unique: false });
              subStore.createIndex('opportunity_type', 'opportunity_type', { unique: false });
            }

            let certTxStore;
            if (!db.objectStoreNames.contains(STORE_CERTIFICATIONS)) {
              const certStore = db.createObjectStore(STORE_CERTIFICATIONS, { keyPath: 'id' });
              certStore.createIndex('category', 'category', { unique: false });
              certStore.createIndex('date', 'date', { unique: false });
              certTxStore = certStore;
            } else {
              certTxStore = event.target.transaction.objectStore(STORE_CERTIFICATIONS);
              certTxStore.clear();
            }

            VERIFIED_CERTIFICATIONS.forEach((cert) => certTxStore.put(cert));
          };

          request.onsuccess = (event) => {
            this.db = event.target.result;
            resolve(this.db);
          };

          request.onerror = (event) => {
            console.error('[PortfolioDB] IndexedDB error:', event.target.error);
            resolve(null);
          };
        } catch (err) {
          console.error('[PortfolioDB] Init error:', err);
          resolve(null);
        }
      });
    }

    _syncCertificationsToLocalStorage() {
      try {
        const existing = JSON.parse(localStorage.getItem(LS_CERTS_KEY) || '[]');
        const map = new Map();
        VERIFIED_CERTIFICATIONS.forEach((c) => map.set(c.id, c));
        if (Array.isArray(existing)) {
          existing.forEach((c) => {
            if (c && c.id && !map.has(c.id)) map.set(c.id, c);
          });
        }
        localStorage.setItem(LS_CERTS_KEY, JSON.stringify(Array.from(map.values())));
      } catch (e) {}
    }

    async getAllCertifications() {
      await this.init();
      const orderIds = VERIFIED_CERTIFICATIONS.map((c) => c.id);
      const sortCerts = (list) =>
        list.slice().sort((a, b) => {
          const ia = orderIds.indexOf(a.id);
          const ib = orderIds.indexOf(b.id);
          if (ia !== -1 && ib !== -1) return ia - ib;
          if (ia !== -1) return -1;
          if (ib !== -1) return 1;
          return 0;
        });

      if (this.db && this.db.objectStoreNames.contains(STORE_CERTIFICATIONS)) {
        return new Promise((resolve) => {
          try {
            const tx = this.db.transaction([STORE_CERTIFICATIONS], 'readonly');
            const store = tx.objectStore(STORE_CERTIFICATIONS);
            const req = store.getAll();
            req.onsuccess = () => {
              const res = req.result && req.result.length ? sortCerts(req.result) : VERIFIED_CERTIFICATIONS;
              resolve(res);
            };
            req.onerror = () => resolve(VERIFIED_CERTIFICATIONS);
          } catch (e) {
            resolve(VERIFIED_CERTIFICATIONS);
          }
        });
      }
      try {
        const cached = JSON.parse(localStorage.getItem(LS_CERTS_KEY) || 'null');
        return cached && cached.length ? sortCerts(cached) : VERIFIED_CERTIFICATIONS;
      } catch (e) {
        return VERIFIED_CERTIFICATIONS;
      }
    }

    async getCertificationsByCategory(category = 'all') {
      const all = await this.getAllCertifications();
      if (category === 'all') return all;
      return all.filter((c) => (c.category || '').includes(category));
    }

    async addCertification(cert) {
      await this.init();
      const record = {
        id: cert.id || `custom-cert-${Date.now()}`,
        title: cert.title || 'Untitled Certification',
        issuer: cert.issuer || 'Verified Issuer',
        category: cert.category || 'gcp',
        date: cert.date || new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
        score: cert.score || 'Verified',
        badgeImage: cert.badgeImage || '',
        pdfUrl: cert.pdfUrl || '',
        verifyUrl: cert.verifyUrl || '',
        description: cert.description || '',
        skills: Array.isArray(cert.skills) ? cert.skills : []
      };

      try {
        const existing = JSON.parse(localStorage.getItem(LS_CERTS_KEY) || '[]');
        const filtered = Array.isArray(existing) ? existing.filter((c) => c.id !== record.id) : [];
        filtered.unshift(record);
        localStorage.setItem(LS_CERTS_KEY, JSON.stringify(filtered));
      } catch (e) {}

      if (this.db && this.db.objectStoreNames.contains(STORE_CERTIFICATIONS)) {
        return new Promise((resolve) => {
          try {
            const tx = this.db.transaction([STORE_CERTIFICATIONS], 'readwrite');
            const store = tx.objectStore(STORE_CERTIFICATIONS);
            const req = store.put(record);
            req.onsuccess = () => resolve({ success: true, data: record, storage: 'indexedDB' });
            req.onerror = () => resolve({ success: true, data: record, storage: 'localStorage' });
          } catch (e) {
            resolve({ success: true, data: record, storage: 'localStorage' });
          }
        });
      }
      return { success: true, data: record, storage: 'localStorage' };
    }

    async saveSubmission(data) {
      await this.init();
      const record = {
        name: data.name || 'Anonymous Client',
        email: data.email || '',
        company: data.company || 'N/A',
        opportunity_type: data.opportunity_type || 'General Inquiry',
        message: data.message || '',
        created_at: new Date().toISOString(),
        timestamp: Date.now()
      };

      if (this.db) {
        return new Promise((resolve) => {
          try {
            const tx = this.db.transaction([STORE_SUBMISSIONS], 'readwrite');
            const store = tx.objectStore(STORE_SUBMISSIONS);
            const req = store.add(record);

            req.onsuccess = () => {
              record.id = req.result;
              resolve({ success: true, id: req.result, data: record, storage: 'indexedDB' });
            };

            req.onerror = () => {
              resolve(this._saveToLocalStorage(record));
            };
          } catch (e) {
            resolve(this._saveToLocalStorage(record));
          }
        });
      }
      return this._saveToLocalStorage(record);
    }

    _saveToLocalStorage(record) {
      try {
        const existing = JSON.parse(localStorage.getItem(LS_SUBMISSIONS_KEY) || '[]');
        record.id = existing.length + 1;
        existing.push(record);
        localStorage.setItem(LS_SUBMISSIONS_KEY, JSON.stringify(existing));
        return { success: true, id: record.id, data: record, storage: 'localStorage' };
      } catch (e) {
        console.error('[PortfolioDB] LocalStorage save error:', e);
        return { success: false, error: e.message };
      }
    }

    async getAllSubmissions() {
      await this.init();
      if (this.db) {
        return new Promise((resolve) => {
          try {
            const tx = this.db.transaction([STORE_SUBMISSIONS], 'readonly');
            const store = tx.objectStore(STORE_SUBMISSIONS);
            const req = store.getAll();

            req.onsuccess = () => resolve(req.result || []);
            req.onerror = () => resolve(this._getAllFromLocalStorage());
          } catch (e) {
            resolve(this._getAllFromLocalStorage());
          }
        });
      }
      return this._getAllFromLocalStorage();
    }

    _getAllFromLocalStorage() {
      try {
        return JSON.parse(localStorage.getItem(LS_SUBMISSIONS_KEY) || '[]');
      } catch (e) {
        return [];
      }
    }

    async clearAll() {
      await this.init();
      if (this.db) {
        const tx = this.db.transaction([STORE_SUBMISSIONS], 'readwrite');
        tx.objectStore(STORE_SUBMISSIONS).clear();
      }
      try {
        localStorage.removeItem(LS_SUBMISSIONS_KEY);
      } catch (e) {}
      return { success: true };
    }
  }

  const instance = new PortfolioDatabase();

  if (typeof module !== 'undefined' && module.exports) {
    module.exports = instance;
  } else {
    global.PortfolioDB = instance;
    global.VERIFIED_CERTIFICATIONS = VERIFIED_CERTIFICATIONS;
  }
})(typeof window !== 'undefined' ? window : globalThis);
