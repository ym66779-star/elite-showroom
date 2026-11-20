/* ============================================================================
   Abu Bahaa Showroom - Centralized Data Repository (9 Core Tables + Views)
   ============================================================================ */

class CarRepository {
  static KEY = STORAGE_KEYS.CARS;
  static SOLD_KEY = STORAGE_KEYS.SOLD_CARS;
  static FAVORITES_KEY = STORAGE_KEYS.FAVORITES;
  static CLIENT_COMP_KEY = STORAGE_KEYS.CLIENT_COMPARE;
  static ADMIN_COMP_KEY = STORAGE_KEYS.ADMIN_COMPARE;
  static RESERVATIONS_KEY = STORAGE_KEYS.RESERVATIONS;
  static INSPECTIONS_KEY = STORAGE_KEYS.INSPECTIONS;
  static TRADEIN_KEY = STORAGE_KEYS.TRADE_INS;
  static ARCHIVED_TRADEIN_KEY = STORAGE_KEYS.ARCHIVED_TRADE_INS;
  static CLIENT_RES_IDS_KEY = STORAGE_KEYS.CLIENT_RES_IDS;
  static CRM_KEY = STORAGE_KEYS.CRM_LEADS;
  static STAFF_FAVS_KEY = STORAGE_KEYS.STAFF_FAVS;
  static sessionViewedCars = new Set();

  static getDefaultCarsList() {
    return DEFAULT_CARS_DATA.map(c => new CarModel(c));
  }

  // Cars Inventory
  static getAllCars() {
    const saved = SafeStorage.get(this.KEY, null);
    if (!saved || !Array.isArray(saved)) {
      const defaults = this.getDefaultCarsList();
      this.saveAll(defaults, false);
      return defaults;
    }
    return saved.map(i => new CarModel(i));
  }

  static saveAll(cars, syncCloud = true) {
    SafeStorage.set(this.KEY, cars.map(c => (c instanceof CarModel ? c.toMap() : new CarModel(c).toMap())));
    if (syncCloud && window.FirebaseCloudService) {
      FirebaseCloudService.syncToCloud();
    }
  }

  static getSoldCars() {
    return (SafeStorage.get(this.SOLD_KEY, []) || []).map(i => new CarModel(i));
  }

  static saveSold(soldCars, syncCloud = true) {
    SafeStorage.set(this.SOLD_KEY, soldCars.map(c => (c instanceof CarModel ? c.toMap() : new CarModel(c).toMap())));
    if (syncCloud && window.FirebaseCloudService) {
      FirebaseCloudService.syncToCloud();
    }
  }

  static findCarAnywhere(id) {
    const targetId = String(id || '');
    const active = this.getAllCars().find(c => String(c.id) === targetId);
    if (active) return { car: active, isSold: false };
    const sold = this.getSoldCars().find(c => String(c.id) === targetId);
    if (sold) return { car: sold, isSold: true };
    return { car: null, isSold: false };
  }

  static addCar(car) {
    const cars = this.getAllCars();
    cars.unshift(car instanceof CarModel ? car : new CarModel(car));
    this.saveAll(cars, true);
    return cars;
  }

  static updateCar(updatedCar) {
    const nextCar = updatedCar instanceof CarModel ? updatedCar : new CarModel(updatedCar);
    const cars = this.getAllCars().map(c => (String(c.id) === String(nextCar.id) ? nextCar : c));
    this.saveAll(cars, true);
    return cars;
  }

  static deleteCar(id) {
    const targetId = String(id);
    const cars = this.getAllCars().filter(c => String(c.id) !== targetId);
    this.cleanOrphanedCarReferences(targetId);
    this.saveAll(cars, true);
    return cars;
  }

  static cleanOrphanedCarReferences(carId) {
    const targetId = String(carId);
    const cComp = (SafeStorage.get(this.CLIENT_COMP_KEY, []) || []).filter(id => String(id) !== targetId);
    const aComp = (SafeStorage.get(this.ADMIN_COMP_KEY, []) || []).filter(id => String(id) !== targetId);
    const favs = (SafeStorage.get(this.FAVORITES_KEY, []) || []).filter(id => String(id) !== targetId);
    const sFavs = (SafeStorage.get(this.STAFF_FAVS_KEY, []) || []).filter(item => String(item.carId) !== targetId);
    SafeStorage.set(this.CLIENT_COMP_KEY, cComp);
    SafeStorage.set(this.ADMIN_COMP_KEY, aComp);
    SafeStorage.set(this.FAVORITES_KEY, favs);
    SafeStorage.set(this.STAFF_FAVS_KEY, sFavs);
  }

