/* ============================================================================
   Abu Bahaa Showroom - Firebase Firestore Cloud Engine (Sharded Chunks + WebP)
   Collection: elite_state | Doc: main_store + main_store_chunk_1..N
   ============================================================================ */

class FirebaseCloudService {
  static CONFIG_KEY = STORAGE_KEYS.FIREBASE_CONFIG;
  static COLLECTION = 'elite_state';
  static MAIN_DOC = 'main_store';
  static CHUNK_PREFIX = 'main_store_chunk_';
  static CHUNK_SIZE = 5;
  static DEFAULT_CONFIG = FIREBASE_DEFAULT_CONFIG;

  static app = null;
  static db = null;
  static storage = null;
  static isConnected = false;
  static isCloudHydrated = false;
  static _isWritingCloud = false;
  static _writeLockTimer = null;
  static unsubscribers = [];

  static getSavedConfig() {
    const saved = SafeStorage.get(this.CONFIG_KEY, null);
    if (saved && typeof saved === 'object' && !Array.isArray(saved) && saved.apiKey && saved.projectId) {
      return saved;
    }
    return this.DEFAULT_CONFIG;
  }

  /**
   * Robust parser for Firebase config input:
   * Supports strict JSON, JS object literals (`const firebaseConfig = {...};`, `export default {...}`),
   * single quotes, trailing commas, and JS comments without breaking `https://` URLs.
   */
  static parseConfigText(rawText) {
    const raw = String(rawText || '').trim();
    if (!raw) return { ...this.DEFAULT_CONFIG };

    // 1. Direct strict JSON attempt
    try {
      const direct = JSON.parse(raw);
      if (this._isValidConfigObj(direct)) return direct;
    } catch (_) {}

    // 2. Extract object block `{ ... }` from pasted JS snippet
    let candidate = raw;
    const firstBrace = candidate.indexOf('{');
    const lastBrace = candidate.lastIndexOf('}');
    if (firstBrace !== -1 && lastBrace > firstBrace) {
      candidate = candidate.slice(firstBrace, lastBrace + 1);
    }

    // Remove single-line and multi-line comments safely outside quoted strings
    candidate = candidate
      .replace(/\/\*[\s\S]*?\*\//g, '')
      .replace(/(^|[^:\\])\/\/.*$/gm, '$1');

    // Replace single-quoted strings with double-quoted JSON strings safely
    candidate = candidate.replace(/'([^'\\]*(?:\\.[^'\\]*)*)'/g, (_, inner) => {
      return `"${inner.replace(/"/g, '\\"')}"`;
    });

    // Quote unquoted keys at object boundaries (`{ key:` or `, key:`) without touching URLs
    candidate = candidate.replace(/([{,]\s*)([a-zA-Z_$][a-zA-Z0-9_$]*)\s*:/g, '$1"$2":');

    // Strip trailing commas before `}` or `]`
    candidate = candidate.replace(/,\s*([}\]])/g, '$1').trim();

    const parsed = JSON.parse(candidate);
    if (!this._isValidConfigObj(parsed)) {
      throw new Error('إعدادات Firebase ينقصها apiKey أو projectId.');
    }
    return parsed;
  }

  static _isValidConfigObj(obj) {
    return Boolean(
      obj &&
      typeof obj === 'object' &&
      !Array.isArray(obj) &&
      typeof obj.apiKey === 'string' && obj.apiKey.trim() &&
      typeof obj.projectId === 'string' && obj.projectId.trim()
    );
  }

  static init() {
    const cfg = this.getSavedConfig();
    if (this._isValidConfigObj(cfg)) {
      return this.connect(cfg, false);
    }
    this.updateStatusIndicator();
    return false;
  }

  static async connect(configObj, showNotification = true) {
    try {
      if (!window.firebase) throw new Error('مكتبة Firebase غير محملة');
      if (!this._isValidConfigObj(configObj)) throw new Error('بيانات إعدادات Firebase غير مكتملة');

      // Stop active listeners before switching/reinitializing
      this.unsubscribers.forEach(unsub => { try { unsub(); } catch (_) {} });
      this.unsubscribers = [];
      this.isCloudHydrated = false;

      if (!firebase.apps.length) {
        this.app = firebase.initializeApp(configObj);
      } else {
        const currentApp = firebase.app();
        const opts = currentApp.options || {};
        if (opts.projectId !== configObj.projectId || opts.apiKey !== configObj.apiKey) {
          await Promise.all(firebase.apps.map(a => a.delete().catch(() => {})));
          this.app = firebase.initializeApp(configObj);
        } else {
          this.app = currentApp;
        }
      }

      this.db = firebase.firestore();
      try {
        this.storage = firebase.storage();
      } catch (_) {
        this.storage = null;
      }

      SafeStorage.set(this.CONFIG_KEY, configObj);
      this.isConnected = true;
      this.updateStatusIndicator();

      await this.pushLocalToCloudIfEmpty();
      this.startRealtimeListeners();

      if (showNotification && window.App) {
        App.showToast(`☁️ تم الاتصال بقاعدة بيانات ${configObj.projectId} بنجاح!`, 'success');
      }
      return true;
    } catch (err) {
      console.error('Firebase Init Error:', err);
      this.isConnected = false;
      this.isCloudHydrated = false;
      this.updateStatusIndicator();
      if (showNotification && window.App) {
        App.showToast('❌ تعذر الاتصال بـ Firebase، تأكد من الإعدادات والإنترنت.', 'error');
      }
      return false;
    }
  }

  static disconnect() {
    this.unsubscribers.forEach(unsub => { try { unsub(); } catch (_) {} });
    this.unsubscribers = [];
    this.isConnected = false;
    this.isCloudHydrated = false;
    this.updateStatusIndicator();
    if (window.App) {
      App.showToast('🔌 تم فصل السحابة مؤقتاً والعودة للتخزين المحلي.', 'warning');
    }
  }

  static updateStatusIndicator() {
    const dot = document.getElementById('cloud-dot');
    const txt = document.getElementById('cloud-text');
    const badge = document.getElementById('cloud-status-badge');
    if (dot && txt && badge) {
      if (this.isConnected) {
        dot.className = 'w-2 h-2 rounded-full bg-emerald-400';
        txt.textContent = 'متصل سحابياً';
        badge.className = 'bg-emerald-950/90 hover:bg-emerald-900 text-emerald-300 border border-emerald-500/40 text-[10px] px-2.5 py-0.5 rounded-full font-bold inline-flex items-center gap-1.5 cursor-pointer transition';
      } else {
        dot.className = 'w-2 h-2 rounded-full bg-amber-400';
        txt.textContent = 'محلي مؤقت';
        badge.className = 'bg-slate-800/90 hover:bg-slate-700 text-slate-300 border border-slate-600 text-[10px] px-2.5 py-0.5 rounded-full font-bold inline-flex items-center gap-1.5 cursor-pointer transition';
      }
    }
    if (window.AdminDrawerUI && typeof AdminDrawerUI.syncHeaderAndDrawer === 'function') {
      AdminDrawerUI.syncHeaderAndDrawer();
    }
  }

  static applyCloudDataToLocal(data) {
    if (!data || typeof data !== 'object') return;
    if (Array.isArray(data.cars)) SafeStorage.set(CarRepository.KEY, data.cars);
    if (Array.isArray(data.soldCars)) SafeStorage.set(CarRepository.SOLD_KEY, data.soldCars);
    if (Array.isArray(data.reservations)) SafeStorage.set(CarRepository.RESERVATIONS_KEY, data.reservations);
    if (Array.isArray(data.inspections)) SafeStorage.set(CarRepository.INSPECTIONS_KEY, data.inspections);
    if (Array.isArray(data.tradeIns)) SafeStorage.set(CarRepository.TRADEIN_KEY, data.tradeIns);
    if (Array.isArray(data.archivedTradeIns)) SafeStorage.set(CarRepository.ARCHIVED_TRADEIN_KEY, data.archivedTradeIns);
    if (Array.isArray(data.crmLeads)) SafeStorage.set(CarRepository.CRM_KEY, data.crmLeads);
    if (Array.isArray(data.staffFavorites)) SafeStorage.set(CarRepository.STAFF_FAVS_KEY, data.staffFavorites);
    if (Array.isArray(data.admins) && data.admins.length > 0) SafeStorage.set(AuthService.DB_KEY, data.admins);
  }

  static async _fetchChunkWithRetry(chunkIndex) {
    const docRef = this.db.collection(this.COLLECTION).doc(`${this.CHUNK_PREFIX}${chunkIndex}`);
    try {
      return await docRef.get();
    } catch (firstErr) {
      await new Promise(r => setTimeout(r, 300));
      return await docRef.get();
    }
  }

  static async _hydrateAllChunksAndApply(mainData) {
    if (!mainData || !this.db) return false;

    let combinedCars = Array.isArray(mainData.cars) ? [...mainData.cars] : [];
    const chunksCount = Math.max(0, Number(mainData.overflowChunks || 0));

    if (chunksCount > 0) {
      const indices = Array.from({ length: chunksCount }, (_, i) => i + 1);
      // Read all chunks atomically; if any chunk read throws, abort hydration to prevent partial inventory loss
      const chunkSnaps = await Promise.all(indices.map(idx => this._fetchChunkWithRetry(idx)));
      for (const cSnap of chunkSnaps) {
        if (cSnap && cSnap.exists && Array.isArray(cSnap.data()?.cars)) {
          combinedCars = combinedCars.concat(cSnap.data().cars);
        }
      }
    }

    this.applyCloudDataToLocal({ ...mainData, cars: combinedCars });
    SafeStorage.sanitizeCorruptedStorage();
    this.isCloudHydrated = true;

    if (window.App) {
      App.syncAll(false);
      App.checkPendingSharedCar();
    }
    return true;
  }

  static async pushLocalToCloudIfEmpty() {
    if (!this.isConnected || !this.db) return;
    try {
      const snap = await this.db.collection(this.COLLECTION).doc(this.MAIN_DOC).get();
      if (!snap.exists) {
        // Only hydrate & seed defaults if main_store truly does not exist in Firestore
        CarRepository.getAllCars();
        AuthService.initDB();
        this.isCloudHydrated = true;
        await this.syncToCloud();
      } else {
        await this._hydrateAllChunksAndApply(snap.data());
      }
    } catch (e) {
      // Strict hydration safety: never allow writes over cloud if initial read failed
      this.isCloudHydrated = false;
      console.warn('Firestore initial hydration paused due to read error:', e);
    }
  }

  static async syncToCloud() {
    if (!this.isConnected || !this.db || !this.isCloudHydrated) return false;

    clearTimeout(this._writeLockTimer);
    this._isWritingCloud = true;

    try {
      SafeStorage.sanitizeCorruptedStorage();
      const rawCars = SafeStorage.get(CarRepository.KEY, []) || [];

      // Ensure any oversized embedded image is shrunk to light WebP (< 65KB target) before sharded upload
      for (let i = 0; i < rawCars.length; i++) {
        const c = rawCars[i];
        if (!c || typeof c !== 'object') continue;
        if (c.imageUrl && c.imageUrl.startsWith('data:image') && c.imageUrl.length > 65000) {
          c.imageUrl = await this.shrinkDataUrl(c.imageUrl, 640, 0.62);
        }
        if (Array.isArray(c.images)) {
          for (let j = 0; j < c.images.length; j++) {
            if (c.images[j] && c.images[j].startsWith('data:image') && c.images[j].length > 65000) {
              c.images[j] = await this.shrinkDataUrl(c.images[j], 640, 0.62);
            }
          }
        }
      }
      SafeStorage.set(CarRepository.KEY, rawCars);

      // Shard cars into chunks of 5 to stay well under Firestore 1MB document limit
      const firstChunk = rawCars.slice(0, this.CHUNK_SIZE);
      const extraChunks = [];
      for (let idx = this.CHUNK_SIZE; idx < rawCars.length; idx += this.CHUNK_SIZE) {
        extraChunks.push(rawCars.slice(idx, idx + this.CHUNK_SIZE));
      }

      const nowIso = new Date().toISOString();

      // 1. Write overflow chunks first
      if (extraChunks.length > 0) {
        await Promise.all(
          extraChunks.map((chunkCars, cIdx) =>
            this.db.collection(this.COLLECTION).doc(`${this.CHUNK_PREFIX}${cIdx + 1}`).set({
              cars: chunkCars,
              updatedAt: nowIso
            })
          )
        );
      }

      // 2. Write main_store pointer and remaining collections
      const mainPayload = {
        cars: firstChunk,
        overflowChunks: extraChunks.length,
        totalCarsCount: rawCars.length,
        soldCars: SafeStorage.get(CarRepository.SOLD_KEY, []),
        reservations: SafeStorage.get(CarRepository.RESERVATIONS_KEY, []),
        inspections: SafeStorage.get(CarRepository.INSPECTIONS_KEY, []),
        tradeIns: SafeStorage.get(CarRepository.TRADEIN_KEY, []),
        archivedTradeIns: SafeStorage.get(CarRepository.ARCHIVED_TRADEIN_KEY, []),
        crmLeads: SafeStorage.get(CarRepository.CRM_KEY, []),
        staffFavorites: SafeStorage.get(CarRepository.STAFF_FAVS_KEY, []),
        admins: SafeStorage.get(AuthService.DB_KEY, []),
        updatedAt: nowIso
      };

      await this.db.collection(this.COLLECTION).doc(this.MAIN_DOC).set(mainPayload);
      return true;
    } catch (e) {
      console.warn('Cloud Sync Sharded Write Error:', e);
      return false;
    } finally {
      this._writeLockTimer = setTimeout(() => {
        this._isWritingCloud = false;
      }, 1200);
    }
  }

  static startRealtimeListeners() {
    if (!this.isConnected || !this.db) return;
    this.unsubscribers.forEach(u => { try { u(); } catch (_) {} });
    this.unsubscribers = [];

    const unsub = this.db.collection(this.COLLECTION).doc(this.MAIN_DOC).onSnapshot(async (doc) => {
      if (this._isWritingCloud) return;
      if (doc.exists) {
        try {
          await this._hydrateAllChunksAndApply(doc.data());
        } catch (err) {
          console.warn('Realtime chunk hydration failed:', err);
        }
      }
    }, (err) => {
      console.warn('Realtime listener error:', err);
    });

    this.unsubscribers.push(unsub);
  }

  // Optional parallel crm_leads collection sync (keeps existing Firestore collection updated)
  static syncCrmDoc(record) {
    if (!this.db || !record?.id) return;
    this.db.collection('crm_leads').doc(String(record.id)).set(record).catch(() => {});
  }

  static updateCrmDoc(id, patch) {
    if (!this.db || !id) return;
    this.db.collection('crm_leads').doc(String(id)).update(patch).catch(() => {});
  }

  static deleteCrmDoc(id) {
    if (!this.db || !id) return;
    this.db.collection('crm_leads').doc(String(id)).delete().catch(() => {});
  }

  static async uploadCarImage(file, onProgress) {
    if (onProgress) onProgress(35);
    const compressedDataUrl = await this.compressImageFile(file, 640, 0.62);
    if (onProgress) onProgress(100);
    return compressedDataUrl;
  }

  static compressImageFile(file, maxWidth = 640, quality = 0.62) {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = (e) => {
        const img = new Image();
        img.onload = () => {
          const canvas = document.createElement('canvas');
          let w = img.width || maxWidth;
          let h = img.height || Math.round(maxWidth * 0.75);
          if (w > maxWidth) {
            h = Math.round((h * maxWidth) / w);
            w = maxWidth;
          }
          canvas.width = w;
          canvas.height = h;
          const ctx = canvas.getContext('2d');
          ctx.drawImage(img, 0, 0, w, h);
          const webpUrl = canvas.toDataURL('image/webp', quality);
          if (webpUrl && webpUrl.startsWith('data:image/webp')) {
            resolve(webpUrl);
          } else {
            resolve(canvas.toDataURL('image/jpeg', Math.min(0.75, quality + 0.1)));
          }
        };
        img.onerror = reject;
        img.src = e.target.result;
      };
      reader.onerror = reject;
      reader.readAsDataURL(file);
    });
  }

  static shrinkDataUrl(dataUrl, maxWidth = 640, quality = 0.62) {
    return new Promise((resolve) => {
      if (!dataUrl || typeof dataUrl !== 'string' || !dataUrl.startsWith('data:image') || dataUrl.length < 65000) {
        resolve(dataUrl);
        return;
      }
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement('canvas');
        let w = img.width || maxWidth;
        let h = img.height || Math.round(maxWidth * 0.75);
        if (w > maxWidth) {
          h = Math.round((h * maxWidth) / w);
          w = maxWidth;
        }
        canvas.width = w;
        canvas.height = h;
        const ctx = canvas.getContext('2d');
        ctx.drawImage(img, 0, 0, w, h);
        const webpUrl = canvas.toDataURL('image/webp', quality);
        resolve(webpUrl && webpUrl.startsWith('data:image/webp') ? webpUrl : canvas.toDataURL('image/jpeg', 0.72));
      };
      img.onerror = () => resolve(dataUrl);
      img.src = dataUrl;
    });
  }
}

window.FirebaseCloudService = FirebaseCloudService;
