/**
 * database.js - Client-Side Database System for Priyanshu Bhatta Portfolio
 * 
 * Provides an asynchronous database engine using IndexedDB with automatic LocalStorage fallback.
 * Allows storing client and recruiter submissions locally when testing, or when running offline.
 */

(function (global) {
  'use strict';

  const DB_NAME = 'PortfolioClientDB';
  const DB_VERSION = 1;
  const STORE_NAME = 'client_submissions';

  class PortfolioDatabase {
    constructor() {
      this.db = null;
      this.isIndexedDBSupported = typeof window !== 'undefined' && 'indexedDB' in window;
    }

    /**
     * Initializes the database connection
     */
    async init() {
      if (this.db) return this.db;
      if (!this.isIndexedDBSupported) {
        console.warn('[PortfolioDB] IndexedDB not available, using localStorage fallback.');
        return null;
      }

      return new Promise((resolve, reject) => {
        try {
          const request = indexedDB.open(DB_NAME, DB_VERSION);

          request.onupgradeneeded = (event) => {
            const db = event.target.result;
            if (!db.objectStoreNames.contains(STORE_NAME)) {
              const store = db.createObjectStore(STORE_NAME, { keyPath: 'id', autoIncrement: true });
              store.createIndex('email', 'email', { unique: false });
              store.createIndex('created_at', 'created_at', { unique: false });
              store.createIndex('opportunity_type', 'opportunity_type', { unique: false });
            }
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

    /**
     * Saves a client form submission
     * @param {Object} data { name, email, company, opportunity_type, message }
     */
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
        return new Promise((resolve, reject) => {
          try {
            const tx = this.db.transaction([STORE_NAME], 'readwrite');
            const store = tx.objectStore(STORE_NAME);
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
      } else {
        return this._saveToLocalStorage(record);
      }
    }

    /**
     * LocalStorage fallback implementation
     */
    _saveToLocalStorage(record) {
      try {
        const existing = JSON.parse(localStorage.getItem('pb_client_submissions') || '[]');
        record.id = existing.length + 1;
        existing.push(record);
        localStorage.setItem('pb_client_submissions', JSON.stringify(existing));
        return { success: true, id: record.id, data: record, storage: 'localStorage' };
      } catch (e) {
        console.error('[PortfolioDB] LocalStorage save error:', e);
        return { success: false, error: e.message };
      }
    }

    /**
     * Retrieves all saved submissions
     */
    async getAllSubmissions() {
      await this.init();
      if (this.db) {
        return new Promise((resolve) => {
          try {
            const tx = this.db.transaction([STORE_NAME], 'readonly');
            const store = tx.objectStore(STORE_NAME);
            const req = store.getAll();

            req.onsuccess = () => resolve(req.result || []);
            req.onerror = () => resolve(this._getAllFromLocalStorage());
          } catch (e) {
            resolve(this._getAllFromLocalStorage());
          }
        });
      } else {
        return this._getAllFromLocalStorage();
      }
    }

    _getAllFromLocalStorage() {
      try {
        return JSON.parse(localStorage.getItem('pb_client_submissions') || '[]');
      } catch (e) {
        return [];
      }
    }

    /**
     * Clears stored submissions
     */
    async clearAll() {
      await this.init();
      if (this.db) {
        const tx = this.db.transaction([STORE_NAME], 'readwrite');
        tx.objectStore(STORE_NAME).clear();
      }
      try {
        localStorage.removeItem('pb_client_submissions');
      } catch (e) {}
      return { success: true };
    }
  }

  const instance = new PortfolioDatabase();

  // Export to window or CommonJS
  if (typeof module !== 'undefined' && module.exports) {
    module.exports = instance;
  } else {
    global.PortfolioDB = instance;
  }
})(typeof window !== 'undefined' ? window : globalThis);
