/* ============================================================================
   Abu Bahaa Showroom - Admin Tools (Bank Quote, Mini-CRM, Staff Favs,
   A4 Contracts/Receipts, Excel Accounting, Executive Report, 9-Table Backup)
   ============================================================================ */

const AdminToolsUI = {
  _activeDocContext: null,

  // 1. عرض سعر رسمي للبنوك وشركات التمويل (45+ بنك وشركة تمويل + إدخال مخصص)
  openBankProformaModal(preselectedCarId = '') {
    if (!AuthService.isLogged()) {
      App.showToast('🔒 هذه الأداة مخصصة لإدارة المعرض فقط', 'error');
      return;
    }
    const cars = CarRepository.getAllCars();
    if (!cars.length) {
      App.showToast('لا توجد سيارات مسجلة حالياً لإصدار عرض سعر', 'error');
      return;
    }

    const selectedCar = cars.find(c => String(c.id) === String(preselectedCarId)) || cars[0];
    const carOptions = cars.map(c =>
      `<option value="${escapeHtml(c.id)}" ${String(c.id) === String(selectedCar.id) ? 'selected' : ''}>${escapeHtml(c.brand)} ${escapeHtml(c.model)} (${escapeHtml(c.year)}) — ${Number(c.price || 0).toLocaleString('ar-EG')} ج.م</option>`
    ).join('');

    const bankOptGroupsHtml = BANK_GROUPS.map(group => `
      <optgroup label="${escapeHtml(group.label)}">
        ${group.options.map(opt => `
          <option value="${escapeHtml(opt.value)}" ${opt.selected ? 'selected' : ''}>${escapeHtml(opt.label)}</option>
        `).join('')}
      </optgroup>
    `).join('');

    App.openModalHtml(`
      <div class="bg-slate-900 border border-slate-700 text-white rounded-3xl max-w-2xl w-full p-6 shadow-2xl my-auto max-h-[92vh] overflow-y-auto custom-scroll">
        <div class="flex items-center justify-between border-b border-slate-800 pb-4 mb-5">
          <div>
            <h3 class="text-lg font-black text-amber-400 flex items-center gap-2">🏦 إصدار عرض سعر رسمي للبنك / شركة التمويل</h3>
            <p class="text-xs text-slate-400 mt-0.5">وثيقة رسمية مختومة ببيانات ${escapeHtml(DEALER_BRAND_NAME)} لتقديمها لجهات التمويل البنكي</p>
          </div>
          <button type="button" onclick="App.closeModal()" class="bg-slate-800 hover:bg-rose-600 text-white w-8 h-8 rounded-xl font-black transition">✕</button>
        </div>

        <div class="grid grid-cols-1 sm:grid-cols-2 gap-3.5 text-xs">
          <div class="sm:col-span-2">
            <label class="block text-slate-300 font-bold mb-1">اختر السيارة من المخزون</label>
            <select id="bp-car-id" onchange="App.syncBankQuoteCarChange()" class="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2.5 text-white font-bold">
              ${carOptions}
            </select>
          </div>

          <div>
            <label class="block text-slate-300 font-bold mb-1">موجّه إلى (اسم البنك / شركة التمويل)</label>
            <select id="bp-bank-name" onchange="App.handleBankSelectChange(this)" class="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2.5 text-white font-bold">
              ${bankOptGroupsHtml}
              <optgroup label="✏️ إدخال مخصص">
                <option id="bp-custom-opt" value="جهة تمويل مخصصة">✏️ كتابة اسم بنك أو فرع أو شركة أخرى يدوياً...</option>
              </optgroup>
            </select>
            <input id="bp-bank-custom" type="text" oninput="const opt=document.getElementById('bp-custom-opt'); if(opt) opt.value=this.value;" placeholder="اكتب اسم البنك أو الفرع المخصص هنا (مثال: البنك الأهلي - فرع جامعة أسيوط)..." class="hidden mt-2 w-full bg-slate-950 border border-amber-500 rounded-xl px-3 py-2 text-white font-bold" />
          </div>

          <div>
            <label class="block text-slate-300 font-bold mb-1">اسم العميل المشتري (رباعي)</label>
            <input id="bp-client-name" type="text" placeholder="اكتب اسم العميل كما في البطاقة..." class="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-white font-bold" />
          </div>

          <div>
            <label class="block text-slate-300 font-bold mb-1">الرقم القومي للعميل (اختياري)</label>
            <input id="bp-client-nid" type="text" maxlength="14" placeholder="14 رقماً..." class="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-white font-mono" />
          </div>

          <div>
            <label class="block text-slate-300 font-bold mb-1">رقم هاتف العميل</label>
            <input id="bp-client-phone" type="text" placeholder="010xxxxxxxx" class="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-white font-mono" />
          </div>

          <div>
            <label class="block text-slate-300 font-bold mb-1">السعر الإجمالي للسيارة (ج.م)</label>
            <input id="bp-car-price" type="number" value="${Number(selectedCar.price || 0)}" oninput="App.recalcBankQuoteAmounts()" class="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-amber-400 font-black font-mono" />
          </div>

          <div>
            <label class="block text-slate-300 font-bold mb-1">نسبة الدفعة المقدمة المسددة للمعرض (%)</label>
            <input id="bp-down-pct" type="number" min="0" max="90" value="30" oninput="App.recalcBankQuoteAmounts()" class="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-emerald-400 font-black font-mono" />
          </div>

          <div>
            <label class="block text-slate-300 font-bold mb-1">قيمة المقدم (ج.م)</label>
            <input id="bp-down-amount" type="text" readonly class="w-full bg-slate-800/80 border border-slate-700 rounded-xl px-3 py-2 text-slate-200 font-mono font-bold" />
          </div>

          <div>
            <label class="block text-slate-300 font-bold mb-1">صافي مبلغ التمويل المطلوب من البنك (ج.م)</label>
            <input id="bp-loan-amount" type="text" readonly class="w-full bg-slate-800/80 border border-amber-500/60 rounded-xl px-3 py-2 text-amber-300 font-mono font-black" />
          </div>

          <div>
            <label class="block text-slate-300 font-bold mb-1">رقم الشاسيه (VIN)</label>
            <input id="bp-chassis" type="text" placeholder="أدخل رقم الشاسيه إن وجد..." class="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-white font-mono" />
          </div>

          <div>
            <label class="block text-slate-300 font-bold mb-1">رقم الموتور / اللون</label>
            <input id="bp-engine-color" type="text" placeholder="مثال: موتور 849302 - لون أسود ميتاليك" class="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-white font-bold" />
          </div>

          <div class="sm:col-span-2">
            <label class="block text-slate-300 font-bold mb-1">ملاحظات وإقرار المعرض للبنك</label>
            <input id="bp-notes" type="text" value="السيارة متاحة للتسليم الفوري وخالية من أي التزامات أو حظر بيع، والعرض سارٍ لمدة 15 يوماً من تاريخه." class="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-white font-semibold" />
          </div>
        </div>

        <div class="flex flex-wrap items-center justify-end gap-2.5 mt-6 pt-4 border-t border-slate-800">
          <button type="button" onclick="App.sendBankQuoteWhatsApp()" class="bg-emerald-600 hover:bg-emerald-500 text-white text-xs px-4 py-2.5 rounded-xl font-black transition flex items-center gap-1.5">
            <span>💬</span> إرسال تفاصيل العرض واتساب
          </button>
          <button type="button" onclick="App.printBankProformaInvoice()" class="bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-400 hover:to-orange-400 text-slate-950 text-xs px-5 py-2.5 rounded-xl font-black transition flex items-center gap-1.5 shadow-lg">
            <span>🖨️</span> طباعة عرض السعر الرسمي للبنك (A4)
          </button>
        </div>
      </div>
    `);
    this.recalcBankQuoteAmounts();
  },

  handleBankSelectChange(selectEl) {
    const customInput = document.getElementById('bp-bank-custom');
    if (!customInput || !selectEl) return;
    if (selectEl.selectedOptions[0]?.id === 'bp-custom-opt') {
      customInput.classList.remove('hidden');
      customInput.focus();
    } else {
      customInput.classList.add('hidden');
    }
  },

  syncBankQuoteCarChange() {
    const carId = document.getElementById('bp-car-id')?.value;
    const { car } = CarRepository.findCarAnywhere(carId);
    if (car) {
      const priceInput = document.getElementById('bp-car-price');
      if (priceInput) priceInput.value = Number(car.price || 0);
      this.recalcBankQuoteAmounts();
    }
  },

  recalcBankQuoteAmounts() {
    const total = Math.max(0, Number(document.getElementById('bp-car-price')?.value || 0));
    const pct = Math.min(95, Math.max(0, Number(document.getElementById('bp-down-pct')?.value || 0)));
    const down = Math.round(total * (pct / 100));
    const loan = Math.max(0, total - down);
    const downEl = document.getElementById('bp-down-amount');
    const loanEl = document.getElementById('bp-loan-amount');
    if (downEl) downEl.value = down.toLocaleString('ar-EG') + ' ج.م';
    if (loanEl) loanEl.value = loan.toLocaleString('ar-EG') + ' ج.م';
  },

  getSelectedBankQuoteName() {
    const customBankEl = document.getElementById('bp-bank-custom');
    if (customBankEl && !customBankEl.classList.contains('hidden') && customBankEl.value.trim()) {
      return customBankEl.value.trim();
    }
    return document.getElementById('bp-bank-name')?.value || 'إدارة تمويل السيارات';
  },

  sendBankQuoteWhatsApp() {
    const carId = document.getElementById('bp-car-id')?.value;
    const { car } = CarRepository.findCarAnywhere(carId);
    const targetCar = car || {};
    const bankName = this.getSelectedBankQuoteName();
    const clientName = document.getElementById('bp-client-name')?.value || 'العميل';
    const clientPhone = document.getElementById('bp-client-phone')?.value || '';
    const total = Number(document.getElementById('bp-car-price')?.value || 0);
    const pct = Number(document.getElementById('bp-down-pct')?.value || 30);
    const down = Math.round(total * (pct / 100));
    const loan = Math.max(0, total - down);
    const msg =
      `🏦 *عرض سعر رسمي للتمويل البنكي — ${DEALER_BRAND_NAME}*\n` +
      `• موجّه إلى: ${bankName}\n` +
      `• باسم العميل: ${clientName}\n` +
      `• السيارة: ${targetCar.brand || ''} ${targetCar.model || ''} (موديل ${targetCar.year || ''})\n` +
      `• الحالة الفنية: ${targetCar.paintStatus || 'فابريكة'} — عداد ${Number(targetCar.mileageKm || 0).toLocaleString('ar-EG')} كم\n` +
      `• السعر الإجمالي: ${total.toLocaleString('ar-EG')} ج.م\n` +
      `• الدفعة المقدمة (${pct}%): ${down.toLocaleString('ar-EG')} ج.م\n` +
      `• صافي مبلغ التمويل المطلوب: ${loan.toLocaleString('ar-EG')} ج.م\n` +
      `📍 العنوان: ${DEALER_ADDRESS}\n` +
      `📞 للتواصل: ${DEALER_PHONES_DISPLAY}`;
    App.whatsApp(clientPhone || DEFAULT_DEALER_PHONE, msg);
  },

  printBankProformaInvoice() {
    const carId = document.getElementById('bp-car-id')?.value;
    const { car } = CarRepository.findCarAnywhere(carId);
    const total = Math.max(0, Number(document.getElementById('bp-car-price')?.value || 0));
    const pct = Math.min(95, Math.max(0, Number(document.getElementById('bp-down-pct')?.value || 0)));
    const down = Math.round(total * (pct / 100));
    const loan = Math.max(0, total - down);

    PrintEngine.printBankProforma({
      car,
      bankName: this.getSelectedBankQuoteName(),
      clientName: document.getElementById('bp-client-name')?.value || '....................................................',
      clientNid: document.getElementById('bp-client-nid')?.value || '....................................',
      clientPhone: document.getElementById('bp-client-phone')?.value || '........................',
      total,
      pct,
      down,
      loan,
      chassis: document.getElementById('bp-chassis')?.value || 'يُحدد عند الاستلام النهائي',
      engineColor: document.getElementById('bp-engine-color')?.value || (car?.paintStatus || 'مفحوصة بالكامل'),
      notes: document.getElementById('bp-notes')?.value || ''
    });
  },

  // 2. نظام متابعة العملاء الذكي وملاحظات المبيعات (Mini-CRM)
  openCrmManagerModal() {
    if (!AuthService.isLogged()) {
      App.showToast('🔒 سجل متابعة العملاء مخصص للإدارة فقط', 'error');
      return;
    }

    App.openModalHtml(`
      <div class="bg-slate-900 border border-slate-700 text-white rounded-3xl max-w-4xl w-full p-6 shadow-2xl my-auto max-h-[92vh] overflow-y-auto custom-scroll">
        <div class="flex items-center justify-between border-b border-slate-800 pb-4 mb-4">
          <div>
            <h3 class="text-lg font-black text-amber-400 flex items-center gap-2">🗂️ نظام متابعة العملاء والمبيعات (Mini-CRM)</h3>
            <p class="text-xs text-slate-400 mt-0.5">تسجيل المكالمات وحالة التمويل البنكي ومواعيد حضور العملاء لـ ${escapeHtml(DEALER_BRAND_NAME)}</p>
          </div>
          <button type="button" onclick="App.closeModal()" class="bg-slate-800 hover:bg-rose-600 text-white w-8 h-8 rounded-xl font-black transition">✕</button>
        </div>

        <div class="bg-slate-950/90 border border-slate-800 rounded-2xl p-4 mb-5 grid grid-cols-1 sm:grid-cols-5 gap-2.5 text-xs">
          <input id="crm-new-name" type="text" placeholder="اسم العميل..." class="bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-white font-bold" />
          <input id="crm-new-phone" type="text" placeholder="رقم الموبايل..." class="bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-white font-mono" />
          <input id="crm-new-car" type="text" placeholder="السيارة المهتم بها..." class="bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-white font-bold" />
          <select id="crm-new-status" class="bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-amber-300 font-bold">
            <option value="مهتم - جاري المتابعة">📞 مهتم - جاري المتابعة</option>
            <option value="في انتظار أوراق البنك">🏦 في انتظار أوراق البنك</option>
            <option value="موعد معاينة بالمعرض">📅 موعد معاينة بالمعرض</option>
            <option value="تم البيع والتعاقد">✅ تم البيع والتعاقد</option>
          </select>
          <button type="button" onclick="App.addCrmLeadRecord()" class="bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl px-3 py-2 font-black transition">➕ حفظ بالمتابعة</button>
          <input id="crm-new-notes" type="text" placeholder="ملاحظة المتابعة (مثال: العميل قادم غداً الساعة 5 مساءً ومعه مقدم 300 ألف)..." class="sm:col-span-5 bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-slate-200 font-semibold" />
        </div>

        <div id="crm-leads-container" class="space-y-2.5 max-h-96 overflow-y-auto pr-1 custom-scroll"></div>
      </div>
    `);
    this.renderCrmLeadsList();
  },

  addCrmLeadRecord() {
    const name = (document.getElementById('crm-new-name')?.value || '').trim();
    const phone = (document.getElementById('crm-new-phone')?.value || '').trim();
    const interest = (document.getElementById('crm-new-car')?.value || 'استفسار عام').trim();
    const status = document.getElementById('crm-new-status')?.value || CRM_STATUSES[0];
    const notes = (document.getElementById('crm-new-notes')?.value || '').trim();

    if (!name || !phone) {
      App.showToast('يرجى إدخال اسم العميل ورقم الهاتف أولاً', 'error');
      return;
    }

    CarRepository.addCrmLead({ name, phone, interest, status, notes });
    ['crm-new-name', 'crm-new-phone', 'crm-new-car', 'crm-new-notes'].forEach(id => {
      const el = document.getElementById(id);
      if (el) el.value = '';
    });

    this.renderCrmLeadsList();
    AdminDrawerUI.syncHeaderAndDrawer();
    App.showToast('✅ تم حفظ متابعة العميل في سجل الـ CRM', 'success');
  },

  updateCrmLeadStatus(id, newStatus) {
    if (CarRepository.updateCrmLeadStatus(id, newStatus)) {
      this.renderCrmLeadsList();
      App.showToast('تم تحديث حالة العميل بنجاح', 'success');
    }
  },

  deleteCrmLeadRecord(id) {
    CarRepository.deleteCrmLead(id);
    this.renderCrmLeadsList();
    AdminDrawerUI.syncHeaderAndDrawer();
  },

  renderCrmLeadsList() {
    const container = document.getElementById('crm-leads-container');
    if (!container) return;
    const list = CarRepository.getCrmLeads();

    if (!list.length) {
      container.innerHTML = `<div class="text-center py-8 text-slate-400 text-xs font-bold">لا توجد متابعات مسجلة حالياً — أضف أول عميل من النموذج بالأعلى.</div>`;
      return;
    }

    container.innerHTML = list.map(item => `
      <div class="bg-slate-950/70 border border-slate-800 rounded-2xl p-3.5 flex flex-wrap items-center justify-between gap-3 text-xs">
        <div class="space-y-1">
          <div class="flex items-center gap-2 flex-wrap">
            <span class="font-black text-white text-sm">${escapeHtml(item.name)}</span>
            <span class="font-mono bg-slate-800 text-amber-300 px-2 py-0.5 rounded-lg">${escapeHtml(item.phone)}</span>
            <span class="bg-indigo-950 text-indigo-300 border border-indigo-700/50 px-2 py-0.5 rounded-lg font-bold">🚘 ${escapeHtml(item.interest)}</span>
          </div>
          <p class="text-slate-300 font-semibold">📝 ${escapeHtml(item.notes)}</p>
          <div class="text-[10px] text-slate-500">🕒 ${escapeHtml(item.date)}</div>
        </div>
        <div class="flex items-center gap-2">
          <select onchange="App.updateCrmLeadStatus('${escapeHtml(item.id)}', this.value)" class="bg-slate-900 border border-slate-700 rounded-xl px-2.5 py-1.5 text-amber-300 font-bold text-xs">
            <option value="مهتم - جاري المتابعة" ${item.status === 'مهتم - جاري المتابعة' ? 'selected' : ''}>📞 مهتم - جاري المتابعة</option>
            <option value="في انتظار أوراق البنك" ${item.status === 'في انتظار أوراق البنك' ? 'selected' : ''}>🏦 في انتظار أوراق البنك</option>
            <option value="موعد معاينة بالمعرض" ${item.status === 'موعد معاينة بالمعرض' ? 'selected' : ''}>📅 موعد معاينة بالمعرض</option>
            <option value="تم البيع والتعاقد" ${item.status === 'تم البيع والتعاقد' ? 'selected' : ''}>✅ تم البيع والتعاقد</option>
          </select>
          <button type="button" onclick="App.whatsApp('${escapeHtml(item.phone)}', 'أهلاً بحضرتك يا أستاذ ${escapeHtml(item.name)}، معك إدارة ${escapeHtml(DEALER_BRAND_NAME)} بخصوص السيارة ${escapeHtml(item.interest)}')" class="bg-emerald-600 hover:bg-emerald-500 text-white px-3 py-1.5 rounded-xl font-black transition">💬 واتساب</button>
          <button type="button" onclick="App.deleteCrmLeadRecord('${escapeHtml(item.id)}')" class="bg-rose-900/60 hover:bg-rose-600 text-white px-2.5 py-1.5 rounded-xl font-black transition">🗑️</button>
        </div>
      </div>
    `).join('');
  },

  // 3. مفضلة المدير والمشرف
  getCurrentStaffRoleName() {
    return AuthService.isSuperAdmin() ? 'المدير العام' : 'المشرف';
  },

  toggleStaffFavoriteCar(carId, customNote = '') {
    const res = CarRepository.toggleStaffFavorite(carId, customNote, this.getCurrentStaffRoleName());
    if (!res.ok) return;
    if (res.added) {
      App.showToast(`⭐ تمت إضافة (${res.car.brand} ${res.car.model}) إلى مفضلة المدير والمشرف`, 'success');
    } else {
      App.showToast(`تم إزالة (${res.car.brand}) من مفضلة المدير والمشرف`, 'warning');
    }
    this.renderStaffFavoritesList();
    AdminDrawerUI.syncHeaderAndDrawer();
  },

  openStaffFavoritesModal() {
    if (!AuthService.isLogged()) {
      App.showToast('🔒 هذه القائمة مخصصة للمدير العام والمشرف فقط', 'error');
      return;
    }

    const cars = CarRepository.getAllCars();
    const carOptions = cars.map(c =>
      `<option value="${escapeHtml(c.id)}">${escapeHtml(c.brand)} ${escapeHtml(c.model)} (${escapeHtml(c.year)}) — ${Number(c.price || 0).toLocaleString('ar-EG')} ج.م</option>`
    ).join('');

    App.openModalHtml(`
      <div class="bg-slate-900 border border-slate-700 text-white rounded-3xl max-w-3xl w-full p-6 shadow-2xl my-auto max-h-[92vh] overflow-y-auto custom-scroll">
        <div class="flex items-center justify-between border-b border-slate-800 pb-4 mb-4">
          <div>
            <h3 class="text-lg font-black text-amber-400 flex items-center gap-2">⭐ مفضلة وترشيحات المدير العام والمشرف</h3>
            <p class="text-xs text-slate-400 mt-0.5">السيارات المختارة بواسطة الإدارة أو المشرف لترشيحها للعملاء المميزين (VIP)</p>
          </div>
          <button type="button" onclick="App.closeModal()" class="bg-slate-800 hover:bg-rose-600 text-white w-8 h-8 rounded-xl font-black transition">✕</button>
        </div>

        <div class="bg-slate-950/90 border border-slate-800 rounded-2xl p-3.5 mb-5 grid grid-cols-1 sm:grid-cols-3 gap-2.5 text-xs">
          <select id="sfav-car-id" class="bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-white font-bold">
            ${carOptions}
          </select>
          <input id="sfav-note" type="text" placeholder="ملاحظة (مثال: ترشيح المشرف للعميل أ/ محمود)..." class="bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-white font-semibold" />
          <button type="button" onclick="App.toggleStaffFavoriteCar(document.getElementById('sfav-car-id').value, document.getElementById('sfav-note').value || 'مرشحة من الإدارة')" class="bg-amber-500 hover:bg-amber-400 text-slate-950 rounded-xl px-3 py-2 font-black transition">⭐ إضافة للمفضلة</button>
        </div>

        <div id="staff-fav-list-container" class="space-y-2.5 max-h-96 overflow-y-auto pr-1 custom-scroll"></div>

        <div class="flex items-center justify-between mt-5 pt-4 border-t border-slate-800">
          <button type="button" onclick="App.clearStaffFavorites()" class="text-xs text-rose-400 hover:text-rose-300 font-bold">🗑️ مسح القائمة بالكامل</button>
          <button type="button" onclick="App.shareStaffFavoritesWhatsApp()" class="bg-emerald-600 hover:bg-emerald-500 text-white text-xs px-4 py-2.5 rounded-xl font-black transition flex items-center gap-1.5">
            <span>💬</span> إرسال القائمة المرشحة للعميل واتساب
          </button>
        </div>
      </div>
    `);
    this.renderStaffFavoritesList();
  },

  clearStaffFavorites() {
    CarRepository.clearStaffFavorites();
    this.renderStaffFavoritesList();
    App.syncAll();
    App.showToast('🗑️ تم مسح قائمة مفضلة الإدارة.', 'info');
  },

  renderStaffFavoritesList() {
    const container = document.getElementById('staff-fav-list-container');
    if (!container) return;
    const list = CarRepository.getStaffFavorites();

    if (!list.length) {
      container.innerHTML = `<div class="text-center py-8 text-slate-400 text-xs font-bold">لا توجد سيارات في مفضلة المدير والمشرف حالياً — اضغط على ⭐ في أي سيارة أو أضفها من الأعلى.</div>`;
      return;
    }

    container.innerHTML = list.map(item => `
      <div class="bg-slate-950/80 border border-slate-800 rounded-2xl p-3 flex flex-wrap items-center justify-between gap-3 text-xs">
        <div class="flex items-center gap-3">
          <img src="${escapeHtml(item.image || './logo.jpg')}" onerror="this.src='./logo.jpg'" class="w-14 h-11 rounded-xl object-cover border border-amber-500/50" />
          <div>
            <div class="font-black text-white text-sm flex items-center gap-2">
              <span>${escapeHtml(item.brand)} ${escapeHtml(item.model || '')} (${escapeHtml(item.year)})</span>
              <span class="bg-amber-500/20 text-amber-300 border border-amber-500/40 px-2 py-0.5 rounded-lg text-[10px]">👤 ${escapeHtml(item.addedBy || 'الإدارة')}</span>
            </div>
            <div class="text-emerald-400 font-black font-mono mt-0.5">${Number(item.price || 0).toLocaleString('ar-EG')} ج.م — <span class="text-slate-300 font-semibold">${escapeHtml(item.note)}</span></div>
          </div>
        </div>
        <div class="flex items-center gap-2">
          <button type="button" onclick="App.openBankProformaModal('${escapeHtml(item.carId)}');" class="bg-indigo-600 hover:bg-indigo-500 text-white px-2.5 py-1.5 rounded-xl font-bold">🏦 عرض سعر للبنك</button>
          <button type="button" onclick="App.toggleStaffFavoriteCar('${escapeHtml(item.carId)}')" class="bg-rose-900/60 hover:bg-rose-600 text-white px-2.5 py-1.5 rounded-xl font-black">🗑️</button>
        </div>
      </div>
    `).join('');
  },

  shareStaffFavoritesWhatsApp() {
    const list = CarRepository.getStaffFavorites();
    if (!list.length) {
      App.showToast('القائمة فارغة حالياً', 'warning');
      return;
    }
    const lines = list.map((c, idx) => `${idx + 1}. *${c.brand} ${c.model || ''} (${c.year})* — السعر: ${Number(c.price || 0).toLocaleString('ar-EG')} ج.م (${c.note || ''})`).join('\n');
    const msg =
      `⭐ *ترشيحات إدارة ومشرفي ${DEALER_BRAND_NAME}*\n\n` +
      `${lines}\n\n` +
      `📍 العنوان: ${DEALER_ADDRESS}\n` +
      `📞 للتواصل والحجز: ${DEALER_PHONES_DISPLAY}`;
    App.whatsApp(DEFAULT_DEALER_PHONE, msg);
  },

  // 4. العقود وإيصالات العربون A4
  openPrintableContract(type, recordId) {
    if (!AuthService.isLogged()) return;
    let car = null;
    let clientName = '';
    let clientPhone = '';

    const r = CarRepository.getReservations().find(x => x.id === recordId);
    if (r) {
      car = CarRepository.findCarAnywhere(r.carId).car;
      clientName = r.clientName || '';
      clientPhone = r.clientPhone || '';
    } else {
      car = CarRepository.findCarAnywhere(recordId).car;
    }
    if (!car) return;

    const isRes = (type === 'RESERVATION');
    const docTitle = isRes ? 'وثيقة حجز سيارة وإيصال استلام عربون' : 'عقد بيع ابتدائي لسيارة معتمدة';
    const docCode = (isRes ? 'REC-' : 'CNT-') + Date.now().toString().slice(-5);
    const today = new Date().toLocaleDateString('ar-EG');
    const currentTime = new Date().toLocaleTimeString('ar-EG', { hour: '2-digit', minute: '2-digit' });
    const defaultDeposit = Math.round(car.price * 0.05);

    this._activeDocContext = { type, car, docTitle, docCode, today, currentTime };

    App.openModalHtml(`
      <div class="bg-white rounded-3xl max-w-3xl w-full p-5 sm:p-7 shadow-2xl relative max-h-[92vh] overflow-y-auto custom-scroll border-2 border-slate-900 text-xs leading-relaxed">
        <div class="flex flex-wrap justify-between items-center gap-2 pb-4 mb-4 border-b-2 border-slate-900">
          <div class="flex items-center gap-2">
            <button type="button" onclick="App.closeModal()" class="bg-slate-200 hover:bg-slate-300 text-slate-900 w-8 h-8 rounded-full font-black text-sm flex items-center justify-center">✕</button>
            <span class="font-black text-sm text-slate-900">${isRes ? '📄 تجهيز إيصال العربون' : '📜 تجهيز عقد البيع الابتدائي'}</span>
          </div>
          <div class="flex items-center gap-2">
            <button type="button" onclick="App.openPrintableContract('${isRes ? 'SALE' : 'RESERVATION'}', '${escapeHtml(recordId)}')" class="bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold px-3 py-2 rounded-xl transition">
              🔄 تبديل إلى ${isRes ? 'عقد بيع ابتدائي' : 'إيصال عربون'}
            </button>
            <button type="button" onclick="App.printDocument()" class="bg-blue-950 hover:bg-blue-900 text-amber-400 font-black px-5 py-2 rounded-xl shadow-md flex items-center gap-1.5 transition">
              <span>🖨️</span> طباعة الوثيقة (A4 كامل)
            </button>
          </div>
        </div>

        <div class="bg-amber-50/80 border border-amber-300 p-3.5 rounded-2xl mb-5 space-y-2.5">
          <p class="font-black text-amber-950 text-[11px]">✍️ بيانات سريعة تُطبع داخل الوثيقة (اترك أي خانة فارغة لتظهر مكانها نقاط للتعبئة اليدوية بالقلم):</p>
          <div class="grid grid-cols-1 sm:grid-cols-3 gap-2">
            <input id="doc-client-name" value="${escapeHtml(clientName)}" placeholder="اسم المشتري بالكامل" class="border p-2 rounded-xl bg-white font-bold" />
            <input id="doc-client-phone" value="${escapeHtml(clientPhone)}" placeholder="رقم الموبايل" class="border p-2 rounded-xl bg-white font-bold" />
            <input id="doc-client-nid" placeholder="الرقم القومي (14 رقم)" class="border p-2 rounded-xl bg-white font-bold" />
          </div>
          ${isRes ? `
            <div class="grid grid-cols-1 sm:grid-cols-3 gap-2">
              <input id="doc-paid-amount" type="number" value="${defaultDeposit}" placeholder="مبلغ العربون المستلم (ج.م)" class="border p-2 rounded-xl bg-white font-black text-emerald-800" />
              <select id="doc-pay-method" class="border p-2 rounded-xl bg-white font-bold">
                <option value="نقداً بخزينة المعرض">نقداً بخزينة المعرض</option>
                <option value="تحويل بنكي / إنستاباي">تحويل بنكي / إنستاباي</option>
                <option value="شيك بنكي">شيك بنكي</option>
              </select>
              <input id="doc-hold-days" value="7 أيام من تاريخه" placeholder="مهلة الحجز (مثال: 7 أيام)" class="border p-2 rounded-xl bg-white font-bold" />
            </div>
          ` : `
            <div class="grid grid-cols-1 sm:grid-cols-3 gap-2">
              <input id="doc-paid-amount" type="number" value="${car.price}" placeholder="المبلغ المسدد عند التعاقد (ج.م)" class="border p-2 rounded-xl bg-white font-black text-blue-900" />
              <input id="doc-chassis" placeholder="رقم الشاسيه (أو يترك فارغاً)" class="border p-2 rounded-xl bg-white font-bold" />
              <input id="doc-engine" placeholder="رقم الموتور (أو يترك فارغاً)" class="border p-2 rounded-xl bg-white font-bold" />
            </div>
          `}
          <button type="button" onclick="App.refreshDocPreview()" class="bg-slate-900 text-amber-400 font-black px-4 py-1.5 rounded-xl text-[11px]">🔄 تحديث المعاينة بالبيانات المدخلة</button>
        </div>

        <div id="a4-preview-box" class="bg-white p-5 rounded-2xl border-2 border-slate-300 text-slate-900"></div>
      </div>
    `);

    this.refreshDocPreview();
  },

  refreshDocPreview() {
    const ctx = this._activeDocContext;
    if (!ctx) return;
    const { type, car, docTitle, docCode, today, currentTime } = ctx;
    const isRes = (type === 'RESERVATION');

    const cName = (document.getElementById('doc-client-name')?.value || '').trim() || '............................................................';
    const cPhone = (document.getElementById('doc-client-phone')?.value || '').trim() || '..............................';
    const cNid = (document.getElementById('doc-client-nid')?.value || '').trim() || '..........................................';
    const paidRaw = Number(document.getElementById('doc-paid-amount')?.value) || 0;
    const paidFormatted = paidRaw > 0 ? (paidRaw.toLocaleString('ar-EG') + ' ج.م') : '.............................. ج.م';
    const remainRaw = Math.max(0, car.price - paidRaw);
    const remainFormatted = paidRaw > 0 ? (remainRaw.toLocaleString('ar-EG') + ' ج.م') : '.............................. ج.م';
    const payMethod = document.getElementById('doc-pay-method')?.value || 'نقداً بخزينة المعرض';
    const holdDays = (document.getElementById('doc-hold-days')?.value || '').trim() || '7 أيام';
    const chassis = (document.getElementById('doc-chassis')?.value || '').trim() || '....................................';
    const engine = (document.getElementById('doc-engine')?.value || '').trim() || '....................................';

    const previewBox = document.getElementById('a4-preview-box');
    if (!previewBox) return;

    if (isRes) {
      previewBox.innerHTML = `
        <div class="doc-header">
          <div>
            <h1 class="doc-main-title">${escapeHtml(DEALER_BRAND_NAME)}</h1>
            <p class="doc-sub">قسم المبيعات والتعاقدات — تحريراً في: ${today}</p>
            <p class="doc-sub" style="color:#0f172a; margin-top:3px;">📍 ${escapeHtml(DEALER_ADDRESS)} | 📞 ${escapeHtml(DEALER_PHONES_DISPLAY)}</p>
          </div>
          <div class="doc-badge-wrap">
            <div class="doc-badge">${docTitle}</div>
            <div class="doc-code">رقم الإيصال: ${docCode}</div>
          </div>
        </div>

        <div class="doc-section">
          <div class="doc-sec-title">أولاً: بيانات العميل الحاجز ومستلم العربون</div>
          <div class="doc-grid-2">
            <div><b>استلمنا نحن:</b> ${escapeHtml(DEALER_BRAND_NAME)} (يمثله: ${escapeHtml(AuthService.getName())})</div>
            <div><b>من السيد /</b> ${escapeHtml(cName)}</div>
            <div><b>رقم الهاتف:</b> ${escapeHtml(cPhone)}</div>
            <div><b>الرقم القومي:</b> ${escapeHtml(cNid)}</div>
          </div>
        </div>

        <div class="doc-section">
          <div class="doc-sec-title">ثانياً: بيان مبلغ العربون والسيارة المحجوزة</div>
          <div class="doc-highlight-box">
            <div><b>مبلغ العربون المستلم:</b> ${paidFormatted} (${escapeHtml(payMethod)})</div>
            <div><b>مهلة الحجز المتفق عليها:</b> ${escapeHtml(holdDays)}</div>
          </div>
          <div class="doc-grid-3">
            <div><b>كود السيارة:</b> ${escapeHtml(car.id)}</div>
            <div><b>الماركة والموديل:</b> ${escapeHtml(car.brand)} ${escapeHtml(car.model)}</div>
            <div><b>سنة الصنع:</b> ${car.year}</div>
            <div><b>قراءة العداد:</b> ${car.formattedMileage}</div>
            <div><b>حالة الدهان:</b> ${escapeHtml(car.paintStatus)}</div>
            <div><b>درجة الفحص:</b> ${car.inspectionScore} / 10</div>
            <div><b>إجمالي السعر المتفق عليه:</b> ${car.formattedPrice}</div>
            <div><b>العربون المسدد:</b> ${paidFormatted}</div>
            <div><b>المبلغ المتبقي للسداد:</b> ${remainFormatted}</div>
          </div>
        </div>

        <div class="doc-section">
          <div class="doc-sec-title">ثالثاً: شروط الحجز والضمان</div>
          <ol class="doc-terms">
            <li>يلتزم ${escapeHtml(DEALER_BRAND_NAME)} بحجز السيارة الموضحة أعلاه باسم العميل وإيقاف عرضها للبيع للغير طوال مهلة الحجز (${escapeHtml(holdDays)}).</li>
            <li>يلتزم العميل بسداد باقي ثمن السيارة (${remainFormatted}) أو إنهاء إجراءات التمويل البنكي قبل انتهاء المهلة المحددة.</li>
            <li>يقر العميل باطلاعه على تقرير الفحص الهندسي المعتمد للسيارة، وفي حال ثبوت أي عيب جوهري يخالف الفحص المعلن يحق للعميل استرداد العربون كاملاً فوراً.</li>
          </ol>
        </div>

        <div class="doc-signatures-3">
          <div>توقيع مسؤول المبيعات / الخزينة<br><br>................................</div>
          <div>ختم المعرض الرسمي<br><br>................................</div>
          <div>توقيع العميل الحاجز<br><br>................................</div>
        </div>
      `;
    } else {
      previewBox.innerHTML = `
        <div class="doc-header">
          <div>
            <h1 class="doc-main-title">${escapeHtml(DEALER_BRAND_NAME)}</h1>
            <p class="doc-sub">الإدارة القانونية والعقود — إنه في يوم ${today} الساعة (${currentTime})</p>
            <p class="doc-sub" style="color:#0f172a; margin-top:3px;">📍 ${escapeHtml(DEALER_ADDRESS)} | 📞 ${escapeHtml(DEALER_PHONES_DISPLAY)}</p>
          </div>
          <div class="doc-badge-wrap">
            <div class="doc-badge">${docTitle}</div>
            <div class="doc-code">رقم العقد: ${docCode}</div>
          </div>
        </div>

        <div class="doc-section">
          <div class="doc-sec-title">أطراف التعاقد</div>
          <div class="doc-grid-1">
            <div><b>الطرف الأول (البائع):</b> ${escapeHtml(DEALER_BRAND_NAME)}، ويمثله قانوناً في هذا العقد السيد/ ${escapeHtml(AuthService.getName())}.</div>
            <div><b>الطرف الثاني (المشتري):</b> السيد/ ${escapeHtml(cName)} — يحمل رقم قومي: (${escapeHtml(cNid)}) — هاتف: (${escapeHtml(cPhone)}).</div>
          </div>
        </div>

        <div class="doc-section">
          <div class="doc-sec-title">البند الأول: بيانات السيارة محل البيع والفحص الفني</div>
          <div class="doc-grid-3">
            <div><b>الماركة والموديل:</b> ${escapeHtml(car.brand)} ${escapeHtml(car.model)}</div>
            <div><b>سنة الصنع:</b> ${car.year}</div>
            <div><b>قراءة العداد:</b> ${car.formattedMileage}</div>
            <div><b>رقم الشاسيه:</b> ${escapeHtml(chassis)}</div>
            <div><b>رقم الموتور:</b> ${escapeHtml(engine)}</div>
            <div><b>كود الفحص:</b> ${escapeHtml(car.id)} (${car.inspectionScore}/10)</div>
          </div>
          <div style="margin-top:8px; padding-top:6px; border-top:1px dashed #cbd5e1;">
            <b>بيان حالة الدهان والفحص الهندسي:</b> ${escapeHtml(car.paintStatus)} — ${escapeHtml(car.paintDetails)}.
          </div>
        </div>

        <div class="doc-section">
          <div class="doc-sec-title">البند الثاني: الثمن وطريقة السداد</div>
          <div class="doc-grid-3">
            <div><b>إجمالي الثمن المتفق عليه:</b> ${car.formattedPrice}</div>
            <div><b>المسدد عند توقيع العقد:</b> ${paidFormatted}</div>
            <div><b>المبلغ المتبقي بذمة المشتري:</b> ${remainFormatted}</div>
          </div>
        </div>

        <div class="doc-section">
          <div class="doc-sec-title">البنود القانونية والالتزامات والضمان</div>
          <ol class="doc-terms">
            <li><b>المعاينة النافية للجهالة:</b> يقر الطرف الثاني (المشتري) بأنه عاين السيارة المباعة المعاينة التامة النافية للجهالة شرعاً وقانوناً وفحصها فنياً وقبل شرائها بحالتها الراهنة الموضحة بتقرير الفحص.</li>
            <li><b>خلو السيارة من الموانع:</b> يقر الطرف الأول (البائع) بخلو السيارة من أي رهون أو حجوزات أو مخالفات مرورية أو مستحقات حكومية سابقة لتاريخ وساعة تحرير هذا العقد.</li>
            <li><b>الاستلام والمسؤولية المدنية والجنائية:</b> يقر الطرف الثاني باستلامه للسيارة المباعة فعلياً بتاريخ (${today}) الساعة (${currentTime})، وأنه أصبح المسؤول الوحيد عنها مدنياً وجنائياً ومرورياً منذ لحظة الاستلام.</li>
            <li><b>نقل الملكية وحفظ الامتياز:</b> يلتزم الطرف الأول بتسليم مستندات الملكية/التوكيل للمشتري فور سداد كامل الثمن، وفي حال وجود مبالغ متبقية تظل ملكية السيارة محفوظة للمعرض لحين السداد التام.</li>
          </ol>
        </div>

        <div class="doc-signatures-3">
          <div>الطرف الأول (البائع)<br>${escapeHtml(DEALER_BRAND_NAME)}<br><br>................................</div>
          <div>الطرف الثاني (المشتري المستلم)<br><br><br>................................</div>
          <div>توقيع الشهود<br>1. ..............................<br>2. ..............................</div>
        </div>
      `;
    }
  },

  // 5. شيت إكسيل المحاسبي (SuperAdmin ONLY)
  exportExcelReport() {
    if (!AuthService.isSuperAdmin()) {
      App.showToast('🔒 شيت الإكسيل المحاسبي والأرباح السرية مخصص للمدير العام فقط', 'error');
      return;
    }

    const activeCars = CarRepository.getAllCars();
    const soldCars = CarRepository.getSoldCars();
    const allCars = [
      ...activeCars.map(c => ({ car: c, isSold: false })),
      ...soldCars.map(c => ({ car: c, isSold: true }))
    ];
    const cleanCell = (v) => `"${String(v ?? '').replace(/"/g, '""')}"`;

    const headers = [
      'كود السيارة', 'الماركة', 'الموديل والفئة', 'سنة الصنع', 'حالة الفابريكة والدهان',
      'العداد (كم)', 'تقييم الفحص الهندسي', 'حالة التوافر', 'سعر البيع (ج.م)',
      'تكلفة الشراء (ج.م)', 'مصروفات التجهيز (ج.م)', 'إجمالي التكلفة (ج.م)',
      'أقل سعر مسموح للمشرف (ج.م)', 'صافي الربح (ج.م)', 'عدد المشاهدات'
    ];

    let totalRevenue = 0;
    let totalCostAll = 0;
    let totalNetProfit = 0;

    const rows = allCars.map(({ car: c, isSold }) => {
      const sellPrice = Number(c.price || 0);
      const buyCost = Number(c.purchaseCost || 0);
      const prepCost = Number(c.prepCost || 0);
      const totalCost = c.totalCost;
      const netProfit = c.expectedProfit;
      totalRevenue += sellPrice;
      totalCostAll += totalCost;
      totalNetProfit += netProfit;
      const statusAr = isSold ? `مباعة (${c.soldAt || ''})` : (c.isReserved ? `محجوزة (${c.reservedByClient || ''})` : 'متاحة بالمعرض');
      return [
        c.id, c.brand, c.model, c.year, c.paintStatus, Number(c.mileageKm || 0),
        `${c.inspectionScore}/10`, statusAr, sellPrice, buyCost, prepCost,
        totalCost, Number(c.minAllowedPrice || 0), netProfit, Number(c.viewsCount || 0)
      ].map(cleanCell).join(',');
    });

    rows.push('');
    rows.push([
      'الإجمالي العام للمعرض', `المتاح: ${activeCars.length}`, `المباع: ${soldCars.length}`,
      '', '', '', '', '', totalRevenue, '', '', totalCostAll, '', totalNetProfit, ''
    ].map(cleanCell).join(','));

    const crmList = CarRepository.getCrmLeads();
    if (crmList.length > 0) {
      rows.push('');
      rows.push(['سجل متابعة العملاء (CRM) — ' + DEALER_BRAND_NAME].map(cleanCell).join(','));
      rows.push(['اسم العميل', 'رقم الهاتف', 'السيارة المطلوبة', 'حالة المتابعة', 'ملاحظات المشرف', 'تاريخ التسجيل'].map(cleanCell).join(','));
      crmList.forEach(item => {
        rows.push([item.name, item.phone, item.interest, item.status, item.notes, item.date].map(cleanCell).join(','));
      });
    }

    const csvContent = '\uFEFF' + [headers.map(cleanCell).join(','), ...rows].join('\r\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `Abu_Bahaa_Inventory_Profit_${new Date().toISOString().slice(0, 10)}.csv`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
    App.showToast('📊 تم تحميل شيت الإكسيل المحاسبي الشامل بنجاح!', 'success');
  },

  // 6. التقرير التنفيذي (.txt)
  exportExecutiveReport() {
    if (!AuthService.isLogged()) return;
    const cars = CarRepository.getAllCars();
    const soldCars = CarRepository.getSoldCars();
    const inspections = CarRepository.getInspections();
    const archivedTi = CarRepository.getArchivedTradeIns();

    const reportContent = [
      '====================================================',
      `   التقرير التنفيذي الرسمي - ${DEALER_BRAND_NAME}`,
      '====================================================',
      `المسؤول المصدر للتقرير: ${AuthService.getName()} (${AuthService.getRole()})`,
      `تاريخ الإصدار: ${new Date().toLocaleString('ar-EG')}`,
      '',
      '1. الملخص الإحصائي العام:',
      `- السيارات المتاحة حالياً بالمعرض: ${cars.length} سيارة`,
      `- إجمالي السيارات المباعة: ${soldCars.length} سيارة`,
      `- إجمالي مواعيد المعاينات: ${inspections.length} موعد`,
      `- طلبات الاستبدال المؤرشفة: ${archivedTi.length} طلب`,
      '',
      '2. بيان السيارات المتاحة حالياً:',
      ...(cars.length ? cars.map((c, i) => `  [${i + 1}] ${c.brand} ${c.model} (${c.year}) | السعر: ${c.formattedPrice} | الحالة: ${c.paintStatus} | الفحص: ${c.inspectionScore}/10 | المشاهدات: ${c.viewsCount}`) : ['  لا توجد سيارات متاحة حالياً.']),
      '',
      '3. بيان السيارات المباعة:',
      ...(soldCars.length ? soldCars.map((c, i) => `  [${i + 1}] ${c.brand} ${c.model} (${c.year}) | السعر: ${c.formattedPrice} | تاريخ البيع: ${c.soldAt} | بواسطة: ${c.soldViaStaff || c.soldBy}`) : ['  لا توجد سيارات مباعة بعد.']),
      '===================================================='
    ].join('\n');

    const blob = new Blob([reportContent], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `Abu_Bahaa_Report_${Date.now().toString().slice(-4)}.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    App.showToast('📥 تم تحميل ملف التقرير التنفيذي بنجاح!', 'success');
  },

  // 7. النسخ الاحتياطي والاستعادة لـ 9 جداول (Backup & Restore)
  exportDatabaseJson() {
    if (!AuthService.isLogged()) {
      App.showToast('🔒 النسخ الاحتياطي متاح لإدارة المعرض فقط', 'error');
      return;
    }
    const dump = {
      meta: {
        dealer: DEALER_BRAND_NAME,
        exportedAt: new Date().toISOString(),
        exportedBy: AuthService.getName(),
        version: 'v9'
      },
      cars: SafeStorage.get(CarRepository.KEY, []),
      soldCars: SafeStorage.get(CarRepository.SOLD_KEY, []),
      reservations: SafeStorage.get(CarRepository.RESERVATIONS_KEY, []),
      inspections: SafeStorage.get(CarRepository.INSPECTIONS_KEY, []),
      tradeIns: SafeStorage.get(CarRepository.TRADEIN_KEY, []),
      archivedTradeIns: SafeStorage.get(CarRepository.ARCHIVED_TRADEIN_KEY, []),
      crmLeads: SafeStorage.get(CarRepository.CRM_KEY, []),
      staffFavorites: SafeStorage.get(CarRepository.STAFF_FAVS_KEY, []),
      admins: SafeStorage.get(AuthService.DB_KEY, [])
    };

    const blob = new Blob([JSON.stringify(dump, null, 2)], { type: 'application/json;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    const dateStr = new Date().toISOString().slice(0, 10);
    a.href = url;
    a.download = `Abu_Bahaa_Full_Backup_${dateStr}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    App.showToast('💾 تم تحميل النسخة الاحتياطية الكاملة للمعرض (9 جداول) بنجاح!', 'success');
  },

  triggerImportDatabaseJson() {
    if (!AuthService.isSuperAdmin()) {
      App.showToast('🔒 استعادة النسخة الاحتياطية مخصصة للمدير العام فقط', 'error');
      return;
    }
    let fileInput = document.getElementById('hidden-restore-json-input');
    if (fileInput) fileInput.remove();

    fileInput = document.createElement('input');
    fileInput.id = 'hidden-restore-json-input';
    fileInput.type = 'file';
    fileInput.accept = '.json,application/json';
    fileInput.style.display = 'none';

    fileInput.onchange = (e) => {
      const file = e.target.files?.[0];
      if (!file) return;
      const reader = new FileReader();
      reader.onload = (ev) => {
        try {
          const data = JSON.parse(ev.target.result);
          if (!data || (!Array.isArray(data.cars) && !Array.isArray(data.soldCars))) {
            App.showToast('❌ ملف النسخة الاحتياطية غير صالح أو تالف.', 'error');
            return;
          }
          const carsCount = Array.isArray(data.cars) ? data.cars.length : 0;
          const soldCount = Array.isArray(data.soldCars) ? data.soldCars.length : 0;

          App.confirmAction(
            'تأكيد استعادة النسخة الاحتياطية',
            `سيتم استعادة (${carsCount} سيارة متاحة و ${soldCount} سيارة مباعة وكافة الحجوزات وسجل الـ CRM وباقي الجداول التسعة) ومزامنتها مع السحابة فوراً. هل تود المتابعة؟`,
            'نعم، استعادة البيانات الآن',
            'bg-emerald-700 hover:bg-emerald-600',
            async () => {
              if (Array.isArray(data.cars)) SafeStorage.set(CarRepository.KEY, data.cars);
              if (Array.isArray(data.soldCars)) SafeStorage.set(CarRepository.SOLD_KEY, data.soldCars);
              if (Array.isArray(data.reservations)) SafeStorage.set(CarRepository.RESERVATIONS_KEY, data.reservations);
              if (Array.isArray(data.inspections)) SafeStorage.set(CarRepository.INSPECTIONS_KEY, data.inspections);
              if (Array.isArray(data.tradeIns)) SafeStorage.set(CarRepository.TRADEIN_KEY, data.tradeIns);
              if (Array.isArray(data.archivedTradeIns)) SafeStorage.set(CarRepository.ARCHIVED_TRADEIN_KEY, data.archivedTradeIns);
              if (Array.isArray(data.crmLeads)) SafeStorage.set(CarRepository.CRM_KEY, data.crmLeads);
              if (Array.isArray(data.staffFavorites)) SafeStorage.set(CarRepository.STAFF_FAVS_KEY, data.staffFavorites);
              if (Array.isArray(data.admins) && data.admins.length > 0) SafeStorage.set(AuthService.DB_KEY, data.admins);

              // Ensure restore can sync even if cloud wasn't hydrated yet
              if (FirebaseCloudService.isConnected && FirebaseCloudService.db) {
                FirebaseCloudService.isCloudHydrated = true;
                await FirebaseCloudService.syncToCloud();
              }
              App.syncAll();
              AdminDrawerUI.openCommandCenter('cloud');
              App.showToast('✅ تم استعادة النسخة الاحتياطية (9 جداول) ومزامنتها مع السحابة بنجاح!', 'success');
            }
          );
        } catch (err) {
          App.showToast('❌ تعذر قراءة ملف الـ JSON، تأكد من اختيار الملف الصحيح.', 'error');
        }
      };
      reader.readAsText(file);
    };

    document.body.appendChild(fileInput);
    fileInput.click();
  }
};

window.AdminToolsUI = AdminToolsUI;
