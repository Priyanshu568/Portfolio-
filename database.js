/**
 * database.js - Client-Side Database System for Priyanshu Bhatta's Portfolio
 * 
 * Features:
 * - Engine: IndexedDB (Native Browser NoSQL Database) with LocalStorage & In-Memory fallback
 * - Auto-Initialization & Schema Migration (Store: 'contacts', Indexes: 'email', 'createdAt', 'status')
 * - Full CRUD Operations: saveMessage(), getAllMessages(), getMessageById(), updateMessageStatus(), deleteMessage(), clearAllMessages()
 * - Export Utilities: exportToJSON(), exportToCSV()
 * - Auto-Attach Form Handler: PortfolioDB.attachToForm('contact-form')
 * - Universal Module: Works in browser window (global PortfolioDB) and Node.js / CommonJS / ES module environments.
 */

(function (root, factory) {
  if (typeof define === 'function' && define.amd) {
    define([], factory);
  } else if (typeof module === 'object' && module.exports) {
    module.exports = factory();
  } else {
    root.PortfolioDB = factory();
  }
}(typeof self !== 'undefined' ? self : this, function () {
  'use strict';

  const DB_CONFIG = {
    name: 'PortfolioDB',
    version: 1,
    storeName: 'contacts',
    fallbackStorageKey: 'portfolio_contacts_fallback'
  };

  let dbInstance = null;
  let inMemoryCache = []; // Fallback cache when neither IndexedDB nor LocalStorage is available

  /**
   * Helper: Generate a collision-resistant unique ID
   */
  function generateId() {
    const timestamp = Date.now().toString(36);
    const randomPart = Math.random().toString(36).substring(2, 9);
    return `msg_${timestamp}_${randomPart}`;
  }

  /**
   * Initialize and open the IndexedDB database
   * @returns {Promise<IDBDatabase|null>}
   */
  function initDB() {
    return new Promise((resolve) => {
      if (dbInstance) {
        return resolve(dbInstance);
      }

      if (typeof window === 'undefined' || !window.indexedDB) {
        return resolve(null);
      }

      try {
        const request = window.indexedDB.open(DB_CONFIG.name, DB_CONFIG.version);

        request.onupgradeneeded = function (event) {
          const db = event.target.result;
          if (!db.objectStoreNames.contains(DB_CONFIG.storeName)) {
            const store = db.createObjectStore(DB_CONFIG.storeName, { keyPath: 'id' });
            store.createIndex('email', 'email', { unique: false });
            store.createIndex('createdAt', 'createdAt', { unique: false });
            store.createIndex('status', 'status', { unique: false });
          }
        };

        request.onsuccess = function (event) {
          dbInstance = event.target.result;
          resolve(dbInstance);
        };

        request.onerror = function (event) {
          console.warn('[PortfolioDB] IndexedDB open error, falling back:', event.target.error);
          resolve(null);
        };
      } catch (err) {
        console.warn('[PortfolioDB] Exception during IndexedDB initialization:', err);
        resolve(null);
      }
    });
  }

  /**
   * Fallback LocalStorage & In-Memory CRUD Helpers
   */
  const FallbackStore = {
    getAll: function () {
      try {
        if (typeof window !== 'undefined' && window.localStorage) {
          const raw = window.localStorage.getItem(DB_CONFIG.fallbackStorageKey);
          if (raw) return JSON.parse(raw);
        }
      } catch (e) {}
      return inMemoryCache.slice();
    },
    saveAll: function (items) {
      inMemoryCache = items.slice();
      try {
        if (typeof window !== 'undefined' && window.localStorage) {
          window.localStorage.setItem(DB_CONFIG.fallbackStorageKey, JSON.stringify(items));
        }
      } catch (e) {}
    },
    insert: function (record) {
      const all = this.getAll();
      all.unshift(record);
      this.saveAll(all);
      return record;
    },
    remove: function (id) {
      const all = this.getAll().filter(item => item.id !== id);
      this.saveAll(all);
    },
    update: function (id, updates) {
      const all = this.getAll().map(item => {
        if (item.id === id) {
          return Object.assign({}, item, updates, { updatedAt: new Date().toISOString() });
        }
        return item;
      });
      this.saveAll(all);
    },
    clear: function () {
      inMemoryCache = [];
      try {
        if (typeof window !== 'undefined' && window.localStorage) {
          window.localStorage.removeItem(DB_CONFIG.fallbackStorageKey);
        }
      } catch (e) {}
    }
  };

  /**
   * Portfolio Database Public API
   */
  const PortfolioDB = {
    /**
     * Explicitly initialize the database
     */
    init: function () {
      return initDB();
    },

    /**
     * Save a new contact / recruiter message to the database
     * @param {Object} data - { name, email, message, metadata }
     * @returns {Promise<Object>} Stored message record with ID and timestamps
     */
    saveMessage: async function (data) {
      if (!data || typeof data !== 'object') {
        throw new Error('[PortfolioDB] Invalid input: data must be an object.');
      }

      const name = (data.name || '').trim();
      const email = (data.email || '').trim();
      const message = (data.message || '').trim();

      if (!name) throw new Error('[PortfolioDB] Validation Error: "name" is required.');
      if (!email) throw new Error('[PortfolioDB] Validation Error: "email" is required.');
      if (!message) throw new Error('[PortfolioDB] Validation Error: "message" is required.');

      const now = new Date();
      const record = {
        id: data.id || generateId(),
        name: name,
        email: email,
        message: message,
        createdAt: now.toISOString(),
        timestamp: now.getTime(),
        status: data.status || 'unread', // 'unread' | 'read' | 'replied' | 'archived'
        metadata: Object.assign({
          source: 'portfolio_contact_form',
          userAgent: (typeof navigator !== 'undefined' && navigator.userAgent) || 'unknown',
          screenResolution: (typeof window !== 'undefined' && window.screen) 
            ? `${window.screen.width}x${window.screen.height}` 
            : 'unknown'
        }, data.metadata || {})
      };

      // Always update fallback cache / localStorage
      FallbackStore.insert(record);

      const db = await initDB();
      if (!db) {
        return record;
      }

      return new Promise((resolve) => {
        try {
          const transaction = db.transaction([DB_CONFIG.storeName], 'readwrite');
          const store = transaction.objectStore(DB_CONFIG.storeName);
          const request = store.add(record);

          request.onsuccess = function () {
            resolve(record);
          };

          request.onerror = function () {
            // LocalStorage fallback already updated
            resolve(record);
          };
        } catch (err) {
          resolve(record);
        }
      });
    },

    /**
     * Fetch all messages sorted by newest first
     * @returns {Promise<Array<Object>>}
     */
    getAllMessages: async function () {
      const db = await initDB();
      if (!db) {
        return FallbackStore.getAll();
      }

      return new Promise((resolve) => {
        try {
          const transaction = db.transaction([DB_CONFIG.storeName], 'readonly');
          const store = transaction.objectStore(DB_CONFIG.storeName);
          const request = store.getAll();

          request.onsuccess = function (event) {
            const records = event.target.result || [];
            records.sort((a, b) => (b.timestamp || 0) - (a.timestamp || 0));
            resolve(records.length ? records : FallbackStore.getAll());
          };

          request.onerror = function () {
            resolve(FallbackStore.getAll());
          };
        } catch (err) {
          resolve(FallbackStore.getAll());
        }
      });
    },

    /**
     * Retrieve a specific message by its ID
     * @param {string} id
     * @returns {Promise<Object|null>}
     */
    getMessageById: async function (id) {
      if (!id) return null;
      const db = await initDB();
      if (!db) {
        const found = FallbackStore.getAll().find(item => item.id === id);
        return found || null;
      }

      return new Promise((resolve) => {
        try {
          const transaction = db.transaction([DB_CONFIG.storeName], 'readonly');
          const store = transaction.objectStore(DB_CONFIG.storeName);
          const request = store.get(id);

          request.onsuccess = function (event) {
            const res = event.target.result;
            if (res) return resolve(res);
            const found = FallbackStore.getAll().find(item => item.id === id);
            resolve(found || null);
          };

          request.onerror = function () {
            const found = FallbackStore.getAll().find(item => item.id === id);
            resolve(found || null);
          };
        } catch (err) {
          const found = FallbackStore.getAll().find(item => item.id === id);
          resolve(found || null);
        }
      });
    },

    /**
     * Update the status of a message ('read', 'replied', 'archived', 'unread')
     * @param {string} id
     * @param {string} newStatus
     * @returns {Promise<boolean>}
     */
    updateMessageStatus: async function (id, newStatus) {
      if (!id || !newStatus) return false;
      FallbackStore.update(id, { status: newStatus });

      const db = await initDB();
      if (!db) return true;

      return new Promise((resolve) => {
        try {
          const transaction = db.transaction([DB_CONFIG.storeName], 'readwrite');
          const store = transaction.objectStore(DB_CONFIG.storeName);
          const getReq = store.get(id);

          getReq.onsuccess = function (event) {
            const record = event.target.result;
            if (!record) return resolve(false);

            record.status = newStatus;
            record.updatedAt = new Date().toISOString();
            const putReq = store.put(record);
            putReq.onsuccess = () => resolve(true);
            putReq.onerror = () => resolve(false);
          };

          getReq.onerror = () => resolve(false);
        } catch (err) {
          resolve(false);
        }
      });
    },

    /**
     * Delete a single message from the database
     * @param {string} id
     * @returns {Promise<boolean>}
     */
    deleteMessage: async function (id) {
      if (!id) return false;
      FallbackStore.remove(id);

      const db = await initDB();
      if (!db) return true;

      return new Promise((resolve) => {
        try {
          const transaction = db.transaction([DB_CONFIG.storeName], 'readwrite');
          const store = transaction.objectStore(DB_CONFIG.storeName);
          const request = store.delete(id);

          request.onsuccess = () => resolve(true);
          request.onerror = () => resolve(false);
        } catch (err) {
          resolve(false);
        }
      });
    },

    /**
     * Clear all stored messages from the database
     * @returns {Promise<boolean>}
     */
    clearAllMessages: async function () {
      FallbackStore.clear();

      const db = await initDB();
      if (!db) return true;

      return new Promise((resolve) => {
        try {
          const transaction = db.transaction([DB_CONFIG.storeName], 'readwrite');
          const store = transaction.objectStore(DB_CONFIG.storeName);
          const request = store.clear();

          request.onsuccess = () => resolve(true);
          request.onerror = () => resolve(false);
        } catch (err) {
          resolve(false);
        }
      });
    },

    /**
     * Retrieve summary statistics
     * @returns {Promise<{total: number, unread: number, latest: string|null}>}
     */
    getStats: async function () {
      const messages = await this.getAllMessages();
      const unread = messages.filter(m => m.status === 'unread').length;
      return {
        total: messages.length,
        unread: unread,
        latest: messages.length > 0 ? messages[0].createdAt : null
      };
    },

    /**
     * Export all stored messages as a formatted JSON string
     * @returns {Promise<string>}
     */
    exportToJSON: async function () {
      const messages = await this.getAllMessages();
      return JSON.stringify(messages, null, 2);
    },

    /**
     * Export all stored messages as CSV text
     * @returns {Promise<string>}
     */
    exportToCSV: async function () {
      const messages = await this.getAllMessages();
      if (!messages.length) return 'id,name,email,message,createdAt,status\n';

      const headers = ['id', 'name', 'email', 'message', 'createdAt', 'status'];
      const escapeField = (val) => {
        const str = String(val || '').replace(/"/g, '""');
        return `"${str}"`;
      };

      const rows = messages.map(m => [
        escapeField(m.id),
        escapeField(m.name),
        escapeField(m.email),
        escapeField(m.message),
        escapeField(m.createdAt),
        escapeField(m.status)
      ].join(','));

      return [headers.join(','), ...rows].join('\n');
    },

    /**
     * Automatically bind PortfolioDB to your HTML contact form
     * @param {string} formId - Default 'contact-form'
     * @param {Object} options - { nameId, emailId, messageId, onSuccess, onError }
     */
    attachToForm: function (formId = 'contact-form', options = {}) {
      if (typeof document === 'undefined') return;

      const form = document.getElementById(formId);
      if (!form) {
        console.warn(`[PortfolioDB] Form with id "${formId}" not found.`);
        return;
      }

      const nameId = options.nameId || 'contact-name';
      const emailId = options.emailId || 'contact-email';
      const msgId = options.messageId || 'contact-msg';

      form.addEventListener('submit', async function (event) {
        event.preventDefault();

        const nameInput = document.getElementById(nameId);
        const emailInput = document.getElementById(emailId);
        const msgInput = document.getElementById(msgId);

        if (!nameInput || !emailInput || !msgInput) {
          console.error('[PortfolioDB] One or more contact form input fields could not be found.');
          return;
        }

        const formData = {
          name: nameInput.value,
          email: emailInput.value,
          message: msgInput.value
        };

        try {
          const saved = await PortfolioDB.saveMessage(formData);
          console.log('[PortfolioDB] Successfully stored message in database:', saved);

          if (typeof options.onSuccess === 'function') {
            options.onSuccess(saved);
          } else if (typeof window.showToast === 'function') {
            window.showToast(`Thank you, ${saved.name}! Your message has been saved to the database.`);
          }

          form.reset();
        } catch (err) {
          console.error('[PortfolioDB] Error storing message:', err);
          if (typeof options.onError === 'function') {
            options.onError(err);
          } else if (typeof window.showToast === 'function') {
            window.showToast('Error: ' + err.message);
          }
        }
      });

      console.log(`[PortfolioDB] Successfully attached to #${formId}`);
    }
  };

  // Auto-attach if running in browser once DOM is ready
  if (typeof window !== 'undefined' && typeof document !== 'undefined') {
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', () => {
        PortfolioDB.init();
        PortfolioDB.attachToForm('contact-form');
      });
    } else {
      PortfolioDB.init();
      PortfolioDB.attachToForm('contact-form');
    }
  }

  return PortfolioDB;
}));