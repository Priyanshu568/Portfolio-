/**
 * database.js - Client-Side Database System for Priyanshu Bhatta Portfolio
 *
 * Provides an asynchronous database engine using IndexedDB (v2) with automatic LocalStorage fallback.
 * Stores both recruiter/client form submissions and Priyanshu Bhatta's verified certifications.
 */

(function (global) {
  'use strict';

  const DB_NAME = 'PortfolioClientDB';
  const DB_VERSION = 2;
  const STORE_SUBMISSIONS = 'client_submissions';
  const STORE_CERTIFICATIONS = 'certifications';
  const LS_SUBMISSIONS_KEY = 'pb_client_submissions';
  const LS_CERTS_KEY = 'pb_verified_certifications';

  const VERIFIED_CERTIFICATIONS = [
    {
      id: 'gcp-cloud-vision-2026',
      title: 'Analyze Images with the Cloud Vision API Skill Badge',
      issuer: 'Google Cloud / Credly',
      category: 'gcp',
      date: 'Nov 15, 2026',
      score: '100% Lab Score',
      verifyUrl: 'https://www.credly.com/go/fImRn2Gge8A1849E98XXlQ',
      skills: ['Cloud Vision API', 'OCR Text Detection', 'Label, Face & Landmark Detection']
    },
    {
      id: 'gcp-speech-api-2026',
      title: 'Using the Google Cloud Speech API',
      issuer: 'Google Cloud / Credly',
      category: 'gcp',
      date: 'Nov 15, 2026',
      score: 'Skill Badge',
      verifyUrl: 'https://www.credly.com/go/gA59Rnf3Idc3nXIJEQjFJw',
      skills: ['Speech-to-Text API', 'Audio Transcription', 'Cloud Speech Pipelines']
    },
    {
      id: 'gcp-store-process-data-2026',
      title: 'Store, Process, and Manage Data on Google Cloud - Console',
      issuer: 'Google Cloud / Credly',
      category: 'gcp',
      date: 'Nov 13, 2026',
      score: '100% Lab Score',
      verifyUrl: 'https://www.credly.com/go/Ih7X0eZE9Wxoz6V0qHtTIQ',
      skills: ['Cloud Storage', 'Cloud Functions', 'Cloud Pub/Sub']
    },
    {
      id: 'gcp-ai-studio-2026',
      title: 'Develop AI-Powered Prototypes in Google AI Studio',
      issuer: 'Google Cloud / Credly',
      category: 'gcp',
      date: 'Nov 12, 2026',
      score: '100% Lab Score',
      verifyUrl: 'https://www.credly.com/go/kFCQa6zQvMeA4awEbDkEQA',
      skills: ['Google AI Studio', 'Multimodal Prototyping', 'Prompt Engineering']
    },
    {
      id: 'gcp-speech-language-2026',
      title: 'Implement Speech and Language Solutions with Pre-trained APIs',
      issuer: 'Google Cloud / Credly',
      category: 'gcp',
      date: 'Nov 12, 2026',
      score: '100% Lab Score',
      verifyUrl: 'https://www.credly.com/go/GrInb6kGb8mbxBYAkvvtgw',
      skills: ['Cloud Natural Language API', 'Speech-to-Text', 'Text-to-Speech']
    },
    {
      id: 'coursera-google-ai-essentials-2026',
      title: 'Google AI Essentials Specialization (5 Courses)',
      issuer: 'Google & Coursera',
      category: 'coursera',
      date: 'Oct – Nov 2026',
      score: '5-Course Specialization',
      verifyUrl: '',
      credentialIds: ['MEQD6YIAY16P', '6HBXWYU77HYQ', 'VNSOVA9W8ZJB', 'WQOYUYRLQ2ZW', '1DGWKM1OFI7J'],
      skills: ['Introduction to AI', 'Art of Prompting', 'Use AI Responsibly']
    },
    {
      id: 'gcp-ai-boost-gemini-2026',
      title: 'AI Boost Bootcamp: How to Use Gemini at Work 101',
      issuer: 'Google Cloud',
      category: 'gcp coursera',
      date: 'Nov 2026',
      score: 'Completion Badge',
      verifyUrl: '',
      skills: ['Gemini Enterprise Productivity', 'AI Workflow Automation']
    },
    {
      id: 'gcp-iam-roles-2026',
      title: 'Configure Service Accounts and IAM Roles for Google Cloud',
      issuer: 'Google Cloud / Credly',
      category: 'gcp',
      date: 'Oct 2026',
      score: '100% Lab Score',
      verifyUrl: '',
      skills: ['Cloud IAM', 'Custom YAML Roles', 'Service Accounts', 'BigQuery Auth']
    },
    {
      id: 'gcp-compute-basics-2026',
      title: 'The Basics of Google Cloud Compute',
      issuer: 'Google Cloud / Credly',
      category: 'gcp',
      date: 'Oct 2026',
      score: '100% Lab Score',
      verifyUrl: '',
      skills: ['Compute Engine VMs', 'Persistent Disks', 'Nginx Web Servers']
    },
    {
      id: 'gcp-gemini-enterprise-2026',
      title: 'Create Your First Gemini Enterprise Application',
      issuer: 'Google Cloud & Coursera',
      category: 'gcp coursera',
      date: 'Oct 2026',
      score: 'Multi-Badge',
      verifyUrl: '',
      skills: ['Deep Research Agents', 'Multi-Agent Ideation', 'NotebookLM']
    },
    {
      id: 'isro-iict-fellowships-2026',
      title: 'ISRO IIRS Geodata ML & IICT AI Skills House Scholar',
      issuer: 'ISRO IIRS • Govt. of India',
      category: 'programs',
      date: 'Jul – Sep 2026',
      score: 'National Fellowships',
      verifyUrl: '',
      credentialIds: ['20261883026394', 'IICT-16082662223'],
      skills: ['Geospatial Remote Sensing ML', 'Gemini Quizwar 2026', 'MYBharat']
    }
  ];

  class PortfolioDatabase {
    constructor() {
      this.db = null;
      this.isIndexedDBSupported = typeof window !== 'undefined' && 'indexedDB' in window;
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

            if (!db.objectStoreNames.contains(STORE_CERTIFICATIONS)) {
              const certStore = db.createObjectStore(STORE_CERTIFICATIONS, { keyPath: 'id' });
              certStore.createIndex('category', 'category', { unique: false });
              certStore.createIndex('date', 'date', { unique: false });
            }

            const certTxStore = event.target.transaction.objectStore(STORE_CERTIFICATIONS);
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
        localStorage.setItem(LS_CERTS_KEY, JSON.stringify(VERIFIED_CERTIFICATIONS));
      } catch (e) {}
    }

    async getAllCertifications() {
      await this.init();
      if (this.db && this.db.objectStoreNames.contains(STORE_CERTIFICATIONS)) {
        return new Promise((resolve) => {
          try {
            const tx = this.db.transaction([STORE_CERTIFICATIONS], 'readonly');
            const store = tx.objectStore(STORE_CERTIFICATIONS);
            const req = store.getAll();
            req.onsuccess = () => resolve(req.result && req.result.length ? req.result : VERIFIED_CERTIFICATIONS);
            req.onerror = () => resolve(VERIFIED_CERTIFICATIONS);
          } catch (e) {
            resolve(VERIFIED_CERTIFICATIONS);
          }
        });
      }
      try {
        const cached = JSON.parse(localStorage.getItem(LS_CERTS_KEY) || 'null');
        return cached && cached.length ? cached : VERIFIED_CERTIFICATIONS;
      } catch (e) {
        return VERIFIED_CERTIFICATIONS;
      }
    }

    async getCertificationsByCategory(category = 'all') {
      const all = await this.getAllCertifications();
      if (category === 'all') return all;
      return all.filter((c) => (c.category || '').includes(category));
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
  }
})(typeof window !== 'undefined' ? window : globalThis);