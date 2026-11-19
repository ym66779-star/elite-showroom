/* ============================================================================
   Abu Bahaa Showroom - Admin Drawer (RTL), Command Center, Car CRUD & Auth UI
   Strict RBAC Isolation: SuperAdmin vs Staff
   ============================================================================ */

const AdminDrawerUI = {
  activeCommandTab: 'overview',
  tempUploadedImages: [],
  isDrawerOpen: false,

  openDrawer() {
    if (!AuthService.isLogged()) return;
    this.syncHeaderAndDrawer();
    this.isDrawerOpen = true;
    const backdrop = document.getElementById('admin-drawer-backdrop');
    const drawer = document.getElementById('admin-drawer');
    if (backdrop) backdrop.classList.add('is-open');
    if (drawer) drawer.classList.add('is-open');
  },

  closeDrawer() {
    this.isDrawerOpen = false;
    const backdrop = document.getElementById('admin-drawer-backdrop');
    const drawer = document.getElementById('admin-drawer');
    if (backdrop) backdrop.classList.remove('is-open');
    if (drawer) drawer.classList.remove('is-open');
  },

  toggleDrawer() {
    if (this.isDrawerOpen) this.closeDrawer();
    else this.openDrawer();
  },

  /**
   * Keeps header quiet (max 4 visitor controls; single "لوحة الإدارة" button for Admin/Staff)
   * and populates the organized RTL Admin Drawer with RBAC isolation.
   */
  syncHeaderAndDrawer() {
    const isAdmin = AuthService.isLogged();
    const isSuperAdmin = AuthService.isSuperAdmin();
    const role = AuthService.getRole();
    const name = AuthService.getName();

    const cars = CarRepository.getAllCars();
    const soldCars = CarRepository.getSoldCars();
    const pendingRes = CarRepository.getReservations().filter(r => r.status === 'pending_admin' || r.status === 'confirmed_by_staff').length;
    const pendingInsp = CarRepository.getInspections().filter(i => i.status === 'pending').length;
    const pendingTi = CarRepository.getTradeIns().length;
    const totalTasks = pendingRes + pendingInsp + pendingTi;
    const crmCount = CarRepository.getCrmLeads().length;
    const staffFavCount = CarRepository.getStaffFavorites().length;

    const authBtn = document.getElementById('admin-auth-btn');
    const drawerBtn = document.getElementById('open-admin-drawer-btn');
    const drawerBadge = document.getElementById('drawer-tasks-badge');
    const footerInfo = document.getElementById('footer-session-info');
    const compTxt = document.getElementById('compare-btn-text');
    const favTxt = document.getElementById('client-fav-btn-text');
    const compCount = document.getElementById('compare-count');
    const favCount = document.getElementById('client-favorites-count');

    if (compTxt) compTxt.textContent = isAdmin ? 'مقارنة الإدارة' : 'المقارنة';
    if (favTxt) favTxt.textContent = isAdmin ? 'اهتمامات العملاء' : 'مفضلتي';
    if (compCount) compCount.textContent = CarRepository.getCompare(isAdmin).length;
    if (favCount) favCount.textContent = CarRepository.getFavorites().length;

    if (authBtn) {
      authBtn.classList.toggle('hidden', isAdmin);
      authBtn.classList.toggle('inline-flex', !isAdmin);
    }
    if (drawerBtn) {
      drawerBtn.classList.toggle('hidden', !isAdmin);
      drawerBtn.classList.toggle('inline-flex', isAdmin);
    }
    if (drawerBadge) {
      drawerBadge.textContent = String(totalTasks);
      drawerBadge.classList.toggle('hidden', totalTasks === 0);
    }
    if (footerInfo) {
      footerInfo.textContent = isAdmin
        ? `مسجل دخول: ${name} (${role === 'SuperAdmin' ? 'مدير عام' : 'مشرف'})`
        : 'وضع تصفح العميل';
    }

    if (!isAdmin) {
      this.closeDrawer();
      return;
    }

    const drawerBody = document.getElementById('admin-drawer-body');
    if (!drawerBody) return;

    drawerBody.innerHTML = `
      <div class="p-4 border-b border-slate-800 bg-slate-950/70 space-y-3">
        <div class="flex items-center justify-between">
          <div>
            <span class="inline-flex items-center gap-1 text-[10px] font-black px-2.5 py-0.5 rounded-full ${isSuperAdmin ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40' : 'bg-indigo-500/20 text-indigo-300 border border-indigo-400/40'}">
              ${isSuperAdmin ? '👑 المدير العام (SuperAdmin)' : '👤 مشرف مبيعات (Staff)'}
            </span>
            <h3 class="text-sm font-black text-white mt-1.5">${escapeHtml(name)}</h3>
          </div>
          <span class="text-[10px] font-bold px-2.5 py-1 rounded-full ${FirebaseCloudService.isConnected ? 'bg-emerald-500/15 text-emerald-300 border border-emerald-500/30' : 'bg-amber-500/15 text-amber-300 border border-amber-500/30'}">
            ${FirebaseCloudService.isConnected ? '☁️ سحابي حي' : '💾 محلي'}
          </span>
        </div>

        <div class="grid grid-cols-3 gap-2 text-center text-[11px]">
          <div class="bg-slate-900 border border-slate-800 rounded-xl p-2">
            <span class="block text-[10px] text-slate-400 font-bold">المتاح</span>
            <b class="text-amber-400 font-black text-sm">${cars.length}</b>
          </div>
          <div class="bg-slate-900 border border-slate-800 rounded-xl p-2">
            <span class="block text-[10px] text-slate-400 font-bold">المباع</span>
            <b class="text-emerald-400 font-black text-sm">${soldCars.length}</b>
          </div>
          <div class="bg-slate-900 border border-slate-800 rounded-xl p-2">
            <span class="block text-[10px] text-slate-400 font-bold">مهام معلقة</span>
            <b class="text-rose-400 font-black text-sm">${totalTasks}</b>
          </div>
        </div>
      </div>

      <div class="p-4 space-y-5 overflow-y-auto flex-grow custom-scroll">
        <div>
          <div class="drawer-section-label">إدارة المعرض والعمليات</div>
          <div class="space-y-2">
            <button type="button" onclick="App.closeAdminDrawer(); App.openCarFormModal();" class="drawer-nav-item is-primary">
              <span class="flex items-center gap-2"><span>➕</span><span>إضافة سيارة جديدة للمعرض</span></span>
              <span class="text-xs opacity-80">←</span>
            </button>
            <button type="button" onclick="App.closeAdminDrawer(); App.openCommandCenter('overview');" class="drawer-nav-item">
              <span class="flex items-center gap-2"><span>🎛️</span><span>مركز القيادة والإحصائيات</span></span>
              <span class="text-[10px] bg-amber-500 text-slate-950 font-black px-2 py-0.5 rounded-full">${totalTasks}</span>
            </button>
            <div class="grid grid-cols-2 gap-1.5 pt-0.5">
              <button type="button" onclick="App.closeAdminDrawer(); App.openCommandCenter('reservations');" class="drawer-nav-item !py-2 !px-2.5 !text-[11px]">
                <span>📋 الحجوزات</span><span class="text-amber-400 font-black">${pendingRes}</span>
              </button>
              <button type="button" onclick="App.closeAdminDrawer(); App.openCommandCenter('inspections');" class="drawer-nav-item !py-2 !px-2.5 !text-[11px]">
                <span>🚗 المعاينات</span><span class="text-amber-400 font-black">${pendingInsp}</span>
              </button>
              <button type="button" onclick="App.closeAdminDrawer(); App.openCommandCenter('tradein');" class="drawer-nav-item !py-2 !px-2.5 !text-[11px]">
                <span>🔄 الاستبدال</span><span class="text-amber-400 font-black">${pendingTi}</span>
              </button>
              <button type="button" onclick="App.closeAdminDrawer(); App.openCommandCenter('sold');" class="drawer-nav-item !py-2 !px-2.5 !text-[11px]">
                <span>🏷️ المباعة</span><span class="text-emerald-400 font-black">${soldCars.length}</span>
              </button>
            </div>
          </div>
        </div>

        <div>
          <div class="drawer-section-label">أدوات المبيعات والعملاء</div>
          <div class="space-y-2">
            <button type="button" onclick="App.closeAdminDrawer(); App.openBankProformaModal();" class="drawer-nav-item">
              <span class="flex items-center gap-2"><span>🏦</span><span>عرض سعر رسمي للبنك (A4)</span></span>
              <span class="text-[10px] text-slate-400">PDF/A4</span>
            </button>
            <button type="button" onclick="App.closeAdminDrawer(); App.openCrmManagerModal();" class="drawer-nav-item">
              <span class="flex items-center gap-2"><span>🗂️</span><span>متابعة العملاء (Mini-CRM)</span></span>
              <span class="text-[10px] bg-slate-800 text-amber-300 px-2 py-0.5 rounded-full">${crmCount}</span>
            </button>
            <button type="button" onclick="App.closeAdminDrawer(); App.openStaffFavoritesModal();" class="drawer-nav-item">
              <span class="flex items-center gap-2"><span>⭐</span><span>مفضلة المدير والمشرف</span></span>
              <span class="text-[10px] bg-slate-800 text-amber-300 px-2 py-0.5 rounded-full">${staffFavCount}</span>
            </button>
            <div class="grid grid-cols-2 gap-1.5">
              <button type="button" onclick="App.closeAdminDrawer(); App.openCompareModal();" class="drawer-nav-item !py-2 !px-2.5 !text-[11px]">
                <span>⚖️ مقارنة الإدارة</span>
              </button>
              <button type="button" onclick="App.closeAdminDrawer(); App.openClientFavModal();" class="drawer-nav-item !py-2 !px-2.5 !text-[11px]">
                <span>❤️ اهتمامات العملاء</span>
              </button>
            </div>
          </div>
        </div>

        ${isSuperAdmin ? `
          <div>
            <div class="drawer-section-label text-amber-400">الإدارة المالية والنظام (SuperAdmin)</div>
            <div class="space-y-2">
              <button type="button" onclick="App.closeAdminDrawer(); App.exportExcelReport();" class="drawer-nav-item">
                <span class="flex items-center gap-2"><span>📊</span><span>شيت Excel المحاسبي والأرباح</span></span>
                <span class="text-[10px] text-emerald-400">CSV</span>
              </button>
              <button type="button" onclick="App.closeAdminDrawer(); App.exportExecutiveReport();" class="drawer-nav-item">
                <span class="flex items-center gap-2"><span>📥</span><span>التقرير التنفيذي الشامل</span></span>
                <span class="text-[10px] text-slate-400">TXT</span>
              </button>
              <button type="button" onclick="App.closeAdminDrawer(); App.openCommandCenter('cloud');" class="drawer-nav-item">
                <span class="flex items-center gap-2"><span>👥</span><span>إدارة المشرفين و Firebase</span></span>
                <span class="text-[10px] text-amber-400">RBAC</span>
              </button>
              <div class="grid grid-cols-2 gap-1.5">
                <button type="button" onclick="App.closeAdminDrawer(); App.exportDatabaseJson();" class="drawer-nav-item !py-2 !px-2.5 !text-[11px]">
                  <span>💾 Backup (9)</span>
                </button>
                <button type="button" onclick="App.closeAdminDrawer(); App.triggerImportDatabaseJson();" class="drawer-nav-item !py-2 !px-2.5 !text-[11px]">
                  <span>📤 Restore</span>
                </button>
              </div>
            </div>
          </div>
        ` : `
          <div>
            <div class="drawer-section-label">السحابة والنسخ الاحتياطي</div>
            <div class="space-y-2">
              <button type="button" onclick="App.closeAdminDrawer(); App.openCommandCenter('cloud');" class="drawer-nav-item">
                <span class="flex items-center gap-2"><span>☁️</span><span>حالة Firebase وإعداداتها</span></span>
              </button>
              <button type="button" onclick="App.closeAdminDrawer(); App.exportDatabaseJson();" class="drawer-nav-item">
                <span class="flex items-center gap-2"><span>💾</span><span>تحميل نسخة احتياطية (JSON)</span></span>
              </button>
            </div>
          </div>
        `}
      </div>

      <div class="p-4 border-t border-slate-800 bg-slate-950/90">
        <button type="button" onclick="App.closeAdminDrawer(); App.handleAuthClick();" class="w-full bg-rose-600/90 hover:bg-rose-600 text-white text-xs font-black py-2.5 px-4 rounded-xl transition flex items-center justify-center gap-2 shadow">
          <span>🔓</span>
          <span>تسجيل الخروج</span>
        </button>
      </div>
    `;
  },

  openCommandCenter(tab = 'overview') {
    if (!AuthService.isLogged()) return;
    this.activeCommandTab = tab;
    const role = AuthService.getRole();
    const isSuperAdmin = role === 'SuperAdmin';

    const cars = CarRepository.getAllCars();
    const soldCars = CarRepository.getSoldCars();
    const reservations = CarRepository.getReservations();
    const activeRes = reservations.filter(r => r.status !== 'sold' && r.status !== 'closed_car_sold');
    const inspections = CarRepository.getInspections();
    const tradeIns = CarRepository.getTradeIns();
    const archivedTi = CarRepository.getArchivedTradeIns();

    const tabs = [
      { id: 'overview', label: '📊 الأداء والإحصائيات', count: null },
      { id: 'reservations', label: '📋 الحجوزات والمبيعات', count: activeRes.length },
      { id: 'inspections', label: '🚗 مواعيد المعاينات', count: inspections.filter(i => i.status === 'pending').length },
      { id: 'tradein', label: '🔄 الاستبدال والأرشيف', count: tradeIns.length },
      { id: 'sold', label: '🏷️ أرشيف المباعة', count: soldCars.length },
      { id: 'cloud', label: isSuperAdmin ? '⚙️ المشرفين و Firebase' : '☁️ حالة Firebase', count: null }
    ];

    let tabBodyHtml = '';

    if (tab === 'overview') {
      const allHistory = [...cars, ...soldCars];
      const totalViews = allHistory.reduce((s, c) => s + c.viewsCount, 0);
      const totalRev = soldCars.reduce((s, c) => s + c.price, 0);

      const brandViews = {};
      allHistory.forEach(c => { brandViews[c.brand] = (brandViews[c.brand] || 0) + c.viewsCount; });
      const maxBViews = Math.max(1, ...Object.values(brandViews));

      const staffMap = {};
      const ensureSt = (n) => {
        if (!n || n.includes('بانتظار')) return null;
        if (!staffMap[n]) staffMap[n] = { sales: 0, res: 0, insp: 0, ti: 0 };
        return staffMap[n];
      };
      soldCars.forEach(c => { const s = ensureSt(c.soldViaStaff || c.soldBy); if (s) s.sales++; });
      reservations.forEach(r => { if (r.status === 'confirmed_by_staff' || r.status === 'sold') { const s = ensureSt(r.handledBy); if (s) s.res++; } });
      inspections.forEach(i => { if (i.status === 'completed') { const s = ensureSt(i.handledBy); if (s) s.insp++; } });
      archivedTi.forEach(a => { const s = ensureSt(a.archivedBy); if (s) s.ti++; });

      tabBodyHtml = `
        <div class="space-y-6">
          <div class="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <div class="bg-slate-50 p-4 rounded-2xl border">
              <span class="text-xs text-slate-500 font-bold">إجمالي السيارات المتاحة</span>
              <h4 class="text-2xl font-black text-blue-950 mt-1">${cars.length}</h4>
            </div>
            <div class="bg-slate-50 p-4 rounded-2xl border">
              <span class="text-xs text-slate-500 font-bold">السيارات المباعة</span>
              <h4 class="text-2xl font-black text-emerald-600 mt-1">${soldCars.length}</h4>
            </div>
            <div class="bg-slate-50 p-4 rounded-2xl border">
              <span class="text-xs text-slate-500 font-bold">إجمالي المبيعات المحققة</span>
              <h4 class="text-lg font-black text-amber-600 mt-1">${totalRev.toLocaleString('ar-EG')} ج.م</h4>
              ${isSuperAdmin ? `
                <div class="mt-2 pt-2 border-t border-slate-200 text-[10px] space-y-0.5">
                  <div class="text-emerald-700 font-black">💰 صافي ربح المباع: ${soldCars.reduce((s, c) => s + c.expectedProfit, 0).toLocaleString('ar-EG')} ج.م</div>
                  <div class="text-blue-900 font-bold">📈 ربح المخزون المتوقع: ${cars.reduce((s, c) => s + c.expectedProfit, 0).toLocaleString('ar-EG')} ج.م</div>
                </div>
              ` : ''}
            </div>
            <div class="bg-slate-50 p-4 rounded-2xl border">
              <span class="text-xs text-slate-500 font-bold">مشاهدات العملاء الفعلية</span>
              <h4 class="text-2xl font-black text-indigo-900 mt-1">${totalViews}</h4>
            </div>
          </div>

          <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div class="bg-slate-50 p-4 rounded-2xl border">
              <h4 class="font-black text-sm text-slate-900 mb-3">🔥 الماركات الأكثر طلباً ومشاهدة</h4>
              <div class="space-y-3">
                ${Object.entries(brandViews).map(([b, v]) => `
                  <div>
                    <div class="flex justify-between text-xs font-bold mb-1"><span>${escapeHtml(b)}</span><span class="text-blue-900">${v} مشاهدة</span></div>
                    <div class="w-full bg-slate-200 h-2.5 rounded-full overflow-hidden">
                      <div class="bg-blue-900 h-full rounded-full" style="width:${Math.round((v / maxBViews) * 100)}%"></div>
                    </div>
                  </div>
                `).join('')}
              </div>
            </div>

            <div class="bg-slate-50 p-4 rounded-2xl border">
              <h4 class="font-black text-sm text-slate-900 mb-3">👥 تقييم إنجازات فريق المبيعات</h4>
              <div class="space-y-2.5">
                ${Object.keys(staffMap).length === 0 ? '<p class="text-xs text-slate-400 py-6 text-center font-bold">لا توجد عمليات مؤكدة بعد.</p>' :
                  Object.entries(staffMap).map(([stName, st]) => `
                    <div class="bg-white p-3 rounded-xl border text-xs flex justify-between items-center">
                      <div>
                        <p class="font-black text-slate-900">👤 ${escapeHtml(stName)}</p>
                        <p class="text-slate-500 mt-0.5">مبيعات: <b>${st.sales}</b> | حجوزات: <b>${st.res}</b> | معاينات: <b>${st.insp}</b> | استبدال: <b>${st.ti}</b></p>
                      </div>
                      <span class="bg-blue-100 text-blue-900 font-black px-2.5 py-1 rounded-lg">${st.sales + st.res + st.insp + st.ti} نقطة</span>
                    </div>
                  `).join('')}
              </div>
            </div>
          </div>

          <div class="flex flex-wrap justify-between items-center gap-2 pt-3 border-t">
            <button type="button" onclick="App.openAdminWatchlistModal()" class="bg-amber-100 hover:bg-amber-200 text-amber-900 text-xs font-black px-4 py-2.5 rounded-xl transition">⭐ فتح قائمة متابعتي الخاصة</button>
            <div class="flex flex-wrap gap-2">
              <button type="button" onclick="App.openStaffFavoritesModal()" class="bg-slate-900 hover:bg-slate-800 text-amber-400 text-xs font-black px-4 py-2.5 rounded-xl transition">⭐ مفضلة المدير والمشرف</button>
              <button type="button" onclick="App.exportExecutiveReport()" class="bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-black px-4 py-2.5 rounded-xl shadow transition">📥 تحميل التقرير التنفيذي الشامل (.txt)</button>
            </div>
          </div>
        </div>
      `;
    }

    if (tab === 'reservations') {
      tabBodyHtml = activeRes.length === 0
        ? '<p class="text-slate-400 py-12 text-center text-xs font-bold">لا توجد طلبات حجز معلقة حالياً.</p>'
        : `<div class="space-y-3">
            ${activeRes.map(r => `
              <div class="bg-slate-50 p-4 rounded-2xl border flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 text-xs">
                <div>
                  <h4 class="font-black text-slate-900 text-sm">🚗 ${escapeHtml(r.carTitle)}</h4>
                  <p class="text-blue-900 font-bold mt-1">العميل: ${escapeHtml(r.clientName)} | الهاتف: ${escapeHtml(r.clientPhone)}</p>
                  <p class="text-slate-600 mt-0.5">المشرف المتابع: <b class="text-indigo-700">${escapeHtml(r.handledBy)}</b> | ${escapeHtml(r.requestedAt)}</p>
                  <span class="inline-block mt-1 px-2.5 py-0.5 rounded-lg font-black ${r.status === 'confirmed_by_staff' ? 'bg-purple-100 text-purple-800' : 'bg-amber-100 text-amber-800'}">
                    ${r.status === 'confirmed_by_staff' ? '✓ حجز مؤكد (السيارة محجوزة بالمعرض)' : '⏳ بانتظار تأكيد المشرف'}
                  </span>
                </div>
                <div class="flex flex-wrap gap-2">
                  <button type="button" onclick="App.whatsAppRes('${escapeHtml(r.id)}')" class="bg-emerald-100 hover:bg-emerald-200 text-emerald-800 px-3 py-2 rounded-xl font-bold">💬 واتساب</button>
                  <button type="button" onclick="App.openPrintableContract('RESERVATION', '${escapeHtml(r.id)}')" class="bg-slate-900 hover:bg-slate-800 text-amber-400 px-3 py-2 rounded-xl font-black shadow">📄 إيصال عربون (A4)</button>
                  ${r.status === 'pending_admin' ? `
                    <button type="button" onclick="App.confirmReservation('${escapeHtml(r.id)}')" class="bg-purple-700 hover:bg-purple-600 text-white px-3.5 py-2 rounded-xl font-bold shadow">تأكيد الحجز</button>
                    <button type="button" onclick="App.rejectReservation('${escapeHtml(r.id)}')" class="bg-rose-100 hover:bg-rose-200 text-rose-700 px-3 py-2 rounded-xl font-bold">رفض</button>
                  ` : ''}
                  ${isSuperAdmin && r.status === 'confirmed_by_staff' ? `
                    <button type="button" onclick="App.approveSaleFromRes('${escapeHtml(r.id)}')" class="bg-emerald-700 hover:bg-emerald-600 text-white px-3.5 py-2 rounded-xl font-black shadow">🏷️ اعتماد البيع النهائي</button>
                    <button type="button" onclick="App.rejectSaleFromRes('${escapeHtml(r.id)}')" class="bg-rose-600 hover:bg-rose-500 text-white px-3 py-2 rounded-xl font-bold">إلغاء الحجز</button>
                  ` : ''}
                </div>
              </div>
            `).join('')}
          </div>`;
    }

    if (tab === 'inspections') {
      tabBodyHtml = inspections.length === 0
        ? '<p class="text-slate-400 py-12 text-center text-xs font-bold">لا توجد مواعيد معاينة مسجلة حالياً.</p>'
        : `<div class="space-y-3">
            ${inspections.map(item => `
              <div class="bg-slate-50 p-4 rounded-2xl border flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 text-xs">
                <div>
                  <h4 class="font-black text-slate-900 text-sm">🚗 ${escapeHtml(item.carTitle)}</h4>
                  <p class="text-cyan-800 font-bold mt-1">${escapeHtml(item.type)} | التاريخ: <b>${escapeHtml(item.date)}</b></p>
                  <p class="text-slate-700 mt-0.5">العميل: <b>${escapeHtml(item.clientName)}</b> (${escapeHtml(item.clientPhone)}) | المشرف: ${escapeHtml(item.handledBy)}</p>
                </div>
                <div class="flex flex-wrap items-center gap-2">
                  <button type="button" onclick="App.whatsAppInsp('${escapeHtml(item.id)}')" class="bg-emerald-100 text-emerald-800 px-3 py-1.5 rounded-xl font-bold">💬 واتساب</button>
                  ${item.status !== 'completed' ? `
                    <button type="button" onclick="App.completeInspection('${escapeHtml(item.id)}')" class="bg-teal-600 hover:bg-teal-500 text-white px-3.5 py-2 rounded-xl font-bold shadow">✓ تأكيد الإتمام</button>
                  ` : `<span class="bg-emerald-100 text-emerald-800 px-3 py-1.5 rounded-xl font-black">مكتملة ✓</span>`}
                  <button type="button" onclick="App.deleteInspection('${escapeHtml(item.id)}')" class="bg-rose-100 text-rose-700 px-2.5 py-1.5 rounded-xl font-bold">🗑️</button>
                </div>
              </div>
            `).join('')}
          </div>`;
    }

    if (tab === 'tradein') {
      tabBodyHtml = `
        <div class="space-y-6">
          <div>
            <h4 class="font-black text-sm text-indigo-950 mb-3">📥 طلبات الاستبدال والتثمين الجديدة (${tradeIns.length})</h4>
            ${tradeIns.length === 0 ? '<p class="text-xs text-slate-400 py-4 text-center bg-slate-50 rounded-xl border">لا توجد طلبات استبدال معلقة.</p>' : `
              <div class="space-y-2.5">
                ${tradeIns.map(item => `
                  <div class="bg-slate-50 p-4 rounded-2xl border flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 text-xs">
                    <div>
                      <h5 class="font-black text-slate-900 text-sm">🚗 ${escapeHtml(item.brand)} ${escapeHtml(item.model)} (${escapeHtml(item.year)}) - <span class="text-amber-700">${escapeHtml(item.type)}</span></h5>
                      <p class="text-slate-700 mt-1">العداد: ${escapeHtml(item.km || '0')} كم | العميل: <b>${escapeHtml(item.clientName || 'عميل')}</b> (${escapeHtml(item.clientPhone)})</p>
                      <p class="text-slate-500 mt-0.5">${escapeHtml(item.desc || '')}</p>
                    </div>
                    <div class="flex gap-2">
                      <button type="button" onclick="App.whatsAppTradeIn('${escapeHtml(item.id)}')" class="bg-emerald-100 text-emerald-800 px-3 py-2 rounded-xl font-bold">💬 واتساب</button>
                      <button type="button" onclick="App.archiveTradeIn('${escapeHtml(item.id)}')" class="bg-indigo-700 text-white px-3 py-2 rounded-xl font-bold">✓ أرشفة</button>
                      <button type="button" onclick="App.deleteTradeIn('${escapeHtml(item.id)}', false)" class="bg-rose-100 text-rose-700 px-2.5 py-2 rounded-xl font-bold">🗑️</button>
                    </div>
                  </div>
                `).join('')}
              </div>
            `}
          </div>

          <div class="pt-4 border-t">
            <h4 class="font-black text-sm text-slate-700 mb-3">📂 أرشيف الاستبدال المكتمل (${archivedTi.length})</h4>
            ${archivedTi.length === 0 ? '<p class="text-xs text-slate-400 py-4 text-center">الأرشيف فارغ.</p>' : `
              <div class="space-y-2">
                ${archivedTi.map(item => `
                  <div class="bg-white p-3 rounded-xl border flex justify-between items-center text-xs">
                    <div>
                      <span class="font-black text-slate-900">${escapeHtml(item.brand)} ${escapeHtml(item.model)} (${escapeHtml(item.type)})</span>
                      <span class="text-slate-500 mx-2">| العميل: ${escapeHtml(item.clientName || 'عميل')}</span>
                      <span class="text-emerald-700 font-bold">✓ بواسطة: ${escapeHtml(item.archivedBy)}</span>
                    </div>
                    <button type="button" onclick="App.deleteTradeIn('${escapeHtml(item.id)}', true)" class="text-rose-600 font-bold hover:underline">حذف</button>
                  </div>
                `).join('')}
              </div>
            `}
          </div>
        </div>
      `;
    }

    if (tab === 'sold') {
      tabBodyHtml = soldCars.length === 0
        ? '<p class="text-slate-400 py-12 text-center text-xs font-bold">لا توجد سيارات مباعة في الأرشيف بعد.</p>'
        : `<div class="grid grid-cols-1 md:grid-cols-2 gap-3">
            ${soldCars.map(c => `
              <div onclick="App.openSoldDetails('${escapeHtml(c.id)}')" class="bg-slate-50 p-3.5 rounded-2xl border border-emerald-200 flex gap-3 items-center cursor-pointer hover:bg-white transition">
                <img src="${escapeHtml(c.imageUrl)}" onerror="this.src='${DEFAULT_CAR_IMAGE}'" class="w-20 h-16 object-cover rounded-xl shrink-0" />
                <div class="text-xs flex-grow">
                  <h4 class="font-black text-slate-900">${escapeHtml(c.brand)} ${escapeHtml(c.model)} (${c.year})</h4>
                  <p class="text-blue-900 font-black">${c.formattedPrice}</p>
                  <p class="text-emerald-700 font-bold text-[11px]">🏷️ ${escapeHtml(c.soldAt)} | بواسطة: ${escapeHtml(c.soldViaStaff || c.soldBy)}</p>
                </div>
              </div>
            `).join('')}
          </div>`;
    }

    if (tab === 'cloud') {
      const savedCfg = FirebaseCloudService.getSavedConfig();
      const admins = AuthService.getAdmins();
      const currentUsername = AuthService.getUsername();

      tabBodyHtml = `
        <div class="grid grid-cols-1 lg:grid-cols-2 gap-6 text-xs">
          <div class="bg-slate-50 p-4 rounded-2xl border space-y-3">
            <div class="flex items-center justify-between">
              <h4 class="font-black text-sm text-blue-950 flex items-center gap-1.5"><span>☁️</span> الربط السحابي (elite-showroom)</h4>
              <span class="px-2.5 py-0.5 rounded-full font-black text-[10px] ${FirebaseCloudService.isConnected ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-800'}">
                ${FirebaseCloudService.isConnected ? 'متصل الآن بـ Firestore ✓' : 'غير متصل'}
              </span>
            </div>
            <p class="text-slate-500 leading-relaxed">تم تثبيت إعدادات مشروعك <b>elite-showroom</b> بشكل افتراضي. يقبل الحقل صيغة JSON أو كود JavaScript (<code class="font-mono">firebaseConfig</code>):</p>
            <textarea id="firebase-config-input" dir="ltr" class="w-full border rounded-xl p-3 font-mono text-[11px] h-32 bg-white">${savedCfg ? escapeHtml(JSON.stringify(savedCfg, null, 2)) : ''}</textarea>
            <div class="flex gap-2">
              <button type="button" onclick="App.saveFirebaseConfigFromUI()" class="flex-1 bg-blue-900 hover:bg-blue-800 text-white font-black py-2.5 rounded-xl shadow transition">⚡ حفظ ومزامنة سحابية فورية</button>
              ${FirebaseCloudService.isConnected ? `<button type="button" onclick="FirebaseCloudService.disconnect(); App.openCommandCenter('cloud');" class="bg-rose-100 text-rose-700 font-bold px-3 py-2.5 rounded-xl">فصل مؤقت</button>` : ''}
            </div>
            <div class="pt-3 border-t flex flex-wrap justify-between items-center gap-2">
              <span class="text-slate-600 font-bold">النسخة الاحتياطية الكاملة (9 جداول):</span>
              <div class="flex items-center gap-1.5 flex-wrap">
                <button type="button" onclick="App.exportDatabaseJson()" class="bg-slate-200 hover:bg-slate-300 text-slate-900 font-black px-3 py-1.5 rounded-lg transition">💾 تحميل Backup JSON</button>
                ${isSuperAdmin ? `
                  <button id="import-db-json-btn" type="button" onclick="App.triggerImportDatabaseJson()" class="bg-amber-500 hover:bg-amber-400 text-slate-950 font-black px-3 py-1.5 rounded-lg transition shadow-sm">📤 استعادة نسخة (Restore)</button>
                ` : ''}
              </div>
            </div>
          </div>

          <div class="bg-slate-50 p-4 rounded-2xl border space-y-3">
            <h4 class="font-black text-sm text-slate-900">👥 إدارة فريق المشرفين والصلاحيات</h4>
            ${!isSuperAdmin ? '<p class="text-amber-800 bg-amber-50 p-3 rounded-xl font-bold border border-amber-200">🔒 إدارة حسابات المشرفين واستعادة النسخ الاحتياطية مخصصة للمدير العام فقط.</p>' : `
              <div class="space-y-2 max-h-40 overflow-y-auto custom-scroll">
                ${admins.map(a => `
                  <div class="bg-white p-2.5 rounded-xl border flex justify-between items-center">
                    <div>
                      <span class="font-black text-slate-900">${escapeHtml(a.name)}</span>
                      <span class="text-slate-400 mx-1">(@${escapeHtml(a.username)})</span>
                      <span class="bg-blue-50 text-blue-900 px-2 py-0.5 rounded font-bold text-[10px]">${a.role === 'SuperAdmin' ? 'مدير عام' : 'مشرف'}</span>
                    </div>
                    ${a.username !== 'admin' && a.username !== currentUsername ? `<button type="button" onclick="App.deleteAdminUser('${escapeHtml(a.username)}')" class="text-rose-600 font-bold hover:underline">حذف</button>` : '<span class="text-[10px] text-slate-400">أساسي</span>'}
                  </div>
                `).join('')}
              </div>
              <form id="cmd-add-admin-form" class="space-y-2 pt-2 border-t">
                <input id="new-name" required placeholder="اسم المشرف الجديد" class="w-full border p-2 rounded-xl bg-white" />
                <div class="grid grid-cols-2 gap-2">
                  <input id="new-user" required placeholder="Username" class="w-full border p-2 rounded-xl bg-white" />
                  <input id="new-pass" required type="password" placeholder="كلمة المرور" class="w-full border p-2 rounded-xl bg-white" />
                </div>
                <select id="new-role" class="w-full border p-2 rounded-xl font-bold bg-white">
                  <option value="Staff">مشرف مبيعات</option>
                  <option value="SuperAdmin">مدير عام</option>
                </select>
                <button type="submit" class="w-full bg-slate-900 text-amber-400 font-black py-2 rounded-xl">➕ إضافة المشرف</button>
              </form>
            `}
          </div>
        </div>
      `;
    }

    App.openModalHtml(`
      <div class="bg-white rounded-3xl max-w-5xl w-full p-5 sm:p-7 shadow-2xl relative max-h-[92vh] overflow-y-auto custom-scroll">
        <div class="flex justify-between items-center border-b pb-4 mb-4">
          <div>
            <h3 class="font-black text-lg sm:text-xl text-slate-900 flex items-center gap-2"><span>🎛️</span> مركز قيادة ${escapeHtml(DEALER_BRAND_NAME)}</h3>
            <p class="text-xs text-slate-500">تحكم مركزي كامل في المخزون، المبيعات، الفريق، والربط السحابي بمشروع elite-showroom</p>
          </div>
          <button type="button" onclick="App.closeModal()" class="bg-slate-200 hover:bg-slate-300 text-slate-900 w-9 h-9 rounded-full font-black text-sm flex items-center justify-center">✕</button>
        </div>

        <div class="flex items-center gap-1.5 overflow-x-auto pb-3 mb-5 border-b custom-scroll">
          ${tabs.map(t => `
            <button type="button" onclick="App.openCommandCenter('${t.id}')" class="px-3.5 py-2 rounded-xl text-xs font-black whitespace-nowrap transition flex items-center gap-1.5 ${this.activeCommandTab === t.id ? 'bg-blue-950 text-amber-400 shadow-sm' : 'bg-slate-100 hover:bg-slate-200 text-slate-700'}">
              <span>${t.label}</span>
              ${t.count !== null ? `<span class="px-1.5 py-0.5 rounded-full text-[10px] ${this.activeCommandTab === t.id ? 'bg-amber-400 text-slate-950' : 'bg-slate-300 text-slate-800'}">${t.count}</span>` : ''}
            </button>
          `).join('')}
        </div>

        <div>${tabBodyHtml}</div>
      </div>
    `);

    const addAdminForm = document.getElementById('cmd-add-admin-form');
    if (addAdminForm) {
      addAdminForm.onsubmit = (e) => {
        e.preventDefault();
        const res = AuthService.addAdmin({
          name: document.getElementById('new-name').value,
          username: document.getElementById('new-user').value,
          pass: document.getElementById('new-pass').value,
          role: document.getElementById('new-role').value
        });
        if (!res.ok) {
          App.showToast(res.reason === 'duplicate' ? '⚠️ اسم المستخدم مسجل بالفعل!' : '🔒 غير مصرح لك.', 'warning');
          return;
        }
        this.openCommandCenter('cloud');
        App.showToast('✅ تم إضافة المشرف الجديد ومزامنته مع السحابة!', 'success');
      };
    }
  },

  async saveFirebaseConfigFromUI() {
    if (!AuthService.isLogged()) return;
    const raw = (document.getElementById('firebase-config-input')?.value || '').trim();
    try {
      const parsed = FirebaseCloudService.parseConfigText(raw);
      await FirebaseCloudService.connect(parsed, true);
      await FirebaseCloudService.syncToCloud();
      this.openCommandCenter('cloud');
    } catch (e) {
      App.showToast('❌ صيغة الإعدادات غير صحيحة، تأكد من وجود apiKey و projectId.', 'error');
    }
  },

  deleteAdminUser(username) {
    if (!AuthService.isSuperAdmin()) {
      App.showToast('🔒 هذه الصلاحية للمدير العام فقط.', 'error');
      return;
    }
    if (AuthService.deleteAdmin(username)) {
      this.openCommandCenter('cloud');
      App.showToast('🗑️ تم حذف حساب المشرف.', 'warning');
    }
  },

  openAdminWatchlistModal() {
    if (!AuthService.isLogged()) return;
    const username = AuthService.getUsername();
    const wl = CarRepository.getAdminWatchlist(username);
    const cars = CarRepository.getAllCars().filter(c => wl.some(w => String(w.id) === String(c.id)));

    App.openModalHtml(`
      <div class="bg-white rounded-3xl max-w-2xl w-full p-6 shadow-2xl relative max-h-[90vh] overflow-y-auto custom-scroll">
        <button type="button" onclick="App.closeModal()" class="absolute top-4 left-4 bg-slate-200 hover:bg-slate-300 text-slate-900 w-8 h-8 rounded-full font-black text-sm flex items-center justify-center">✕</button>
        <h3 class="font-black text-lg mb-1 text-amber-700">⭐ قائمة متابعتي الخاصة (${escapeHtml(AuthService.getName())})</h3>
        <p class="text-xs text-slate-500 mb-4">قائمة خاصة بك لمتابعة السيارات المهمة لعملائك.</p>

        ${cars.length === 0 ? '<p class="text-slate-400 py-10 text-center text-xs font-bold">لم تقم بإضافة سيارات لقائمة متابعتك بعد.</p>' : `
          <div class="space-y-3">
            ${cars.map(c => `
              <div class="bg-slate-50 p-3 rounded-2xl border flex justify-between items-center gap-3 text-xs">
                <div onclick="App.openDetails('${escapeHtml(c.id)}')" class="flex gap-3 items-center cursor-pointer flex-grow">
                  <img src="${escapeHtml(c.imageUrl)}" onerror="this.src='${DEFAULT_CAR_IMAGE}'" class="w-16 h-12 object-cover rounded-xl" />
                  <div>
                    <h4 class="font-black text-slate-900">${escapeHtml(c.brand)} ${escapeHtml(c.model)}</h4>
                    <p class="text-blue-900 font-bold">${c.formattedPrice}</p>
                  </div>
                </div>
                <button type="button" onclick="App.toggleFav('${escapeHtml(c.id)}'); App.openAdminWatchlistModal();" class="bg-rose-100 hover:bg-rose-200 text-rose-700 px-3 py-1.5 rounded-xl font-bold">إزالة</button>
              </div>
            `).join('')}
          </div>
        `}
      </div>
    `);
  },

  // Car Upsert Modal (Add / Edit)
  openCarFormModal(editCarId = null) {
    if (!AuthService.isLogged()) return;
    const existing = editCarId ? CarRepository.getAllCars().find(c => String(c.id) === String(editCarId)) : null;
    const isEdit = Boolean(existing);
    const isSuperAdmin = AuthService.isSuperAdmin();
    this.tempUploadedImages = isEdit && Array.isArray(existing.images) ? [...existing.images] : [];
    const initialExternalUrl = (isEdit && existing.imageUrl && !existing.imageUrl.startsWith('data:')) ? existing.imageUrl : '';

    App.openModalHtml(`
      <div class="bg-white rounded-3xl max-w-xl w-full p-6 shadow-2xl relative max-h-[92vh] overflow-y-auto custom-scroll">
        <button type="button" onclick="App.closeModal()" class="absolute top-4 left-4 bg-slate-200 hover:bg-slate-300 text-slate-900 w-8 h-8 rounded-full font-black text-sm flex items-center justify-center">✕</button>
        <h3 class="font-black text-lg text-slate-900 mb-1">${isEdit ? '✏️ تعديل بيانات السيارة وألبوم الصور' : '➕ إضافة سيارة جديدة للمعرض'}</h3>
        <p class="text-xs text-slate-500 mb-4">أضف المواصفات، السعر، حالة الفابريكة، وألبوم الصور ليتم حفظها سحابياً</p>

        <form id="car-upsert-form" class="space-y-3 text-xs">
          <div class="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label class="block font-bold text-slate-700 mb-1">الماركة *</label>
              <input id="cf-brand" required value="${isEdit ? escapeHtml(existing.brand) : ''}" placeholder="مثال: مرسيدس بنز" class="w-full border p-2.5 rounded-xl" />
            </div>
            <div>
              <label class="block font-bold text-slate-700 mb-1">الموديل والفئة *</label>
              <input id="cf-model" required value="${isEdit ? escapeHtml(existing.model) : ''}" placeholder="مثال: C200 AMG" class="w-full border p-2.5 rounded-xl" />
            </div>
          </div>

          <div class="grid grid-cols-3 gap-2.5">
            <div>
              <label class="block font-bold text-slate-700 mb-1">سنة الصنع *</label>
              <input id="cf-year" required type="number" min="1990" max="2027" value="${isEdit ? existing.year : 2025}" class="w-full border p-2.5 rounded-xl text-center font-bold" />
            </div>
            <div>
              <label class="block font-bold text-slate-700 mb-1">العداد (كم) *</label>
              <input id="cf-km" required type="number" min="0" value="${isEdit ? existing.mileageKm : 0}" class="w-full border p-2.5 rounded-xl text-center font-bold" />
            </div>
            <div>
              <label class="block font-bold text-slate-700 mb-1">أقصى شهور تقسيط</label>
              <input id="cf-months" required type="number" min="6" max="120" value="${isEdit ? existing.maxInstallmentMonths : 60}" class="w-full border p-2.5 rounded-xl text-center font-bold" />
            </div>
          </div>

          <div class="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
            <div>
              <label class="block font-bold text-slate-700 mb-1">السعر النقدي الحالي (ج.م) *</label>
              <input id="cf-price" required type="number" min="50000" value="${isEdit ? existing.price : ''}" placeholder="مثال: 2500000" class="w-full border p-2.5 rounded-xl font-black text-blue-900" />
            </div>
            <div>
              <label class="block font-bold text-rose-700 mb-1">السعر السابق قبل الخصم (اختياري)</label>
              <input id="cf-old-price" type="number" min="0" value="${isEdit && existing.oldPrice ? existing.oldPrice : ''}" placeholder="لإظهار شارة خصم 🔥" class="w-full border p-2.5 rounded-xl font-bold text-rose-700" />
            </div>
            <div>
              <label class="block font-bold text-slate-700 mb-1">رقم واتساب المسؤول</label>
              <input id="cf-phone" required value="${isEdit ? escapeHtml(existing.dealerPhone) : DEFAULT_DEALER_PHONE}" placeholder="${DEFAULT_DEALER_PHONE}" class="w-full border p-2.5 rounded-xl" />
            </div>
          </div>

          ${isSuperAdmin ? `
            <div class="bg-slate-900 text-white p-3.5 rounded-2xl border border-amber-400/50 space-y-2 always-dark">
              <label class="block font-black text-amber-400">🔐 التكلفة السرية وحد التفاوض المسموح (تظهر للمدير العام فقط):</label>
              <div class="grid grid-cols-1 sm:grid-cols-3 gap-2">
                <div>
                  <span class="block text-[10px] text-slate-300 font-bold mb-1">سعر شراء السيارة (ج.م)</span>
                  <input id="cf-purchase-cost" type="number" min="0" value="${isEdit ? existing.purchaseCost : ''}" placeholder="تلقائي (90%)" class="w-full border border-slate-700 p-2 rounded-xl bg-slate-950 text-white font-bold" />
                </div>
                <div>
                  <span class="block text-[10px] text-slate-300 font-bold mb-1">مصاريف التجهيز (ج.م)</span>
                  <input id="cf-prep-cost" type="number" min="0" value="${isEdit ? existing.prepCost : 15000}" placeholder="15000" class="w-full border border-slate-700 p-2 rounded-xl bg-slate-950 text-white font-bold" />
                </div>
                <div>
                  <span class="block text-[10px] text-amber-300 font-bold mb-1">أقل سعر بيع مسموح للمشرف</span>
                  <input id="cf-min-allowed-price" type="number" min="0" value="${isEdit ? existing.minAllowedPrice : ''}" placeholder="تلقائي (97%)" class="w-full border border-slate-700 p-2 rounded-xl bg-slate-950 text-amber-300 font-black" />
                </div>
              </div>
            </div>
          ` : ''}

          <div class="bg-emerald-50/70 p-3.5 rounded-2xl border border-emerald-200 space-y-2">
            <label class="block font-black text-emerald-950">🛡️ حالة الفابريكة والدهان التفصيلية:</label>
            <div class="grid grid-cols-1 sm:grid-cols-2 gap-2">
              <select id="cf-paint-status" class="w-full border p-2 rounded-xl font-black bg-white text-slate-800">
                ${PAINT_STATUS_OPTIONS.map(opt => `
                  <option value="${escapeHtml(opt.value)}" ${isEdit && existing.paintStatus === opt.value ? 'selected' : ''}>${escapeHtml(opt.label)}</option>
                `).join('')}
              </select>
              <input id="cf-paint-details" value="${isEdit ? escapeHtml(existing.paintDetails) : ''}" placeholder="تفصيل الدهان (مثال: فابريكة بالكامل بدون ملاحظات)" class="w-full border p-2 rounded-xl bg-white" />
            </div>
          </div>

          <div class="bg-blue-50/70 p-3.5 rounded-2xl border border-blue-200 space-y-2">
            <div class="flex justify-between items-center">
              <label class="font-black text-blue-950">📷 ألبوم صور السيارة (ضغط WebP فوري أو رابط):</label>
              <span id="upload-status-text" class="text-[10px] font-bold text-blue-800"></span>
            </div>
            <input id="cf-file-input" type="file" accept="image/*" multiple onchange="App.handleCarFilesSelected(this.files)" class="w-full text-xs file:ml-3 file:py-1.5 file:px-3 file:rounded-xl file:border-0 file:text-xs file:font-black file:bg-blue-900 file:text-white hover:file:bg-blue-800 cursor-pointer" />
            <div id="upload-progress-bar-wrap" class="hidden w-full bg-slate-200 h-2 rounded-full overflow-hidden">
              <div id="upload-progress-bar" class="bg-emerald-600 h-full transition-all duration-300" style="width:0%"></div>
            </div>
            <input id="cf-img" type="text" value="${escapeHtml(initialExternalUrl)}" placeholder="أو الصق رابط صورة مباشر (https://...)..." class="w-full border p-2 rounded-xl bg-white" />
            <div id="uploaded-thumbs-preview" class="flex gap-2 overflow-x-auto pt-1"></div>
          </div>

          <div class="bg-slate-50 p-3.5 rounded-2xl border space-y-2">
            <label class="block font-black text-slate-800">⚙️ درجات تقرير الفحص الفني (من 10):</label>
            <div class="grid grid-cols-2 sm:grid-cols-4 gap-2">
              <div>
                <span class="block text-[10px] text-slate-500 font-bold mb-1">المحرك</span>
                <input id="cf-eng" type="number" step="0.1" min="1" max="10" value="${isEdit ? existing.engineScore : 9.8}" class="w-full border p-2 rounded-xl text-center font-bold bg-white" />
              </div>
              <div>
                <span class="block text-[10px] text-slate-500 font-bold mb-1">الفتيس</span>
                <input id="cf-gear" type="number" step="0.1" min="1" max="10" value="${isEdit ? existing.gearScore : 9.8}" class="w-full border p-2 rounded-xl text-center font-bold bg-white" />
              </div>
              <div>
                <span class="block text-[10px] text-slate-500 font-bold mb-1">الهيكل والدهان</span>
                <input id="cf-body" type="number" step="0.1" min="1" max="10" value="${isEdit ? existing.bodyScore : 9.5}" class="w-full border p-2 rounded-xl text-center font-bold bg-white" />
              </div>
              <div>
                <span class="block text-[10px] text-slate-500 font-bold mb-1">العفشة والصالون</span>
                <input id="cf-int" type="number" step="0.1" min="1" max="10" value="${isEdit ? existing.interiorScore : 9.5}" class="w-full border p-2 rounded-xl text-center font-bold bg-white" />
              </div>
            </div>
          </div>

          <div>
            <label class="block font-bold text-slate-700 mb-1">الوصف التفصيلي والكماليات *</label>
            <textarea id="cf-desc" required class="w-full border p-2.5 rounded-xl h-20">${isEdit ? escapeHtml(existing.description) : ''}</textarea>
          </div>

          <button id="cf-submit-btn" type="submit" class="w-full bg-blue-900 hover:bg-blue-800 text-white font-black py-3 rounded-xl shadow transition">
            ${isEdit ? '💾 حفظ التعديلات ومزامنة السحابة' : '🚀 نشر السيارة في المعرض والسحابة'}
          </button>
        </form>
      </div>
    `);

    this.renderTempThumbs();

    document.getElementById('car-upsert-form').onsubmit = (e) => {
      e.preventDefault();
      const eng = Math.min(10, Math.max(1, Number(document.getElementById('cf-eng').value) || 9.5));
      const gear = Math.min(10, Math.max(1, Number(document.getElementById('cf-gear').value) || 9.5));
      const body = Math.min(10, Math.max(1, Number(document.getElementById('cf-body').value) || 9.5));
      const intr = Math.min(10, Math.max(1, Number(document.getElementById('cf-int').value) || 9.5));
      const avgScore = Number(((eng + gear + body + intr) / 4).toFixed(1));

      const manualUrl = document.getElementById('cf-img').value.trim();
      const finalImages = [...this.tempUploadedImages];
      if (manualUrl && !finalImages.includes(manualUrl)) finalImages.unshift(manualUrl);

      const purchaseInput = document.getElementById('cf-purchase-cost');
      const prepInput = document.getElementById('cf-prep-cost');
      const minAllowedInput = document.getElementById('cf-min-allowed-price');

      const carObj = new CarModel({
        ...(isEdit ? existing.toMap() : {}),
        brand: document.getElementById('cf-brand').value,
        model: document.getElementById('cf-model').value,
        year: document.getElementById('cf-year').value,
        mileageKm: document.getElementById('cf-km').value,
        maxInstallmentMonths: document.getElementById('cf-months').value,
        price: document.getElementById('cf-price').value,
        oldPrice: document.getElementById('cf-old-price').value,
        purchaseCost: purchaseInput ? (purchaseInput.value || (isEdit ? existing.purchaseCost : '')) : (isEdit ? existing.purchaseCost : ''),
        prepCost: prepInput ? (prepInput.value ?? (isEdit ? existing.prepCost : 15000)) : (isEdit ? existing.prepCost : 15000),
        minAllowedPrice: minAllowedInput ? (minAllowedInput.value || (isEdit ? existing.minAllowedPrice : '')) : (isEdit ? existing.minAllowedPrice : ''),
        paintStatus: document.getElementById('cf-paint-status').value,
        paintDetails: document.getElementById('cf-paint-details').value,
        dealerPhone: document.getElementById('cf-phone').value,
        imageUrl: finalImages[0] || manualUrl,
        images: finalImages,
        engineScore: eng,
        gearScore: gear,
        bodyScore: body,
        interiorScore: intr,
        inspectionScore: avgScore,
        description: document.getElementById('cf-desc').value
      });

      if (isEdit) {
        CarRepository.updateCar(carObj);
        App.showToast('✅ تم تحديث بيانات السيارة ومزامنتها مع Firebase!', 'success');
      } else {
        CarRepository.addCar(carObj);
        App.showToast('🎉 تمت إضافة السيارة وحفظها في قاعدة بيانات Firebase!', 'success');
      }
      App.closeModal();
      App.syncAll();
    };
  },

  async handleCarFilesSelected(fileList) {
    if (!fileList || fileList.length === 0) return;
    const wrap = document.getElementById('upload-progress-bar-wrap');
    const bar = document.getElementById('upload-progress-bar');
    const statusTxt = document.getElementById('upload-status-text');
    const submitBtn = document.getElementById('cf-submit-btn');

    if (wrap) wrap.classList.remove('hidden');
    if (submitBtn) submitBtn.disabled = true;

    for (let i = 0; i < fileList.length; i++) {
      const file = fileList[i];
      if (statusTxt) statusTxt.textContent = `⚡ جاري ضغط الصورة WebP (${i + 1}/${fileList.length})...`;
      try {
        const url = await FirebaseCloudService.uploadCarImage(file, (pct) => {
          if (bar) bar.style.width = `${pct}%`;
        });
        this.tempUploadedImages.push(url);
      } catch (e) {
        console.error('Image Upload Error:', e);
      }
    }

    if (statusTxt) statusTxt.textContent = `✓ تم تجهيز ${this.tempUploadedImages.length} صور بنجاح`;
    if (submitBtn) submitBtn.disabled = false;
    this.renderTempThumbs();
  },

  removeTempThumb(idx) {
    const removed = this.tempUploadedImages.splice(idx, 1)[0];
    const imgInput = document.getElementById('cf-img');
    if (imgInput && imgInput.value.trim() === removed) {
      imgInput.value = this.tempUploadedImages.find(u => !u.startsWith('data:')) || '';
    }
    this.renderTempThumbs();
  },

  renderTempThumbs() {
    const container = document.getElementById('uploaded-thumbs-preview');
    if (!container) return;
    container.innerHTML = this.tempUploadedImages.map((img, idx) => `
      <div class="relative shrink-0">
        <img src="${escapeHtml(img)}" class="w-16 h-12 object-cover rounded-lg border" />
        <button type="button" onclick="App.removeTempThumb(${idx})" class="absolute -top-1 -left-1 bg-rose-600 text-white w-4 h-4 rounded-full text-[9px] flex items-center justify-center">✕</button>
      </div>
    `).join('');
  },

  deleteCar(carId) {
    if (!AuthService.isLogged()) return;
    App.confirmAction(
      'تأكيد حذف السيارة نهائياً',
      'هل أنت متأكد من رغبتك في حذف هذه السيارة من المعرض وقاعدة البيانات السحابية؟',
      'نعم، احذف السيارة',
      'bg-rose-600 hover:bg-rose-500',
      () => {
        CarRepository.deleteCar(carId);
        App.closeModal();
        App.syncAll();
        App.showToast('🗑️ تم حذف السيارة من المعرض والسحابة بنجاح.', 'error');
      }
    );
  },

  directSellCar(carId) {
    if (!AuthService.isSuperAdmin()) {
      App.showToast('⚠️ صلاحية البيع النهائي المباشر للمدير العام فقط.', 'warning');
      return;
    }
    App.confirmAction(
      'اعتماد البيع المباشر (كاش)',
      'سيتم نقل السيارة إلى أرشيف السيارات المباعة وإضافتها لإيرادات المعرض المحققة في السحابة.',
      'تأكيد البيع النهائي',
      'bg-emerald-700 hover:bg-emerald-600',
      () => {
        const adminName = AuthService.getName();
        if (CarRepository.markAsSold(carId, adminName, adminName)) {
          App.closeModal();
          App.syncAll();
          App.showToast('🏷️ مبروك! تم اعتماد البيع المباشر ومزامنته مع السحابة.', 'success');
        }
      }
    );
  },

  confirmReservation(resId) {
    if (!AuthService.isLogged()) return;
    let reservations = CarRepository.getReservations();
    const target = reservations.find(r => r.id === resId);
    if (!target) return;

    const adminName = AuthService.getName();
    reservations = reservations.map(r => {
      if (r.id === resId) {
        r.status = 'confirmed_by_staff';
        r.handledBy = adminName;
      }
      return r;
    });
    CarRepository.updateReservations(reservations, false);

    const cars = CarRepository.getAllCars().map(c => {
      if (String(c.id) === String(target.carId)) {
        c.isReserved = true;
        c.reservedByClient = target.clientName;
      }
      return c;
    });
    CarRepository.saveAll(cars, true);

    App.syncAll();
    this.openCommandCenter('reservations');
    App.showToast('✅ تم تأكيد الحجز للعميل وتحديث حالة السيارة إلى "محجوزة".', 'success');
  },

  rejectReservation(resId) {
    if (!AuthService.isLogged()) return;
    let reservations = CarRepository.getReservations();
    const target = reservations.find(r => r.id === resId);
    reservations = reservations.filter(r => r.id !== resId);
    CarRepository.updateReservations(reservations, false);

    if (target) {
      const stillHasConfirmed = reservations.some(r => String(r.carId) === String(target.carId) && r.status === 'confirmed_by_staff');
      if (!stillHasConfirmed) {
        const cars = CarRepository.getAllCars().map(c => {
          if (String(c.id) === String(target.carId)) {
            c.isReserved = false;
            c.reservedByClient = null;
          }
          return c;
        });
        CarRepository.saveAll(cars, false);
      }
    }
    FirebaseCloudService.syncToCloud();
    App.syncAll();
    this.openCommandCenter('reservations');
    App.showToast('🗑️ تم رفض وحذف طلب الحجز.', 'warning');
  },

  approveSaleFromRes(resId) {
    if (!AuthService.isSuperAdmin()) {
      App.showToast('🔒 اعتماد البيع النهائي للمدير العام فقط.', 'error');
      return;
    }
    let reservations = CarRepository.getReservations();
    const target = reservations.find(r => r.id === resId);
    if (!target) return;

    App.confirmAction(
      'اعتماد البيع النهائي للعميل',
      `هل تؤكد إتمام بيع سيارة (${target.carTitle}) للعميل (${target.clientName}) ونقلها لأرشيف المبيعات؟`,
      'نعم، اعتماد البيع',
      'bg-emerald-700 hover:bg-emerald-600',
      () => {
        reservations = reservations.map(r => {
          if (r.id === resId) r.status = 'sold';
          return r;
        });
        CarRepository.updateReservations(reservations, false);
        CarRepository.markAsSold(target.carId, AuthService.getName(), target.handledBy);
        App.syncAll();
        this.openCommandCenter('reservations');
        App.showToast('🏷️ مبروك! تم اعتماد البيع النهائي ونقل السيارة للأرشيف.', 'success');
      }
    );
  },

  rejectSaleFromRes(resId) {
    if (!AuthService.isSuperAdmin()) return;
    this.rejectReservation(resId);
  },

  completeInspection(inspId) {
    if (!AuthService.isLogged()) return;
    const adminName = AuthService.getName();
    const list = CarRepository.getInspections().map(i => {
      if (i.id === inspId) {
        i.status = 'completed';
        i.handledBy = adminName;
      }
      return i;
    });
    CarRepository.updateInspections(list);
    App.syncAll();
    this.openCommandCenter('inspections');
    App.showToast('✅ تم تأكيد إتمام المعاينة واحتسابها في تقييم الأداء!', 'success');
  },

  deleteInspection(inspId) {
    if (!AuthService.isLogged()) return;
    const list = CarRepository.getInspections().filter(i => i.id !== inspId);
    CarRepository.updateInspections(list);
    App.syncAll();
    this.openCommandCenter('inspections');
    App.showToast('🗑️ تم حذف سجل المعاينة.', 'warning');
  },

  archiveTradeIn(id) {
    if (!AuthService.isLogged()) return;
    CarRepository.archiveTradeIn(id, AuthService.getName());
    App.syncAll();
    this.openCommandCenter('tradein');
    App.showToast('📂 تمت أرشفة الطلب واحتسابه في تقييم الأداء!', 'success');
  },

  deleteTradeIn(id, isArchived) {
    if (!AuthService.isLogged()) return;
    if (isArchived) {
      CarRepository.updateArchivedTradeIns(CarRepository.getArchivedTradeIns().filter(i => i.id !== id));
    } else {
      CarRepository.updateTradeIns(CarRepository.getTradeIns().filter(i => i.id !== id));
    }
    App.syncAll();
    this.openCommandCenter('tradein');
    App.showToast('🗑️ تم حذف الطلب بنجاح.', 'warning');
  },

  handleAuthClick() {
    if (AuthService.isLogged()) {
      AuthService.logout();
      this.closeDrawer();
      App.syncAll();
      App.showToast('🔒 تم تسجيل الخروج بنجاح.', 'info');
    } else {
      this.openLoginModal();
    }
  },

  openLoginModal() {
    App.openModalHtml(`
      <div class="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl relative">
        <button type="button" onclick="App.closeModal()" class="absolute top-4 left-4 bg-slate-200 hover:bg-slate-300 text-slate-900 w-8 h-8 rounded-full font-black text-sm flex items-center justify-center">✕</button>
        <h3 class="text-lg font-black mb-1 text-slate-900">🔐 بوابة دخول إدارة المعرض</h3>
        <p class="text-xs text-slate-500 mb-4">سجل دخولك للوصول إلى لوحة الإدارة والربط السحابي بـ Firebase</p>
        <form id="sec-login" class="space-y-3 text-xs">
          <input id="l-user" required placeholder="اسم المستخدم (admin أو yasser)" class="w-full border p-3 rounded-xl font-bold" />
          <input id="l-pass" required type="password" placeholder="كلمة المرور" class="w-full border p-3 rounded-xl font-bold" />
          <div class="bg-amber-50 border border-amber-200 p-3 rounded-xl text-[11px] text-amber-900 space-y-1">
            <p class="font-black">💡 دخول سريع للتجربة (اضغط للتعبئة التلقائية):</p>
            <div class="flex gap-2 pt-1">
              <button type="button" onclick="document.getElementById('l-user').value='admin'; document.getElementById('l-pass').value='Elite@2026#Secure';" class="bg-amber-200/70 hover:bg-amber-300 px-2.5 py-1 rounded-lg font-black transition">👑 حساب المدير العام</button>
              <button type="button" onclick="document.getElementById('l-user').value='yasser'; document.getElementById('l-pass').value='Yasser*99';" class="bg-blue-100 hover:bg-blue-200 text-blue-900 px-2.5 py-1 rounded-lg font-black transition">👤 حساب المشرف (يسري)</button>
            </div>
          </div>
          <button type="submit" class="w-full bg-blue-950 hover:bg-blue-900 text-amber-400 font-black py-3 rounded-xl shadow">تسجيل الدخول للوحة الإدارة</button>
        </form>
      </div>
    `);

    document.getElementById('sec-login').onsubmit = (e) => {
      e.preventDefault();
      const u = document.getElementById('l-user').value.trim();
      const p = document.getElementById('l-pass').value.trim();
      if (AuthService.login(u, p)) {
        App.closeModal();
        App.syncAll();
        App.showToast(`🎉 مرحباً بك في لوحة الإدارة يا ${AuthService.getName()}!`, 'success');
      } else {
        App.showToast('❌ اسم المستخدم أو كلمة المرور غير صحيحة!', 'error');
      }
    };
  }
};

window.AdminDrawerUI = AdminDrawerUI;
