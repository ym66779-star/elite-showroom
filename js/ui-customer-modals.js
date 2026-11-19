/* ============================================================================
   Abu Bahaa Showroom - Customer Modals, Purchasing Power, Trade-In, VIP & AI Chat
   ============================================================================ */

const CustomerModalsUI = {
  openCompareModal() {
    const isAdmin = AuthService.isLogged();
    const compIds = CarRepository.getCompare(isAdmin);
    const compCars = CarRepository.getAllCars().filter(c => compIds.includes(String(c.id)));

    App.openModalHtml(`
      <div class="bg-white rounded-3xl max-w-5xl w-full p-6 shadow-2xl relative max-h-[90vh] overflow-y-auto custom-scroll">
        <div class="flex justify-between items-center border-b pb-3 mb-4">
          <div>
            <h3 class="font-black text-xl text-blue-950">⚖️ جدول المقارنة الفنية الشاملة (${compCars.length}/3)</h3>
            <p class="text-xs text-slate-500">مقارنة دقيقة للمواصفات، الأسعار، حالة الفابريكة، ونتائج الفحص الهندسي جنباً إلى جنب</p>
          </div>
          <div class="flex items-center gap-2">
            ${compCars.length > 0 ? `<button type="button" onclick="App.clearCompareAll()" class="bg-rose-100 hover:bg-rose-200 text-rose-700 text-xs font-bold px-3 py-1.5 rounded-xl">🗑️ مسح الكل</button>` : ''}
            <button type="button" onclick="App.closeModal()" class="bg-slate-200 hover:bg-slate-300 text-slate-900 w-8 h-8 rounded-full font-black text-sm flex items-center justify-center">✕</button>
          </div>
        </div>

        ${compCars.length === 0 ? `
          <div class="py-12 text-center space-y-3">
            <div class="text-4xl">⚖️</div>
            <p class="text-slate-500 text-sm font-bold">لم تقم بإضافة سيارات للمقارنة بعد.</p>
            <p class="text-slate-400 text-xs">اضغط على أيقونة <b>"⚖️"</b> أعلى صورة أي سيارة لإضافتها هنا (حتى 3 سيارات).</p>
          </div>
        ` : `
          <div class="overflow-x-auto">
            <table class="w-full text-right text-xs border-collapse border rounded-2xl overflow-hidden">
              <thead>
                <tr class="bg-slate-900 text-white">
                  <th class="p-3 border border-slate-700">وجه المقارنة</th>
                  ${compCars.map(c => `<th class="p-3 border border-slate-700 text-amber-300 font-black">${escapeHtml(c.brand)} ${escapeHtml(c.model)}</th>`).join('')}
                </tr>
              </thead>
              <tbody class="divide-y">
                <tr><td class="p-3 border font-bold bg-slate-50">الصورة</td>${compCars.map(c => `<td class="p-3 border text-center"><img src="${escapeHtml(c.imageUrl)}" onerror="this.src='${DEFAULT_CAR_IMAGE}'" class="w-32 h-20 object-cover rounded-xl mx-auto cursor-pointer" onclick="App.openDetails('${escapeHtml(c.id)}')" /></td>`).join('')}</tr>
                <tr><td class="p-3 border font-bold bg-slate-50">السعر النقدي</td>${compCars.map(c => `<td class="p-3 border font-black text-sm text-blue-900">${c.formattedPrice}${c.hasDiscount ? `<br><span class="text-[10px] text-rose-500 line-through">${c.formattedOldPrice}</span>` : ''}</td>`).join('')}</tr>
                <tr><td class="p-3 border font-bold bg-slate-50">حالة الفابريكة والدهان</td>${compCars.map(c => `<td class="p-3 border font-black text-emerald-700">🛡️ ${escapeHtml(c.paintStatus)}</td>`).join('')}</tr>
                <tr><td class="p-3 border font-bold bg-slate-50">سنة الصنع والعداد</td>${compCars.map(c => `<td class="p-3 border font-bold">${c.year} | <span class="text-amber-700">${c.formattedMileage}</span></td>`).join('')}</tr>
                <tr><td class="p-3 border font-bold bg-slate-50">التقييم الهندسي العام</td>${compCars.map(c => `<td class="p-3 border font-black text-teal-700">${c.inspectionScore}/10 (${c.inspectionBadge})</td>`).join('')}</tr>
                <tr><td class="p-3 border font-bold bg-slate-50">تفاصيل الفحص (محرك/فتيس/هيكل/صالون)</td>${compCars.map(c => `<td class="p-3 border text-[11px] font-semibold">محرك: ${c.engineScore} | فتيس: ${c.gearScore} | هيكل: ${c.bodyScore} | صالون: ${c.interiorScore}</td>`).join('')}</tr>
                <tr><td class="p-3 border font-bold bg-slate-50">أقصى فترة تقسيط</td>${compCars.map(c => `<td class="p-3 border font-bold">${c.maxInstallmentMonths} شهراً</td>`).join('')}</tr>
                <tr><td class="p-3 border font-bold bg-slate-50">إجراءات</td>${compCars.map(c => `<td class="p-3 border text-center space-x-1 space-x-reverse"><button type="button" onclick="App.openDetails('${escapeHtml(c.id)}')" class="bg-blue-900 text-white px-3 py-1.5 rounded-lg font-bold">التفاصيل والتقسيط</button><button type="button" onclick="App.toggleCompare('${escapeHtml(c.id)}'); App.openCompareModal();" class="bg-rose-100 text-rose-700 px-3 py-1.5 rounded-lg font-bold">إزالة</button></td>`).join('')}</tr>
              </tbody>
            </table>
          </div>
        `}
      </div>
    `);
  },

  clearCompareAll() {
    const isAdmin = AuthService.isLogged();
    CarRepository.clearCompare(isAdmin);
    App.syncAll();
    this.openCompareModal();
    App.showToast('🗑️ تم إفراغ جدول المقارنة.', 'info');
  },

  openClientFavModal() {
    const favIds = CarRepository.getFavorites();
    const allCars = [...CarRepository.getAllCars(), ...CarRepository.getSoldCars()];
    const favCars = allCars.filter(c => favIds.includes(String(c.id)));
    const isAdmin = AuthService.isLogged();

    App.openModalHtml(`
      <div class="bg-white rounded-3xl max-w-2xl w-full p-6 shadow-2xl relative max-h-[90vh] overflow-y-auto custom-scroll">
        <button type="button" onclick="App.closeModal()" class="absolute top-4 left-4 bg-slate-200 hover:bg-slate-300 text-slate-900 w-8 h-8 rounded-full font-black text-sm flex items-center justify-center">✕</button>
        <h3 class="font-black text-lg mb-1 text-rose-700">❤️ ${isAdmin ? 'سجل اهتمامات ومفضلة العملاء' : 'قائمة سياراتي المفضلة'}</h3>
        <p class="text-xs text-slate-500 mb-4">${isAdmin ? 'اطلاع إداري على السيارات الأكثر تفضيلاً لدى زوار المعرض.' : 'السيارات التي قمت بحفظها للرجوع إليها بسهولة.'}</p>

        ${favCars.length === 0 ? '<p class="text-slate-400 py-10 text-center text-xs font-bold">لا توجد سيارات مضافة في المفضلة حالياً.</p>' : `
          <div class="space-y-3">
            ${favCars.map(c => `
              <div class="bg-slate-50 p-3 rounded-2xl border flex justify-between items-center gap-3 text-xs">
                <div onclick="App.openDetails('${escapeHtml(c.id)}')" class="flex gap-3 items-center cursor-pointer flex-grow">
                  <img src="${escapeHtml(c.imageUrl)}" onerror="this.src='${DEFAULT_CAR_IMAGE}'" class="w-16 h-12 object-cover rounded-xl shrink-0" />
                  <div>
                    <h4 class="font-black text-slate-900">${escapeHtml(c.brand)} ${escapeHtml(c.model)} ${c.soldAt ? '<span class="text-rose-600 text-[10px]">(مباعة)</span>' : ''}</h4>
                    <p class="text-blue-900 font-bold">${c.formattedPrice}</p>
                  </div>
                </div>
                ${!isAdmin ? `<button type="button" onclick="App.toggleFav('${escapeHtml(c.id)}'); App.openClientFavModal();" class="bg-rose-100 hover:bg-rose-200 text-rose-700 px-3 py-1.5 rounded-xl font-bold">إزالة</button>` : `<span class="text-slate-400 font-bold">❤️ ${c.favoritesCount}</span>`}
              </div>
            `).join('')}
          </div>
        `}
      </div>
    `);
  },

  openGeneralFinanceModal() {
    App.openModalHtml(`
      <div class="bg-white rounded-3xl max-w-2xl w-full p-6 shadow-2xl my-auto border border-slate-200 text-xs max-h-[92vh] overflow-y-auto custom-scroll relative">
        <div class="flex items-center justify-between border-b pb-4 mb-4">
          <div class="flex items-center gap-2.5">
            <span class="bg-blue-950 text-amber-400 w-10 h-10 rounded-2xl flex items-center justify-center text-lg font-black shadow">🧮</span>
            <div>
              <h3 class="text-base sm:text-lg font-black text-slate-900">حاسبة التمويل والقدرة الشرائية الذكية</h3>
              <p class="text-[11px] text-slate-500">احسب قسطك الشهري أو اعرف السيارات المتاحة بالمعرض التي تناسب مقدمك</p>
            </div>
          </div>
          <button type="button" onclick="App.closeModal()" class="bg-slate-200 hover:bg-rose-600 hover:text-white text-slate-900 w-8 h-8 rounded-full font-black transition">✕</button>
        </div>

        <div class="grid grid-cols-1 sm:grid-cols-2 gap-3.5 mb-4">
          <div>
            <label class="block font-black text-slate-700 mb-1">سعر السيارة التقريبي (ج.م)</label>
            <input id="gf-car-price" type="number" min="100000" step="50000" value="1800000" oninput="App.recalcGeneralFinance()" class="w-full border border-slate-300 rounded-xl px-3 py-2.5 font-black text-blue-950 text-sm" />
          </div>
          <div>
            <label class="block font-black text-slate-700 mb-1">الدفعة المقدمة المتاحة معك (ج.م)</label>
            <input id="gf-down-payment" type="number" min="50000" step="25000" value="540000" oninput="App.recalcGeneralFinance()" class="w-full border border-slate-300 rounded-xl px-3 py-2.5 font-black text-emerald-700 text-sm" />
          </div>
          <div>
            <label class="block font-black text-slate-700 mb-1">نظام التمويل المطلوب</label>
            <select id="gf-program" onchange="App.recalcGeneralFinance()" class="w-full border border-slate-300 rounded-xl px-3 py-2.5 font-bold bg-white">
              <option value="13.5">🏦 تمويل بنكي (موظفين / معاشات - مقدم يبدأ من 20%)</option>
              <option value="14.5" selected>🏢 أصحاب الأعمال والسجل التجاري (مقدم 30%)</option>
              <option value="16.5">⚡ بصورة البطاقة فقط بدون إثبات دخل (مقدم 40%)</option>
            </select>
          </div>
          <div>
            <label class="block font-black text-slate-700 mb-1">مدة السداد (من سنة إلى 7 سنوات)</label>
            <select id="gf-months" onchange="App.recalcGeneralFinance()" class="w-full border border-slate-300 rounded-xl px-3 py-2.5 font-black bg-white">
              <option value="12">12 شهراً (سنة واحدة)</option>
              <option value="24">24 شهراً (سنتان)</option>
              <option value="36" selected>36 شهراً (3 سنوات - الأكثر طلباً)</option>
              <option value="48">48 شهراً (4 سنوات)</option>
              <option value="60">60 شهراً (5 سنوات)</option>
              <option value="72">72 شهراً (6 سنوات)</option>
              <option value="84">84 شهراً (7 سنوات)</option>
            </select>
          </div>
        </div>

        <div class="bg-slate-900 text-white rounded-2xl p-4 grid grid-cols-1 sm:grid-cols-3 gap-3 text-center mb-4 border border-blue-900">
          <div>
            <span class="block text-[10px] text-slate-400 font-bold">صافي مبلغ التمويل</span>
            <span id="gf-loan-out" class="text-base font-black text-white mt-0.5 block">0 ج.م</span>
          </div>
          <div class="border-y sm:border-y-0 sm:border-x border-slate-700 py-2 sm:py-0">
            <span class="block text-[10px] text-amber-300 font-bold">القسط الشهري التقديري</span>
            <span id="gf-monthly-out" class="text-xl font-black text-amber-400 mt-0.5 block">0 ج.م / شهر</span>
          </div>
          <div>
            <span class="block text-[10px] text-emerald-300 font-bold">أقصى سيارة يناسبها مقدمك</span>
            <span id="gf-power-out" class="text-base font-black text-emerald-400 mt-0.5 block">0 ج.م</span>
          </div>
        </div>

        <div class="space-y-2 mb-4">
          <h4 class="font-black text-slate-900 text-xs">🚘 سيارات متاحة بالمعرض تناسب دفعتك المقدمة الآن:</h4>
          <div id="gf-matching-cars-list" class="grid grid-cols-1 sm:grid-cols-2 gap-2 max-h-48 overflow-y-auto pr-1 custom-scroll"></div>
        </div>

        <div class="flex justify-end gap-2 pt-3 border-t">
          <button type="button" onclick="App.sendGeneralFinanceWhatsApp()" class="bg-emerald-600 hover:bg-emerald-500 text-white font-black px-4 py-2.5 rounded-xl flex items-center gap-1.5 shadow transition">
            <span>💬</span> إرسال خطة التمويل للمعرض عبر واتساب
          </button>
        </div>
      </div>
    `);
    this.recalcGeneralFinance();
  },

  recalcGeneralFinance() {
    const price = Math.max(0, Number(document.getElementById('gf-car-price')?.value || 0));
    const down = Math.max(0, Number(document.getElementById('gf-down-payment')?.value || 0));
    const rate = Number(document.getElementById('gf-program')?.value || 14.5);
    const months = Math.max(6, Number(document.getElementById('gf-months')?.value || 36));

    const loan = Math.max(0, price - down);
    const totalPayable = loan + (loan * (rate / 100) * (months / 12));
    const monthly = Math.round(totalPayable / months);
    const maxPurchasingPower = Math.round(down / 0.25);

    const loanEl = document.getElementById('gf-loan-out');
    const monthlyEl = document.getElementById('gf-monthly-out');
    const powerEl = document.getElementById('gf-power-out');
    if (loanEl) loanEl.textContent = loan.toLocaleString('ar-EG') + ' ج.م';
    if (monthlyEl) monthlyEl.textContent = monthly.toLocaleString('ar-EG') + ' ج.م / شهر';
    if (powerEl) powerEl.textContent = 'حتى ' + maxPurchasingPower.toLocaleString('ar-EG') + ' ج.م';

    const listEl = document.getElementById('gf-matching-cars-list');
    if (!listEl) return;
    const matches = CarRepository.getAllCars().filter(c => !c.isReserved && down >= c.price * 0.20);

    if (!matches.length) {
      listEl.innerHTML = `<div class="col-span-full text-center py-4 text-slate-400 font-bold">ارفع قيمة الدفعة المقدمة قليلاً لتظهر لك السيارات المتاحة بالتقسيط (الحد الأدنى للمقدم 20%).</div>`;
      return;
    }

    listEl.innerHTML = matches.map(c => {
      const cLoan = Math.max(0, c.price - down);
      const cMonthly = Math.round((cLoan + (cLoan * (rate / 100) * (months / 12))) / months);
      return `
        <div onclick="App.openDetails('${escapeHtml(c.id)}')" class="bg-slate-50 hover:bg-blue-50/60 border border-slate-200 rounded-xl p-2.5 flex items-center gap-2.5 cursor-pointer transition">
          <img src="${escapeHtml(c.imageUrl)}" onerror="this.src='${DEFAULT_CAR_IMAGE}'" class="w-14 h-10 rounded-lg object-cover shrink-0" />
          <div class="overflow-hidden">
            <div class="font-black text-slate-900 truncate">${escapeHtml(c.brand)} ${escapeHtml(c.model)} (${c.year})</div>
            <div class="text-emerald-700 font-black text-[11px]">قسطها بمقدمك: ${cMonthly.toLocaleString('ar-EG')} ج.م/شهر</div>
          </div>
        </div>
      `;
    }).join('');
  },

  sendGeneralFinanceWhatsApp() {
    const price = Number(document.getElementById('gf-car-price')?.value || 0);
    const down = Number(document.getElementById('gf-down-payment')?.value || 0);
    const months = Number(document.getElementById('gf-months')?.value || 36);
    const monthlyTxt = document.getElementById('gf-monthly-out')?.textContent || '';
    const msg =
      `🧮 *استفسار تمويل وتقسيط — ${DEALER_BRAND_NAME}*\n` +
      `• ميزانية السيارة المطلوبة: ${price.toLocaleString('ar-EG')} ج.م\n` +
      `• الدفعة المقدمة المتاحة: ${down.toLocaleString('ar-EG')} ج.م\n` +
      `• مدة التقسيط: ${months} شهراً\n` +
      `• القسط الشهري التقديري: ${monthlyTxt}\n` +
      `يرجى إفادتي بالسيارات المتاحة والأوراق المطلوبة للتنفيذ.`;
    App.whatsApp(DEFAULT_DEALER_PHONE, msg);
  },

  openTradeInModal() {
    App.openModalHtml(`
      <div class="bg-white rounded-3xl max-w-lg w-full p-6 shadow-2xl relative max-h-[90vh] overflow-y-auto custom-scroll">
        <button type="button" onclick="App.closeModal()" class="absolute top-4 left-4 bg-slate-200 hover:bg-slate-300 text-slate-900 w-8 h-8 rounded-full font-black text-sm flex items-center justify-center">✕</button>
        <h3 class="font-black text-lg mb-1 text-amber-700">🔄 استبدل سيارتك القديمة أو بعها نقداً</h3>
        <p class="text-xs text-slate-500 mb-4">أدخل مواصفات سيارتك وسيقوم خبراء التثمين بالمعرض بالتواصل معك بأفضل عرض سعر.</p>
        <form id="tradein-form" class="space-y-3 text-xs">
          <div class="grid grid-cols-2 gap-3">
            <input id="ti-brand" required placeholder="ماركة سيارتك (مثال: هيونداي)" class="w-full border p-2.5 rounded-xl" />
            <input id="ti-model" required placeholder="الموديل والفئة" class="w-full border p-2.5 rounded-xl" />
          </div>
          <div class="grid grid-cols-2 gap-3">
            <input id="ti-year" required type="number" min="1990" max="2027" placeholder="سنة الصنع" class="w-full border p-2.5 rounded-xl" />
            <input id="ti-km" required type="number" min="0" placeholder="عداد الكيلومترات (كم)" class="w-full border p-2.5 rounded-xl" />
          </div>
          <select id="ti-type" class="w-full border p-2.5 rounded-xl font-bold text-slate-700 bg-white">
            <option value="استبدال">استبدال بسيارة أحدث من المعرض</option>
            <option value="بيع">بيع نقدي مباشر للمعرض</option>
          </select>
          <textarea id="ti-desc" required placeholder="حالة الدهان، الصيانات، أو السيارة التي ترغب في الاستبدال بها..." class="w-full border p-2.5 rounded-xl h-20"></textarea>
          <div class="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <input id="ti-name" required placeholder="اسمك الثلاثي *" class="w-full border p-2.5 rounded-xl" />
            <input id="ti-phone" required type="tel" placeholder="رقم الموبايل *" class="w-full border p-2.5 rounded-xl" />
          </div>
          <button type="submit" class="w-full bg-amber-500 hover:bg-amber-400 text-slate-950 font-black py-3 rounded-xl shadow transition">إرسال طلب التثمين والاستبدال</button>
        </form>
      </div>
    `);

    document.getElementById('tradein-form').onsubmit = (e) => {
      e.preventDefault();
      CarRepository.addTradeIn({
        id: 'TI-' + Date.now().toString().slice(-5),
        brand: document.getElementById('ti-brand').value.trim(),
        model: document.getElementById('ti-model').value.trim(),
        year: document.getElementById('ti-year').value.trim(),
        km: Number(document.getElementById('ti-km').value).toLocaleString('ar-EG'),
        type: document.getElementById('ti-type').value,
        desc: document.getElementById('ti-desc').value.trim(),
        clientName: document.getElementById('ti-name').value.trim(),
        clientPhone: document.getElementById('ti-phone').value.trim(),
        requestedAt: new Date().toLocaleString('ar-EG')
      });
      App.closeModal();
      App.syncAll();
      App.showToast('✅ تم إرسال طلب التثمين لإدارة المعرض بنجاح!', 'success');
    };
  },

  openVipRequestModal(prefillSearch = '') {
    App.openModalHtml(`
      <div class="bg-white rounded-3xl max-w-lg w-full p-6 shadow-2xl relative max-h-[92vh] overflow-y-auto custom-scroll">
        <button type="button" onclick="App.closeModal()" class="absolute top-4 left-4 bg-slate-200 hover:bg-slate-300 text-slate-900 w-8 h-8 rounded-full font-black text-sm flex items-center justify-center">✕</button>
        <div class="flex items-center gap-2.5 mb-2">
          <span class="bg-amber-400 text-slate-950 w-10 h-10 rounded-2xl flex items-center justify-center text-xl font-black shadow">🎯</span>
          <div>
            <h3 class="font-black text-base sm:text-lg text-slate-900">خدمة توفير سيارة بالطلب الخاص (VIP Order)</h3>
            <p class="text-xs text-slate-500">نوفر لك أي سيارة مفحوصة ومعتمدة بمواصفاتك وميزانيتك خلال 48 ساعة</p>
          </div>
        </div>

        <form id="vip-order-form" class="space-y-3 text-xs mt-4">
          <div class="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label class="block font-bold text-slate-700 mb-1">الماركة والموديل المطلوب *</label>
              <input id="vip-car" required value="${escapeHtml(prefillSearch)}" placeholder="مثال: أودي Q3 أو تويوتا راف فور" class="w-full border p-2.5 rounded-xl font-bold" />
            </div>
            <div>
              <label class="block font-bold text-slate-700 mb-1">موديل السنة المفضل *</label>
              <input id="vip-year" required value="2024 - 2026" placeholder="مثال: من 2023 إلى 2026" class="w-full border p-2.5 rounded-xl font-bold" />
            </div>
          </div>

          <div class="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label class="block font-bold text-slate-700 mb-1">الميزانية التقريبية (ج.م) *</label>
              <input id="vip-budget" required type="number" min="100000" step="50000" placeholder="مثال: 2200000" class="w-full border p-2.5 rounded-xl font-black text-blue-900" />
            </div>
            <div>
              <label class="block font-bold text-slate-700 mb-1">نظام الشراء المفضل</label>
              <select id="vip-pay-type" class="w-full border p-2.5 rounded-xl font-bold bg-white">
                <option value="شراء كاش نقدي">💵 شراء كاش نقدي</option>
                <option value="تقسيط بنكي / شركات">💳 تقسيط بنكي / شركات</option>
                <option value="استبدال بسيارتي الحالية">🔄 استبدال بسيارتي الحالية</option>
              </select>
            </div>
          </div>

          <div>
            <label class="block font-bold text-slate-700 mb-1">اللون المفضل أو مواصفات خاصة (الفئة / حالة الدهان)</label>
            <textarea id="vip-notes" placeholder="مثال: يفضل اللون الأسود أو الرمادي، أعلى فئة بانوراما، فابريكة بالكامل..." class="w-full border p-2.5 rounded-xl h-16"></textarea>
          </div>

          <div class="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <input id="vip-name" required placeholder="اسمك الكريم *" class="w-full border p-2.5 rounded-xl font-bold" />
            <input id="vip-phone" required type="tel" placeholder="رقم الموبايل للتواصل *" class="w-full border p-2.5 rounded-xl font-bold" />
          </div>

          <button type="submit" class="w-full bg-slate-900 hover:bg-slate-800 text-amber-400 font-black py-3 rounded-xl shadow-lg transition flex items-center justify-center gap-2">
            <span>🚀</span> إرسال طلب التوفير الخاص لإدارة المشتريات
          </button>
        </form>
      </div>
    `);

    document.getElementById('vip-order-form').onsubmit = (e) => {
      e.preventDefault();
      CarRepository.addTradeIn({
        id: 'VIP-' + Date.now().toString().slice(-5),
        brand: document.getElementById('vip-car').value.trim(),
        model: `(طلب توفير VIP - ${document.getElementById('vip-pay-type').value})`,
        year: document.getElementById('vip-year').value.trim(),
        km: `ميزانية: ${(Number(document.getElementById('vip-budget').value) || 0).toLocaleString('ar-EG')} ج.م`,
        type: '🎯 طلب شراء خاص (VIP)',
        desc: document.getElementById('vip-notes').value.trim() || 'مطلوب فابريكة بحالة ممتازة',
        clientName: document.getElementById('vip-name').value.trim(),
        clientPhone: document.getElementById('vip-phone').value.trim(),
        requestedAt: new Date().toLocaleString('ar-EG')
      });

      App.closeModal();
      App.syncAll();
      App.showToast('🎯 تم تسجيل طلبك الخاص في قسم المشتريات بالمعرض وسنتواصل معك فوراً!', 'success');
    };
  },

  openReserveModal(carId) {
    const { car } = CarRepository.findCarAnywhere(carId);
    if (!car || car.isReserved) {
      App.showToast('⚠️ هذه السيارة محجوزة بالفعل حالياً.', 'warning');
      return;
    }
    const isAdmin = AuthService.isLogged();
    const carIdEsc = escapeHtml(car.id);

    App.openModalHtml(`
      <div class="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl relative">
        <button type="button" onclick="App.openDetails('${carIdEsc}')" class="absolute top-4 left-4 bg-slate-200 hover:bg-slate-300 text-slate-900 w-8 h-8 rounded-full font-black text-sm flex items-center justify-center">✕</button>
        <h3 class="font-black text-lg mb-1 text-purple-900">🔒 طلب حجز مؤقت للسيارة</h3>
        <p class="text-xs text-slate-500 mb-4">${escapeHtml(car.brand)} ${escapeHtml(car.model)} — ${car.formattedPrice}</p>
        <form id="reserve-form" class="space-y-3 text-xs">
          <div>
            <label class="block font-bold text-slate-700 mb-1">اسم العميل الثلاثي *</label>
            <input id="res-name" required placeholder="أدخل الاسم بالكامل" class="w-full border p-2.5 rounded-xl" />
          </div>
          <div>
            <label class="block font-bold text-slate-700 mb-1">رقم الموبايل للتأكيد *</label>
            <input id="res-phone" required type="tel" placeholder="010xxxxxxxx" class="w-full border p-2.5 rounded-xl" />
          </div>
          <button type="submit" class="w-full bg-purple-700 hover:bg-purple-600 text-white font-black py-3 rounded-xl shadow transition">
            ${isAdmin ? 'تسجيل الحجز للعميل' : 'إرسال طلب الحجز للإدارة'}
          </button>
        </form>
      </div>
    `);

    document.getElementById('reserve-form').onsubmit = (e) => {
      e.preventDefault();
      const resObj = {
        id: 'RES-' + Date.now().toString().slice(-5),
        carId: car.id,
        carTitle: `${car.brand} ${car.model} (${car.year})`,
        clientName: document.getElementById('res-name').value.trim(),
        clientPhone: document.getElementById('res-phone').value.trim(),
        handledBy: isAdmin ? AuthService.getName() : 'بانتظار مراجعة المشرف',
        status: 'pending_admin',
        requestedAt: new Date().toLocaleString('ar-EG')
      };

      const ok = CarRepository.addReservation(resObj, !isAdmin);
      App.showToast(
        ok ? '✅ تم تسجيل طلب الحجز في السحابة بنجاح!' : '⚠️ يوجد طلب حجز مسجل مسبقاً بنفس الرقم لهذه السيارة.',
        ok ? 'success' : 'warning'
      );
      App.syncAll();
      App.openDetails(car.id);
    };
  },

  openInspectionBookingModal(carId) {
    const { car } = CarRepository.findCarAnywhere(carId);
    if (!car) return;
    const todayStr = new Date().toISOString().split('T')[0];
    const carIdEsc = escapeHtml(car.id);

    App.openModalHtml(`
      <div class="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl relative">
        <button type="button" onclick="App.openDetails('${carIdEsc}')" class="absolute top-4 left-4 bg-slate-200 hover:bg-slate-300 text-slate-900 w-8 h-8 rounded-full font-black text-sm flex items-center justify-center">✕</button>
        <h3 class="font-black text-lg mb-1 text-teal-800">🚗 حجز موعد معاينة أو مكالمة فيديو</h3>
        <p class="text-xs text-slate-500 mb-4">${escapeHtml(car.brand)} ${escapeHtml(car.model)} — ${car.formattedPrice}</p>
        <form id="insp-form" class="space-y-3 text-xs">
          <div>
            <label class="block font-bold text-slate-700 mb-1">نوع المعاينة المطلوبة</label>
            <select id="insp-type" class="w-full border p-2.5 rounded-xl font-bold bg-white">
              <option value="معاينة داخل المعرض">معاينة وفحص داخل المعرض</option>
              <option value="مكالمة فيديو مباشر (Video Call)">مكالمة فيديو مباشر (Video Call)</option>
            </select>
          </div>
          <div>
            <label class="block font-bold text-slate-700 mb-1">اسم العميل *</label>
            <input id="insp-name" required placeholder="الاسم الثلاثي" class="w-full border p-2.5 rounded-xl" />
          </div>
          <div>
            <label class="block font-bold text-slate-700 mb-1">رقم الموبايل *</label>
            <input id="insp-phone" required type="tel" placeholder="010xxxxxxxx" class="w-full border p-2.5 rounded-xl" />
          </div>
          <div>
            <label class="block font-bold text-slate-700 mb-1">تاريخ الموعد المقترح *</label>
            <input id="insp-date" required type="date" min="${todayStr}" value="${todayStr}" class="w-full border p-2.5 rounded-xl font-bold" />
          </div>
          <button type="submit" class="w-full bg-teal-700 hover:bg-teal-600 text-white font-black py-3 rounded-xl shadow transition">تأكيد موعد المعاينة</button>
        </form>
      </div>
    `);

    document.getElementById('insp-form').onsubmit = (e) => {
      e.preventDefault();
      const ok = CarRepository.addInspection({
        id: 'INS-' + Date.now().toString().slice(-5),
        carId: car.id,
        carTitle: `${car.brand} ${car.model}`,
        type: document.getElementById('insp-type').value,
        clientName: document.getElementById('insp-name').value.trim(),
        clientPhone: document.getElementById('insp-phone').value.trim(),
        date: document.getElementById('insp-date').value,
        handledBy: 'بانتظار المشرف',
        status: 'pending',
        requestedAt: new Date().toLocaleString('ar-EG')
      });
      App.showToast(
        ok ? '✅ تم تسجيل موعد المعاينة سحابياً وسنتواصل معك!' : '⚠️ لديك طلب معاينة معلق بالفعل لهذه السيارة.',
        ok ? 'success' : 'warning'
      );
      App.closeModal();
      App.syncAll();
    };
  },

  submitVipAlertToCrm(e) {
    if (e) e.preventDefault();
    const name = (document.getElementById('alert-client-name')?.value || '').trim();
    const phone = (document.getElementById('alert-client-phone')?.value || '').trim();
    const carInterest = (document.getElementById('alert-client-car')?.value || '').trim();

    if (!name || !phone) {
      App.showToast('⚠️ يرجى كتابة الاسم ورقم الهاتف لتفعيل التنبيهات', 'warning');
      return;
    }

    CarRepository.addCrmLead({
      name,
      phone,
      interest: carInterest || 'اشتراك في تنبيهات العروض والسيارات الجديدة',
      status: 'مهتم - جاري المتابعة',
      notes: '🔔 سجل بنفسه من نموذج تنبيهات العروض والسيارات الجديدة بالموقع'
    });

    ['alert-client-name', 'alert-client-phone', 'alert-client-car'].forEach(id => {
      const el = document.getElementById(id);
      if (el) el.value = '';
    });

    App.showToast('🎉 تم تسجيلك في قائمة تنبيهات الـ VIP بنجاح! سنتواصل معك بأقوى العروض.', 'success');
  },

  // Smart Assistant Chat
  toggleChat(forceState) {
    const modal = document.getElementById('chat-modal');
    if (!modal) return;
    const show = typeof forceState === 'boolean' ? forceState : modal.classList.contains('hidden');
    modal.classList.toggle('hidden', !show);
    modal.classList.toggle('flex', show);
  },

  quickChat(action) {
    const messages = document.getElementById('chat-messages');
    if (!messages) return;
    const cars = CarRepository.getAllCars();

    const labels = {
      matchmaker: '✨ رشح لي أفضل سيارة حسب ميزانيتي',
      prices: '💰 قائمة الأسعار الحالية',
      installment: '💳 أنظمة التقسيط والأوراق المطلوبة',
      howto: '🚗 خطوات الشراء والحجز',
      human: '👨‍💻 التواصل مع مشرف المبيعات'
    };

    const userDiv = document.createElement('div');
    userDiv.className = 'bg-blue-900 text-white p-2.5 rounded-2xl rounded-tl-none max-w-[85%] self-end shadow-sm leading-relaxed';
    userDiv.textContent = labels[action] || '';
    messages.appendChild(userDiv);

    setTimeout(() => {
      let replyHtml = '';
      if (action === 'prices') {
        replyHtml = cars.length === 0
          ? 'جميع السيارات المتاحة تم بيعها حالياً، ترقبوا الدفعة الجديدة قريباً!'
          : cars.map(c => `• <b>${escapeHtml(c.brand)} ${escapeHtml(c.model)}</b>: ${c.formattedPrice} (${escapeHtml(c.paintStatus)})`).join('<br>');
      } else if (action === 'matchmaker') {
        const currentFilterBudget = document.getElementById('filter-max-price')?.value || '';
        replyHtml = `
          <div class="space-y-2">
            <p class="font-bold text-blue-950">🎯 حدد ميزانيتك وسأقوم بتحليل المعرض وترشيح الأفضل لك فوراً (كاش أو تقسيط):</p>
            <div class="flex gap-1.5">
              <input id="chat-budget-input" type="number" min="50000" step="50000" value="${escapeHtml(currentFilterBudget)}" placeholder="اكتب ميزانيتك (مثال: 2000000)" class="w-full border border-blue-300 rounded-xl px-2.5 py-1.5 text-xs font-bold bg-white text-slate-900 focus:outline-none" />
              <button type="button" onclick="App.runSmartMatchmaker()" class="bg-blue-900 hover:bg-blue-800 text-white px-3 py-1.5 rounded-xl font-black text-xs shrink-0">تحليل ←</button>
            </div>
            <div class="flex flex-wrap gap-1 pt-1">
              <button type="button" onclick="document.getElementById('chat-budget-input').value='600000'; App.runSmartMatchmaker();" class="bg-white border border-blue-200 text-blue-900 px-2 py-0.5 rounded-lg text-[10px] font-bold hover:bg-blue-50">600 ألف (مقدم)</button>
              <button type="button" onclick="document.getElementById('chat-budget-input').value='1500000'; App.runSmartMatchmaker();" class="bg-white border border-blue-200 text-blue-900 px-2 py-0.5 rounded-lg text-[10px] font-bold hover:bg-blue-50">1.5 مليون</button>
              <button type="button" onclick="document.getElementById('chat-budget-input').value='2500000'; App.runSmartMatchmaker();" class="bg-white border border-blue-200 text-blue-900 px-2 py-0.5 rounded-lg text-[10px] font-bold hover:bg-blue-50">2.5 مليون</button>
              <button type="button" onclick="document.getElementById('chat-budget-input').value='4000000'; App.runSmartMatchmaker();" class="bg-white border border-blue-200 text-blue-900 px-2 py-0.5 rounded-lg text-[10px] font-bold hover:bg-blue-50">4 مليون</button>
            </div>
          </div>`;
      } else if (action === 'installment') {
        replyHtml = '💳 <b>برامج التمويل المتاحة بالمعرض:</b><br>1. <b>بصورة البطاقة فقط:</b> بمقدم 40% وموافقة خلال 24 ساعة.<br>2. <b>تمويل بنكي:</b> بمقدم يبدأ من 20% للموظفين.<br>3. <b>سجل تجاري:</b> بمقدم 30% لأصحاب الأعمال.<br>افتح أي سيارة وجرب الأزرار الثلاثة داخل الحاسبة!';
      } else if (action === 'howto') {
        replyHtml = '🚗 يمكنك الضغط على أي سيارة لمراجعة خريطة الفابريكة وتقرير الفحص الـ 4 محاور، أو طباعة ملصق الـ QR Code، أو طلب <b>حجز مؤقت</b> بضغطة زر.';
      } else if (action === 'human') {
        replyHtml = `👨‍💻 فريق المبيعات جاهز لخدمتك فوراً.<br><button type="button" onclick="App.whatsApp('${DEFAULT_DEALER_PHONE}', 'مرحباً ${escapeHtml(DEALER_BRAND_NAME)}، أرغب في التحدث مع مشرف المبيعات')" class="mt-2 bg-emerald-600 text-white px-3 py-1 rounded-lg font-bold">💬 فتح واتساب المشرف</button>`;
      }

      const aiDiv = document.createElement('div');
      aiDiv.className = 'bg-blue-100 text-blue-950 p-3 rounded-2xl rounded-tr-none max-w-[92%] self-start shadow-sm leading-relaxed';
      aiDiv.innerHTML = replyHtml;
      messages.appendChild(aiDiv);

      while (messages.children.length > 14) messages.removeChild(messages.firstChild);
      messages.scrollTop = messages.scrollHeight;
    }, 150);
  },

  runSmartMatchmaker() {
    const messages = document.getElementById('chat-messages');
    const inputEl = document.getElementById('chat-budget-input');
    const budget = Number(inputEl?.value) || 0;
    const cars = CarRepository.getAllCars().filter(c => !c.isReserved);

    if (budget <= 0) {
      App.showToast('⚠️ يرجى كتابة مبلغ الميزانية أولاً.', 'warning');
      return;
    }

    const cashMatches = cars.filter(c => c.price <= budget).sort((a, b) => b.inspectionScore - a.inspectionScore);
    let resultHtml = '';

    if (cashMatches.length > 0) {
      const topCar = cashMatches[0];
      const saving = budget - topCar.price;
      const maxPriceEl = document.getElementById('filter-max-price');
      if (maxPriceEl) maxPriceEl.value = budget;
      CatalogUI.applyFilters();

      resultHtml = `
        ✅ <b>وجدنا ${cashMatches.length} سيارة تناسب ميزانيتك النقدية (${budget.toLocaleString('ar-EG')} ج.م)!</b><br>
        🏆 <b>أفضل ترشيح لك:</b> ${escapeHtml(topCar.brand)} ${escapeHtml(topCar.model)} (${topCar.year})<br>
        • السعر: <b>${topCar.formattedPrice}</b> ${saving > 0 ? `(ستوفر ${saving.toLocaleString('ar-EG')} ج.م)` : ''}<br>
        • الحالة: <b>${escapeHtml(topCar.paintStatus)} (${topCar.inspectionScore}/10)</b><br>
        <button type="button" onclick="App.openDetails('${escapeHtml(topCar.id)}')" class="mt-2 bg-blue-900 text-white px-3 py-1.5 rounded-xl font-bold text-[11px] w-full">🔍 عرض تفاصيل السيارة المرشحة</button>
      `;
    } else {
      const installmentMatches = cars.filter(c => budget >= c.price * 0.2).sort((a, b) => a.price - b.price);
      if (installmentMatches.length > 0) {
        const instCar = installmentMatches[0];
        const financed = instCar.price - budget;
        const months = instCar.maxInstallmentMonths || 60;
        const monthly = Math.round((financed + (financed * 0.145 * (months / 12))) / months);

        resultHtml = `
          💡 ميزانيتك (<b>${budget.toLocaleString('ar-EG')} ج.م</b>) أقل من أسعار الكاش الحالية، ولكنها <b>ممتازة كمقدم تقسيط!</b><br>
          🌟 <b>نرشح لك بالتقسيط:</b> ${escapeHtml(instCar.brand)} ${escapeHtml(instCar.model)}<br>
          • السعر الإجمالي: ${instCar.formattedPrice}<br>
          • بمقدم <b>${budget.toLocaleString('ar-EG')} ج.م</b> وقسط شهري نحو <b>${monthly.toLocaleString('ar-EG')} ج.م</b> على ${months} شهراً.<br>
          <button type="button" onclick="App.openDetails('${escapeHtml(instCar.id)}')" class="mt-2 bg-amber-500 text-slate-950 px-3 py-1.5 rounded-xl font-black text-[11px] w-full">🧮 افتح حاسبة التقسيط للسيارة</button>
        `;
      } else {
        resultHtml = `⚠️ عذراً، المبلغ المدخل (${budget.toLocaleString('ar-EG')} ج.م) أقل من الحد الأدنى لمقدم التقسيط (20%) للسيارات المتاحة حالياً.`;
      }
    }

    const aiDiv = document.createElement('div');
    aiDiv.className = 'bg-amber-50 border border-amber-300 text-slate-900 p-3 rounded-2xl rounded-tr-none max-w-[92%] self-start shadow-sm leading-relaxed';
    aiDiv.innerHTML = resultHtml;
    messages.appendChild(aiDiv);
    messages.scrollTop = messages.scrollHeight;
  }
};

window.CustomerModalsUI = CustomerModalsUI;
