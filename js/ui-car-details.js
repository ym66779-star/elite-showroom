/* ============================================================================
   Abu Bahaa Showroom - Car Details, Calculators, A4 Cert/Sticker/Plans & Share
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
      App.showToast('⚠️ هذه السيارة لم تعد متوفرة.', 'warning');
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
    const isReservedByMe = CarRepository.hasClientReservedCar(car.id);
    const maxM = car.maxInstallmentMonths || 60;
    const defaultDown = Math.round(car.price * 0.3);
    const gallery = Array.isArray(car.images) && car.images.length ? car.images : [car.imageUrl];
    this.activeGalleryList = gallery;
    this.activeCalcCarPrice = car.price;
    const isCompared = CarRepository.getCompare(isAdmin).includes(String(car.id));
    const carIdEsc = escapeHtml(car.id);

    const similarCars = CarRepository.getAllCars()
      .filter(c => String(c.id) !== String(car.id) && !c.isReserved)
      .sort((a, b) => Math.abs(a.price - car.price) - Math.abs(b.price - car.price))
      .slice(0, 3);

    App.openModalHtml(`
      <div id="printable-quote-area" class="bg-white rounded-3xl max-w-4xl w-full p-5 sm:p-7 shadow-2xl relative max-h-[92vh] overflow-y-auto custom-scroll">
        <div class="flex justify-between items-center border-b pb-3 mb-4 flex-wrap gap-2">
          <div class="flex items-center gap-2">
            <span class="bg-blue-950 text-amber-400 w-8 h-8 rounded-xl flex items-center justify-center font-black">🚘</span>
            <div>
              <h4 class="font-black text-sm text-slate-900">${escapeHtml(DEALER_BRAND_NAME)} - وثيقة الفحص والتقسيط</h4>
              <p class="text-[10px] text-slate-500">كود السيارة المرجعي: ${carIdEsc}</p>
            </div>
          </div>
          <div class="flex items-center gap-1.5 sm:gap-2 no-print flex-wrap">
            <button type="button" onclick="App.shareCarNative('${carIdEsc}')" class="bg-amber-500 hover:bg-amber-400 text-slate-950 text-xs font-black px-3 py-1.5 rounded-xl transition flex items-center gap-1 shadow-sm">
              <span>📤</span> مشاركة
            </button>
            <button type="button" onclick="App.openWindowStickerModal('${carIdEsc}')" class="bg-blue-950 hover:bg-blue-900 text-amber-400 text-xs font-black px-3 py-1.5 rounded-xl transition flex items-center gap-1 shadow-sm">
              <span>🏷️</span> ملصق الزجاج (QR)
            </button>
            <button type="button" onclick="App.toggleCompare('${carIdEsc}'); App.openDetails('${carIdEsc}');" class="bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-bold px-3 py-1.5 rounded-xl transition">
              ${isCompared ? '✓ بالمقارنة' : '⚖️ قارن'}
            </button>
            <button type="button" onclick="App.printDocument()" class="bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-bold px-3 py-1.5 rounded-xl flex items-center gap-1 transition">
              <span>🖨️</span> طباعة عرض سعر
            </button>
            <button type="button" onclick="App.closeModal()" class="bg-slate-200 hover:bg-slate-300 text-slate-900 w-8 h-8 rounded-full font-black text-sm flex items-center justify-center transition">✕</button>
          </div>
        </div>

        <div class="grid grid-cols-1 lg:grid-cols-12 gap-6">
          <div class="lg:col-span-7 space-y-3.5">
            <div class="relative rounded-2xl overflow-hidden bg-slate-900 h-60 sm:h-72">
              <img id="main-gallery-image" src="${escapeHtml(gallery[0])}" onerror="this.src='${DEFAULT_CAR_IMAGE}'" class="w-full h-full object-cover transition duration-300" />
              <div class="absolute bottom-3 right-3 bg-slate-900/90 text-amber-300 text-xs font-black px-3.5 py-1.5 rounded-xl border border-amber-400/30 shadow">
                ${car.inspectionBadge} (${car.inspectionScore}/10)
              </div>
              ${car.hasDiscount ? `<div class="absolute top-3 left-3 bg-rose-600 text-white text-xs font-black px-3 py-1.5 rounded-xl shadow-lg">🔥 خصم نقدي ${car.formattedDiscount}</div>` : ''}
              ${car.isReserved ? `<div class="absolute top-3 right-3 bg-purple-700 text-white text-xs font-black px-3.5 py-1.5 rounded-xl shadow">🔒 محجوزة حالياً</div>` : ''}
            </div>

            ${gallery.length > 1 ? `
              <div class="flex gap-2 overflow-x-auto pb-1 no-print">
                ${gallery.map((imgUrl, idx) => `
                  <img onclick="App.setGalleryImage(${idx})" src="${escapeHtml(imgUrl)}" onerror="this.src='${DEFAULT_CAR_IMAGE}'" class="w-20 h-14 object-cover rounded-xl cursor-pointer border-2 border-transparent hover:border-amber-500 transition shrink-0" />
                `).join('')}
              </div>
            ` : ''}

            <div class="bg-slate-50 p-4 rounded-2xl border border-slate-200 space-y-3">
              <div class="flex flex-wrap items-center justify-between gap-2">
                <h4 class="font-black text-xs sm:text-sm text-slate-900 flex items-center gap-1.5">
                  <span>🛡️</span> خريطة حالة الفابريكة والدهان (6 مناطق)
                </h4>
                <span class="bg-emerald-100 text-emerald-900 border border-emerald-300 px-3 py-0.5 rounded-xl text-xs font-black">
                  ${escapeHtml(car.paintStatus)}
                </span>
              </div>
              <p class="text-xs text-slate-600 font-bold bg-white p-2.5 rounded-xl border">${escapeHtml(car.paintDetails)}</p>
              <div class="grid grid-cols-2 sm:grid-cols-3 gap-2 text-[11px]">
                ${car.bodyZones.map(z => `
                  <div class="bg-white p-2 rounded-xl border flex items-center justify-between">
                    <span class="font-bold text-slate-600">${z.part}:</span>
                    <span class="font-black ${z.ok ? 'text-emerald-700' : 'text-amber-700'}">${z.ok ? '✓ ' : ''}${z.state}</span>
                  </div>
                `).join('')}
              </div>
            </div>

            <div class="bg-slate-50 p-4 rounded-2xl border border-slate-200">
              <h4 class="font-black text-xs sm:text-sm text-slate-900 mb-3 flex items-center justify-between">
                <span>⚙️ شهادة الفحص الهندسي المعتمد (4 محاور)</span>
                <span class="text-teal-700 bg-teal-50 px-2.5 py-0.5 rounded-lg border border-teal-200 text-xs">الإجمالي: ${car.inspectionScore}/10</span>
              </h4>
              <div class="grid grid-cols-2 gap-3 text-xs">
                ${[
                  { label: 'كفاءة المحرك والحرارة', score: car.engineScore },
                  { label: 'ناقل الحركة (الفتيس)', score: car.gearScore },
                  { label: 'الهيكل الخارجي والدهان', score: car.bodyScore },
                  { label: 'العفشة والصالون الداخلي', score: car.interiorScore }
                ].map(item => `
                  <div class="bg-white p-2.5 rounded-xl border">
                    <div class="flex justify-between font-bold text-slate-700 mb-1">
                      <span>${item.label}</span>
                      <span class="text-blue-900 font-black">${item.score}/10</span>
                    </div>
                    <div class="w-full bg-slate-200 h-2 rounded-full overflow-hidden">
                      <div class="bg-teal-600 h-full rounded-full" style="width: ${Math.min(100, item.score * 10)}%"></div>
                    </div>
                  </div>
                `).join('')}
              </div>
            </div>

            <div>
              <h4 class="font-black text-sm text-slate-900 mb-1">📋 الوصف التفصيلي والتجهيزات:</h4>
              <p class="text-xs sm:text-sm text-slate-600 leading-relaxed bg-slate-50 p-3.5 rounded-xl border">${escapeHtml(car.description)}</p>
            </div>
          </div>

          <div class="lg:col-span-5 flex flex-col justify-between space-y-4">
            <div class="bg-blue-950 text-white p-5 rounded-2xl shadow-md">
              <div class="flex justify-between items-center">
                <span class="text-xs text-amber-300 font-bold">${escapeHtml(car.brand)}</span>
                ${car.hasDiscount ? `<span class="bg-rose-600 text-white text-[10px] font-black px-2.5 py-0.5 rounded-lg">وفر ${car.formattedDiscount}</span>` : ''}
              </div>
              <h3 class="text-xl sm:text-2xl font-black mt-0.5">${escapeHtml(car.model)}</h3>
              <div class="flex items-center gap-3 text-xs text-slate-300 mt-2 pb-3 border-b border-blue-800">
                <span>📅 موديل: <b class="text-white">${car.year}</b></span>
                <span>•</span>
                <span>🛣️ الممشى: <b class="text-white">${car.formattedMileage}</b></span>
                <span>•</span>
                <span>👁️ <b class="text-white">${car.viewsCount}</b></span>
              </div>
              <div class="mt-3 flex justify-between items-baseline">
                <span class="text-xs text-slate-300 font-bold">السعر النقدي:</span>
                <div class="text-left">
                  ${car.hasDiscount ? `<span class="text-xs text-rose-300 line-through block">${car.formattedOldPrice}</span>` : ''}
                  <span class="text-2xl font-black text-amber-400">${car.formattedPrice}</span>
                </div>
              </div>
            </div>

            <div class="bg-rose-50 border border-rose-200 text-rose-950 px-3.5 py-2.5 rounded-2xl flex items-center justify-between text-xs font-bold shadow-sm no-print">
              <div class="flex items-center gap-2">
                <span class="text-base">🔥</span>
                <span>إقبال مرتفع: شاهدها <b>${car.viewsCount} عميل</b> ${car.favoritesCount > 0 ? `• وفي مفضلة <b>${car.favoritesCount} عملاء</b>` : '• جاهزة للمعاينة الفورية'}</span>
              </div>
              <span class="bg-rose-600 text-white text-[10px] font-black px-2 py-0.5 rounded-lg shrink-0">مطلوبة</span>
            </div>

            ${isAdmin ? `
              <div class="grid grid-cols-3 gap-1.5 bg-slate-900 p-2.5 rounded-2xl border border-amber-400/40 no-print">
                <button type="button" onclick="App.openSocialAdStudio('${carIdEsc}')" class="bg-amber-500 hover:bg-amber-400 text-slate-950 font-black py-2 px-2 rounded-xl text-[11px] flex items-center justify-center gap-1 shadow transition">
                  <span>📢</span> بوست إعلاني
                </button>
                <button type="button" onclick="App.openPrintableContract('RESERVATION', '${carIdEsc}')" class="bg-white/10 hover:bg-white/20 text-amber-300 font-black py-2 px-2 rounded-xl text-[11px] flex items-center justify-center gap-1 transition">
                  <span>📄</span> إيصال عربون
                </button>
                <button type="button" onclick="App.openPrintableContract('SALE', '${carIdEsc}')" class="bg-white/10 hover:bg-white/20 text-white font-black py-2 px-2 rounded-xl text-[11px] flex items-center justify-center gap-1 transition">
                  <span>📜</span> عقد بيع
                </button>
              </div>
            ` : ''}

            ${isAdmin ? (role === 'SuperAdmin' ? `
              <div class="bg-slate-950 text-white p-3.5 rounded-2xl border-2 border-emerald-500/60 space-y-2 text-xs shadow-lg no-print">
                <div class="flex justify-between items-center border-b border-slate-800 pb-1.5">
                  <span class="font-black text-amber-400 flex items-center gap-1">🔐 البيانات المالية السرية (للمدير العام فقط)</span>
                  <span class="bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 px-2 py-0.5 rounded-lg text-[10px] font-black">صافي الربح: ${car.expectedProfit.toLocaleString('ar-EG')} ج.م</span>
                </div>
                <div class="grid grid-cols-3 gap-2 text-[11px] text-center pt-1">
                  <div class="bg-slate-900 p-2 rounded-xl border border-slate-800">
                    <span class="block text-slate-400 text-[10px]">التكلفة الكلية (شراء+تجهيز)</span>
                    <b class="text-white font-black">${car.totalCost.toLocaleString('ar-EG')} ج.م</b>
                  </div>
                  <div class="bg-slate-900 p-2 rounded-xl border border-slate-800">
                    <span class="block text-slate-400 text-[10px]">أقل سعر بيع مسموح</span>
                    <b class="text-amber-400 font-black">${car.minAllowedPrice.toLocaleString('ar-EG')} ج.م</b>
                  </div>
                  <div class="bg-slate-900 p-2 rounded-xl border border-slate-800">
                    <span class="block text-slate-400 text-[10px]">أقصى خصم تفاوض</span>
                    <b class="text-rose-400 font-black">${car.maxNegotiationDiscount.toLocaleString('ar-EG')} ج.م</b>
                  </div>
                </div>
              </div>
            ` : `
              <div class="bg-indigo-950 text-white p-3 rounded-2xl border border-indigo-400/50 flex justify-between items-center text-xs shadow no-print">
                <div>
                  <span class="block font-black text-amber-300">🎯 حد التفاوض المسموح للمبيعات:</span>
                  <span class="text-[11px] text-slate-200">أقل سعر بيع مسموح بعد التفاوض: <b>${car.minAllowedPrice.toLocaleString('ar-EG')} ج.م</b></span>
                </div>
                <span class="bg-white/10 text-amber-300 font-black px-2.5 py-1 rounded-xl text-[10px] shrink-0">خصم حتى ${car.maxNegotiationDiscount.toLocaleString('ar-EG')} ج.م</span>
              </div>
            `) : ''}

            <div class="grid grid-cols-2 gap-2 no-print">
              <button type="button" onclick="App.openInspectionCertificateModal('${carIdEsc}')" class="bg-emerald-900 hover:bg-emerald-800 text-white font-black py-2.5 px-3 rounded-2xl text-xs flex items-center justify-center gap-1.5 shadow-sm transition border border-emerald-700">
                <span>🛡️</span> شهادة الفحص والضمان (A4)
              </button>
              <button type="button" onclick="App.openInstallmentPlansModal('${carIdEsc}')" class="bg-blue-900 hover:bg-blue-800 text-amber-300 font-black py-2.5 px-3 rounded-2xl text-xs flex items-center justify-center gap-1.5 shadow-sm transition border border-blue-700">
                <span>📊</span> جدول خطط السداد (1/3/5 سنوات)
              </button>
            </div>

            <div class="bg-slate-50 p-4 rounded-2xl border border-slate-200 space-y-3">
              <h4 class="font-black text-sm text-slate-900 flex items-center justify-between">
                <span>🧮 حاسبة وبرامج التقسيط الذكية</span>
                <span class="text-[11px] text-blue-900 bg-blue-100 px-2 py-0.5 rounded-lg">حتى ${maxM} شهراً</span>
              </h4>

              <div class="space-y-1.5 no-print">
                <span class="block text-[11px] font-bold text-slate-600">اختر نظام التمويل المناسب لأوراقك:</span>
                <div class="grid grid-cols-3 gap-1.5 text-[10px]">
                  <button type="button" onclick="App.applyInstallmentPreset('ID_ONLY')" data-preset="ID_ONLY" class="preset-tier-btn bg-white hover:bg-blue-50 border border-slate-300 text-slate-800 font-black py-2 px-1.5 rounded-xl transition text-center">
                    ⚡ بصورة البطاقة<br><span class="text-[9px] text-slate-500 font-bold">مقدم 40%</span>
                  </button>
                  <button type="button" onclick="App.applyInstallmentPreset('BANK_EMP')" data-preset="BANK_EMP" class="preset-tier-btn bg-white hover:bg-blue-50 border border-slate-300 text-slate-800 font-black py-2 px-1.5 rounded-xl transition text-center">
                    🏦 تمويل بنكي<br><span class="text-[9px] text-slate-500 font-bold">مقدم 20%</span>
                  </button>
                  <button type="button" onclick="App.applyInstallmentPreset('BUSINESS')" data-preset="BUSINESS" class="preset-tier-btn bg-blue-950 text-amber-400 border border-blue-900 font-black py-2 px-1.5 rounded-xl transition text-center shadow-sm">
                    🏢 سجل تجاري<br><span class="text-[9px] text-amber-200 font-bold">مقدم 30%</span>
                  </button>
                </div>
                <div id="calc-docs-box" class="bg-amber-50/90 border border-amber-200 text-amber-950 p-2.5 rounded-xl text-[11px] font-bold leading-relaxed">
                  ${escapeHtml(INSTALLMENT_PROGRAMS.BUSINESS.docs)}
                </div>
              </div>

              <div>
                <div class="flex justify-between text-xs font-bold text-slate-700 mb-1">
                  <label>الدفعة المقدمة (ج.م)</label>
                  <span id="calc-down-label" class="text-blue-900 font-black">${defaultDown.toLocaleString('ar-EG')} ج.م</span>
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

              <div class="bg-white p-3 rounded-xl border border-blue-200 flex justify-between items-center">
                <div>
                  <span class="block text-[10px] text-slate-500 font-bold">القسط الشهري المحسوب</span>
                  <span id="calc-financed-note" class="text-[10px] text-slate-400 font-semibold">المبلغ الممول: 0 ج.م</span>
                </div>
                <span id="calc-result" class="text-base sm:text-lg font-black text-blue-900">0 ج.م</span>
              </div>
            </div>

            <div class="space-y-2 no-print">
              <div class="bg-amber-50/60 rounded-2xl border border-amber-300/80 p-2.5">
                <button type="button" onclick="App.toggleInlineTradeInBox()" class="w-full text-amber-950 font-black py-1 px-2 rounded-xl text-xs flex items-center justify-between transition">
                  <span>🔄 لديك سيارة قديمة؟ احسب فرق الاستبدال كمقدم</span>
                  <span class="bg-amber-400/40 px-2 py-0.5 rounded-lg text-[10px]">من - إلى ▾</span>
                </button>
                <div id="inline-tradein-box" class="hidden mt-2.5 pt-2.5 border-t border-amber-200 space-y-2 text-xs">
                  <input id="iti-car-name" placeholder="نوع سيارتك وموديلها (مثال: إلنترا 2019)" class="w-full border p-2 rounded-xl bg-white font-bold" />
                  <div class="grid grid-cols-2 gap-2">
                    <input id="iti-expected-val" type="number" min="50000" step="10000" placeholder="سعرك التقديري (ج.م)" class="w-full border p-2 rounded-xl bg-white font-bold" />
                    <select id="iti-condition" class="w-full border p-2 rounded-xl bg-white font-bold">
                      <option value="FULL_FABRIKA">فابريكة بالكامل</option>
                      <option value="CLEAN_BELT" selected>فابريكة دواخل - رشة خارجي</option>
                      <option value="NEEDS_CARE">تحتاج بعض المصاريف</option>
                    </select>
                  </div>
                  <button type="button" onclick="App.calculateInlineTradeIn('${carIdEsc}')" class="w-full bg-slate-900 hover:bg-slate-800 text-amber-400 font-black py-2 rounded-xl transition shadow-sm">
                    🧮 احسب نطاق التثمين (من - إلى) والقسط المتبقي
                  </button>
                  <div id="iti-result-box" class="hidden"></div>
                </div>
              </div>

              <div class="bg-slate-100/80 rounded-2xl border border-slate-200 p-2.5">
                <button type="button" onclick="App.toggleOwnershipCostsBox()" class="w-full text-slate-800 font-black py-1 px-2 rounded-xl text-xs flex items-center justify-between transition">
                  <span>📑 التكلفة التقديرية لنقل الملكية والترخيص والتأمين</span>
                  <span class="bg-slate-200 px-2 py-0.5 rounded-lg text-[10px]">شفافية كاملة ▾</span>
                </button>
                <div id="ownership-costs-box" class="hidden mt-2.5 pt-2.5 border-t border-slate-200 space-y-1.5 text-[11px]">
                  <div class="bg-white p-2 rounded-xl border flex justify-between items-center">
                    <span class="text-slate-600 font-bold">📜 رسوم العقد المسجل والشهر العقاري (تقديري):</span>
                    <span class="font-black text-blue-950">${(Math.round((Math.min(car.price * 0.008, 12000) + 2500) / 100) * 100).toLocaleString('ar-EG')} ج.م</span>
                  </div>
                  <div class="bg-white p-2 rounded-xl border flex justify-between items-center">
                    <span class="text-slate-600 font-bold">🏷️ مصروفات الترخيص السنوي والملصق والفحص:</span>
                    <span class="font-black text-blue-950">3,800 ج.م</span>
                  </div>
                  <div class="bg-white p-2 rounded-xl border flex justify-between items-center">
                    <span class="text-slate-600 font-bold">🛡️ وثيقة التأمين الشامل السنوي (اختياري ~2.5%):</span>
                    <span class="font-black text-emerald-700">${(Math.round((car.price * 0.025) / 500) * 500).toLocaleString('ar-EG')} ج.م / سنة</span>
                  </div>
                  <p class="text-[10px] text-slate-500 font-semibold px-1">
                    * الأرقام استرشادية وفق متوسط الرسوم المعمول بها في وحدات المرور والشهر العقاري.
                  </p>
                </div>
              </div>
            </div>

            <div class="space-y-2 no-print">
              <div class="grid grid-cols-2 gap-2">
                <button type="button" onclick="App.sendSmartCarWhatsApp('${carIdEsc}')" class="bg-emerald-600 hover:bg-emerald-500 text-white font-black py-2.5 px-3 rounded-xl text-xs flex items-center justify-center gap-1.5 shadow transition">
                  <span>💬</span> واتساب بالعرض المحسوب
                </button>
                <button type="button" onclick="App.openInspectionBookingModal('${carIdEsc}')" class="bg-teal-700 hover:bg-teal-600 text-white font-black py-2.5 px-3 rounded-xl text-xs flex items-center justify-center gap-1.5 shadow transition">
                  <span>🚗</span> حجز معاينة / فيديو
                </button>
              </div>

              ${!car.isReserved && !isReservedByMe ? `
                <button type="button" onclick="App.openReserveModal('${carIdEsc}')" class="w-full bg-purple-700 hover:bg-purple-600 text-white font-black py-2.5 px-4 rounded-xl text-xs flex items-center justify-center gap-1.5 shadow transition">
                  <span>🔒</span> ${isAdmin ? 'تسجيل حجز مؤقت باسم عميل بالمعرض' : 'طلب حجز مؤقت للسيارة'}
                </button>
              ` : `
                <div class="w-full bg-purple-50 border border-purple-200 text-purple-900 font-black py-2.5 px-4 rounded-xl text-xs text-center">
                  🔒 ${car.isReserved ? `السيارة محجوزة حالياً (${escapeHtml(car.reservedByClient || 'عميل المعرض')})` : 'طلب حجزك قيد المراجعة لدى الإدارة'}
                </div>
              `}

              ${isAdmin ? `
                <div class="pt-2 border-t flex flex-wrap gap-2">
                  <button type="button" onclick="App.openCarFormModal('${carIdEsc}')" class="flex-1 bg-amber-500 hover:bg-amber-400 text-slate-950 font-black py-2 px-3 rounded-xl text-xs transition">
                    ✏️ تعديل البيانات
                  </button>
                  ${role === 'SuperAdmin' ? `
                    <button type="button" onclick="App.directSellCar('${carIdEsc}')" class="flex-1 bg-emerald-700 hover:bg-emerald-600 text-white font-black py-2 px-3 rounded-xl text-xs transition">
                      🏷️ بيع مباشر (كاش)
                    </button>
                  ` : ''}
                  <button type="button" onclick="App.deleteCar('${carIdEsc}')" class="bg-rose-100 hover:bg-rose-200 text-rose-700 font-black py-2 px-3 rounded-xl text-xs transition">
                    🗑️ حذف
                  </button>
                </div>
              ` : ''}
            </div>
          </div>
        </div>

        ${similarCars.length > 0 ? `
          <div class="mt-6 pt-5 border-t border-slate-200 no-print">
            <h4 class="font-black text-sm text-slate-900 mb-3 flex items-center gap-1.5">
              <span>🔄</span> سيارات مشابهة وبدائل مقترحة لك من المعرض
            </h4>
            <div class="grid grid-cols-1 sm:grid-cols-3 gap-3">
              ${similarCars.map(sc => `
                <div onclick="App.openDetails('${escapeHtml(sc.id)}')" class="bg-slate-50 hover:bg-blue-50/50 p-3 rounded-2xl border border-slate-200 flex items-center gap-3 cursor-pointer transition group">
                  <img src="${escapeHtml(sc.imageUrl)}" onerror="this.src='${DEFAULT_CAR_IMAGE}'" class="w-16 h-12 object-cover rounded-xl shrink-0 group-hover:scale-105 transition" />
                  <div class="text-xs overflow-hidden">
                    <h5 class="font-black text-slate-900 truncate">${escapeHtml(sc.brand)} ${escapeHtml(sc.model)}</h5>
                    <p class="text-blue-900 font-black">${sc.formattedPrice}</p>
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

  setGalleryImage(idx) {
    const imgEl = document.getElementById('main-gallery-image');
    if (imgEl && this.activeGalleryList[idx]) {
      imgEl.src = this.activeGalleryList[idx];
    }
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
    if (docsBox) docsBox.textContent = preset.docs;

    this.currentCalcState.programName = preset.name;

    document.querySelectorAll('.preset-tier-btn').forEach(btn => {
      if (btn.getAttribute('data-preset') === presetKey) {
        btn.className = 'preset-tier-btn bg-blue-950 text-amber-400 border border-blue-900 font-black py-2 px-1.5 rounded-xl transition text-center shadow-sm';
      } else {
        btn.className = 'preset-tier-btn bg-white hover:bg-blue-50 border border-slate-300 text-slate-800 font-black py-2 px-1.5 rounded-xl transition text-center';
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

    this.currentCalcState.programName = INSTALLMENT_PROGRAMS.BUSINESS.name;

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
      App.showToast('⚠️ يرجى كتابة نوع سيارتك وقيمتها التقديرية بشكل صحيح.', 'warning');
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
            <span class="font-bold text-slate-600">📊 نطاق التثمين المبدئي لسيارتك:</span>
            <span class="font-black text-emerald-700">من ${minVal.toLocaleString('ar-EG')} إلى ${maxVal.toLocaleString('ar-EG')} ج.م</span>
          </div>
          <div class="flex justify-between items-center border-b pb-1.5">
            <span class="font-bold text-slate-600">💵 فرق الكاش المتبقي تقريباً:</span>
            <span class="font-black text-blue-900">من ${minCashDiff.toLocaleString('ar-EG')} إلى ${maxCashDiff.toLocaleString('ar-EG')} ج.م</span>
          </div>
          <p class="text-[10px] text-amber-900 bg-amber-50 p-2 rounded-lg font-bold leading-relaxed border border-amber-200">
            ⚠️ <b>تأكيد هام:</b> هذا النطاق السعري (من - إلى) استرشادي فقط، ويتم تحديد السعر الفعلي والنهائي لسيارتك داخل المعرض بعد المعاينة والفحص الفني على الطبيعة.
          </p>
          <button type="button" onclick="App.sendInlineTradeInWhatsApp('${escapeHtml(car.id)}')" class="w-full bg-amber-500 hover:bg-amber-400 text-slate-950 font-black py-2 rounded-xl shadow-sm transition flex items-center justify-center gap-1.5">
            <span>💬</span> إرسال طلب الاستبدال وحجز موعد معاينة بالمعرض
          </button>
        </div>
      `;
    }
    App.showToast('✅ تم حساب نطاق الاستبدال وتحديث المقدم والقسط الشهري!', 'success');
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
      `🚘 السيارة المطلوبة: ${car.brand} ${car.model} (${car.year}) - السعر: ${car.formattedPrice}\n` +
      `🔄 سيارتي الحالية: ${ti.oldCarTitle} (${ti.conditionLabel})\n` +
      `📊 نطاق التثمين الاسترشادي: من ${ti.minVal.toLocaleString('ar-EG')} إلى ${ti.maxVal.toLocaleString('ar-EG')} ج.م\n` +
      `💳 القسط المتبقي التقريبي: ${monthly.toLocaleString('ar-EG')} ج.م × ${months} شهر\n` +
      `⚠️ (مع علمي بأن السعر الفعلي والنهائي لسيارتي يتحدد داخل المعرض بعد المعاينة والفحص الفني).`;

    App.whatsApp(car.dealerPhone, msg);
  },

  openSoldDetails(id) {
    const car = CarRepository.getSoldCars().find(c => String(c.id) === String(id));
    if (!car) return;
    App.openModalHtml(`
      <div class="bg-white rounded-3xl max-w-2xl w-full p-6 shadow-2xl relative max-h-[90vh] overflow-y-auto">
        <button type="button" onclick="App.closeModal()" class="absolute top-4 left-4 bg-slate-200 hover:bg-slate-300 text-slate-900 w-8 h-8 rounded-full font-black text-sm flex items-center justify-center">✕</button>
        <div class="bg-emerald-100 text-emerald-900 p-3.5 rounded-2xl mb-4 font-bold text-xs flex flex-wrap justify-between items-center gap-2 border border-emerald-200">
          <span>🏷️ هذه السيارة مباعة ومدرجة في أرشيف المعرض</span>
          <span>تاريخ البيع: ${escapeHtml(car.soldAt)} | اعتماد: ${escapeHtml(car.soldBy)}</span>
        </div>
        <img src="${escapeHtml(car.imageUrl)}" onerror="this.src='${DEFAULT_CAR_IMAGE}'" class="w-full h-60 object-cover rounded-2xl mb-4" />
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
    const shareText = `🚘 ${car.brand} ${car.model} (موديل ${car.year})\n💰 السعر: ${car.formattedPrice}${car.hasDiscount ? ` (بدلاً من ${car.formattedOldPrice})` : ''}\n🛡️ الحالة: ${car.paintStatus} | فحص ${car.inspectionScore}/10\n🛣️ العداد: ${car.formattedMileage}\n📍 ${DEALER_BRAND_NAME} (كود: ${car.id})`;
    const fullSharePayload = `${shareText}\n📍 العنوان: ${DEALER_ADDRESS}\n📞 للتواصل: ${DEALER_PHONES_DISPLAY}\n🔗 رابط السيارة المباشر:\n${carUrl}`;

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
    App.showToast('📋 تم نسخ تفاصيل ورابط السيارة تلقائياً وجاهز للمشاركة!', 'success');
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
        <button type="button" onclick="App.closeModal()" class="absolute top-4 left-4 bg-slate-200 hover:bg-slate-300 text-slate-900 w-8 h-8 rounded-full font-black text-sm flex items-center justify-center">✕</button>
        <div class="flex items-center gap-3 border-b pb-3">
          <img src="${escapeHtml(car.imageUrl)}" onerror="this.src='${DEFAULT_CAR_IMAGE}'" class="w-16 h-12 object-cover rounded-xl shrink-0" />
          <div>
            <h3 class="font-black text-sm text-slate-900">📤 مشاركة بيانات السيارة</h3>
            <p class="text-blue-900 font-bold mt-0.5">${escapeHtml(car.brand)} ${escapeHtml(car.model)} (${car.year})</p>
          </div>
        </div>

        <div class="bg-emerald-50 border border-emerald-200 text-emerald-900 px-3 py-2 rounded-xl font-bold text-[11px] flex items-center gap-1.5">
          <span>✅</span>
          <span>تم نسخ تفاصيل ورابط السيارة تلقائياً إلى الحافظة (يمكنك عمل لصق Ctrl+V مباشرة).</span>
        </div>

        <div class="bg-slate-50 p-3 rounded-2xl border text-[11px] text-slate-700 whitespace-pre-line leading-relaxed select-all">${escapeHtml(fullSharePayload)}</div>

        <div class="grid grid-cols-1 gap-2">
          <div class="grid grid-cols-2 gap-2">
            <button type="button" onclick="App.copySharePayload(false)" class="bg-blue-950 hover:bg-blue-900 text-amber-400 font-black py-2.5 px-3 rounded-xl shadow flex items-center justify-center gap-1.5 transition">
              <span>📋</span> نسخ النص والرابط
            </button>
            <button type="button" onclick="App.copySharePayload(true)" class="bg-slate-200 hover:bg-slate-300 text-slate-900 font-black py-2.5 px-3 rounded-xl flex items-center justify-center gap-1.5 transition">
              <span>🔗</span> نسخ الرابط فقط
            </button>
          </div>

          <a href="${waWebUrl}" target="_blank" rel="noopener noreferrer" onclick="App.showToast('💻 جاري فتح واتساب ويب للمشاركة...', 'success')" class="w-full bg-emerald-600 hover:bg-emerald-500 text-white font-black py-3 rounded-xl flex items-center justify-center gap-2 shadow transition">
            <span>💻</span> مشاركة عبر واتساب ويب (للكمبيوتر واللابتوب)
          </a>

          <div class="grid grid-cols-2 gap-2">
            <a href="${waAppUrl}" target="_blank" rel="noopener noreferrer" class="bg-emerald-700/90 hover:bg-emerald-700 text-white font-bold py-2.5 rounded-xl flex items-center justify-center gap-1.5 transition">
              <span>📱</span> تطبيق واتساب
            </a>
            <a href="${tgShareUrl}" target="_blank" rel="noopener noreferrer" class="bg-sky-600 hover:bg-sky-500 text-white font-black py-2.5 rounded-xl flex items-center justify-center gap-1.5 shadow transition">
              <span>✈️</span> تيليجرام
            </a>
          </div>

          <a href="${fbShareUrl}" target="_blank" rel="noopener noreferrer" class="w-full bg-blue-700 hover:bg-blue-600 text-white font-bold py-2 rounded-xl flex items-center justify-center gap-1.5 transition">
            <span>📘</span> مشاركة على فيسبوك
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
      App.showToast(onlyUrl ? '🔗 تم نسخ الرابط المباشر للسيارة بنجاح!' : '✅ تم نسخ تفاصيل ورابط السيارة بنجاح!', 'success');
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
          <button type="button" onclick="App.openDetails('${carIdEsc}')" class="bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-black px-3.5 py-2 rounded-xl flex items-center gap-1 transition">
            <span>←</span> العودة لصفحة السيارة
          </button>
          <div class="flex items-center gap-2">
            <button type="button" onclick="App.printDocument()" class="bg-blue-950 hover:bg-blue-900 text-amber-400 text-xs font-black px-4 py-2 rounded-xl flex items-center gap-1.5 shadow-md transition">
              <span>🖨️</span> طباعة ملصق الزجاج (A4)
            </button>
            <button type="button" onclick="App.closeModal()" class="bg-slate-200 hover:bg-slate-300 text-slate-900 w-8 h-8 rounded-full font-black text-sm flex items-center justify-center">✕</button>
          </div>
        </div>

        <div class="bg-slate-950 text-white p-5 rounded-2xl flex justify-between items-center mb-5">
          <div class="flex items-center gap-3">
            <div class="bg-amber-400 text-slate-950 w-12 h-12 rounded-2xl flex items-center justify-center text-2xl font-black">🚘</div>
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
              <span>🛣️ الممشى: <b>${car.formattedMileage}</b></span>
              <span>•</span>
              <span class="text-emerald-800 bg-emerald-100 px-2.5 py-0.5 rounded-lg font-black">🛡️ ${escapeHtml(car.paintStatus)}</span>
            </div>
          </div>
          <div class="sm:col-span-5 text-right sm:text-left border-t sm:border-t-0 sm:border-r-2 border-slate-200 pt-3 sm:pt-0 sm:pr-4">
            <span class="block text-xs text-slate-500 font-bold">السعر النقدي المعتمد</span>
            ${car.hasDiscount ? `<span class="text-xs text-rose-600 line-through font-bold block">${car.formattedOldPrice}</span>` : ''}
            <span class="text-2xl sm:text-3xl font-black text-blue-950">${car.formattedPrice}</span>
            <span class="block text-[11px] text-emerald-700 font-black mt-1">💳 أو بقسط يبدأ من ${estMonthly.toLocaleString('ar-EG')} ج.م/شهر</span>
          </div>
        </div>

        <div class="grid grid-cols-1 sm:grid-cols-12 gap-5 items-center">
          <div class="sm:col-span-7 space-y-3">
            <div class="bg-white p-4 rounded-2xl border-2 border-slate-200">
              <div class="flex justify-between items-center mb-3 pb-2 border-b">
                <span class="font-black text-xs text-slate-900">🛡️ تقييم الفحص الهندسي (4 محاور)</span>
                <span class="bg-emerald-700 text-white text-xs font-black px-3 py-0.5 rounded-lg">${car.inspectionScore} / 10</span>
              </div>
              <div class="grid grid-cols-2 gap-2.5 text-xs">
                <div class="bg-slate-50 p-2.5 rounded-xl border flex justify-between font-bold"><span>كفاءة المحرك:</span><b class="text-blue-950">${car.engineScore}/10</b></div>
                <div class="bg-slate-50 p-2.5 rounded-xl border flex justify-between font-bold"><span>ناقل الحركة:</span><b class="text-blue-950">${car.gearScore}/10</b></div>
                <div class="bg-slate-50 p-2.5 rounded-xl border flex justify-between font-bold"><span>الهيكل والدهان:</span><b class="text-blue-950">${car.bodyScore}/10</b></div>
                <div class="bg-slate-50 p-2.5 rounded-xl border flex justify-between font-bold"><span>العفشة والصالون:</span><b class="text-blue-950">${car.interiorScore}/10</b></div>
              </div>
              <p class="text-[11px] text-slate-600 font-bold mt-3 bg-slate-50 p-2.5 rounded-xl border">✨ ${escapeHtml(car.paintDetails)}</p>
            </div>

            <div class="bg-slate-50 p-3.5 rounded-2xl border text-xs leading-relaxed text-slate-700">
              <b class="text-slate-900 block mb-1">📋 أبرز التجهيزات والكماليات:</b>
              ${escapeHtml(car.description)}
            </div>
          </div>

          <div class="sm:col-span-5 bg-slate-900 text-white p-5 rounded-3xl text-center flex flex-col items-center justify-center space-y-3 border-2 border-amber-400 shadow-xl">
            <span class="bg-amber-400 text-slate-950 text-[11px] font-black px-3 py-1 rounded-full">📱 امسح الكود بكاميرا هاتفك</span>
            <div class="bg-white p-3 rounded-2xl shadow-inner">
              <img src="${qrApiUrl}" alt="QR Code" class="w-40 h-40 object-contain mx-auto" onerror="this.style.display='none'; this.nextElementSibling.style.display='flex';" />
              <div style="display:none" class="w-40 h-40 items-center justify-center text-slate-900 font-black text-xs p-2 text-center">كود السيارة المباشر:<br>${carIdEsc}</div>
            </div>
            <p class="text-[11px] text-slate-200 font-bold leading-relaxed">
              افتح ملف السيارة على هاتفك لحساب القسط الشهري المناسب لك أو طلب الحجز الفوري
            </p>
            <div class="flex items-center justify-center gap-2.5 mt-1 pt-2 border-t border-slate-700/80">
              <img src="./logo.jpg" alt="أبو بهاء" class="w-10 h-10 rounded-xl border border-orange-500 object-cover shrink-0" />
              <div class="text-[10px] text-amber-300 font-bold leading-relaxed text-right">📍 ${escapeHtml(DEALER_ADDRESS)}<br><span class="font-mono text-white">${escapeHtml(DEALER_PHONES_DISPLAY)}</span></div>
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

    App.openModalHtml(`
      <div id="printable-quote-area" class="bg-white rounded-3xl max-w-3xl w-full p-6 sm:p-8 shadow-2xl relative max-h-[92vh] overflow-y-auto custom-scroll border-4 border-slate-900 text-xs leading-relaxed">
        <div class="flex flex-wrap justify-between items-center gap-2 pb-4 mb-5 border-b-2 border-slate-900 no-print">
          <button type="button" onclick="App.openDetails('${carIdEsc}')" class="bg-slate-100 hover:bg-slate-200 text-slate-800 font-black px-3.5 py-2 rounded-xl transition">← العودة لصفحة السيارة</button>
          <div class="flex items-center gap-2">
            <button type="button" onclick="App.printDocument()" class="bg-blue-950 hover:bg-blue-900 text-amber-400 font-black px-5 py-2 rounded-xl shadow-md flex items-center gap-1.5 transition">
              <span>🖨️</span> طباعة شهادة الفحص المعتمدة (A4)
            </button>
            <button type="button" onclick="App.closeModal()" class="bg-slate-200 hover:bg-slate-300 text-slate-900 w-8 h-8 rounded-full font-black text-sm flex items-center justify-center">✕</button>
          </div>
        </div>

        <div class="bg-slate-950 text-white p-5 rounded-2xl flex justify-between items-center mb-5">
          <div class="flex items-center gap-3">
            <div class="bg-amber-400 text-slate-950 w-12 h-12 rounded-2xl flex items-center justify-center text-2xl font-black">🛡️</div>
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
            <span class="text-[10px] bg-white/15 px-2.5 py-0.5 rounded-full font-black inline-block">${car.inspectionBadge}</span>
          </div>
        </div>

        <div class="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-5">
          <div class="bg-white p-4 rounded-2xl border-2 border-slate-200 space-y-2.5">
            <h4 class="font-black text-sm text-blue-950 border-b pb-1.5">⚙️ أولاً: نتائج الفحص الميكانيكي (4 محاور)</h4>
            <div class="space-y-2">
              <div class="flex justify-between items-center bg-slate-50 p-2 rounded-xl border"><span>1. كفاءة المحرك ودورة التبريد:</span><b class="text-blue-950 font-black">${car.engineScore} / 10</b></div>
              <div class="flex justify-between items-center bg-slate-50 p-2 rounded-xl border"><span>2. ناقل الحركة (الفتيس) والأداء:</span><b class="text-blue-950 font-black">${car.gearScore} / 10</b></div>
              <div class="flex justify-between items-center bg-slate-50 p-2 rounded-xl border"><span>3. الشاسيه والهيكل الخارجي:</span><b class="text-blue-950 font-black">${car.bodyScore} / 10</b></div>
              <div class="flex justify-between items-center bg-slate-50 p-2 rounded-xl border"><span>4. العفشة والصالون والكهرباء:</span><b class="text-blue-950 font-black">${car.interiorScore} / 10</b></div>
            </div>
          </div>

          <div class="bg-white p-4 rounded-2xl border-2 border-slate-200 space-y-2.5">
            <h4 class="font-black text-sm text-emerald-950 border-b pb-1.5">🛡️ ثانياً: خريطة فحص الفابريكة (6 مناطق)</h4>
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
            <p class="font-black text-slate-900">📋 تقرير مهندس الفحص وحالة الهيكل:</p>
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
      { months: 36, title: 'خطة 3 سنوات (36 شهراً)', badge: 'الأكثر طلباً وتوازناً ⭐' },
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
          <button type="button" onclick="App.openDetails('${carIdEsc}')" class="bg-slate-100 hover:bg-slate-200 text-slate-800 font-black px-3.5 py-2 rounded-xl transition">← العودة لحاسبة السيارة</button>
          <div class="flex items-center gap-2">
            <button type="button" onclick="App.printDocument()" class="bg-blue-950 hover:bg-blue-900 text-amber-400 font-black px-4 py-2 rounded-xl shadow-md flex items-center gap-1.5 transition">
              <span>🖨️</span> طباعة جدول الخطط (A4)
            </button>
            <button type="button" onclick="App.closeModal()" class="bg-slate-200 hover:bg-slate-300 text-slate-900 w-8 h-8 rounded-full font-black text-sm flex items-center justify-center">✕</button>
          </div>
        </div>

        <div class="bg-slate-950 text-white p-5 rounded-2xl flex justify-between items-center mb-5">
          <div>
            <h2 class="text-lg sm:text-xl font-black">📊 جدول مقارنة خطط التمويل والتقسيط</h2>
            <p class="text-xs text-amber-400 font-bold mt-0.5">${escapeHtml(car.brand)} ${escapeHtml(car.model)} (موديل ${car.year}) — السعر النقدي: ${car.formattedPrice}</p>
          </div>
          <span class="bg-amber-400 text-slate-950 font-black px-3 py-1 rounded-xl text-xs">مقدم ${downPctLabel}%</span>
        </div>

        <div class="flex flex-wrap items-center justify-between gap-2 bg-amber-50 p-3 rounded-2xl border border-amber-200 mb-5 no-print">
          <span class="font-black text-amber-950">⚡ جرب تغيير نسبة الدفعة المقدمة لمقارنة الأقساط:</span>
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
        <button type="button" onclick="App.openDetails('${escapeHtml(car.id)}')" class="absolute top-4 left-4 bg-slate-200 hover:bg-slate-300 text-slate-900 w-8 h-8 rounded-full font-black text-sm flex items-center justify-center">✕</button>
        <h3 class="font-black text-base text-slate-900">📢 استوديو إعلانات السوشيال ميديا (فيسبوك / انستجرام)</h3>
        <p class="text-slate-500">تم توليد إعلان تسويقي جاهز للنشر شامل تفاصيل الفحص والقسط والهاشتاجات:</p>
        <textarea id="social-ad-textarea" class="w-full h-64 p-3.5 rounded-2xl border bg-slate-50 font-semibold leading-relaxed text-slate-800">${escapeHtml(adText)}</textarea>
        <button type="button" onclick="App.copyAdTextarea()" class="w-full bg-blue-950 hover:bg-blue-900 text-amber-400 font-black py-3 rounded-xl shadow flex items-center justify-center gap-2">
          <span>📋</span> نسخ الإعلان بالكامل للنشر
        </button>
      </div>
    `);
  }
};

window.CarDetailsUI = CarDetailsUI;