  static markAsSold(id, approvedByAdmin, handledByStaff = null) {
    const cars = this.getAllCars();
    const soldCars = this.getSoldCars();
    const idx = cars.findIndex(c => String(c.id) === String(id));
    if (idx === -1) return false;

    const car = cars[idx];
    car.soldAt = new Date().toLocaleString('ar-EG');
    car.soldBy = approvedByAdmin;
    car.soldViaStaff = handledByStaff || approvedByAdmin;
    car.isReserved = false;
    soldCars.unshift(car);
    cars.splice(idx, 1);

    this.saveAll(cars, false);
    this.saveSold(soldCars, false);
    this.cleanOrphanedCarReferences(id);

    const resList = this.getReservations().map(r => {
      if (String(r.carId) === String(id) && r.status !== 'sold') {
        r.status = 'closed_car_sold';
      }
      return r;
    });
    this.updateReservations(resList);
    return true;
  }

  static incrementClientView(id) {
    const targetId = String(id);
    if (AuthService.isLogged() || this.sessionViewedCars.has(targetId)) return;
    this.sessionViewedCars.add(targetId);
    const now = new Date().toLocaleString('ar-EG');
    const cars = this.getAllCars().map(c => {
      if (String(c.id) === targetId) {
        c.viewsCount++;
        c.lastViewedAt = now;
      }
      return c;
    });
    this.saveAll(cars, true);
  }

  // Client Favorites
  static getFavorites() {
    const list = SafeStorage.get(this.FAVORITES_KEY, []);
    return Array.isArray(list) ? list : [];
  }

  static toggleFavorite(id) {
    const targetId = String(id);
    let favs = this.getFavorites();
    let cars = this.getAllCars();
    const isFav = favs.includes(targetId);
    if (isFav) {
      favs = favs.filter(f => f !== targetId);
      cars = cars.map(c => {
        if (String(c.id) === targetId && c.favoritesCount > 0) c.favoritesCount--;
        return c;
      });
    } else {
      favs.push(targetId);
      cars = cars.map(c => {
        if (String(c.id) === targetId) c.favoritesCount++;
        return c;
      });
    }
    SafeStorage.set(this.FAVORITES_KEY, favs);
    this.saveAll(cars, true);
    return !isFav;
  }

  // Compare (Separate lists for Client vs Admin)
  static getCompare(isAdmin) {
    const key = isAdmin ? this.ADMIN_COMP_KEY : this.CLIENT_COMP_KEY;
    const activeIds = new Set(this.getAllCars().map(c => String(c.id)));
    const rawList = SafeStorage.get(key, []) || [];
    const validComp = Array.isArray(rawList) ? rawList.map(String).filter(id => activeIds.has(id)) : [];
    SafeStorage.set(key, validComp);
    return validComp;
  }

  static toggleCompare(id, isAdmin) {
    const targetId = String(id);
    const key = isAdmin ? this.ADMIN_COMP_KEY : this.CLIENT_COMP_KEY;
    let comp = this.getCompare(isAdmin);
    if (comp.includes(targetId)) {
      comp = comp.filter(c => c !== targetId);
      SafeStorage.set(key, comp);
      return { ok: true, added: false };
    }
    if (comp.length >= 3) return { ok: false, added: false };
    comp.push(targetId);
    SafeStorage.set(key, comp);
    return { ok: true, added: true };
  }

  static clearCompare(isAdmin) {
    const key = isAdmin ? this.ADMIN_COMP_KEY : this.CLIENT_COMP_KEY;
    SafeStorage.set(key, []);
  }

  // Staff Watchlist (per-user legacy + unified Staff Favorites list)
  static getAdminWatchlist(username) {
    if (!username) return [];
    const activeIds = new Set(this.getAllCars().map(c => String(c.id)));
    const key = `${STORAGE_KEYS.WATCHLIST_PREFIX}${username}`;
    const raw = SafeStorage.get(key, []) || [];
    const list = Array.isArray(raw) ? raw.filter(item => item && activeIds.has(String(item.id))) : [];
    SafeStorage.set(key, list);
    return list;
  }

