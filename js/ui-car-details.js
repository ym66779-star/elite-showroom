/* ============================================================================
   Abu Bahaa Showroom - Immersive Car Details, Calculators & A4 Docs (v10)
   ============================================================================ */

const CarDetailsUI = {
  activeGalleryList: [],
  activeCalcCarPrice: 0,
  currentCalcState: { down: 0, months: 36, monthly: 0, programName: 'النظام القياسي (30% مقدم)' },
  _lastInlineTradeIn: null,
  _tempSharePayload: '',
  _tempShareUrlOnly: '',

  openDetails(id) {
    const found = CarRepository.findCarAnywhere(id);
    if (!found.car) {
      App.showToast('هذه السيارة لم تعد متوفرة.', 'warning');
      return;
    }
    if (found.isSold) {
      this.openSoldDetails(id);
      return;
    }

    CarRepository.incrementClientView(id);
    const { car } = CarRepository.findCarAnywhere(id);
    App.syncAll();

    const isAdmin = AuthService.isLogged();
    const role = AuthService.getRole();
    const username = AuthService.getUsername();
    const isReservedByMe = CarRepository.hasClientReservedCar(car.id);
    const maxM = car.maxInstallmentMonths || 60;
    const defaultDown = Math.round(car.price * 0.3);
    const gallery = Array.isArray(car.images) && car.images.length ? car.images : [car.imageUrl];
    this.activeGalleryList = gallery;
    this.activeCalcCarPrice = car.price;
    const isCompared = CarRepository.getCompare(isAdmin).includes(String(car.id));
    const isFav = isAdmin
      ? (CarRepository.getAdminWatchlist(username).some(w => String(w.id) === String(car.id)) ||
         CarRepository.getStaffFavorites().some(w => String(w.carId) === String(car.id)))
      : CarRepository.getFavorites().includes(String(car.id));
    const carIdEsc = escapeHtml(car.id);
    const cleanInspectionBadge = UiIcons.stripEmoji(car.inspectionBadge);

    const favLabel = isAdmin
      ? (isFav ? 'بمفضلة الإدارة' : 'حفظ للإدارة')
      : (isFav ? 'محفوظة بالمفضلة' : 'حفظ بالمفضلة');
    const favIcon = isAdmin
      ? (isFav ? UiIcons.get('starFilled', 'w-3.5 h-3.5 text-accent') : UiIcons.get('star', 'w-3.5 h-3.5'))
      : (isFav ? UiIcons.get('heartFilled', 'w-3.5 h-3.5') : UiIcons.get('heart', 'w-3.5 h-3.5'));
    const favActiveClass = isFav ? (isAdmin ? 'is-compare-active' : 'is-fav-active') : '';

    const similarCars = CarRepository.getAllCars()
      .filter(c => String(c.id) !== String(car.id) && !c.isReserved)
      .sort((a, b) => Math.abs(a.price - car.price) - Math.abs(b.price - car.price))
      .slice(0, 3);

    App.openModalHtml(`
      <div id="printable-quote-area" class="bg-white rounded-3xl max-w-6xl w-full p-5 sm:p-7 shadow-2xl relative max-h-[92vh] overflow-y-auto custom-scroll">
        <!-- ترويسة النافذة والأدوات السريعة -->
        <div class="flex justify-between items-center border-b border-slate-200 pb-3.5 mb-5 flex-wrap gap-2">
          <div class="flex items-center gap-2.5">
            <span class="bg-[#0B0E14] text-[#D4AF37] border border-[#D4AF37]/30 w-9 h-9 rounded-xl flex items-center justify-center shrink-0">
              ${UiIcons.get('car', 'w-5 h-5')}
            </span>
            <div>
              <h4 class="font-black text-sm text-slate-900">${escapeHtml(DEALER_BRAND_NAME)} — وثيقة الفحص والتقسيط</h4>
              <p class="text-[11px] text-slate-500 font-semibold">كود السيارة المرجعي: <span class="font-mono font-bold">${carIdEsc}</span></p>
            </div>
          </div>

          <div class="flex items-center gap-1.5 sm:gap-2 no-print flex-wrap">
            <button id="details-fav-btn" type="button" aria-pressed="${isFav}" onclick="CarDetailsUI.toggleFavInDetails('${carIdEsc}')" class="details-action-pill ${favActiveClass}">
              ${favIcon}
              <span>${favLabel}</span>
            </button>
            <button id="details-compare-btn" type="button" aria-pressed="${isCompared}" onclick="CarDetailsUI.toggleCompareInDetails('${carIdEsc}')" class="details-action-pill ${isCompared ? 'is-compare-active' : ''}">
              ${isCompared ? UiIcons.get('check', 'w-3.5 h-3.5 text-accent') : UiIcons.get('scale', 'w-3.5 h-3.5')}
              <span>${isCompared ? 'بالمقارنة' : 'قارن'}</span>
            </button>
            <button type="button" onclick="App.shareCarNative('${carIdEsc}')" class="btn-luxury-accent text-xs font-black px-3 py-2 rounded-xl inline-flex items-center gap-1.5 shadow-sm">
              ${UiIcons.get('share', 'w-3.5 h-3.5')}
              <span>مشاركة</span>
            </button>
            <button type="button" onclick="App.openWindowStickerModal('${carIdEsc}')" class="btn-luxury-primary text-xs font-black px-3 py-2 rounded-xl inline-flex items-center gap-1.5 shadow-sm">
              ${UiIcons.get('qrCode', 'w-3.5 h-3.5')}
              <span>ملصق الزجاج (QR)</span>
            </button>
            <button type="button" onclick="App.printDocument()" class="btn-luxury-outline text-xs font-bold px-3 py-2 rounded-xl inline-flex items-center gap-1.5">
              ${UiIcons.get('printer', 'w-3.5 h-3.5')}
              <span>طباعة عرض سعر</span>
            </button>
            <button type="button" onclick="App.closeModal()" aria-label="إغلاق" class="btn-luxury-outline w-9 h-9 rounded-full inline-flex items-center justify-center">
              ${UiIcons.get('x', 'w-4 h-4')}
            </button>
          </div>
        </div>

        <!-- تخطيط من عمودين على الديسكتوب (يمين: المعرض والفحص | يسار Sticky: السعر والحاسبة والإجراءات) -->
        <div class="grid grid-cols-1 lg:grid-cols-12 gap-7 items-start">
          <!-- العمود الأيمن: معرض الصور الواسع والمواصفات والفحص الهندسي -->
          <div class="lg:col-span-7 space-y-5">
            <div class="relative rounded-2xl overflow-hidden bg-[#0B0E14] aspect-[16/10] shadow-lg">
              <img id="main-gallery-image" src="${escapeHtml(gallery[0])}" alt="${escapeHtml(car.brand)} ${escapeHtml(car.model)}" onerror="this.src='${DEFAULT_CAR_IMAGE}'" class="w-full h-full object-cover transition duration-300" />
              <div class="absolute inset-0 bg-gradient-to-t from-slate-950/60 via-transparent to-slate-950/20 pointer-events-none"></div>

              <div class="absolute bottom-3.5 right-3.5 bg-[#0B0E14]/85 backdrop-blur-md text-[#D4AF37] text-xs font-black px-3.5 py-1.5 rounded-full border border-[#D4AF37]/35 shadow inline-flex items-center gap-1.5">
                ${UiIcons.get('award', 'w-3.5 h-3.5 text-[#D4AF37]')}
                <span>${escapeHtml(cleanInspectionBadge)} (${car.inspectionScore}/10)</span>
              </div>

              ${car.hasDiscount ? `
                <div class="absolute top-3.5 left-3.5 car-status-badge is-offer">
                  ${UiIcons.get('tag', 'w-3.5 h-3.5')}
                  <span>خصم نقدي ${car.formattedDiscount}</span>
                </div>` : ''}

              ${car.isReserved ? `
                <div class="absolute top-3.5 right-3.5 car-status-badge is-reserved">
                  ${UiIcons.get('lock', 'w-3.5 h-3.5')}
                  <span>محجوزة حالياً</span>
                </div>` : ''}
            </div>

            ${gallery.length > 1 ? `
              <div id="car-gallery-thumbs" class="flex gap-2.5 overflow-x-auto pb-1 no-print custom-scroll">
                ${gallery.map((imgUrl, idx) => `
                  <button type="button" data-thumb-idx="${idx}" onclick="App.setGalleryImage(${idx})" class="gallery-thumb-btn relative rounded-xl overflow-hidden shrink-0 border-2 ${idx === 0 ? 'border-[#B89146] ring-2 ring-[#B89146]/30' : 'border-transparent opacity-75 hover:opacity-100'} transition">
                    <img src="${escapeHtml(imgUrl)}" alt="صورة ${idx + 1}" onerror="this.src='${DEFAULT_CAR_IMAGE}'" class="w-24 h-16 object-cover" />
                  </button>
                `).join('')}
              </div>
            ` : ''}

            <!-- خريطة حالة الفابريكة 6 مناطق -->
            <div class="bg-slate-50 p-4 sm:p-5 rounded-2xl border border-slate-200 space-y-3">
              <div class="flex flex-wrap items-center justify-between gap-2">
                <h4 class="font-black text-xs sm:text-sm text-slate-900 flex items-center gap-2">
                  ${UiIcons.get('shieldCheck', 'w-4 h-4 text-accent')}
                  <span>خريطة حالة الفابريكة والدهان (6 مناطق)</span>
                </h4>
                <span class="bg-accent-soft text-accent border border-accent-subtle px-3 py-0.5 rounded-full text-xs font-black">
                  ${escapeHtml(car.paintStatus)}
                </span>
              </div>
              <p class="text-xs text-slate-600 font-bold bg-white p-3 rounded-xl border border-slate-200">${escapeHtml(car.paintDetails)}</p>
              <div class="grid grid-cols-2 sm:grid-cols-3 gap-2 text-[11px]">
                ${car.bodyZones.map(z => `
                  <div class="bg-white p-2.5 rounded-xl border border-slate-200 flex items-center justify-between gap-1">
                    <span class="font-bold text-slate-600">${z.part}</span>
                    <span class="font-black inline-flex items-center gap-1 ${z.ok ? 'text-slate-900' : 'text-accent'}">
                      ${z.ok ? UiIcons.get('check', 'w-3 h-3 text-accent') : ''}
                      <span>${z.state}</span>
                    </span>
                  </div>
                `).join('')}
              </div>
            </div>

            <!-- شهادة الفحص الهندسي 4 محاور مع أشرطة تقييم بصرية -->
            <div class="bg-slate-50 p-4 sm:p-5 rounded-2xl border border-slate-200">
              <h4 class="font-black text-xs sm:text-sm text-slate-900 mb-3 flex items-center justify-between">
                <span class="inline-flex items-center gap-2">
                  ${UiIcons.get('settings', 'w-4 h-4 text-accent')}
                  <span>شهادة الفحص الهندسي المعتمد (4 محاور)</span>
                </span>
                <span class="bg-accent-soft text-accent px-2.5 py-0.5 rounded-lg border border-accent-subtle text-xs font-black">الإجمالي: ${car.inspectionScore}/10</span>
              </h4>
              <div class="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                ${[
                  { label: 'كفاءة المحرك والحرارة', score: car.engineScore },
                  { label: 'ناقل الحركة (الفتيس)', score: car.gearScore },
                  { label: 'الهيكل الخارجي والدهان', score: car.bodyScore },
                  { label: 'العفشة والصالون الداخلي', score: car.interiorScore }
                ].map(item => {
                  const pct = Math.min(100, Math.round((Number(item.score) || 0) * 10));
                  return `
                    <div class="bg-white p-3.5 rounded-xl border border-slate-200 space-y-2">
                      <div class="flex justify-between items-center font-bold text-slate-700">
                        <span>${item.label}</span>
                        <span class="text-accent font-black">${item.score}/10 <span class="text-[10px] text-slate-400 font-bold">(${pct}%)</span></span>
                      </div>
                      <div class="inspection-progress-track">
                        <div class="inspection-progress-fill" style="width: ${pct}%"></div>
                      </div>
                    </div>
                  `;
                }).join('')}
              </div>
            </div>

            <!-- الوصف التفصيلي والتجهيزات -->
            <div>
              <h4 class="font-black text-sm text-slate-900 mb-2 flex items-center gap-2">
                ${UiIcons.get('fileText', 'w-4 h-4 text-accent')}
                <span>الوصف التفصيلي والتجهيزات</span>
              </h4>
              <p class="text-xs sm:text-sm text-slate-600 leading-relaxed bg-slate-50 p-4 rounded-2xl border border-slate-200">${escapeHtml(car.description)}</p>
            </div>
          </div>

          <!-- العمود الأيسر (Sticky على الديسكتوب): بطاقة السعر + الحاسبة + الإجراءات -->
          <div class="lg:col-span-5 lg:sticky lg:top-0 space-y-4">
            <div class="bg-[#0B0E14] text-white p-5 rounded-2xl shadow-lg border border-[#D4AF37]/25">
              <div class="flex justify-between items-center">
                <span class="text-xs text-[#D4AF37] font-extrabold">${escapeHtml(car.brand)}</span>
                ${car.hasDiscount ? `<span class="car-status-badge is-offer !text-[10px] !py-0.5 !px-2.5">وفر ${car.formattedDiscount}</span>` : ''}
              </div>
              <h3 class="text-xl sm:text-2xl font-black mt-1">${escapeHtml(car.model)}</h3>
              <div class="flex flex-wrap items-center gap-3 text-xs text-slate-300 mt-2.5 pb-3.5 border-b border-white/10">
                <span class="inline-flex items-center gap-1">${UiIcons.get('calendar', 'w-3.5 h-3.5 text-[#D4AF37]')} موديل <b class="text-white">${car.year}</b></span>
                <span class="opacity-40">•</span>
                <span class="inline-flex items-center gap-1">${UiIcons.get('gauge', 'w-3.5 h-3.5 text-[#D4AF37]')} <b class="text-white">${car.formattedMileage}</b></span>
                <span class="opacity-40">•</span>
                <span class="inline-flex items-center gap-1">${UiIcons.get('eye', 'w-3.5 h-3.5 text-[#D4AF37]')} <b class="text-white">${car.viewsCount}</b></span>
              </div>
              <div class="mt-3.5 flex justify-between items-baseline">
                <span class="text-xs text-slate-300 font-bold">السعر النقدي</span>
                <div class="text-left">
                  ${car.hasDiscount ? `<span class="text-xs text-slate-400 line-through block">${car.formattedOldPrice}</span>` : ''}
                  <span class="text-2xl font-black text-[#D4AF37]">${car.formattedPrice}</span>
                </div>
              </div>
            </div>

            <div class="bg-slate-50 border border-slate-200 text-slate-800 px-3.5 py-2.5 rounded-2xl flex items-center justify-between text-xs font-bold shadow-sm no-print">
              <div class="flex items-center gap-2">
                ${UiIcons.get('flame', 'w-4 h-4 text-accent')}
                <span>إقبال العملاء: شاهدها <b>${car.viewsCount} عميل</b> ${car.favoritesCount > 0 ? `• وفي مفضلة <b>${car.favoritesCount} عملاء</b>` : '• جاهزة للمعاينة الفورية'}</span>
              </div>
              <span class="bg-accent-soft text-accent border border-accent-subtle text-[10px] font-black px-2 py-0.5 rounded-full shrink-0">متاحة للفحص</span>
            </div>

            ${isAdmin ? `
              <div class="grid grid-cols-3 gap-1.5 bg-[#0B0E14] p-2.5 rounded-2xl border border-[#D4AF37]/30 no-print">
                <button type="button" onclick="App.openSocialAdStudio('${carIdEsc}')" class="btn-luxury-accent font-black py-2 px-2 rounded-xl text-[11px] flex items-center justify-center gap-1 shadow">
                  ${UiIcons.get('megaphone', 'w-3.5 h-3.5')}
                  <span>بوست إعلاني</span>
                </button>
                <button type="button" onclick="App.openPrintableContract('RESERVATION', '${carIdEsc}')" class="bg-white/10 hover:bg-white/20 text-[#D4AF37] font-black py-2 px-2 rounded-xl text-[11px] flex items-center justify-center gap-1 transition">
                  ${UiIcons.get('fileText', 'w-3.5 h-3.5')}
                  <span>إيصال عربون</span>
                </button>
                <button type="button" onclick="App.openPrintableContract('SALE', '${carIdEsc}')" class="bg-white/10 hover:bg-white/20 text-white font-black py-2 px-2 rounded-xl text-[11px] flex items-center justify-center gap-1 transition">
                  ${UiIcons.get('fileText', 'w-3.5 h-3.5')}
                  <span>عقد بيع</span>
                </button>
              </div>
            ` : ''}

            ${isAdmin ? (role === 'SuperAdmin' ? `
              <div class="bg-[#0B0E14] text-white p-3.5 rounded-2xl border border-[#D4AF37]/40 space-y-2 text-xs shadow-lg no-print">
                <div class="flex justify-between items-center border-b border-white/10 pb-1.5">
                  <span class="font-black text-[#D4AF37] inline-flex items-center gap-1.5">
                    ${UiIcons.get('lock', 'w-3.5 h-3.5')}
                    <span>البيانات المالية السرية (للمدير العام فقط)</span>
                  </span>
                  <span class="bg-emerald-500/15 text-emerald-300 border border-emerald-500/35 px-2 py-0.5 rounded-lg text-[10px] font-black">صافي الربح: ${car.expectedProfit.toLocaleString('ar-EG')} ج.م</span>
                </div>
                <div class="grid grid-cols-3 gap-2 text-[11px] text-center pt-1">
                  <div class="bg-[#131823] p-2 rounded-xl border border-white/10">
                    <span class="block text-slate-400 text-[10px]">التكلفة الكلية</span>
                    <b class="text-white font-black">${car.totalCost.toLocaleString('ar-EG')} ج.م</b>
                  </div>
                  <div class="bg-[#131823] p-2 rounded-xl border border-white/10">
                    <span class="block text-slate-400 text-[10px]">أقل سعر مسموح</span>
                    <b class="text-[#D4AF37] font-black">${car.minAllowedPrice.toLocaleString('ar-EG')} ج.م</b>
                  </div>
                  <div class="bg-[#131823] p-2 rounded-xl border border-white/10">
                    <span class="block text-slate-400 text-[10px]">أقصى خصم تفاوض</span>
                    <b class="text-rose-300 font-black">${car.maxNegotiationDiscount.toLocaleString('ar-EG')} ج.م</b>
                  </div>
                </div>
              </div>
            ` : `
              <div class="bg-[#131823] text-white p-3 rounded-2xl border border-[#D4AF37]/30 flex justify-between items-center text-xs shadow no-print">
                <div>
                  <span class="font-black text-[#D4AF37] inline-flex items-center gap-1.5">
                    ${UiIcons.get('target', 'w-3.5 h-3.5')}
                    <span>حد التفاوض المسموح للمبيعات:</span>
                  </span>
                  <span class="text-[11px] text-slate-200 block mt-0.5">أقل سعر بيع مسموح بعد التفاوض: <b>${car.minAllowedPrice.toLocaleString('ar-EG')} ج.م</b></span>
                </div>
                <span class="bg-white/10 text-[#D4AF37] font-black px-2.5 py-1 rounded-xl text-[10px] shrink-0">خصم حتى ${car.maxNegotiationDiscount.toLocaleString('ar-EG')} ج.م</span>
              </div>
            `) : ''}

            <div class="grid grid-cols-2 gap-2 no-print">
              <button type="button" onclick="App.openInspectionCertificateModal('${carIdEsc}')" class="btn-luxury-outline font-black py-2.5 px-3 rounded-2xl text-xs flex items-center justify-center gap-1.5 shadow-sm">
                ${UiIcons.get('shieldCheck', 'w-4 h-4 text-accent')}
                <span>شهادة الفحص (A4)</span>
              </button>
              <button type="button" onclick="App.openInstallmentPlansModal('${carIdEsc}')" class="btn-luxury-primary font-black py-2.5 px-3 rounded-2xl text-xs flex items-center justify-center gap-1.5 shadow-sm">
                ${UiIcons.get('table', 'w-4 h-4')}
                <span>جدول السداد (1/3/5)</span>
              </button>
            </div>

            <div class="bg-slate-50 p-4 rounded-2xl border border-slate-200 space-y-3">
              <h4 class="font-black text-sm text-slate-900 flex items-center justify-between">
                <span class="inline-flex items-center gap-1.5">
                  ${UiIcons.get('calculator', 'w-4 h-4 text-accent')}
                  <span>حاسبة وبرامج التقسيط الذكية</span>
                </span>
                <span class="text-[11px] text-accent bg-accent-soft border border-accent-subtle px-2 py-0.5 rounded-lg font-black">حتى ${maxM} شهراً</span>
              </h4>

              <div class="space-y-1.5 no-print">
                <span class="block text-[11px] font-bold text-slate-600">اختر نظام التمويل المناسب لأوراقك:</span>
                <div class="grid grid-cols-3 gap-1.5 text-[10px]">
                  <button type="button" onclick="App.applyInstallmentPreset('ID_ONLY')" data-preset="ID_ONLY" class="preset-tier-btn btn-luxury-outline font-black py-2 px-1.5 rounded-xl text-center flex flex-col items-center gap-0.5">
                    ${UiIcons.get('idCard', 'w-3.5 h-3.5')}
                    <span>بصورة البطاقة</span>
                    <span class="text-[9px] text-slate-500 font-bold">مقدم 40%</span>
                  </button>
                  <button type="button" onclick="App.applyInstallmentPreset('BANK_EMP')" data-preset="BANK_EMP" class="preset-tier-btn btn-luxury-outline font-black py-2 px-1.5 rounded-xl text-center flex flex-col items-center gap-0.5">
                    ${UiIcons.get('building', 'w-3.5 h-3.5')}
                    <span>تمويل بنكي</span>
                    <span class="text-[9px] text-slate-500 font-bold">مقدم 20%</span>
                  </button>
                  <button type="button" onclick="App.applyInstallmentPreset('BUSINESS')" data-preset="BUSINESS" class="preset-tier-btn btn-luxury-primary font-black py-2 px-1.5 rounded-xl text-center shadow-sm flex flex-col items-center gap-0.5">
                    ${UiIcons.get('award', 'w-3.5 h-3.5')}
                    <span>سجل تجاري</span>
                    <span class="text-[9px] opacity-85 font-bold">مقدم 30%</span>
                  </button>
                </div>
                <div id="calc-docs-box" class="bg-white border border-slate-200 text-slate-800 p-2.5 rounded-xl text-[11px] font-bold leading-relaxed">
                  ${escapeHtml(UiIcons.stripEmoji(INSTALLMENT_PROGRAMS.BUSINESS.docs))}
                </div>
              </div>

              <div>
                <div class="flex justify-between text-xs font-bold text-slate-700 mb-1">
                  <label>الدفعة المقدمة (ج.م)</label>
                  <span id="calc-down-label" class="text-accent font-black">${defaultDown.toLocaleString('ar-EG')} ج.م</span>
                </div>
                <input id="calc-down-slider" type="range" min="${Math.round(car.price * 0.1)}" max="${Math.round(car.price * 0.9)}" step="10000" value="${defaultDown}" class="w-full cursor-pointer" />
                <input id="calc-down" type="number" min="0" max="${car.price}" value="${defaultDown}" class="w-full border rounded-xl px-3 py-1.5 text-xs font-bold mt-1 bg-white" />
              </div>

              <div class="grid grid-cols-2 gap-2.5">
                <div>
                  <label class="block text-[11px] font-bold text-slate-600 mb-1">مدة التقسيط (شهور)</label>
                  <input id="calc-months" type="number" min="6" max="${maxM}" value="${Math.min(36, maxM)}" class="w-full border rounded-xl px-3 py-1.5 text-xs font-black text-center bg-white" />
                </div>
                <div>
                  <label class="block text-[11px] font-bold text-slate-600 mb-1">الفائدة السنوية (%)</label>
                  <input id="calc-interest" type="number" min="0" max="50" step="0.5" value="14.5" class="w-full border rounded-xl px-3 py-1.5 text-xs font-black text-center bg-white" />
                </div>
              </div>

              <div class="bg-white p-3.5 rounded-xl border border-slate-200 flex justify-between items-center">
                <div>
                  <span class="block text-[10px] text-slate-500 font-bold">القسط الشهري المحسوب</span>
                  <span id="calc-financed-note" class="text-[10px] text-slate-400 font-semibold">المبلغ الممول: 0 ج.م</span>
                </div>
                <span id="calc-result" class="text-base sm:text-lg font-black text-accent">0 ج.م</span>
              </div>
            </div>

            <div class="space-y-2 no-print">
              <div class="bg-slate-50 rounded-2xl border border-slate-200 p-2.5">
                <button type="button" onclick="App.toggleInlineTradeInBox()" class="w-full text-slate-900 font-black py-1 px-2 rounded-xl text-xs flex items-center justify-between transition">
                  <span class="inline-flex items-center gap-1.5">${UiIcons.get('repeat', 'w-3.5 h-3.5 text-accent')} لديك سيارة قديمة؟ احسب فرق الاستبدال كمقدم</span>
                  <span class="bg-accent-soft text-accent px-2 py-0.5 rounded-lg text-[10px] inline-flex items-center gap-1">من - إلى ${UiIcons.get('chevronDown', 'w-3 h-3')}</span>
                </button>
                <div id="inline-tradein-box" class="hidden mt-2.5 pt-2.5 border-t border-slate-200 space-y-2 text-xs">
                  <input id="iti-car-name" placeholder="نوع سيارتك وموديلها (مثال: إلنترا 2019)" class="w-full border p-2 rounded-xl bg-white font-bold" />
                  <div class="grid grid-cols-2 gap-2">
                    <input id="iti-expected-val" type="number" min="50000" step="10000" placeholder="سعرك التقديري (ج.م)" class="w-full border p-2 rounded-xl bg-white font-bold" />
                    <select id="iti-condition" class="w-full border p-2 rounded-xl bg-white font-bold">
                      <option value="FULL_FABRIKA">فابريكة بالكامل</option>
                      <option value="CLEAN_BELT" selected>فابريكة دواخل - رشة خارجي</option>
                      <option value="NEEDS_CARE">تحتاج بعض المصاريف</option>
                    </select>
                  </div>
                  <button type="button" onclick="App.calculateInlineTradeIn('${carIdEsc}')" class="w-full btn-luxury-primary font-black py-2 rounded-xl shadow-sm inline-flex items-center justify-center gap-1.5">
                    ${UiIcons.get('calculator', 'w-3.5 h-3.5')}
                    <span>احسب نطاق التثمين (من - إلى) والقسط المتبقي</span>
                  </button>
                  <div id="iti-result-box" class="hidden"></div>
                </div>
              </div>

              <div class="bg-slate-50 rounded-2xl border border-slate-200 p-2.5">
                <button type="button" onclick="App.toggleOwnershipCostsBox()" class="w-full text-slate-800 font-black py-1 px-2 rounded-xl text-xs flex items-center justify-between transition">
                  <span class="inline-flex items-center gap-1.5">${UiIcons.get('fileText', 'w-3.5 h-3.5 text-accent')} التكلفة التقديرية لنقل الملكية والترخيص والتأمين</span>
                  <span class="bg-white border border-slate-200 px-2 py-0.5 rounded-lg text-[10px] inline-flex items-center gap-1">شفافية كاملة ${UiIcons.get('chevronDown', 'w-3 h-3')}</span>
                </button>
                <div id="ownership-costs-box" class="hidden mt-2.5 pt-2.5 border-t border-slate-200 space-y-1.5 text-[11px]">
                  <div class="bg-white p-2 rounded-xl border flex justify-between items-center">
                    <span class="text-slate-600 font-bold">رسوم العقد المسجل والشهر العقاري (تقديري):</span>
                    <span class="font-black text-slate-900">${(Math.round((Math.min(car.price * 0.008, 12000) + 2500) / 100) * 100).toLocaleString('ar-EG')} ج.م</span>
                  </div>
                  <div class="bg-white p-2 rounded-xl border flex justify-between items-center">
                    <span class="text-slate-600 font-bold">مصروفات الترخيص السنوي والملصق والفحص:</span>
                    <span class="font-black text-slate-900">3,800 ج.م</span>
                  </div>
                  <div class="bg-white p-2 rounded-xl border flex justify-between items-center">
                    <span class="text-slate-600 font-bold">وثيقة التأمين الشامل السنوي (اختياري ~2.5%):</span>
                    <span class="font-black text-accent">${(Math.round((car.price * 0.025) / 500) * 500).toLocaleString('ar-EG')} ج.م / سنة</span>
                  </div>
                  <p class="text-[10px] text-slate-500 font-semibold px-1">
                    * الأرقام استرشادية وفق متوسط الرسوم المعمول بها في وحدات المرور والشهر العقاري.
                  </p>
                </div>
              </div>
            </div>

            <div class="space-y-2 no-print">
              <button type="button" onclick="CarDetailsUI.requestLiveVideoWhatsApp('${carIdEsc}')" class="w-full btn-luxury-video font-black py-3 px-4 rounded-xl text-xs flex items-center justify-center gap-2">
                <span class="w-2 h-2 rounded-full bg-rose-500 shrink-0"></span>
                ${UiIcons.get('video', 'w-4 h-4 text-[#D4AF37]')}
                <span>طلب معاينة فيديو لايف (واتساب)</span>
              </button>

              <div class="grid grid-cols-2 gap-2">
                <button type="button" onclick="App.sendSmartCarWhatsApp('${carIdEsc}')" class="btn-luxury-whatsapp font-black py-2.5 px-3 rounded-xl text-xs flex items-center justify-center gap-1.5 shadow-sm">
                  ${UiIcons.get('messageCircle', 'w-4 h-4')}
                  <span>واتساب بالعرض المحسوب</span>
                </button>
                <button type="button" onclick="App.openInspectionBookingModal('${carIdEsc}')" class="btn-luxury-outline font-black py-2.5 px-3 rounded-xl text-xs flex items-center justify-center gap-1.5 shadow-sm">
                  ${UiIcons.get('calendar', 'w-4 h-4 text-accent')}
                  <span>حجز موعد معاينة</span>
                </button>
              </div>

              ${!car.isReserved && !isReservedByMe ? `
                <button type="button" onclick="App.openReserveModal('${carIdEsc}')" class="w-full btn-luxury-accent font-black py-3 px-4 rounded-xl text-xs flex items-center justify-center gap-1.5 shadow">
                  ${UiIcons.get('lock', 'w-4 h-4')}
                  <span>${isAdmin ? 'تسجيل حجز مؤقت باسم عميل بالمعرض' : 'طلب حجز مؤقت للسيارة'}</span>
                </button>
              ` : `
                <div class="w-full bg-accent-soft border border-accent-subtle text-slate-900 font-black py-2.5 px-4 rounded-xl text-xs flex items-center justify-center gap-1.5">
                  ${UiIcons.get('lock', 'w-4 h-4 text-accent')}
                  <span>${car.isReserved ? `السيارة محجوزة حالياً (${escapeHtml(car.reservedByClient || 'عميل المعرض')})` : 'طلب حجزك قيد المراجعة لدى الإدارة'}</span>
                </div>
              `}

              ${isAdmin ? `
                <div class="pt-2 border-t flex flex-wrap gap-2">
                  <button type="button" onclick="App.openCarFormModal('${carIdEsc}')" class="flex-1 btn-luxury-accent font-black py-2.5 px-3 rounded-xl text-xs inline-flex items-center justify-center gap-1.5">
                    ${UiIcons.get('pencil', 'w-3.5 h-3.5')}
                    <span>تعديل البيانات</span>
                  </button>
                  ${role === 'SuperAdmin' ? `
                    <button type="button" onclick="App.directSellCar('${carIdEsc}')" class="flex-1 btn-luxury-whatsapp font-black py-2.5 px-3 rounded-xl text-xs inline-flex items-center justify-center gap-1.5">
                      ${UiIcons.get('tag', 'w-3.5 h-3.5')}
                      <span>بيع مباشر (كاش)</span>
                    </button>
                  ` : ''}
                  <button type="button" onclick="App.deleteCar('${carIdEsc}')" class="btn-luxury-outline text-rose-700 font-black py-2.5 px-3 rounded-xl text-xs inline-flex items-center justify-center gap-1">
                    ${UiIcons.get('trash', 'w-3.5 h-3.5')}
                    <span>حذف</span>
                  </button>
                </div>
              ` : ''}
            </div>
          </div>
        </div>

        ${similarCars.length > 0 ? `
          <div class="mt-7 pt-5 border-t border-slate-200 no-print">
            <h4 class="font-black text-sm text-slate-900 mb-3 flex items-center gap-2">
              ${UiIcons.get('sparkles', 'w-4 h-4 text-accent')}
              <span>سيارات مشابهة وبدائل مقترحة لك من المعرض</span>
            </h4>
            <div class="grid grid-cols-1 sm:grid-cols-3 gap-3">
              ${similarCars.map(sc => `
                <div onclick="App.openDetails('${escapeHtml(sc.id)}')" class="bg-slate-50 hover:border-[#B89146] p-3 rounded-2xl border border-slate-200 flex items-center gap-3 cursor-pointer transition group">
                  <img src="${escapeHtml(sc.imageUrl)}" onerror="this.src='${DEFAULT_CAR_IMAGE}'" class="w-16 h-12 object-cover rounded-xl shrink-0 group-hover:scale-105 transition" />
                  <div class="text-xs overflow-hidden">
                    <h5 class="font-black text-slate-900 truncate">${escapeHtml(sc.brand)} ${escapeHtml(sc.model)}</h5>
                    <p class="text-accent font-black">${sc.formattedPrice}</p>
                    <span class="text-[10px] text-slate-500 font-bold">${sc.year} • فحص ${sc.inspectionScore}/10</span>
                  </div>
                </div>
              `).join('')}
            </div>
          </div>
        ` : ''}
      </div>
    `);

    this.attachCalculatorEvents(car);
  },

  toggleFavInDetails(carId) {
    App.toggleFav(carId);
    const btn = document.getElementById('details-fav-btn');
    if (!btn) return;
    const isAdmin = AuthService.isLogged();
    const username = AuthService.getUsername();
    const isFav = isAdmin
      ? (CarRepository.getAdminWatchlist(username).some(w => String(w.id) === String(carId)) ||
         CarRepository.getStaffFavorites().some(w => String(w.carId) === String(carId)))
      : CarRepository.getFavorites().includes(String(carId));

    const favLabel = isAdmin
      ? (isFav ? 'بمفضلة الإدارة' : 'حفظ للإدارة')
      : (isFav ? 'محفوظة بالمفضلة' : 'حفظ بالمفضلة');
    const favIcon = isAdmin
      ? (isFav ? UiIcons.get('starFilled', 'w-3.5 h-3.5 text-accent') : UiIcons.get('star', 'w-3.5 h-3.5'))
      : (isFav ? UiIcons.get('heartFilled', 'w-3.5 h-3.5') : UiIcons.get('heart', 'w-3.5 h-3.5'));

    btn.setAttribute('aria-pressed', String(isFav));
    btn.className = `details-action-pill ${isFav ? (isAdmin ? 'is-compare-active' : 'is-fav-active') : ''}`;
    btn.innerHTML = `${favIcon}<span>${favLabel}</span>`;
  },

  toggleCompareInDetails(carId) {
    App.toggleCompare(carId);
    const btn = document.getElementById('details-compare-btn');
    if (!btn) return;
    const isAdmin = AuthService.isLogged();
    const isCompared = CarRepository.getCompare(isAdmin).includes(String(carId));
    btn.setAttribute('aria-pressed', String(isCompared));
    btn.className = `details-action-pill ${isCompared ? 'is-compare-active' : ''}`;
    btn.innerHTML = `${isCompared ? UiIcons.get('check', 'w-3.5 h-3.5 text-accent') : UiIcons.get('scale', 'w-3.5 h-3.5')}<span>${isCompared ? 'بالمقارنة' : 'قارن'}</span>`;
  },

  requestLiveVideoWhatsApp(carId) {
    const { car } = CarRepository.findCarAnywhere(carId);
    if (!car) return;
    const msg =
      `مرحباً ${DEALER_BRAND_NAME}، أرغب في طلب معاينة فيديو لايف (واتساب) لسيارة: ${car.brand} ${car.model} (${car.year}) - كود [${car.id}]\n` +
      `• السعر النقدي: ${car.formattedPrice}\n` +
      `يرجى تحديد الموعد المناسب لبدء البث المباشر وفحص السيارة عن بُعد.`;
    App.whatsApp(car.dealerPhone, msg);
  },

  setGalleryImage(idx) {
    const imgEl = document.getElementById('main-gallery-image');
    if (imgEl && this.activeGalleryList[idx]) {
      imgEl.src = this.activeGalleryList[idx];
    }
    document.querySelectorAll('.gallery-thumb-btn').forEach(btn => {
      const isSelected = Number(btn.getAttribute('data-thumb-idx')) === idx;
      btn.classList.toggle('border-[#B89146]', isSelected);
      btn.classList.toggle('ring-2', isSelected);
      btn.classList.toggle('ring-[#B89146]/30', isSelected);
      btn.classList.toggle('border-transparent', !isSelected);
      btn.classList.toggle('opacity-75', !isSelected);
    });
  },

  applyInstallmentPreset(presetKey) {
    const preset = INSTALLMENT_PROGRAMS[presetKey];
    if (!preset || !this.activeCalcCarPrice) return;

    const downInput = document.getElementById('calc-down');
    const slider = document.getElementById('calc-down-slider');
    const interestInput = document.getElementById('calc-interest');
    const docsBox = document.getElementById('calc-docs-box');

    const newDown = Math.round(this.activeCalcCarPrice * preset.downPct);
    if (downInput) downInput.value = newDown;
    if (slider) slider.value = Math.min(Math.max(newDown, Number(slider.min)), Number(slider.max));
    if (interestInput) interestInput.value = preset.interest;
    if (docsBox) docsBox.textContent = UiIcons.stripEmoji(preset.docs);

    this.currentCalcState.programName = UiIcons.stripEmoji(preset.name);

    document.querySelectorAll('.preset-tier-btn').forEach(btn => {
      if (btn.getAttribute('data-preset') === presetKey) {
        btn.className = 'preset-tier-btn btn-luxury-primary font-black py-2 px-1.5 rounded-xl text-center shadow-sm flex flex-col items-center gap-0.5';
      } else {
        btn.className = 'preset-tier-btn btn-luxury-outline font-black py-2 px-1.5 rounded-xl text-center flex flex-col items-center gap-0.5';
      }
    });

    if (downInput && typeof downInput.oninput === 'function') {
      downInput.oninput();
    }
  },

  attachCalculatorEvents(car) {
    const slider = document.getElementById('calc-down-slider');
    const downInput = document.getElementById('calc-down');
    const downLabel = document.getElementById('calc-down-label');
    const monthsInput = document.getElementById('calc-months');
    const interestInput = document.getElementById('calc-interest');
    const resEl = document.getElementById('calc-result');
    const noteEl = document.getElementById('calc-financed-note');
    const maxM = car.maxInstallmentMonths || 60;

    this.currentCalcState.programName = UiIcons.stripEmoji(INSTALLMENT_PROGRAMS.BUSINESS.name);

    const compute = (fromSlider = false) => {
      let d = fromSlider ? Number(slider.value) : Number(downInput.value);
      if (isNaN(d) || d < 0) d = 0;
      if (d > car.price) { d = car.price; downInput.value = d; }
      if (fromSlider) downInput.value = d;
      else slider.value = Math.min(Math.max(d, Number(slider.min)), Number(slider.max));

      downLabel.textContent = d.toLocaleString('ar-EG') + ' ج.م';

      let m = Number(monthsInput.value);
      if (isNaN(m) || m < 6) m = 6;
      if (m > maxM) { m = maxM; monthsInput.value = maxM; }

      let rate = Number(interestInput.value);
      if (isNaN(rate) || rate < 0) { rate = 0; interestInput.value = 0; }

      const financed = Math.max(0, car.price - d);
      const totalWithInterest = financed + (financed * (rate / 100) * (m / 12));
      const monthly = Math.round(totalWithInterest / m);

      this.currentCalcState = { ...this.currentCalcState, down: d, months: m, monthly };
      noteEl.textContent = `المبلغ الممول: ${financed.toLocaleString('ar-EG')} ج.م`;
      resEl.textContent = monthly.toLocaleString('ar-EG') + ' ج.م / شهر';
    };

    if (slider && downInput) {
      slider.oninput = () => compute(true);
      downInput.oninput = () => compute(false);
      monthsInput.oninput = () => compute(false);
      monthsInput.onblur = () => {
        const m = Number(monthsInput.value);
        if (isNaN(m) || m < 6) monthsInput.value = 6;
        else if (m > maxM) monthsInput.value = maxM;
        compute(false);
      };
      interestInput.oninput = () => compute(false);
      compute(true);
    }
  },

  sendSmartCarWhatsApp(carId) {
    const { car } = CarRepository.findCarAnywhere(carId);
    if (!car) return;
    const { down, months, monthly, programName } = this.currentCalcState;
    const msg =
      `مرحباً ${DEALER_BRAND_NAME}، أستفسر عن سيارة: ${car.brand} ${car.model} (${car.year}) - كود [${car.id}]\n` +
      `• السعر النقدي: ${car.formattedPrice}\n` +
      `• نظام التقسيط المختار: ${programName || 'تقسيط المعرض'}\n` +
      `• خطة السداد: مقدم (${down.toLocaleString('ar-EG')} ج.م) وقسط شهري (${monthly.toLocaleString('ar-EG')} ج.م) لمدة ${months} شهر.`;
    App.whatsApp(car.dealerPhone, msg);
  },

  toggleInlineTradeInBox() {
    const box = document.getElementById('inline-tradein-box');
    if (box) box.classList.toggle('hidden');
  },

  toggleOwnershipCostsBox() {
    const box = document.getElementById('ownership-costs-box');
    if (box) box.classList.toggle('hidden');
  },

  calculateInlineTradeIn(newCarId) {
    const { car } = CarRepository.findCarAnywhere(newCarId);
    if (!car) return;

    const oldCarTitle = (document.getElementById('iti-car-name')?.value || '').trim();
    const expectedVal = Number(document.getElementById('iti-expected-val')?.value) || 0;
    const condition = document.getElementById('iti-condition')?.value || 'CLEAN_BELT';
    const resBox = document.getElementById('iti-result-box');

    if (!oldCarTitle || expectedVal < 50000) {
      App.showToast('يرجى كتابة نوع سيارتك وقيمتها التقديرية بشكل صحيح.', 'warning');
      return;
    }

    const ranges = {
      FULL_FABRIKA: { minPct: 0.85, maxPct: 0.92, label: 'فابريكة بالكامل' },
      CLEAN_BELT: { minPct: 0.78, maxPct: 0.85, label: 'فابريكة دواخل - رشة خارجي' },
      NEEDS_CARE: { minPct: 0.70, maxPct: 0.78, label: 'تحتاج بعض المصاريف' }
    };

    const r = ranges[condition] || ranges.CLEAN_BELT;
    const minVal = Math.round((expectedVal * r.minPct) / 5000) * 5000;
    const maxVal = Math.round((expectedVal * r.maxPct) / 5000) * 5000;
    const safeAvgDown = Math.min(Math.round((minVal + maxVal) / 2), Math.round(car.price * 0.85));
    const minCashDiff = Math.max(0, car.price - maxVal);
    const maxCashDiff = Math.max(0, car.price - minVal);

    const downInput = document.getElementById('calc-down');
    const slider = document.getElementById('calc-down-slider');
    if (downInput) downInput.value = safeAvgDown;
    if (slider) slider.value = Math.min(Math.max(safeAvgDown, Number(slider.min)), Number(slider.max));
    this.currentCalcState.programName = `استبدال (${oldCarTitle})`;
    if (downInput && typeof downInput.oninput === 'function') downInput.oninput();

    this._lastInlineTradeIn = { oldCarTitle, conditionLabel: r.label, minVal, maxVal, safeAvgDown, minCashDiff, maxCashDiff };

    if (resBox) {
      resBox.classList.remove('hidden');
      resBox.innerHTML = `
        <div class="bg-white p-3 rounded-xl border border-amber-300 space-y-2 text-[11px]">
          <div class="flex justify-between items-center border-b pb-1.5">
            <span class="font-bold text-slate-600">نطاق التثمين المبدئي لسيارتك:</span>
            <span class="font-black text-emerald-700">من ${minVal.toLocaleString('ar-EG')} إلى ${maxVal.toLocaleString('ar-EG')} ج.م</span>
          </div>
          <div class="flex justify-between items-center border-b pb-1.5">
            <span class="font-bold text-slate-600">فرق الكاش المتبقي تقريباً:</span>
            <span class="font-black text-blue-900">من ${minCashDiff.toLocaleString('ar-EG')} إلى ${maxCashDiff.toLocaleString('ar-EG')} ج.م</span>
          </div>
          <p class="text-[10px] text-amber-900 bg-amber-50 p-2 rounded-lg font-bold leading-relaxed border border-amber-200 flex items-start gap-1.5">
            ${UiIcons.get('alertTriangle', 'w-3.5 h-3.5 text-amber-600 mt-0.5')}
            <span><b>تأكيد هام:</b> هذا النطاق السعري (من - إلى) استرشادي فقط، ويتم تحديد السعر الفعلي والنهائي لسيارتك داخل المعرض بعد المعاينة والفحص الفني على الطبيعة.</span>
          </p>
          <button type="button" onclick="App.sendInlineTradeInWhatsApp('${escapeHtml(car.id)}')" class="w-full bg-amber-500 hover:bg-amber-400 text-slate-950 font-black py-2 rounded-xl shadow-sm transition flex items-center justify-center gap-1.5">
            ${UiIcons.get('messageCircle', 'w-4 h-4')}
            <span>إرسال طلب الاستبدال وحجز موعد معاينة بالمعرض</span>
          </button>
        </div>
      `;
    }
    App.showToast('تم حساب نطاق الاستبدال وتحديث المقدم والقسط الشهري!', 'success');
  },

  sendInlineTradeInWhatsApp(newCarId) {
    const { car } = CarRepository.findCarAnywhere(newCarId);
    const ti = this._lastInlineTradeIn;
    if (!car || !ti) return;

    CarRepository.addTradeIn({
      id: 'TI-' + Date.now().toString().slice(-5),
      brand: ti.oldCarTitle,
      model: `للاستبدال بـ (${car.brand} ${car.model})`,
      year: new Date().getFullYear(),
      km: 'يحدد بالمعاينة',
      type: 'استبدال مباشر',
      desc: `الحالة: ${ti.conditionLabel} | النطاق الاسترشادي: من ${ti.minVal.toLocaleString('ar-EG')} إلى ${ti.maxVal.toLocaleString('ar-EG')} ج.م (مشروط بالمعاينة بالمعرض)`,
      clientName: 'عميل استبدال أونلاين',
      clientPhone: 'عبر واتساب',
      requestedAt: new Date().toLocaleString('ar-EG')
    });

    const { months, monthly } = this.currentCalcState;
    const msg =
      `مرحباً ${DEALER_BRAND_NAME}، أرغب في استبدال سيارتي بسيارة من المعرض:\n` +
      `• السيارة المطلوبة: ${car.brand} ${car.model} (${car.year}) - السعر: ${car.formattedPrice}\n` +
      `• سيارتي الحالية: ${ti.oldCarTitle} (${ti.conditionLabel})\n` +
      `• نطاق التثمين الاسترشادي: من ${ti.minVal.toLocaleString('ar-EG')} إلى ${ti.maxVal.toLocaleString('ar-EG')} ج.م\n` +
      `• القسط المتبقي التقريبي: ${monthly.toLocaleString('ar-EG')} ج.م × ${months} شهر\n` +
      `• (مع علمي بأن السعر الفعلي والنهائي لسيارتي يتحدد داخل المعرض بعد المعاينة والفحص الفني).`;

    App.whatsApp(car.dealerPhone, msg);
  },

  openSoldDetails(id) {
    const car = CarRepository.getSoldCars().find(c => String(c.id) === String(id));
    if (!car) return;
    App.openModalHtml(`
      <div class="bg-white rounded-3xl max-w-2xl w-full p-6 shadow-2xl relative max-h-[90vh] overflow-y-auto">
        <button type="button" onclick="App.closeModal()" aria-label="إغلاق" class="absolute top-4 left-4 bg-slate-200 hover:bg-slate-300 text-slate-900 w-8 h-8 rounded-full inline-flex items-center justify-center transition">
          ${UiIcons.get('x', 'w-4 h-4')}
        </button>
        <div class="bg-emerald-100 text-emerald-900 p-3.5 rounded-2xl mb-4 font-bold text-xs flex flex-wrap justify-between items-center gap-2 border border-emerald-200 mt-6">
          <span class="inline-flex items-center gap-1.5">${UiIcons.get('tag', 'w-4 h-4')} هذه السيارة مباعة ومدرجة في أرشيف المعرض</span>
          <span>تاريخ البيع: ${escapeHtml(car.soldAt)} | اعتماد: ${escapeHtml(car.soldBy)}</span>
        </div>
        <img src="${escapeHtml(car.imageUrl)}" onerror="this.src='${DEFAULT_CAR_IMAGE}'" class="w-full aspect-[16/10] object-cover rounded-2xl mb-4" />
        <div class="flex justify-between items-center border-b pb-3">
          <div>
            <h3 class="text-xl font-black text-slate-900">${escapeHtml(car.brand)} ${escapeHtml(car.model)}</h3>
            <p class="text-xs text-slate-500 mt-1">سنة الصنع: <b>${car.year}</b> | الممشى عند البيع: <b>${car.formattedMileage}</b></p>
          </div>
          <span class="text-xl font-black text-emerald-700">${car.formattedPrice}</span>
        </div>
        <p class="text-xs sm:text-sm text-slate-600 mt-4 leading-relaxed">${escapeHtml(car.description)}</p>
      </div>
    `);
  },

  async shareCarNative(carId) {
    const { car } = CarRepository.findCarAnywhere(carId);
    if (!car) return;

    const carUrl = App.getDirectCarUrl(car.id);
    const shareText = `${car.brand} ${car.model} (موديل ${car.year})\nالسعر: ${car.formattedPrice}${car.hasDiscount ? ` (بدلاً من ${car.formattedOldPrice})` : ''}\nالحالة: ${car.paintStatus} | فحص ${car.inspectionScore}/10\nالعداد: ${car.formattedMileage}\n${DEALER_BRAND_NAME} (كود: ${car.id})`;
    const fullSharePayload = `${shareText}\nالعنوان: ${DEALER_ADDRESS}\nللتواصل: ${DEALER_PHONES_DISPLAY}\nرابط السيارة المباشر:\n${carUrl}`;

    this._tempSharePayload = fullSharePayload;
    this._tempShareUrlOnly = carUrl;

    const isMobileDevice = /Android|iPhone|iPad|iPod/i.test(navigator.userAgent);
    if (isMobileDevice && navigator.share) {
      try {
        await navigator.share({
          title: `${DEALER_BRAND_NAME} - ${car.brand} ${car.model}`,
          text: shareText,
          url: carUrl
        });
        return;
      } catch (err) {
        if (err && err.name === 'AbortError') return;
      }
    }

    await copyTextSilent(fullSharePayload);
    this.openShareModal(car, fullSharePayload, carUrl);
    App.showToast('تم نسخ تفاصيل ورابط السيارة تلقائياً وجاهز للمشاركة!', 'success');
  },

  openShareModal(car, fullSharePayload, carUrl) {
    this._tempSharePayload = fullSharePayload;
    this._tempShareUrlOnly = carUrl;

    const waWebUrl = `https://web.whatsapp.com/send?text=${encodeURIComponent(fullSharePayload)}`;
    const waAppUrl = `https://api.whatsapp.com/send?text=${encodeURIComponent(fullSharePayload)}`;
    const tgShareUrl = `https://t.me/share/url?url=${encodeURIComponent(carUrl)}&text=${encodeURIComponent(fullSharePayload)}`;
    const fbShareUrl = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(carUrl)}`;

    App.openModalHtml(`
      <div class="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl relative text-xs space-y-4">
        <button type="button" onclick="App.closeModal()" aria-label="إغلاق" class="absolute top-4 left-4 bg-slate-200 hover:bg-slate-300 text-slate-900 w-8 h-8 rounded-full inline-flex items-center justify-center transition">
          ${UiIcons.get('x', 'w-4 h-4')}
        </button>
        <div class="flex items-center gap-3 border-b pb-3">
          <img src="${escapeHtml(car.imageUrl)}" onerror="this.src='${DEFAULT_CAR_IMAGE}'" class="w-16 h-12 object-cover rounded-xl shrink-0" />
          <div>
            <h3 class="font-black text-sm text-slate-900 inline-flex items-center gap-1.5">${UiIcons.get('share', 'w-4 h-4 text-amber-600')} مشاركة بيانات السيارة</h3>
            <p class="text-blue-900 font-bold mt-0.5">${escapeHtml(car.brand)} ${escapeHtml(car.model)} (${car.year})</p>
          </div>
        </div>

        <div class="bg-emerald-50 border border-emerald-200 text-emerald-900 px-3 py-2 rounded-xl font-bold text-[11px] flex items-center gap-1.5">
          ${UiIcons.get('checkCircle', 'w-4 h-4 text-emerald-600')}
          <span>تم نسخ تفاصيل ورابط السيارة تلقائياً إلى الحافظة (يمكنك عمل لصق Ctrl+V مباشرة).</span>
        </div>

        <div class="bg-slate-50 p-3 rounded-2xl border text-[11px] text-slate-700 whitespace-pre-line leading-relaxed select-all">${escapeHtml(fullSharePayload)}</div>

        <div class="grid grid-cols-1 gap-2">
          <div class="grid grid-cols-2 gap-2">
            <button type="button" onclick="App.copySharePayload(false)" class="bg-blue-950 hover:bg-blue-900 text-amber-400 font-black py-2.5 px-3 rounded-xl shadow flex items-center justify-center gap-1.5 transition">
              ${UiIcons.get('copy', 'w-3.5 h-3.5')}
              <span>نسخ النص والرابط</span>
            </button>
            <button type="button" onclick="App.copySharePayload(true)" class="bg-slate-200 hover:bg-slate-300 text-slate-900 font-black py-2.5 px-3 rounded-xl flex items-center justify-center gap-1.5 transition">
              ${UiIcons.get('link', 'w-3.5 h-3.5')}
              <span>نسخ الرابط فقط</span>
            </button>
          </div>

          <a href="${waWebUrl}" target="_blank" rel="noopener noreferrer" onclick="App.showToast('جاري فتح واتساب ويب للمشاركة...', 'success')" class="w-full bg-emerald-600 hover:bg-emerald-500 text-white font-black py-3 rounded-xl flex items-center justify-center gap-2 shadow transition">
            ${UiIcons.get('laptop', 'w-4 h-4')}
            <span>مشاركة عبر واتساب ويب (للكمبيوتر واللابتوب)</span>
          </a>

          <div class="grid grid-cols-2 gap-2">
            <a href="${waAppUrl}" target="_blank" rel="noopener noreferrer" class="bg-emerald-700/90 hover:bg-emerald-700 text-white font-bold py-2.5 rounded-xl flex items-center justify-center gap-1.5 transition">
              ${UiIcons.get('smartphone', 'w-3.5 h-3.5')}
              <span>تطبيق واتساب</span>
            </a>
            <a href="${tgShareUrl}" target="_blank" rel="noopener noreferrer" class="bg-sky-600 hover:bg-sky-500 text-white font-black py-2.5 rounded-xl flex items-center justify-center gap-1.5 shadow transition">
              ${UiIcons.get('send', 'w-3.5 h-3.5')}
              <span>تيليجرام</span>
            </a>
          </div>

          <a href="${fbShareUrl}" target="_blank" rel="noopener noreferrer" class="w-full bg-blue-700 hover:bg-blue-600 text-white font-bold py-2 rounded-xl flex items-center justify-center gap-1.5 transition">
            ${UiIcons.get('share', 'w-3.5 h-3.5')}
            <span>مشاركة على فيسبوك</span>
          </a>
        </div>
      </div>
    `);
  },

  async copySharePayload(onlyUrl = false) {
    const text = onlyUrl ? (this._tempShareUrlOnly || '') : (this._tempSharePayload || '');
    if (!text) return;
    const ok = await copyTextSilent(text);
    if (ok) {
      App.showToast(onlyUrl ? 'تم نسخ الرابط المباشر للسيارة بنجاح!' : 'تم نسخ تفاصيل ورابط السيارة بنجاح!', 'success');
    }
  },

  openWindowStickerModal(carId) {
    const { car } = CarRepository.findCarAnywhere(carId);
    if (!car) return;

    const carIdEsc = escapeHtml(car.id);
    const carUrl = App.getDirectCarUrl(car.id);
    const qrApiUrl = `https://api.qrserver.com/v1/create-qr-code/?size=220x220&margin=6&data=${encodeURIComponent(carUrl)}`;
    const estMonthly = car.estimatedMonthlyInstallment;

    App.openModalHtml(`
      <div id="printable-quote-area" class="bg-white rounded-3xl max-w-2xl w-full p-6 sm:p-8 shadow-2xl relative max-h-[92vh] overflow-y-auto custom-scroll border-4 border-slate-900">
        <div class="flex justify-between items-center pb-4 mb-5 border-b-2 border-slate-900 no-print">
          <button type="button" onclick="App.openDetails('${carIdEsc}')" class="bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-black px-3.5 py-2 rounded-xl inline-flex items-center gap-1.5 transition">
            ${UiIcons.get('arrowRight', 'w-3.5 h-3.5')}
            <span>العودة لصفحة السيارة</span>
          </button>
          <div class="flex items-center gap-2">
            <button type="button" onclick="App.printDocument()" class="bg-blue-950 hover:bg-blue-900 text-amber-400 text-xs font-black px-4 py-2 rounded-xl inline-flex items-center gap-1.5 shadow-md transition">
              ${UiIcons.get('printer', 'w-4 h-4')}
              <span>طباعة ملصق الزجاج (A4)</span>
            </button>
            <button type="button" onclick="App.closeModal()" aria-label="إغلاق" class="bg-slate-200 hover:bg-slate-300 text-slate-900 w-8 h-8 rounded-full inline-flex items-center justify-center transition">
              ${UiIcons.get('x', 'w-4 h-4')}
            </button>
          </div>
        </div>

        <div class="bg-slate-950 text-white p-5 rounded-2xl flex justify-between items-center mb-5">
          <div class="flex items-center gap-3">
            <div class="bg-amber-400 text-slate-950 w-12 h-12 rounded-2xl flex items-center justify-center">
              ${UiIcons.get('car', 'w-6 h-6')}
            </div>
            <div>
              <h2 class="text-lg sm:text-xl font-black tracking-wide">${escapeHtml(DEALER_BRAND_NAME)}</h2>
              <p class="text-xs text-amber-400 font-bold">بطاقة المواصفات والفحص الهندسي المعتمد</p>
            </div>
          </div>
          <div class="text-left">
            <span class="block text-[10px] text-slate-400 font-bold">كود السيارة بالمعرض</span>
            <span class="font-mono font-black text-sm sm:text-base text-amber-400 bg-slate-900 px-3 py-1 rounded-xl border border-slate-700 inline-block mt-0.5">${carIdEsc}</span>
          </div>
        </div>

        <div class="grid grid-cols-1 sm:grid-cols-12 gap-4 items-center bg-slate-50 p-5 rounded-2xl border-2 border-slate-200 mb-5">
          <div class="sm:col-span-7 space-y-1">
            <span class="bg-blue-900 text-white text-[11px] font-black px-3 py-0.5 rounded-lg inline-block">${escapeHtml(car.brand)} — موديل ${car.year}</span>
            <h1 class="text-2xl sm:text-3xl font-black text-slate-950">${escapeHtml(car.model)}</h1>
            <div class="flex flex-wrap items-center gap-2 pt-1 text-xs font-bold text-slate-700">
              <span class="inline-flex items-center gap-1">${UiIcons.get('gauge', 'w-3.5 h-3.5')} الممشى: <b>${car.formattedMileage}</b></span>
              <span>•</span>
              <span class="text-emerald-800 bg-emerald-100 px-2.5 py-0.5 rounded-lg font-black inline-flex items-center gap-1">${UiIcons.get('shieldCheck', 'w-3.5 h-3.5')} ${escapeHtml(car.paintStatus)}</span>
            </div>
          </div>
          <div class="sm:col-span-5 text-right sm:text-left border-t sm:border-t-0 sm:border-r-2 border-slate-200 pt-3 sm:pt-0 sm:pr-4">
            <span class="block text-xs text-slate-500 font-bold">السعر النقدي المعتمد</span>
            ${car.hasDiscount ? `<span class="text-xs text-rose-600 line-through font-bold block">${car.formattedOldPrice}</span>` : ''}
            <span class="text-2xl sm:text-3xl font-black text-blue-950">${car.formattedPrice}</span>
            <span class="block text-[11px] text-emerald-700 font-black mt-1">أو بقسط يبدأ من ${estMonthly.toLocaleString('ar-EG')} ج.م/شهر</span>
          </div>
        </div>

        <div class="grid grid-cols-1 sm:grid-cols-12 gap-5 items-center">
          <div class="sm:col-span-7 space-y-3">
            <div class="bg-white p-4 rounded-2xl border-2 border-slate-200">
              <div class="flex justify-between items-center mb-3 pb-2 border-b">
                <span class="font-black text-xs text-slate-900 inline-flex items-center gap-1.5">${UiIcons.get('shieldCheck', 'w-4 h-4 text-emerald-600')} تقييم الفحص الهندسي (4 محاور)</span>
                <span class="bg-emerald-700 text-white text-xs font-black px-3 py-0.5 rounded-lg">${car.inspectionScore} / 10</span>
              </div>
              <div class="grid grid-cols-2 gap-2.5 text-xs">
                <div class="bg-slate-50 p-2.5 rounded-xl border flex justify-between font-bold"><span>كفاءة المحرك:</span><b class="text-blue-950">${car.engineScore}/10</b></div>
                <div class="bg-slate-50 p-2.5 rounded-xl border flex justify-between font-bold"><span>ناقل الحركة:</span><b class="text-blue-950">${car.gearScore}/10</b></div>
                <div class="bg-slate-50 p-2.5 rounded-xl border flex justify-between font-bold"><span>الهيكل والدهان:</span><b class="text-blue-950">${car.bodyScore}/10</b></div>
                <div class="bg-slate-50 p-2.5 rounded-xl border flex justify-between font-bold"><span>العفشة والصالون:</span><b class="text-blue-950">${car.interiorScore}/10</b></div>
              </div>
              <p class="text-[11px] text-slate-600 font-bold mt-3 bg-slate-50 p-2.5 rounded-xl border">${escapeHtml(car.paintDetails)}</p>
            </div>

            <div class="bg-slate-50 p-3.5 rounded-2xl border text-xs leading-relaxed text-slate-700">
              <b class="text-slate-900 block mb-1">أبرز التجهيزات والكماليات:</b>
              ${escapeHtml(car.description)}
            </div>
          </div>

          <div class="sm:col-span-5 bg-slate-900 text-white p-5 rounded-3xl text-center flex flex-col items-center justify-center space-y-3 border-2 border-amber-400 shadow-xl">
            <span class="bg-amber-400 text-slate-950 text-[11px] font-black px-3 py-1 rounded-full inline-flex items-center gap-1.5">${UiIcons.get('qrCode', 'w-3.5 h-3.5')} امسح الكود بكاميرا هاتفك</span>
            <div class="bg-white p-3 rounded-2xl shadow-inner">
              <img src="${qrApiUrl}" alt="QR Code" class="w-40 h-40 object-contain mx-auto" onerror="this.style.display='none'; this.nextElementSibling.style.display='flex';" />
              <div style="display:none" class="w-40 h-40 items-center justify-center text-slate-900 font-black text-xs p-2 text-center">كود السيارة المباشر:<br>${carIdEsc}</div>
            </div>
            <p class="text-[11px] text-slate-200 font-bold leading-relaxed">
              افتح ملف السيارة على هاتفك لحساب القسط الشهري المناسب لك أو طلب الحجز الفوري
            </p>
            <div class="flex items-center justify-center gap-2.5 mt-1 pt-2 border-t border-slate-700/80">
              <img src="./logo.jpg" alt="أبو بهاء" class="w-10 h-10 rounded-xl border border-amber-500 object-cover shrink-0" />
              <div class="text-[10px] text-amber-300 font-bold leading-relaxed text-right">${escapeHtml(DEALER_ADDRESS)}<br><span class="font-mono text-white">${escapeHtml(DEALER_PHONES_DISPLAY)}</span></div>
            </div>
          </div>
        </div>
      </div>
    `);
  },

  openInspectionCertificateModal(carId) {
    const { car } = CarRepository.findCarAnywhere(carId);
    if (!car) return;

    const carIdEsc = escapeHtml(car.id);
    const certCode = 'CERT-' + car.id.replace(/[^0-9]/g, '') + '-' + new Date().getFullYear();
    const today = new Date().toLocaleDateString('ar-EG');
    const carUrl = App.getDirectCarUrl(car.id);
    const qrApiUrl = `https://api.qrserver.com/v1/create-qr-code/?size=150x150&margin=4&data=${encodeURIComponent(carUrl)}`;
    const cleanBadge = UiIcons.stripEmoji(car.inspectionBadge);

    App.openModalHtml(`
      <div id="printable-quote-area" class="bg-white rounded-3xl max-w-3xl w-full p-6 sm:p-8 shadow-2xl relative max-h-[92vh] overflow-y-auto custom-scroll border-4 border-slate-900 text-xs leading-relaxed">
        <div class="flex flex-wrap justify-between items-center gap-2 pb-4 mb-5 border-b-2 border-slate-900 no-print">
          <button type="button" onclick="App.openDetails('${carIdEsc}')" class="bg-slate-100 hover:bg-slate-200 text-slate-800 font-black px-3.5 py-2 rounded-xl inline-flex items-center gap-1.5 transition">
            ${UiIcons.get('arrowRight', 'w-3.5 h-3.5')}
            <span>العودة لصفحة السيارة</span>
          </button>
          <div class="flex items-center gap-2">
            <button type="button" onclick="App.printDocument()" class="bg-blue-950 hover:bg-blue-900 text-amber-400 font-black px-5 py-2 rounded-xl shadow-md inline-flex items-center gap-1.5 transition">
              ${UiIcons.get('printer', 'w-4 h-4')}
              <span>طباعة شهادة الفحص المعتمدة (A4)</span>
            </button>
            <button type="button" onclick="App.closeModal()" aria-label="إغلاق" class="bg-slate-200 hover:bg-slate-300 text-slate-900 w-8 h-8 rounded-full inline-flex items-center justify-center transition">
              ${UiIcons.get('x', 'w-4 h-4')}
            </button>
          </div>
        </div>

        <div class="bg-slate-950 text-white p-5 rounded-2xl flex justify-between items-center mb-5">
          <div class="flex items-center gap-3">
            <div class="bg-amber-400 text-slate-950 w-12 h-12 rounded-2xl flex items-center justify-center">
              ${UiIcons.get('shieldCheck', 'w-6 h-6')}
            </div>
            <div>
              <h2 class="text-lg sm:text-xl font-black">شهادة الفحص الهندسي وضمان الفابريكة</h2>
              <p class="text-[11px] text-amber-400 font-bold">${escapeHtml(DEALER_BRAND_NAME)} — مركز الفحص الفني المعتمد</p>
            </div>
          </div>
          <div class="text-left">
            <span class="block text-[10px] text-slate-300 font-bold">رقم الشهادة: ${certCode}</span>
            <span class="block text-[11px] text-amber-300 font-black mt-0.5">تاريخ الإصدار: ${today}</span>
          </div>
        </div>

        <div class="grid grid-cols-1 sm:grid-cols-12 gap-4 bg-slate-50 p-4 rounded-2xl border-2 border-slate-200 mb-5 items-center">
          <div class="sm:col-span-8 grid grid-cols-2 gap-2.5 text-slate-900">
            <div><b>الماركة والموديل:</b> ${escapeHtml(car.brand)} ${escapeHtml(car.model)}</div>
            <div><b>سنة الصنع:</b> ${car.year}</div>
            <div><b>قراءة العداد الحالية:</b> ${car.formattedMileage}</div>
            <div><b>كود السيارة المرجعي:</b> ${carIdEsc}</div>
            <div class="col-span-2 pt-1 border-t"><b>حالة الدهان المعتمدة:</b> <span class="text-emerald-800 font-black">${escapeHtml(car.paintStatus)}</span></div>
          </div>
          <div class="sm:col-span-4 bg-emerald-900 text-white p-3.5 rounded-2xl text-center">
            <span class="block text-[10px] text-emerald-200 font-bold">التقييم الهندسي العام</span>
            <span class="text-3xl font-black text-amber-300 block my-0.5">${car.inspectionScore} / 10</span>
            <span class="text-[10px] bg-white/15 px-2.5 py-0.5 rounded-full font-black inline-block">${escapeHtml(cleanBadge)}</span>
          </div>
        </div>

        <div class="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-5">
          <div class="bg-white p-4 rounded-2xl border-2 border-slate-200 space-y-2.5">
            <h4 class="font-black text-sm text-blue-950 border-b pb-1.5 inline-flex items-center gap-1.5 w-full">${UiIcons.get('settings', 'w-4 h-4')} أولاً: نتائج الفحص الميكانيكي (4 محاور)</h4>
            <div class="space-y-2">
              <div class="flex justify-between items-center bg-slate-50 p-2 rounded-xl border"><span>1. كفاءة المحرك ودورة التبريد:</span><b class="text-blue-950 font-black">${car.engineScore} / 10</b></div>
              <div class="flex justify-between items-center bg-slate-50 p-2 rounded-xl border"><span>2. ناقل الحركة (الفتيس) والأداء:</span><b class="text-blue-950 font-black">${car.gearScore} / 10</b></div>
              <div class="flex justify-between items-center bg-slate-50 p-2 rounded-xl border"><span>3. الشاسيه والهيكل الخارجي:</span><b class="text-blue-950 font-black">${car.bodyScore} / 10</b></div>
              <div class="flex justify-between items-center bg-slate-50 p-2 rounded-xl border"><span>4. العفشة والصالون والكهرباء:</span><b class="text-blue-950 font-black">${car.interiorScore} / 10</b></div>
            </div>
          </div>

          <div class="bg-white p-4 rounded-2xl border-2 border-slate-200 space-y-2.5">
            <h4 class="font-black text-sm text-emerald-950 border-b pb-1.5 inline-flex items-center gap-1.5 w-full">${UiIcons.get('shieldCheck', 'w-4 h-4')} ثانياً: خريطة فحص الفابريكة (6 مناطق)</h4>
            <div class="grid grid-cols-1 gap-1.5">
              ${car.bodyZones.map(z => `
                <div class="flex justify-between items-center bg-slate-50 px-2.5 py-1.5 rounded-xl border">
                  <span class="font-bold text-slate-700">${z.part}:</span>
                  <span class="font-black ${z.ok ? 'text-emerald-700' : 'text-amber-700'}">${z.ok ? '✓ ' : ''}${z.state}</span>
                </div>
              `).join('')}
            </div>
          </div>
        </div>

        <div class="grid grid-cols-1 sm:grid-cols-12 gap-4 items-center bg-slate-50 p-4 rounded-2xl border border-slate-300 mb-6">
          <div class="sm:col-span-9 space-y-2">
            <p class="font-black text-slate-900">تقرير مهندس الفحص وحالة الهيكل:</p>
            <p class="text-slate-700 font-bold bg-white p-2.5 rounded-xl border">${escapeHtml(car.paintDetails)} — ${escapeHtml(car.description)}</p>
            <p class="text-[11px] text-emerald-950 bg-emerald-50 border border-emerald-200 p-2.5 rounded-xl font-bold">
              ✓ يضمن ${escapeHtml(DEALER_BRAND_NAME)} صحة بيانات الفحص الفني الموضحة بهذه الشهادة وخلو الشاسيه والدواخل من أي حوادث جوهرية أو لحامات.
            </p>
          </div>
          <div class="sm:col-span-3 text-center">
            <img src="${qrApiUrl}" alt="QR" class="w-28 h-28 mx-auto rounded-xl border bg-white p-1.5" />
            <span class="block text-[9px] text-slate-500 font-bold mt-1">امسح للتحقق أونلاين</span>
          </div>
        </div>

        <div class="grid grid-cols-3 gap-4 pt-4 border-t-2 border-slate-900 text-center font-black text-slate-900">
          <div>اعتماد مهندس الفحص الفني<br><br>................................</div>
          <div>ختم المعرض المعتمد<br><br>................................</div>
          <div>توقيع العميل بالاطلاع<br><br>................................</div>
        </div>
      </div>
    `);
  },

  openInstallmentPlansModal(carId, customDownPct = null) {
    const { car } = CarRepository.findCarAnywhere(carId);
    if (!car) return;

    const carIdEsc = escapeHtml(car.id);
    const currentDownInput = Number(document.getElementById('calc-down')?.value) || Math.round(car.price * 0.30);
    const downAmount = customDownPct ? Math.round(car.price * customDownPct) : currentDownInput;
    const downPctLabel = car.price > 0 ? Math.round((downAmount / car.price) * 100) : 30;
    const interestRate = Number(document.getElementById('calc-interest')?.value) || 14.5;
    const financed = Math.max(0, car.price - downAmount);
    const adminFees = Math.round((financed * 0.025) / 500) * 500;
    const maxMonths = Math.min(60, car.maxInstallmentMonths || 60);

    const durations = [
      { months: 12, title: 'خطة سنة واحدة (12 شهراً)', badge: 'أقل فائدة إجمالية' },
      { months: 36, title: 'خطة 3 سنوات (36 شهراً)', badge: 'الأكثر طلباً وتوازناً' },
      { months: maxMonths, title: `خطة ${Math.round(maxMonths / 12)} سنوات (${maxMonths} شهراً)`, badge: 'أقل قسط شهري مريح' }
    ];

    const plans = durations.map(d => {
      const totalInterest = financed * (interestRate / 100) * (d.months / 12);
      const totalPayable = financed + totalInterest;
      const monthly = Math.round(totalPayable / d.months);
      return { ...d, monthly, totalPayable: Math.round(totalPayable) };
    });

    App.openModalHtml(`
      <div id="printable-quote-area" class="bg-white rounded-3xl max-w-3xl w-full p-6 sm:p-8 shadow-2xl relative max-h-[92vh] overflow-y-auto custom-scroll border-4 border-slate-900 text-xs leading-relaxed">
        <div class="flex flex-wrap justify-between items-center gap-2 pb-4 mb-5 border-b-2 border-slate-900 no-print">
          <button type="button" onclick="App.openDetails('${carIdEsc}')" class="bg-slate-100 hover:bg-slate-200 text-slate-800 font-black px-3.5 py-2 rounded-xl inline-flex items-center gap-1.5 transition">
            ${UiIcons.get('arrowRight', 'w-3.5 h-3.5')}
            <span>العودة لحاسبة السيارة</span>
          </button>
          <div class="flex items-center gap-2">
            <button type="button" onclick="App.printDocument()" class="bg-blue-950 hover:bg-blue-900 text-amber-400 font-black px-4 py-2 rounded-xl shadow-md inline-flex items-center gap-1.5 transition">
              ${UiIcons.get('printer', 'w-4 h-4')}
              <span>طباعة جدول الخطط (A4)</span>
            </button>
            <button type="button" onclick="App.closeModal()" aria-label="إغلاق" class="bg-slate-200 hover:bg-slate-300 text-slate-900 w-8 h-8 rounded-full inline-flex items-center justify-center transition">
              ${UiIcons.get('x', 'w-4 h-4')}
            </button>
          </div>
        </div>

        <div class="bg-slate-950 text-white p-5 rounded-2xl flex justify-between items-center mb-5">
          <div>
            <h2 class="text-lg sm:text-xl font-black inline-flex items-center gap-2">${UiIcons.get('table', 'w-5 h-5 text-amber-400')} جدول مقارنة خطط التمويل والتقسيط</h2>
            <p class="text-xs text-amber-400 font-bold mt-0.5">${escapeHtml(car.brand)} ${escapeHtml(car.model)} (موديل ${car.year}) — السعر النقدي: ${car.formattedPrice}</p>
          </div>
          <span class="bg-amber-400 text-slate-950 font-black px-3 py-1 rounded-xl text-xs">مقدم ${downPctLabel}%</span>
        </div>

        <div class="flex flex-wrap items-center justify-between gap-2 bg-amber-50 p-3 rounded-2xl border border-amber-200 mb-5 no-print">
          <span class="font-black text-amber-950 inline-flex items-center gap-1.5">${UiIcons.get('zap', 'w-4 h-4 text-amber-600')} جرب تغيير نسبة الدفعة المقدمة لمقارنة الأقساط:</span>
          <div class="flex gap-1.5">
            ${[20, 30, 40, 50].map(pct => `
              <button type="button" onclick="App.openInstallmentPlansModal('${carIdEsc}', ${pct / 100})" class="px-3 py-1.5 rounded-xl font-black ${downPctLabel === pct ? 'bg-blue-950 text-amber-400' : 'bg-white border text-slate-800'}">مقدم ${pct}%</button>
            `).join('')}
          </div>
        </div>

        <div class="grid grid-cols-3 gap-3 bg-slate-50 p-4 rounded-2xl border border-slate-200 mb-5 text-center">
          <div>
            <span class="block text-[11px] text-slate-500 font-bold">الدفعة المقدمة (${downPctLabel}%)</span>
            <span class="text-base font-black text-emerald-700">${downAmount.toLocaleString('ar-EG')} ج.م</span>
          </div>
          <div>
            <span class="block text-[11px] text-slate-500 font-bold">المبلغ المتبقي للتمويل</span>
            <span class="text-base font-black text-blue-950">${financed.toLocaleString('ar-EG')} ج.م</span>
          </div>
          <div>
            <span class="block text-[11px] text-slate-500 font-bold">المصاريف الإدارية التقديرية</span>
            <span class="text-base font-black text-slate-800">${adminFees.toLocaleString('ar-EG')} ج.م</span>
          </div>
        </div>

        <div class="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-5">
          ${plans.map((p, idx) => `
            <div class="p-4 rounded-2xl border-2 ${idx === 1 ? 'border-amber-400 bg-amber-50/40' : 'border-slate-200 bg-white'} flex flex-col justify-between space-y-3">
              <div>
                <span class="inline-block text-[10px] font-black px-2.5 py-0.5 rounded-full ${idx === 1 ? 'bg-amber-400 text-slate-950' : 'bg-slate-100 text-slate-700'} mb-2">${p.badge}</span>
                <h4 class="font-black text-sm text-slate-900">${p.title}</h4>
              </div>
              <div class="py-3 border-y border-slate-200">
                <span class="block text-[10px] text-slate-500 font-bold">القسط الشهري الثابت</span>
                <span class="text-xl font-black text-blue-950">${p.monthly.toLocaleString('ar-EG')} ج.م</span>
              </div>
              <div class="text-[11px] text-slate-600 font-bold">
                عدد الأقساط: <b>${p.months} قسطاً شهرياً</b>
              </div>
            </div>
          `).join('')}
        </div>

        <p class="text-[11px] text-slate-500 font-bold bg-slate-50 p-3 rounded-xl border">
          * الأقساط الموضحة أعلاه استرشادية وفق معدل الفائدة السنوي (${interestRate}%)، وتخضع للموافقة الائتمانية النهائية للبنك أو شركة التمويل.
        </p>
      </div>
    `);
  },

  openSocialAdStudio(carId) {
    const { car } = CarRepository.findCarAnywhere(carId);
    if (!car) return;
    const carUrl = App.getDirectCarUrl(car.id);
    const minDown = Math.round(car.price * 0.20);
    const estMonthly = car.estimatedMonthlyInstallment;

    const adText =
      `🔥 وحش جديد ينضم لأسطول #أبو_بهاء_لتجارة_السيارات 🔥\n\n` +
      `🚘 الماركة والموديل: ${car.brand} ${car.model} (موديل ${car.year})\n` +
      `🛡️ حالة الدهان: ${car.paintStatus} (${car.paintDetails})\n` +
      `⚙️ تقييم الفحص الهندسي المعتمد: ${car.inspectionScore}/10\n` +
      `🛣️ العداد: ${car.formattedMileage}\n` +
      `✨ أبرز التجهيزات: ${car.description}\n\n` +
      `💰 السعر النقدي: ${car.formattedPrice}${car.hasDiscount ? ` (بدلاً من ${car.formattedOldPrice} - وفر ${car.formattedDiscount}!)` : ''}\n` +
      `💳 متاح التقسيط (بنكي / بصورة البطاقة / سجل تجاري) بمقدم يبدأ من ${minDown.toLocaleString('ar-EG')} ج.م وقسط شهري يبدأ من ${estMonthly.toLocaleString('ar-EG')} ج.م!\n` +
      `🔄 متاح استبدال سيارتك القديمة وتقسيط الفرق فوراً.\n\n` +
      `🔗 فحص السيارة وحساب قسطك أونلاين:\n${carUrl}\n\n` +
      `📍 العنوان: ${DEALER_ADDRESS}\n` +
      `📞 للتواصل والحجز: ${DEALER_PHONES_DISPLAY}\n` +
      `#أبو_بهاء_لتجارة_السيارات #سيارات_أسيوط #تقسيط_سيارات #استبدال_سيارات #${car.brand.replace(/\s+/g, '_')}`;

    App.openModalHtml(`
      <div class="bg-white rounded-3xl max-w-lg w-full p-6 shadow-2xl relative text-xs space-y-4">
        <button type="button" onclick="App.openDetails('${escapeHtml(car.id)}')" aria-label="رجوع" class="absolute top-4 left-4 bg-slate-200 hover:bg-slate-300 text-slate-900 w-8 h-8 rounded-full inline-flex items-center justify-center transition">
          ${UiIcons.get('x', 'w-4 h-4')}
        </button>
        <h3 class="font-black text-base text-slate-900 inline-flex items-center gap-2">${UiIcons.get('megaphone', 'w-4 h-4 text-amber-600')} استوديو إعلانات السوشيال ميديا (فيسبوك / انستجرام)</h3>
        <p class="text-slate-500">تم توليد إعلان تسويقي جاهز للنشر شامل تفاصيل الفحص والقسط والهاشتاجات:</p>
        <textarea id="social-ad-textarea" class="w-full h-64 p-3.5 rounded-2xl border bg-slate-50 font-semibold leading-relaxed text-slate-800">${escapeHtml(adText)}</textarea>
        <button type="button" onclick="App.copyAdTextarea()" class="w-full bg-blue-950 hover:bg-blue-900 text-amber-400 font-black py-3 rounded-xl shadow flex items-center justify-center gap-2">
          ${UiIcons.get('copy', 'w-4 h-4')}
          <span>نسخ الإعلان بالكامل للنشر</span>
        </button>
      </div>
    `);
  }
};

window.CarDetailsUI = CarDetailsUI;
