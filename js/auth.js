/* ============================================================================
   Abu Bahaa Showroom - Role-Based Access Control (RBAC AuthService v9)
   ============================================================================ */

class AuthService {
  static SESSION_KEY = STORAGE_KEYS.AUTH_SESSION;
  static DB_KEY = STORAGE_KEYS.ADMINS_DB;

  static initDB() {
    const existing = SafeStorage.get(this.DB_KEY, null);
    if (!existing || !Array.isArray(existing) || existing.length === 0) {
      SafeStorage.set(this.DB_KEY, DEFAULT_ADMINS.map(a => ({ ...a })));
    }
  }

  static getAdmins() {
    this.initDB();
    return SafeStorage.get(this.DB_KEY, []);
  }

  static saveAdmins(adminsList, syncCloud = true) {
    if (!Array.isArray(adminsList) || adminsList.length === 0) return;
    SafeStorage.set(this.DB_KEY, adminsList);
    if (syncCloud && window.FirebaseCloudService) {
      FirebaseCloudService.syncToCloud();
    }
  }

  static getSession() {
    const s = SafeStorage.get(this.SESSION_KEY, null);
    if (!s || !s.username) return null;
    const found = this.getAdmins().find(a => a.username === s.username && a.role === s.role);
    return found || null;
  }

  static isLogged() {
    return Boolean(this.getSession());
  }

  static isSuperAdmin() {
    return this.getRole() === 'SuperAdmin';
  }

  static isStaff() {
    return this.getRole() === 'Staff';
  }

  static getRole() {
    const s = this.getSession();
    return s ? s.role : 'Client';
  }

  static getName() {
    const s = this.getSession();
    return s ? s.name : 'عميل';
  }

  static getUsername() {
    const s = this.getSession();
    return s ? s.username : null;
  }

  static login(u, p) {
    const username = String(u || '').trim().toLowerCase();
    const pass = String(p || '');
    const found = this.getAdmins().find(a => a.username.toLowerCase() === username && a.pass === pass);
    if (found) {
      SafeStorage.set(this.SESSION_KEY, {
        username: found.username,
        role: found.role,
        name: found.name
      });
      return true;
    }
    return false;
  }

  static logout() {
    SafeStorage.remove(this.SESSION_KEY);
  }

  static addAdmin({ name, username, pass, role }) {
    if (!this.isSuperAdmin()) return { ok: false, reason: 'forbidden' };
    const cleanUser = String(username || '').trim();
    const list = this.getAdmins();
    if (!cleanUser || list.some(a => a.username.toLowerCase() === cleanUser.toLowerCase())) {
      return { ok: false, reason: 'duplicate' };
    }
    list.push({
      name: String(name || '').trim(),
      username: cleanUser,
      pass: String(pass || '').trim(),
      role: role === 'SuperAdmin' ? 'SuperAdmin' : 'Staff'
    });
    this.saveAdmins(list, true);
    return { ok: true };
  }

  static deleteAdmin(username) {
    if (!this.isSuperAdmin()) return false;
    const current = this.getUsername();
    if (!username || username === 'admin' || username === current) return false;
    const list = this.getAdmins().filter(a => a.username !== username);
    this.saveAdmins(list, true);
    return true;
  }
}

window.AuthService = AuthService;
