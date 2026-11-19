/* ============================================================================
   Abu Bahaa Showroom - Catalog, Unified Filter Bar & Luxury Car Grid UI (v9)
   ============================================================================ */

const CatalogUI = {
  quickFilter: 'ALL',
  bodyCategory: 'ALL',
  advancedOpen: false,

  renderBodyCategoryPills() {
    const wrap = document.getElementById('body-category-pills');
    if (!wrap) return;
    wrap.innerHTML = BODY_CATEGORIES.map(cat => {
      const isActive = this.bodyCategory === cat.key;
      return `
        <button type="button" onclick="App.setBodyCategory('${cat.key}')" data-body-cat="${cat.key}" class="filter-pill ${isActive ? 'is-active' : ''}">
          <span>${cat.icon}</span>
          <span>${cat.label}</span>
        </button>
      `;
    }).join('');
  },

  renderQuickFilterPills() {
    const wrap = document.getElementById('quick-filter-chips');
    if (!wrap) return;
    wrap.innerHTML = QUICK_FILTERS.map(qf => {
      const isActive = this.quickFilter === qf.key;
      return `
        <button type="button" onclick="App.setQuickFilter('${qf.key}')" data-chip="${qf.key}" class="filter-pill ${isActive ? 'is-active' : ''}">
          ${qf.label}
        </button>
      `;
    }).join('');
  },

  populateFilterDropdowns() {
    const cars = CarRepository.getAllCars();
    const brandSelect = document.getElementById('filter-brand');
    const yearSelect = document.getElementById('filter-year');
    if (!brandSelect || !yearSelect) return;

    const currentBrand = brandSelect.value || 'ALL';
    const currentYear = yearSelect.value || 'ALL';

    const brands = [...new Set(cars.map(c => c.brand).filter(Boolean))];
    const years = [...new Set(cars.map(c => c.year).filter(Boolean))].sort((a, b) => b - a);

    brandSelect.innerHTML = `<option value="ALL">جميع الماركات</option>` +
      brands.map(b => `<option value="${escapeHtml(b)}">${escapeHtml(b)}</option>`).join('');
    yearSelect.innerHTML = `<option value="ALL">جميع سنوات الصنع</option>` +
      years.map(y => `<option value="${y}">${y}</option>`).join('');

    if (brands.includes(currentBrand)) brandSelect.value = currentBrand;
    if (years.map(String).includes(String(currentYear))) yearSelect.value = currentYear;

    this.renderBodyCategoryPills();
    this.renderQuickFilterPills();
    this.renderInteractiveBrandsStrip();
    this.updateAdvancedFilterBadge();
  },

  renderInteractiveBrandsStrip() {
    const strip = document.getElementById('interactive-brands-strip');
    if (!strip) return;
    const cars = CarRepository.getAllCars();
    const currentSelected = document.getElementById('filter-brand')?.value || 'ALL';
    const counts = {};
    cars.forEach(c => {
      if (c.brand) counts[c.brand] = (counts[c.brand] || 0) + 1;
    });

    const brandsList = Object.keys(counts);
    strip.innerHTML = `
      <button type="button" onclick="App.selectBrandQuickPill('ALL')" class="filter-pill ${currentSelected === 'ALL' ? 'is-active' : ''}">
        <span>🚘</span>
        <span>كل الماركات (${cars.length})</span>
      </button>
      ${brandsList.map(b => `
        <button type="button" onclick="App.selectBrandQuickPill('${escapeHtml(b)}')" class="filter-pill ${currentSelected === b ? 'is-active' : ''}">
          <span>🏷️</span>
          <span>${escapeHtml(b)}</span>
          <span class="opacity-75 text-[10px]">(${counts[b]})</span>
        </button>
      `).join('')}
    `;
  },

  toggleAdvancedFilters(forceState) {
    const panel = document.getElementById('advanced-filters-panel');
    const btn = document.getElementById('toggle-advanced-filters-btn');
    if (!panel) return;

    this.advancedOpen = typeof forceState === 'boolean' ? forceState : !this.advancedOpen;
    panel.classList.toggle('hidden', !this.advancedOpen);

    if (btn) {
      btn.setAttribute('aria-expanded', String(this.advancedOpen));
      btn.classList.toggle('border-amber-500', this.advancedOpen);
      btn.classList.toggle('text-amber-600', this.advancedOpen);
    }
  },

  updateAdvancedFilterBadge() {
    const brand = document.getElementById('filter-brand')?.value || 'ALL';
    const year = document.getElementById('filter-year')?.value || 'ALL';
    const maxP = (document.getElementById('filter-max-price')?.value ?? '').trim();
    const maxKm = (document.getElementById('filter-max-km')?.value ?? '').trim();

    let count = 0;
    if (brand !== 'ALL') count++;
    if (year !== 'ALL') count++;
    if (maxP !== '') count++;
    if (maxKm !== '') count++;

    const badge = document.getElementById('adv-filter-count');
    if (badge) {
      badge.textContent = String(count);
      badge.classList.toggle('hidden', count === 0);
    }

    const searchQ = (document.getElementById('filter-search')?.value || '').trim();
    const sortBy = document.getElementById('sort-by-select')?.value || 'NEWEST';
    const hasAnyFilter = count > 0 || Boolean(searchQ) || this.quickFilter !== 'ALL' || this.bodyCategory !== 'ALL' || sortBy !== 'NEWEST';
    const resetBtn = document.getElementById('reset-filters-btn');
    if (resetBtn) {
      resetBtn.classList.toggle('hidden', !hasAnyFilter);
    }
  },

  selectBrandQuickPill(brandName) {
    const brandSelect = document.getElementById('filter-brand');
    if (brandSelect) {
      brandSelect.value = brandName;
      this.applyFilters();
      this.renderInteractiveBrandsStrip();
    }
  },

  setBodyCategory(categoryKey) {
    this.bodyCategory = categoryKey || 'ALL';
    this.renderBodyCategoryPills();
    this.applyFilters();
  },

  setQuickFilter(type) {
    this.quickFilter = type || 'ALL';
    this.renderQuickFilterPills();
    this.applyFilters();
  },

  resetFilters(silent = false) {
    const fs = document.getElementById('filter-search');
    const fb = document.getElementById('filter-brand');
    const fy = document.getElementById('filter-year');
    const fmp = document.getElementById('filter-max-price');
    const fmk = document.getElementById('filter-max-km');
    const sbs = document.getElementById('sort-by-select');

    if (fs) fs.value = '';
    if (fb) fb.value = 'ALL';
    if (fy) fy.value = 'ALL';
    if (fmp) fmp.value = '';
    if (fmk) fmk.value = '';
    if (sbs) sbs.value = 'NEWEST';

    this.quickFilter = 'ALL';
    this.bodyCategory = 'ALL';
    this.renderBodyCategoryPills();
    this.renderQuickFilterPills();
    this.renderInteractiveBrandsStrip();
    this.applyFilters();
    if (!silent && window.App) {
      App.showToast('🔄 تم إعادة ضبط جميع الفلاتر والترتيب.', 'info');
    }
  },

  matchesBodyCategory(car, categoryKey) {
    if (!categoryKey || categoryKey === 'ALL') return true;
    const text = `${car.brand} ${car.model} ${car.description}`.toLowerCase();
    if (categoryKey === 'SUV') {
      return /x5|x3|x6|suv|سبورتاج|توسان|راف|كادجار|تيجوان|كيا سبورتاج|دفع رباعي|جيب|شيروكي|برادو|فورتشنر|جلc|gle|q7|q5|cx-5|3008|5008|توريس|كوليوس/.test(text);
    }
    if (categoryKey === 'CROSSOVER') {
      return /كروس|سبورتاج|توسان|كاشكاي|جوuke|كونا|كريتا|اكليبس|2008|c-hr|أرانو|تي روك|x1|x2|gla|q3/.test(text);
    }
    if (categoryKey === 'SEDAN') {
      return /c200|c180|e200|كورولا|إلنترا|النترا|سيراتو|أوكتافيا|باسات|جيتا|لانسر|صني|سنترا|أوبترا|تيبو|أكسنت|ميجان|سيدان|320i|520i|a4|a6|كامري|أكورد|سيفيك|مازدا 3/.test(text);
    }
    if (categoryKey === 'HATCHBACK') {
      return /هاتشباك|جولف|إبيزا|ليون|فيستا|فوكس|ياريس|سويفت|بيكانتو|i10|i20|بولو|أسترا|مازدا 3 هاتشباك/.test(text);
    }
    if (categoryKey === 'LUXURY') {
      return car.price >= 2800000 || /مرسيدس|بي إم دبليو|أودي|بورش|رنج روفر|لكزس|amg|m-sport/.test(text);
    }
    if (categoryKey === 'ECONOMY') {
      return car.price <= 1650000;
    }
    return true;
  },

  applyFilters() {
    const cars = CarRepository.getAllCars();
    const q = (document.getElementById('filter-search')?.value || '').toLowerCase().trim();
    const b = document.getElementById('filter-brand')?.value || 'ALL';
    const y = document.getElementById('filter-year')?.value || 'ALL';

    const rawMaxP = (document.getElementById('filter-max-price')?.value ?? '').trim();
    const rawMaxKm = (document.getElementById('filter-max-km')?.value ?? '').trim();
    const maxP = (rawMaxP !== '' && !isNaN(Number(rawMaxP))) ? Number(rawMaxP) : Infinity;
    const maxKm = (rawMaxKm !== '' && !isNaN(Number(rawMaxKm))) ? Number(rawMaxKm) : Infinity;
    const sortBy = document.getElementById('sort-by-select')?.value || 'NEWEST';

    let filtered = cars.filter(c => {
      const matchesText = !q ||
        c.brand.toLowerCase().includes(q) ||
        c.model.toLowerCase().includes(q) ||
        c.description.toLowerCase().includes(q) ||
        c.paintStatus.toLowerCase().includes(q);
      const matchesBrand = (b === 'ALL' || c.brand === b);
      const matchesYear = (y === 'ALL' || c.year === Number(y));
      const matchesPrice = (c.price <= maxP);
      const matchesKm = (c.mileageKm <= maxKm);
      const matchesBody = this.matchesBodyCategory(c, this.bodyCategory);

      let matchesQuick = true;
      if (this.quickFilter === 'AVAILABLE') matchesQuick = !c.isReserved;
      if (this.quickFilter === 'FABRIKA') matchesQuick = c.paintStatus === 'فابريكة بالكامل';
      if (this.quickFilter === 'TOP_SCORE') matchesQuick = c.inspectionScore >= 9.5;
      if (this.quickFilter === 'DISCOUNT') matchesQuick = c.hasDiscount;
      if (this.quickFilter === 'UNDER_2M') matchesQuick = c.price <= 2000000;

      return matchesText && matchesBrand && matchesYear && matchesPrice && matchesKm && matchesBody && matchesQuick;
    });

    if (sortBy === 'PRICE_ASC') filtered.sort((a, x) => a.price - x.price);
    if (sortBy === 'PRICE_DESC') filtered.sort((a, x) => x.price - a.price);
    if (sortBy === 'SCORE_DESC') filtered.sort((a, x) => x.inspectionScore - a.inspectionScore);
    if (sortBy === 'KM_ASC') filtered.sort((a, x) => a.mileageKm - x.mileageKm);

    this.updateAdvancedFilterBadge();
    this.renderInteractiveBrandsStrip();
    this.renderCarsGrid(filtered);
  },

  renderCarsGrid(cars) {
    const grid = document.getElementById('cars-grid-container');
    const countBadge = document.getElementById('cars-count-badge');
    if (countBadge) countBadge.textContent = `${cars.length} سيارة`;
    if (!grid) return;

    const isAdmin = AuthService.isLogged();
    const username = AuthService.getUsername();
    const watchlistIds = isAdmin ? CarRepository.getAdminWatchlist(username).map(w => String(w.id)) : [];
    const staffFavIds = isAdmin ? CarRepository.getStaffFavorites().map(w => String(w.carId)) : [];
    const favs = isAdmin ? [...new Set([...watchlistIds, ...staffFavIds])] : CarRepository.getFavorites();
    const compares = CarRepository.getCompare(isAdmin);
    const clientFavCount = CarRepository.getFavorites().length;

    const compEl = document.getElementById('compare-count');
    const mCompEl = document.getElementById('m-compare-count');
    const favEl = document.getElementById('client-favorites-count');
    const mFavEl = document.getElementById('m-fav-count');

    if (compEl) compEl.textContent = compares.length;
    if (mCompEl) mCompEl.textContent = compares.length;
    if (favEl) favEl.textContent = clientFavCount;
    if (mFavEl) mFavEl.textContent = clientFavCount;

    if (cars.length === 0) {
      grid.innerHTML = `
        <div class="col-span-full bg-white rounded-3xl p-12 text-center border border-dashed border-slate-300">
          <div class="text-4xl mb-3">🔍</div>
          <h3 class="font-black text-base text-slate-900">لا توجد سيارات مطابقة لمعايير البحث الحالية</h3>
          <p class="text-xs text-slate-500 mt-1 mb-5">جرب تعديل الميزانية أو اختيار فئة أخرى لعرض جميع سيارات المعرض</p>
          <div class="flex flex-wrap justify-center gap-2">
            <button type="button" onclick="App.resetFilters()" class="bg-slate-900 text-amber-400 text-xs font-black px-5 py-2.5 rounded-xl shadow transition">عرض كل السيارات</button>
            <button type="button" onclick="App.openVipRequestModal(document.getElementById('filter-search')?.value || '')" class="bg-amber-500 text-slate-950 text-xs font-black px-5 py-2.5 rounded-xl shadow transition">🎯 اطلبها بالطلب (VIP)</button>
          </div>
        </div>
      `;
      return;
    }

    grid.innerHTML = cars.map(c => {
      const carIdEsc = escapeHtml(c.id);
      const isCompared = compares.includes(String(c.id));
      const isFav = favs.includes(String(c.id));
      const estMonthly = c.estimatedMonthlyInstallment;

      // Single clean status badge above image (Max 1 badge per Constitution)
      let statusBadgeHtml = '';
      if (c.isReserved) {
        statusBadgeHtml = `<span class="car-status-badge bg-slate-900/90 text-amber-300 border border-amber-400/40">🔒 محجوزة</span>`;
      } else if (c.hasDiscount) {
        statusBadgeHtml = `<span class="car-status-badge bg-rose-600/95 text-white">🔥 وفر ${c.formattedDiscount}</span>`;
      } else {
        statusBadgeHtml = `<span class="car-status-badge bg-emerald-600/95 text-white">✓ متاحة</span>`;
      }

      return `
        <article class="car-card">
          <div>
            <div class="car-card-media" onclick="App.openDetails('${carIdEsc}')">
              <img src="${escapeHtml(c.imageUrl)}" alt="${escapeHtml(c.brand)} ${escapeHtml(c.model)}" loading="lazy" onerror="this.src='${DEFAULT_CAR_IMAGE}'" />
              <div class="absolute inset-0 bg-gradient-to-t from-slate-950/35 via-transparent to-slate-950/20 pointer-events-none"></div>

              <div class="absolute top-3 inset-x-3 flex items-center justify-between gap-2 z-10">
                <div>${statusBadgeHtml}</div>
                <div class="flex items-center gap-1.5 shrink-0">
                  <button type="button" onclick="event.stopPropagation(); App.toggleCompare('${carIdEsc}')" title="إضافة للمقارنة" class="car-glass-action ${isCompared ? 'is-active' : ''}">
                    ${isCompared ? '✓' : '⚖️'}
                  </button>
                  <button type="button" onclick="event.stopPropagation(); App.toggleFav('${carIdEsc}')" title="${isAdmin ? 'إضافة لمفضلة الإدارة' : 'إضافة للمفضلة'}" class="car-glass-action">
                    ${isFav ? (isAdmin ? '⭐' : '❤️') : '🤍'}
                  </button>
                </div>
              </div>
            </div>

            <div class="p-4 space-y-2.5 cursor-pointer" onclick="App.openDetails('${carIdEsc}')">
              <div class="flex items-start justify-between gap-2">
                <div class="min-w-0">
                  <span class="text-[11px] font-extrabold text-amber-600 block">${escapeHtml(c.brand)}</span>
                  <h3 class="font-black text-base text-slate-900 truncate leading-snug">${escapeHtml(c.model)}</h3>
                </div>
                <span class="bg-slate-100 text-slate-800 border border-slate-200 text-[11px] font-black px-2.5 py-0.5 rounded-lg shrink-0">${c.year}</span>
              </div>

              <div class="car-spec-row">
                <span>🛣️ ${c.formattedMileage}</span>
                <span>•</span>
                <span class="truncate">🛡️ ${escapeHtml(c.paintStatus)}</span>
                <span>•</span>
                <span class="text-emerald-700 font-black">⭐ ${c.inspectionScore}/10</span>
              </div>

              <div class="car-price-box flex items-center justify-between gap-2">
                <div>
                  <span class="text-[10px] text-slate-500 font-bold block">السعر النقدي</span>
                  ${c.hasDiscount ? `<span class="text-[11px] text-rose-500 line-through font-bold block leading-none">${c.formattedOldPrice}</span>` : ''}
                  <span class="font-black text-base text-blue-950">${c.formattedPrice}</span>
                </div>
                <div class="text-left">
                  <span class="text-[10px] text-slate-500 font-bold block">قسط شهري يبدأ من</span>
                  <span class="font-black text-xs text-emerald-700">${formatNumber(estMonthly)} ج.م/شهر</span>
                </div>
              </div>
            </div>
          </div>

          <div class="px-4 pb-4 pt-2 border-t border-slate-100 flex items-center justify-between gap-2">
            <button type="button" onclick="App.openDetails('${carIdEsc}')" class="flex-1 bg-slate-900 hover:bg-slate-800 text-amber-400 text-xs font-black py-2.5 px-3.5 rounded-xl transition shadow-sm flex items-center justify-center gap-1.5">
              <span>التفاصيل والتقسيط</span>
              <span>←</span>
            </button>
            <button type="button" onclick="event.stopPropagation(); App.shareCarNative('${carIdEsc}')" class="bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold w-9 h-9 rounded-xl transition flex items-center justify-center" title="مشاركة السيارة">📤</button>
            ${isAdmin ? `
              <button type="button" onclick="event.stopPropagation(); App.openCarFormModal('${carIdEsc}')" class="bg-slate-100 hover:bg-amber-100 text-slate-700 text-xs font-bold w-9 h-9 rounded-xl transition flex items-center justify-center" title="تعديل السيارة">✏️</button>
            ` : ''}
          </div>
        </article>
      `;
    }).join('');
  }
};

window.CatalogUI = CatalogUI;