  static toggleAdminWatchlist(id, username, adminName) {
    if (!username) return false;
    const targetId = String(id);
    const key = `${STORAGE_KEYS.WATCHLIST_PREFIX}${username}`;
    let list = this.getAdminWatchlist(username);
    const exists = list.some(item => String(item.id) === targetId);
    if (exists) {
      list = list.filter(item => String(item.id) !== targetId);
      SafeStorage.set(key, list);
      return false;
    }
    list.push({ id: targetId, addedBy: adminName, addedAt: new Date().toLocaleString('ar-EG') });
    SafeStorage.set(key, list);
    return true;
  }

  static getStaffFavorites() {
    const list = SafeStorage.get(this.STAFF_FAVS_KEY, []);
    return Array.isArray(list) ? list : [];
  }

  static saveStaffFavorites(list, syncCloud = true) {
    SafeStorage.set(this.STAFF_FAVS_KEY, Array.isArray(list) ? list : []);
    if (syncCloud && window.FirebaseCloudService) {
      FirebaseCloudService.syncToCloud();
    }
  }

  static toggleStaffFavorite(carId, customNote = '', roleLabel = 'المدير العام') {
    const { car } = this.findCarAnywhere(carId);
    if (!car) return { ok: false, added: false, car: null };

    const list = this.getStaffFavorites();
    const existsIdx = list.findIndex(item => String(item.carId) === String(carId));
    if (existsIdx > -1 && !customNote) {
      list.splice(existsIdx, 1);
      this.saveStaffFavorites(list, true);
      return { ok: true, added: false, car };
    }

    const record = {
      carId: car.id,
      brand: car.brand,
      model: car.model,
      year: car.year,
      price: Number(car.price || 0),
      condition: car.paintStatus || 'مفحوصة',
      image: (car.images && car.images[0]) || car.imageUrl || DEFAULT_CAR_IMAGE,
      addedBy: roleLabel,
      note: customNote || `تمت إضافتها بواسطة ${roleLabel}`,
      date: new Date().toLocaleString('ar-EG')
    };

    if (existsIdx > -1) list[existsIdx] = record;
    else list.unshift(record);

    this.saveStaffFavorites(list, true);
    return { ok: true, added: true, car };
  }

  static clearStaffFavorites() {
    this.saveStaffFavorites([], true);
  }

  // Reservations
  static getReservations() {
    const list = SafeStorage.get(this.RESERVATIONS_KEY, []);
    return Array.isArray(list) ? list : [];
  }

  static updateReservations(list, syncCloud = true) {
    SafeStorage.set(this.RESERVATIONS_KEY, Array.isArray(list) ? list : []);
    if (syncCloud && window.FirebaseCloudService) {
      FirebaseCloudService.syncToCloud();
    }
  }

  static hasClientReservedCar(carId) {
    const myResIds = SafeStorage.get(this.CLIENT_RES_IDS_KEY, []) || [];
    const activeRes = this.getReservations().filter(r => r.status === 'pending_admin' || r.status === 'confirmed_by_staff');
    return myResIds.includes(carId) && activeRes.some(r => String(r.carId) === String(carId));
  }

  static addReservation(resObj, isClientSession = true) {
    const list = this.getReservations();
    const duplicate = list.find(r =>
      String(r.carId) === String(resObj.carId) &&
      r.clientPhone === resObj.clientPhone &&
      (r.status === 'pending_admin' || r.status === 'confirmed_by_staff')
    );
    if (duplicate) return false;
    list.unshift(resObj);
    this.updateReservations(list, true);
    if (isClientSession) {
      const myIds = SafeStorage.get(this.CLIENT_RES_IDS_KEY, []) || [];
      if (!myIds.includes(resObj.carId)) {
        myIds.push(resObj.carId);
        SafeStorage.set(this.CLIENT_RES_IDS_KEY, myIds);
      }
    }
    return true;
  }

  // Inspections
  static getInspections() {
    const list = SafeStorage.get(this.INSPECTIONS_KEY, []);
    return Array.isArray(list) ? list : [];
  }

