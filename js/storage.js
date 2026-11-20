/* ============================================================================
   Abu Bahaa Showroom - Safe LocalStorage Layer, Keys & Shared Helpers (v9)
   ============================================================================ */

const STORAGE_KEYS = {
  FIREBASE_CONFIG: 'elite_firebase_config_v1',
  CARS: 'elite_pro_cars_v1',
  SOLD_CARS: 'elite_pro_sold_v1',
  FAVORITES: 'elite_pro_favs_v1',
  CLIENT_COMPARE: 'elite_pro_c_comp_v1',
  ADMIN_COMPARE: 'elite_pro_a_comp_v1',
  RESERVATIONS: 'elite_pro_res_v1',
  INSPECTIONS: 'elite_pro_insp_v1',
  TRADE_INS: 'elite_pro_ti_v1',
  ARCHIVED_TRADE_INS: 'elite_pro_arch_ti_v1',
  CLIENT_RES_IDS: 'elite_pro_my_res_ids_v1',
  AUTH_SESSION: 'elite_pro_auth_session_v1',
  ADMINS_DB: 'elite_pro_admins_db_v1',
  DARK_MODE: 'elite_dark_mode_v1',
  CRM_LEADS: 'abu_bahaa_crm_leads_v1',
  STAFF_FAVS: 'abu_bahaa_staff_favs_v1',
  WATCHLIST_PREFIX: 'elite_pro_wl_'
};

class SafeStorage {
  static memoryFallback = {};

  static get(key, defaultVal = null) {
    try {
      const item = window.localStorage.getItem(key);
      return item !== null ? JSON.parse(item) : defaultVal;
    } catch (e) {
      return this.memoryFallback[key] !== undefined ? this.memoryFallback[key] : defaultVal;
    }
  }

  static set(key, value) {
    try {
      window.localStorage.setItem(key, JSON.stringify(value));
    } catch (e) {
      this.memoryFallback[key] = value;
    }
  }

  static remove(key) {
    try {
      window.localStorage.removeItem(key);
    } catch (e) {
      delete this.memoryFallback[key];
    }
  }

  /**
   * Cleans orphaned client favorite IDs and malformed sold entries without touching valid inventory.
   */
  static sanitizeCorruptedStorage() {
    try {
      const rawCars = this.get(STORAGE_KEYS.CARS, null);
      if (Array.isArray(rawCars)) {
        const activeIds = new Set(rawCars.map(c => String(c?.id || '')).filter(Boolean));
        const rawFavs = this.get(STORAGE_KEYS.FAVORITES, []);
        if (Array.isArray(rawFavs)) {
          const cleanFavs = rawFavs.filter(id => typeof id === 'string' && activeIds.has(id));
          if (cleanFavs.length !== rawFavs.length) {
            this.set(STORAGE_KEYS.FAVORITES, cleanFavs);
          }
        }
      }

      const rawSold = this.get(STORAGE_KEYS.SOLD_CARS, null);
      if (Array.isArray(rawSold)) {
        const cleanSold = rawSold.filter(c => c && typeof c === 'object' && c.soldAt && Number(c.price) > 0);
        if (cleanSold.length !== rawSold.length) {
          this.set(STORAGE_KEYS.SOLD_CARS, cleanSold);
        }
      }

      // Guard Firebase config against non-object corruption
      const rawCfg = this.get(STORAGE_KEYS.FIREBASE_CONFIG, null);
      if (rawCfg !== null && (typeof rawCfg !== 'object' || Array.isArray(rawCfg) || !rawCfg.apiKey || !rawCfg.projectId)) {
        this.remove(STORAGE_KEYS.FIREBASE_CONFIG);
      }
    } catch (err) {
      console.warn('Storage sanitization warning:', err);
    }
  }
}

function escapeHtml(str) {
  return String(str ?? '').replace(/[&<>"']/g, m => ({
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    '"': '&quot;',
    "'": '&#39;'
  }[m]));
}

function formatNumber(val) {
  return Math.round(Number(val) || 0).toLocaleString('ar-EG');
}

function formatCurrency(val) {
  return formatNumber(val) + ' ج.م';
}

function normalizePhoneForWhatsApp(phone) {
  if (SANDBOX_TEST_MODE) return MY_PERSONAL_TEST_PHONE;
  let clean = String(phone || DEFAULT_DEALER_PHONE).replace(/[^0-9]/g, '');
  if (!clean || clean === '201000000001' || clean === '201066980075' || clean === '01066980075') {
    clean = DEFAULT_DEALER_PHONE;
  }
  if (clean.startsWith('01')) clean = '2' + clean;
  return clean;
}

async function copyTextSilent(text) {
  if (!text) return false;
  try {
    if (navigator.clipboard && navigator.clipboard.writeText) {
      await navigator.clipboard.writeText(text);
      return true;
    }
  } catch (err) {}
  try {
    const ta = document.createElement('textarea');
    ta.value = text;
    ta.style.position = 'fixed';
    ta.style.opacity = '0';
    document.body.appendChild(ta);
    ta.focus();
    ta.select();
    const ok = document.execCommand('copy');
    document.body.removeChild(ta);
    return ok;
  } catch (e) {
    return false;
  }
}

window.STORAGE_KEYS = STORAGE_KEYS;
window.SafeStorage = SafeStorage;
window.escapeHtml = escapeHtml;
window.formatNumber = formatNumber;
window.formatCurrency = formatCurrency;
window.normalizePhoneForWhatsApp = normalizePhoneForWhatsApp;
window.copyTextSilent = copyTextSilent;
