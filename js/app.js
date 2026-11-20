/* ============================================================================
   Abu Bahaa Showroom - Main Application Controller (window.App v9)
   ============================================================================ */

window.App = {
  pendingSharedCarId: null,
  _toastTimer: null,

  init() {
    SafeStorage.sanitizeCorruptedStorage();
    AuthService.initDB();
    CarRepository.getAllCars();

    if (SafeStorage.get(STORAGE_KEYS.DARK_MODE, false)) {
      document.body.classList.add('dark-mode');
      const dmIcon = document.getElementById('dark-mode-icon');
      if (dmIcon) dmIcon.textContent = '☀️';
    }

    const sharedCarParam = new URLSearchParams(window.location.search).get('car');
    if (sharedCarParam) {
      this.pendingSharedCarId = sharedCarParam.trim();
    }

    this.syncAll();
    this.checkPendingSharedCar();
    FirebaseCloudService.init();

    const backdrop = document.getElementById('modal-backdrop');
    if (backdrop) {
      backdrop.addEventListener('click', (e) => {
        if (e.target === backdrop) this.closeModal();
      });
    }

    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape') {
        const confirmBackdrop = document.getElementById('confirm-backdrop');
        if (confirmBackdrop && !confirmBackdrop.classList.contains('hidden')) {
          confirmBackdrop.classList.add('hidden');
          confirmBackdrop.classList.remove('flex');
        } else if (AdminDrawerUI.isDrawerOpen) {
          AdminDrawerUI.closeDrawer();
        } else {
          this.closeModal();
        }
      }
    });
  },

  syncAll() {
    SafeStorage.sanitizeCorruptedStorage();
    CatalogUI.populateFilterDropdowns();
    CatalogUI.applyFilters();
    AdminDrawerUI.syncHeaderAndDrawer();
  },

  getDirectCarUrl(carId) {
    const cleanPath = window.location.pathname.replace(/index\.html$/i, '');
    const baseUrl = window.location.origin + cleanPath;
    return `${baseUrl}?car=${encodeURIComponent(carId)}`;
  },

  checkPendingSharedCar() {
    if (!this.pendingSharedCarId) return;
    const found = CarRepository.findCarAnywhere(this.pendingSharedCarId);
    if (found && found.car) {
      const targetId = this.pendingSharedCarId;
      this.pendingSharedCarId = null;
      if (window.history && window.history.replaceState) {
        window.history.replaceState({}, document.title, window.location.pathname);
      }
      setTimeout(() => this.openDetails(targetId), 150);
    }
  },

  toggleDarkMode() {
    const isDark = document.body.classList.toggle('dark-mode');
    SafeStorage.set(STORAGE_KEYS.DARK_MODE, isDark);
    const dmIcon = document.getElementById('dark-mode-icon');
    if (dmIcon) dmIcon.textContent = isDark ? '☀️' : '🌙';
    this.showToast(isDark ? '🌙 تم تفعيل الوضع الليلي الفاخر' : '☀️ تم تفعيل الوضع النهاري', 'info');
  },

  showToast(msg, type = 'info') {
    const t = document.getElementById('toast-notification');
    if (!t) return;
    const colors = {
      success: 'border-emerald-400 bg-slate-900 text-white',
      warning: 'border-amber-400 bg-slate-900 text-white',
      error: 'border-rose-500 bg-rose-950 text-white',
      info: 'border-blue-400 bg-slate-900 text-white'
    };
    t.className = `fixed bottom-24 sm:bottom-12 left-5 px-5 py-3 rounded-xl shadow-2xl transform transition-all duration-300 z-[70] font-bold text-xs sm:text-sm border-r-4 flex items-center gap-2 pointer-events-none no-print ${colors[type] || colors.info}`;
    t.textContent = msg;
    t.classList.remove('translate-y-24', 'opacity-0');
    clearTimeout(this._toastTimer);
    this._toastTimer = setTimeout(() => t.classList.add('translate-y-24', 'opacity-0'), 3200);
  },

  confirmAction(title, message, confirmText, confirmColorClass, onConfirm) {
    const backdrop = document.getElementById('confirm-backdrop');
    const box = document.getElementById('confirm-content-box');
    if (!backdrop || !box) return;
    box.innerHTML = `
      <div class="w-12 h-12 rounded-2xl bg-amber-100 text-amber-700 flex items-center justify-center text-2xl mx-auto font-black">⚠️</div>
      <h4 class="font-black text-base text-slate-900">${escapeHtml(title)}</h4>
      <p class="text-xs text-slate-500 leading-relaxed">${escapeHtml(message)}</p>
      <div class="flex gap-2 pt-2">
        <button id="confirm-yes-btn" type="button" class="flex-1 ${confirmColorClass} text-white font-black py-2.5 rounded-xl text-xs shadow transition">${escapeHtml(confirmText)}</button>
        <button id="confirm-no-btn" type="button" class="flex-1 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold py-2.5 rounded-xl text-xs transition">إلغاء</button>
      </div>
    `;
    backdrop.classList.remove('hidden');
    backdrop.classList.add('flex');

    const closeConfirm = () => {
      backdrop.classList.add('hidden');
      backdrop.classList.remove('flex');
    };
    document.getElementById('confirm-no-btn').onclick = closeConfirm;
    document.getElementById('confirm-yes-btn').onclick = () => {
      closeConfirm();
      if (onConfirm) onConfirm();
    };
  },

  openModalHtml(htmlContent) {
    const backdrop = document.getElementById('modal-backdrop');
    const box = document.getElementById('modal-content-box');
    if (!backdrop || !box) return;
    box.innerHTML = htmlContent;
    backdrop.classList.remove('hidden');
    backdrop.classList.add('flex');
  },

  closeModal() {
    const backdrop = document.getElementById('modal-backdrop');
    const box = document.getElementById('modal-content-box');
    if (backdrop) {
      backdrop.classList.add('hidden');
      backdrop.classList.remove('flex');
    }
    if (box) box.innerHTML = '';
  },

  printDocument() {
    PrintEngine.printCurrentModalA4();
  },

  whatsApp(phone, customText = '') {
    const cleanPhone = normalizePhoneForWhatsApp(phone);
    const isMobile = /Android|iPhone|iPad|iPod/i.test(navigator.userAgent);
    const url = isMobile
      ? `https://wa.me/${cleanPhone}${customText ? '?text=' + encodeURIComponent(customText) : ''}`
      : `https://web.whatsapp.com/send?phone=${cleanPhone}${customText ? '&text=' + encodeURIComponent(customText) : ''}`;
    this.showToast('💬 جاري فتح محادثة واتساب الرسمية...', 'success');
    window.open(url, '_blank', 'noopener,noreferrer');
  },

  whatsAppRes(resId) {
    const r = CarRepository.getReservations().find(item => item.id === resId);
    if (!r) return;
    this.whatsApp(r.clientPhone, `مرحباً أستاذ ${r.clientName}، نتواصل معك من ${DEALER_BRAND_NAME} بخصوص حجز سيارة ${r.carTitle}`);
  },

  whatsAppInsp(inspId) {
    const item = CarRepository.getInspections().find(i => i.id === inspId);
    if (!item) return;
    this.whatsApp(item.clientPhone, `مرحباً أستاذ ${item.clientName}، نؤكد معك موعد ${item.type} لسيارة ${item.carTitle} بتاريخ ${item.date}`);
  },

  whatsAppTradeIn(tiId) {
    const item = CarRepository.getTradeIns().find(i => i.id === tiId);
    if (!item) return;
    this.whatsApp(item.clientPhone, `مرحباً أستاذ ${item.clientName || ''}، نتواصل معك من قسم التثمين بـ ${DEALER_BRAND_NAME} بخصوص سيارتك ${item.brand} ${item.model}`);
  },

  handleCloudBadgeClick() {
    if (AuthService.isLogged()) {
      this.openCommandCenter('cloud');
    } else {
      this.showToast(
        FirebaseCloudService.isConnected
          ? '☁️ المعرض متصل بقاعدة بيانات elite-showroom السحابية مباشر!'
          : '💡 سجل دخول الإدارة لإدارة الاتصال السحابي.',
        'info'
      );
    }
  },

  toggleFav(id) {
    if (AuthService.isLogged()) {
      const addedWatch = CarRepository.toggleAdminWatchlist(id, AuthService.getUsername(), AuthService.getName());
      const resStaff = CarRepository.toggleStaffFavorite(id, '', AdminToolsUI.getCurrentStaffRoleName());
      this.syncAll();
      this.showToast(
        addedWatch || resStaff.added ? '⭐ تمت الإضافة إلى مفضلة الإدارة وقائمة متابعتك' : '⭐ تمت الإزالة من مفضلة الإدارة',
        'info'
      );
    } else {
      const added = CarRepository.toggleFavorite(id);
      this.syncAll();
      this.showToast(added ? '❤️ تمت إضافة السيارة إلى مفضلتك' : '🤍 تمت إزالة السيارة من مفضلتك', 'info');
    }
  },

  toggleCompare(id) {
    const isAdmin = AuthService.isLogged();
    const res = CarRepository.toggleCompare(id, isAdmin);
    if (!res.ok) {
      this.showToast('⚠️ الحد الأقصى للمقارنة هو 3 سيارات في نفس الوقت.', 'warning');
      return;
    }
    this.syncAll();
    this.showToast(res.added ? '⚖️ تمت إضافة السيارة لجدول المقارنة' : '⚖️ تمت إزالة السيارة من المقارنة', 'info');
  },

  async copyAdTextarea() {
    const val = document.getElementById('social-ad-textarea')?.value || '';
    if (await copyTextSilent(val)) {
      this.showToast('✅ تم نسخ نص الإعلان التسويقي جاهزاً للنشر!', 'success');
    }
  },

  // Delegations to CatalogUI
  applyFilters() { CatalogUI.applyFilters(); },
  setQuickFilter(type) { CatalogUI.setQuickFilter(type); },
  setBodyCategory(cat) { CatalogUI.setBodyCategory(cat); },
  toggleAdvancedFilters(force) { CatalogUI.toggleAdvancedFilters(force); },
  selectBrandQuickPill(b) { CatalogUI.selectBrandQuickPill(b); },
  resetFilters(silent) { CatalogUI.resetFilters(silent); },

  // Delegations to CarDetailsUI
  openDetails(id) { CarDetailsUI.openDetails(id); },
  openSoldDetails(id) { CarDetailsUI.openSoldDetails(id); },
  setGalleryImage(idx) { CarDetailsUI.setGalleryImage(idx); },
  applyInstallmentPreset(k) { CarDetailsUI.applyInstallmentPreset(k); },
  sendSmartCarWhatsApp(id) { CarDetailsUI.sendSmartCarWhatsApp(id); },
  toggleInlineTradeInBox() { CarDetailsUI.toggleInlineTradeInBox(); },
  toggleOwnershipCostsBox() { CarDetailsUI.toggleOwnershipCostsBox(); },
  calculateInlineTradeIn(id) { CarDetailsUI.calculateInlineTradeIn(id); },
  sendInlineTradeInWhatsApp(id) { CarDetailsUI.sendInlineTradeInWhatsApp(id); },
  shareCarNative(id) { CarDetailsUI.shareCarNative(id); },
  copySharePayload(onlyUrl) { CarDetailsUI.copySharePayload(onlyUrl); },
  openWindowStickerModal(id) { CarDetailsUI.openWindowStickerModal(id); },
  openInspectionCertificateModal(id) { CarDetailsUI.openInspectionCertificateModal(id); },
  openInstallmentPlansModal(id, pct) { CarDetailsUI.openInstallmentPlansModal(id, pct); },
  openSocialAdStudio(id) { CarDetailsUI.openSocialAdStudio(id); },

  // Delegations to CustomerModalsUI
  openCompareModal() { CustomerModalsUI.openCompareModal(); },
  clearCompareAll() { CustomerModalsUI.clearCompareAll(); },
  openClientFavModal() { CustomerModalsUI.openClientFavModal(); },
  openGeneralFinanceModal() { CustomerModalsUI.openGeneralFinanceModal(); },
  recalcGeneralFinance() { CustomerModalsUI.recalcGeneralFinance(); },
  sendGeneralFinanceWhatsApp() { CustomerModalsUI.sendGeneralFinanceWhatsApp(); },
  openTradeInModal() { CustomerModalsUI.openTradeInModal(); },
  openVipRequestModal(q) { CustomerModalsUI.openVipRequestModal(q); },
  openReserveModal(id) { CustomerModalsUI.openReserveModal(id); },
  openInspectionBookingModal(id) { CustomerModalsUI.openInspectionBookingModal(id); },
  submitVipAlertToCrm(e) { CustomerModalsUI.submitVipAlertToCrm(e); },
  toggleChat(state) { CustomerModalsUI.toggleChat(state); },
  quickChat(action) { CustomerModalsUI.quickChat(action); },
  runSmartMatchmaker() { CustomerModalsUI.runSmartMatchmaker(); },

  // Delegations to AdminDrawerUI
  openAdminDrawer() { AdminDrawerUI.openDrawer(); },
  closeAdminDrawer() { AdminDrawerUI.closeDrawer(); },
  toggleAdminDrawer() { AdminDrawerUI.toggleDrawer(); },
  openCommandCenter(tab) { AdminDrawerUI.openCommandCenter(tab); },
  saveFirebaseConfigFromUI() { AdminDrawerUI.saveFirebaseConfigFromUI(); },
  deleteAdminUser(u) { AdminDrawerUI.deleteAdminUser(u); },
  openAdminWatchlistModal() { AdminDrawerUI.openAdminWatchlistModal(); },
  openCarFormModal(id) { AdminDrawerUI.openCarFormModal(id); },
  handleCarFilesSelected(files) { AdminDrawerUI.handleCarFilesSelected(files); },
  removeTempThumb(idx) { AdminDrawerUI.removeTempThumb(idx); },
  deleteCar(id) { AdminDrawerUI.deleteCar(id); },
  directSellCar(id) { AdminDrawerUI.directSellCar(id); },
  confirmReservation(id) { AdminDrawerUI.confirmReservation(id); },
  rejectReservation(id) { AdminDrawerUI.rejectReservation(id); },
  approveSaleFromRes(id) { AdminDrawerUI.approveSaleFromRes(id); },
  rejectSaleFromRes(id) { AdminDrawerUI.rejectSaleFromRes(id); },
  completeInspection(id) { AdminDrawerUI.completeInspection(id); },
  deleteInspection(id) { AdminDrawerUI.deleteInspection(id); },
  archiveTradeIn(id) { AdminDrawerUI.archiveTradeIn(id); },
  deleteTradeIn(id, isArch) { AdminDrawerUI.deleteTradeIn(id, isArch); },
  handleAuthClick() { AdminDrawerUI.handleAuthClick(); },
  openLoginModal() { AdminDrawerUI.openLoginModal(); },

  // Delegations to AdminToolsUI
  openBankProformaModal(id) { AdminToolsUI.openBankProformaModal(id); },
  handleBankSelectChange(el) { AdminToolsUI.handleBankSelectChange(el); },
  syncBankQuoteCarChange() { AdminToolsUI.syncBankQuoteCarChange(); },
  recalcBankQuoteAmounts() { AdminToolsUI.recalcBankQuoteAmounts(); },
  sendBankQuoteWhatsApp() { AdminToolsUI.sendBankQuoteWhatsApp(); },
  printBankProformaInvoice() { AdminToolsUI.printBankProformaInvoice(); },
  openCrmManagerModal() { AdminToolsUI.openCrmManagerModal(); },
  addCrmLeadRecord() { AdminToolsUI.addCrmLeadRecord(); },
  updateCrmLeadStatus(id, st) { AdminToolsUI.updateCrmLeadStatus(id, st); },
  deleteCrmLeadRecord(id) { AdminToolsUI.deleteCrmLeadRecord(id); },
  openStaffFavoritesModal() { AdminToolsUI.openStaffFavoritesModal(); },
  toggleStaffFavoriteCar(id, note) { AdminToolsUI.toggleStaffFavoriteCar(id, note); },
  clearStaffFavorites() { AdminToolsUI.clearStaffFavorites(); },
  shareStaffFavoritesWhatsApp() { AdminToolsUI.shareStaffFavoritesWhatsApp(); },
  openPrintableContract(type, id) { AdminToolsUI.openPrintableContract(type, id); },
  refreshDocPreview() { AdminToolsUI.refreshDocPreview(); },
  exportExcelReport() { AdminToolsUI.exportExcelReport(); },
  exportExecutiveReport() { AdminToolsUI.exportExecutiveReport(); },
  exportDatabaseJson() { AdminToolsUI.exportDatabaseJson(); },
  triggerImportDatabaseJson() { AdminToolsUI.triggerImportDatabaseJson(); }
};

document.addEventListener('DOMContentLoaded', () => App.init());

if ('serviceWorker' in navigator) {
  window.addEventListener('load', async () => {
    try {
      const reg = await navigator.serviceWorker.register('./sw.js?v=9', { updateViaCache: 'none' });
      if (reg && reg.update) reg.update();
    } catch (err) {
      console.warn('PWA Service Worker Warning:', err);
    }
  });
}