  static updateInspections(list, syncCloud = true) {
    SafeStorage.set(this.INSPECTIONS_KEY, Array.isArray(list) ? list : []);
    if (syncCloud && window.FirebaseCloudService) {
      FirebaseCloudService.syncToCloud();
    }
  }

  static addInspection(inspObj) {
    const list = this.getInspections();
    const duplicate = list.find(i =>
      String(i.carId) === String(inspObj.carId) &&
      i.clientPhone === inspObj.clientPhone &&
      i.status === 'pending'
    );
    if (duplicate) return false;
    list.unshift(inspObj);
    this.updateInspections(list, true);
    return true;
  }

  // Trade-Ins & VIP Orders
  static getTradeIns() {
    const list = SafeStorage.get(this.TRADEIN_KEY, []);
    return Array.isArray(list) ? list : [];
  }

  static updateTradeIns(list, syncCloud = true) {
    SafeStorage.set(this.TRADEIN_KEY, Array.isArray(list) ? list : []);
    if (syncCloud && window.FirebaseCloudService) {
      FirebaseCloudService.syncToCloud();
    }
  }

  static addTradeIn(reqObj) {
    const list = this.getTradeIns();
    list.unshift(reqObj);
    this.updateTradeIns(list, true);
    return true;
  }

  static getArchivedTradeIns() {
    const list = SafeStorage.get(this.ARCHIVED_TRADEIN_KEY, []);
    return Array.isArray(list) ? list : [];
  }

  static updateArchivedTradeIns(list, syncCloud = true) {
    SafeStorage.set(this.ARCHIVED_TRADEIN_KEY, Array.isArray(list) ? list : []);
    if (syncCloud && window.FirebaseCloudService) {
      FirebaseCloudService.syncToCloud();
    }
  }

  static archiveTradeIn(id, adminName) {
    const tradeIns = this.getTradeIns();
    const archived = this.getArchivedTradeIns();
    const idx = tradeIns.findIndex(i => i.id === id);
    if (idx !== -1) {
      const item = tradeIns[idx];
      item.archivedAt = new Date().toLocaleString('ar-EG');
      item.archivedBy = adminName;
      archived.unshift(item);
      tradeIns.splice(idx, 1);
      SafeStorage.set(this.TRADEIN_KEY, tradeIns);
      this.updateArchivedTradeIns(archived, true);
    }
  }

  // Mini-CRM Leads
  static getCrmLeads() {
    const list = SafeStorage.get(this.CRM_KEY, []);
    return Array.isArray(list) ? list : [];
  }

  static saveCrmLeads(list, syncCloud = true) {
    SafeStorage.set(this.CRM_KEY, Array.isArray(list) ? list : []);
    if (syncCloud && window.FirebaseCloudService) {
      FirebaseCloudService.syncToCloud();
    }
  }

  static addCrmLead({ name, phone, interest, status, notes }) {
    const list = this.getCrmLeads();
    const record = {
      id: 'CRM-' + Date.now(),
      name: String(name || '').trim(),
      phone: String(phone || '').trim(),
      interest: String(interest || 'استفسار عام').trim(),
      status: status || CRM_STATUSES[0],
      notes: String(notes || '').trim() || 'تم تسجيل العميل للمتابعة',
      date: new Date().toLocaleString('ar-EG')
    };
    list.unshift(record);
    this.saveCrmLeads(list, true);
    if (window.FirebaseCloudService) {
      FirebaseCloudService.syncCrmDoc(record);
    }
    return record;
  }

  static updateCrmLeadStatus(id, newStatus) {
    const list = this.getCrmLeads();
    const idx = list.findIndex(i => i.id === id);
    if (idx === -1) return false;
    list[idx].status = newStatus;
    this.saveCrmLeads(list, true);
    if (window.FirebaseCloudService) {
      FirebaseCloudService.updateCrmDoc(id, { status: newStatus });
    }
    return true;
  }

  static deleteCrmLead(id) {
    const list = this.getCrmLeads().filter(i => i.id !== id);
    this.saveCrmLeads(list, true);
    if (window.FirebaseCloudService) {
      FirebaseCloudService.deleteCrmDoc(id);
    }
  }
}

window.CarRepository = CarRepository;
