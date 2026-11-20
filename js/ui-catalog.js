/* ============================================================================
   Abu Bahaa Showroom - Unified Lucide SVG Icons, Catalog Filters, Skeletons & Cards
   ============================================================================ */

const UiIcons = {
  PATHS: {
    layoutGrid: '<rect width="7" height="7" x="3" y="3" rx="1"/><rect width="7" height="7" x="14" y="3" rx="1"/><rect width="7" height="7" x="14" y="14" rx="1"/><rect width="7" height="7" x="3" y="14" rx="1"/>',
    car: '<path d="M19 17h2c.6 0 1-.4 1-1v-3c0-.9-.7-1.7-1.5-1.9C18.7 10.6 16 10 16 10s-1.3-1.4-2.2-2.3c-.5-.4-1.1-.7-1.8-.7H5c-.6 0-1.1.4-1.4.9l-1.4 2.9A3.7 3.7 0 0 0 2 12v4c0 .6.4 1 1 1h2"/><circle cx="7" cy="17" r="2"/><path d="M9 17h6"/><circle cx="17" cy="17" r="2"/>',
    truck: '<path d="M14 18V6a2 2 0 0 0-2-2H4a2 2 0 0 0-2 2v11a1 1 0 0 0 1 1h2"/><path d="M15 18H9"/><path d="M19 18h2a1 1 0 0 0 1-1v-3.65a1 1 0 0 0-.22-.624l-3.48-4.35A1 1 0 0 0 17.52 8H14"/><circle cx="17" cy="18" r="2"/><circle cx="7" cy="18" r="2"/>',
    compass: '<circle cx="12" cy="12" r="10"/><polygon points="16.24 7.76 14.12 14.12 7.76 16.24 9.88 9.88 16.24 7.76"/>',
    zap: '<polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"/>',
    crown: '<path d="m2 4 3 12h14l3-12-6 7-4-7-4 7-6-7zm3 16h14"/>',
    wallet: '<path d="M19 7V4a1 1 0 0 0-1-1H5a2 2 0 0 0 0 4h15a1 1 0 0 1 1 1v4h-3a2 2 0 0 0 0 4h3a1 1 0 0 0 1-1v-2a1 1 0 0 0-1-1"/><path d="M3 5v14a2 2 0 0 0 2 2h15a1 1 0 0 0 1-1v-4"/>',
    check: '<path d="M20 6 9 17l-5-5"/>',
    checkCircle: '<circle cx="12" cy="12" r="10"/><path d="m9 12 2 2 4-4"/>',
    shieldCheck: '<path d="M20 13c0 5-3.5 7.5-7.66 8.95a1 1 0 0 1-.67-.01C7.5 20.5 4 18 4 13V6a1 1 0 0 1 1-1c2 0 4.5-1.2 6.24-2.72a1.17 1.17 0 0 1 1.52 0C14.51 3.81 17 5 19 5a1 1 0 0 1 1 1z"/><path d="m9 12 2 2 4-4"/>',
    award: '<path d="m15.477 12.89 1.515 8.526a.5.5 0 0 1-.81.47l-3.58-2.687a1 1 0 0 0-1.197 0l-3.586 2.686a.5.5 0 0 1-.81-.469l1.514-8.526"/><circle cx="12" cy="8" r="6"/>',
    tag: '<path d="M12.586 2.586A2 2 0 0 0 11.172 2H4a2 2 0 0 0-2 2v7.172a2 2 0 0 0 .586 1.414l8.704 8.704a2.426 2.426 0 0 0 3.42 0l6.58-6.58a2.426 2.426 0 0 0 0-3.42z"/><circle cx="7.5" cy="7.5" r=".5" fill="currentColor"/>',
    banknote: '<rect width="20" height="12" x="2" y="6" rx="2"/><circle cx="12" cy="12" r="2"/><path d="M6 12h.01M18 12h.01"/>',
    flame: '<path d="M8.5 14.5A2.5 2.5 0 0 0 11 12c0-1.38-.5-2-1-3-1.072-2.143-.224-4.054 2-6 .5 2.5 2 4.9 4 6.5 2 1.6 3 3.5 3 5.5a7 7 0 1 1-14 0c0-1.153.433-2.294 1-3a2.5 2.5 0 0 0 2.5 2.5z"/>',
    lock: '<rect width="18" height="11" x="3" y="11" rx="2" ry="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/>',
    unlock: '<rect width="18" height="11" x="3" y="11" rx="2" ry="2"/><path d="M7 11V7a5 5 0 0 1 9.9-1"/>',
    scale: '<path d="m16 16 3-8 3 8c-.87.65-1.92 1-3 1s-2.13-.35-3-1Z"/><path d="m2 16 3-8 3 8c-.87.65-1.92 1-3 1s-2.13-.35-3-1Z"/><path d="M7 21h10"/><path d="M12 3v18"/><path d="M3 7h2c2 0 5-1 7-2 2 1 5 2 7 2h2"/>',
    heart: '<path d="M19 14c1.49-1.46 3-3.21 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.76 0-3 .5-4.5 2-1.5-1.5-2.74-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.3 1.5 4.05 3 5.5l7 7Z"/>',
    heartFilled: '<path fill="currentColor" d="M19 14c1.49-1.46 3-3.21 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.76 0-3 .5-4.5 2-1.5-1.5-2.74-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.3 1.5 4.05 3 5.5l7 7Z"/>',
    star: '<polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/>',
    starFilled: '<polygon fill="currentColor" points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/>',
    share: '<circle cx="18" cy="5" r="3"/><circle cx="6" cy="12" r="3"/><circle cx="18" cy="19" r="3"/><line x1="8.59" x2="15.42" y1="13.51" y2="17.49"/><line x1="15.41" x2="8.59" y1="6.51" y2="10.49"/>',
    pencil: '<path d="M21.174 6.812a1 1 0 0 0-3.986-3.987L3.842 16.174a2 2 0 0 0-.5.83l-1.321 4.352a.5.5 0 0 0 .623.622l4.353-1.32a2 2 0 0 0 .83-.497z"/><path d="m15 5 4 4"/>',
    trash: '<path d="M3 6h18"/><path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6"/><path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2"/><line x1="10" x2="10" y1="11" y2="17"/><line x1="14" x2="14" y1="11" y2="17"/>',
    plus: '<path d="M5 12h14"/><path d="M12 5v14"/>',
    gauge: '<path d="m12 14 4-4"/><path d="M3.34 19a10 10 0 1 1 17.32 0"/>',
    calendar: '<path d="M8 2v4"/><path d="M16 2v4"/><rect width="18" height="18" x="3" y="4" rx="2"/><path d="M3 10h18"/>',
    eye: '<path d="M2.062 12.348a1 1 0 0 1 0-.696 10.75 10.75 0 0 1 19.876 0 1 1 0 0 1 0 .696 10.75 10.75 0 0 1-19.876 0"/><circle cx="12" cy="12" r="3"/>',
    search: '<circle cx="11" cy="11" r="8"/><path d="m21 21-4.3-4.3"/>',
    sliders: '<line x1="21" x2="14" y1="4" y2="4"/><line x1="10" x2="3" y1="4" y2="4"/><line x1="21" x2="12" y1="12" y2="12"/><line x1="8" x2="3" y1="12" y2="12"/><line x1="21" x2="16" y1="20" y2="20"/><line x1="12" x2="3" y1="20" y2="20"/><line x1="14" x2="14" y1="2" y2="6"/><line x1="8" x2="8" y1="10" y2="14"/><line x1="16" x2="16" y1="18" y2="22"/>',
    chevronDown: '<path d="m6 9 6 6 6-6"/>',
    arrowLeft: '<path d="m12 19-7-7 7-7"/><path d="M19 12H5"/>',
    arrowRight: '<path d="M5 12h14"/><path d="m12 5 7 7-7 7"/>',
    x: '<path d="M18 6 6 18"/><path d="m6 6 12 12"/>',
    phone: '<path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"/>',
    messageCircle: '<path d="M7.9 20A9 9 0 1 0 4 16.1L2 22Z"/>',
    mapPin: '<path d="M20 10c0 4.993-5.539 10.193-7.399 11.799a1 1 0 0 1-1.202 0C9.539 20.193 4 14.993 4 10a8 8 0 0 1 16 0"/><circle cx="12" cy="10" r="3"/>',
    clock: '<circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/>',
    sparkles: '<path d="M9.937 15.5A2 2 0 0 0 8.5 14.063l-6.135-1.582a.5.5 0 0 1 0-.962L8.5 9.936A2 2 0 0 0 9.937 8.5l1.582-6.135a.5.5 0 0 1 .963 0L14.063 8.5A2 2 0 0 0 15.5 9.937l6.135 1.581a.5.5 0 0 1 0 .964L15.5 14.063a2 2 0 0 0-1.437 1.437l-1.582 6.135a.5.5 0 0 1-.963 0z"/><path d="M20 3v4"/><path d="M22 5h-4"/>',
    calculator: '<rect width="16" height="20" x="4" y="2" rx="2"/><line x1="8" x2="16" y1="6" y2="6"/><line x1="16" x2="16" y1="14" y2="18"/><path d="M16 10h.01"/><path d="M12 10h.01"/><path d="M8 10h.01"/><path d="M12 14h.01"/><path d="M8 14h.01"/><path d="M12 18h.01"/><path d="M8 18h.01"/>',
    repeat: '<path d="m17 2 4 4-4 4"/><path d="M3 11v-1a4 4 0 0 1 4-4h14"/><path d="m7 22-4-4 4-4"/><path d="M21 13v1a4 4 0 0 1-4 4H3"/>',
    building: '<rect width="16" height="20" x="4" y="2" rx="2" ry="2"/><path d="M9 22v-4h6v4"/><path d="M8 6h.01"/><path d="M16 6h.01"/><path d="M12 6h.01"/><path d="M12 10h.01"/><path d="M12 14h.01"/><path d="M16 10h.01"/><path d="M16 14h.01"/><path d="M8 10h.01"/><path d="M8 14h.01"/>',
    fileText: '<path d="M15 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7Z"/><path d="M14 2v4a2 2 0 0 0 2 2h4"/><path d="M10 9H8"/><path d="M16 13H8"/><path d="M16 17H8"/>',
    printer: '<path d="M6 18H4a2 2 0 0 1-2-2v-5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2h-2"/><path d="M6 9V3a1 1 0 0 1 1-1h10a1 1 0 0 1 1 1v6"/><rect width="12" height="8" x="6" y="14"/>',
    qrCode: '<rect width="5" height="5" x="3" y="3" rx="1"/><rect width="5" height="5" x="16" y="3" rx="1"/><rect width="5" height="5" x="3" y="16" rx="1"/><path d="M21 16h-3a2 2 0 0 0-2 2v3"/><path d="M21 21v.01"/><path d="M12 7v3a2 2 0 0 1-2 2H7"/><path d="M3 12h.01"/><path d="M12 3h.01"/><path d="M12 16v.01"/><path d="M16 12h1"/><path d="M21 12v.01"/><path d="M12 21v-1"/>',
    megaphone: '<path d="m3 11 18-5v12L3 14v-3z"/><path d="M11.6 16.8a3 3 0 1 1-5.8-1.6"/>',
    barChart: '<line x1="12" x2="12" y1="20" y2="10"/><line x1="18" x2="18" y1="20" y2="4"/><line x1="6" x2="6" y1="20" y2="16"/>',
    users: '<path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M22 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/>',
    user: '<path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/>',
    cloud: '<path d="M17.5 19H9a7 7 0 1 1 6.71-9h1.79a4.5 4.5 0 1 1 0 9Z"/>',
    download: '<path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" x2="12" y1="15" y2="3"/>',
    upload: '<path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="17 8 12 3 7 8"/><line x1="12" x2="12" y1="3" y2="15"/>',
    folder: '<path d="M20 20a2 2 0 0 0 2-2V8a2 2 0 0 0-2-2h-7.9a2 2 0 0 1-1.69-.9L9.6 3.9A2 2 0 0 0 7.93 3H4a2 2 0 0 0-2 2v13a2 2 0 0 0 2 2Z"/>',
    settings: '<path d="M12.22 2h-.44a2 2 0 0 0-2 2v.18a2 2 0 0 1-1 1.73l-.43.25a2 2 0 0 1-2 0l-.15-.08a2 2 0 0 0-2.73.73l-.22.38a2 2 0 0 0 .73 2.73l.15.1a2 2 0 0 1 1 1.72v.51a2 2 0 0 1-1 1.74l-.15.09a2 2 0 0 0-.73 2.73l.22.38a2 2 0 0 0 2.73.73l.15-.08a2 2 0 0 1 2 0l.43.25a2 2 0 0 1 1 1.73V20a2 2 0 0 0 2 2h.44a2 2 0 0 0 2-2v-.18a2 2 0 0 1 1-1.73l.43-.25a2 2 0 0 1 2 0l.15.08a2 2 0 0 0 2.73-.73l.22-.39a2 2 0 0 0-.73-2.73l-.15-.08a2 2 0 0 1-1-1.74v-.5a2 2 0 0 1 1-1.74l.15-.09a2 2 0 0 0 .73-2.73l-.22-.38a2 2 0 0 0-2.73-.73l-.15.08a2 2 0 0 1-2 0l-.43-.25a2 2 0 0 1-1-1.73V4a2 2 0 0 0-2-2z"/><circle cx="12" cy="12" r="3"/>',
    bot: '<path d="M12 8V4H8"/><rect width="16" height="12" x="4" y="8" rx="2"/><path d="M2 14h2"/><path d="M20 14h2"/><path d="M15 13v2"/><path d="M9 13v2"/>',
    target: '<circle cx="12" cy="12" r="10"/><circle cx="12" cy="12" r="6"/><circle cx="12" cy="12" r="2"/>',
    send: '<path d="M14.536 21.686a.5.5 0 0 0 .937-.024l6.5-19a.496.496 0 0 0-.635-.635l-19 6.5a.5.5 0 0 0-.024.937l7.93 3.18a2 2 0 0 1 1.112 1.11z"/><path d="m21.854 2.147-10.94 10.939"/>',
    alertTriangle: '<path d="m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3"/><path d="M12 9v4"/><path d="M12 17h.01"/>',
    video: '<path d="m16 13 5.223 3.482a.5.5 0 0 0 .777-.416V7.87a.5.5 0 0 0-.752-.432L16 10.5"/><rect x="2" y="6" width="14" height="12" rx="2"/>',
    copy: '<rect width="14" height="14" x="8" y="8" rx="2" ry="2"/><path d="M4 16c-1.1 0-2-.9-2-2V4c0-1.1.9-2 2-2h10c1.1 0 2 .9 2 2"/>',
    link: '<path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71"/><path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71"/>',
    camera: '<path d="M14.5 4h-5L7 7H4a2 2 0 0 0-2 2v9a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2V9a2 2 0 0 0-2-2h-3l-2.5-3z"/><circle cx="12" cy="13" r="3"/>',
    idCard: '<path d="M16 10h2"/><path d="M16 14h2"/><path d="M6.17 15a3 3 0 0 1 5.66 0"/><circle cx="9" cy="11" r="2"/><rect x="2" y="5" width="20" height="14" rx="2"/>',
    smartphone: '<rect width="14" height="20" x="5" y="2" rx="2" ry="2"/><path d="M12 18h.01"/>',
    laptop: '<path d="M20 16V7a2 2 0 0 0-2-2H6a2 2 0 0 0-2 2v9m16 0H4m16 0 1.28 2.55a1 1 0 0 1-.9 1.45H3.62a1 1 0 0 1-.9-1.45L4 16"/>',
    clipboardList: '<rect width="8" height="4" x="8" y="2" rx="1" ry="1"/><path d="M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2"/><path d="M12 11h4"/><path d="M12 16h4"/><path d="M8 11h.01"/><path d="M8 16h.01"/>',
    table: '<path d="M12 3v18"/><rect width="18" height="18" x="3" y="3" rx="2"/><path d="M3 9h18"/><path d="M3 15h18"/>'
  },

  get(name, cls = 'w-4 h-4') {
    const d = this.PATHS[name] || this.PATHS.sparkles;
    return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round" class="${cls} shrink-0" aria-hidden="true">${d}</svg>`;
  },

  stripEmoji(text) {
    return String(text ?? '')
      .replace(/[\u{1F000}-\u{1FAFF}\u{2600}-\u{27BF}\u{2B00}-\u{2BFF}\u{2300}-\u{23FF}\uFE0F\u200D]/gu, '')
      .replace(/\s{2,}/g, ' ')
      .trim();
  }
};

window.UiIcons = UiIcons;

const CatalogUI = {
  quickFilter: 'ALL',
  bodyCategory: 'ALL',
  advancedOpen: false,
  _initialSyncHandled: false,
  _userInteracted: false,
  _fallbackTimer: null,

  BODY_ICON_MAP: {
    ALL: 'layoutGrid',
    SEDAN: 'car',
    SUV: 'truck',
    CROSSOVER: 'compass',
    HATCHBACK: 'zap',
    LUXURY: 'crown',
    ECONOMY: 'wallet'
  },

  QUICK_ICON_MAP: {
    AVAILABLE: 'checkCircle',
    FABRIKA: 'shieldCheck',
    TOP_SCORE: 'star',
    DISCOUNT: 'tag',
    UNDER_2M: 'banknote'
  },

  renderBodyCategoryPills() {
    const wrap = document.getElementById('body-category-pills');
    if (!wrap) return;
    wrap.innerHTML = BODY_CATEGORIES.map(cat => {
      const isActive = this.bodyCategory === cat.key;
      const iconName = this.BODY_ICON_MAP[cat.key] || 'car';
      return `
        <button type="button" onclick="App.setBodyCategory('${cat.key}')" data-body-cat="${cat.key}" class="filter-pill ${isActive ? 'is-active' : ''}">
          ${UiIcons.get(iconName, 'w-3.5 h-3.5')}
          <span>${escapeHtml(cat.label)}</span>
        </button>
      `;
    }).join('');
  },

  renderQuickFilterPills() {
    const wrap = document.getElementById('quick-filter-chips');
    if (!wrap) return;
    // Render toggleable quick filters WITHOUT a duplicate "الكل" button
    wrap.innerHTML = QUICK_FILTERS
      .filter(qf => qf.key !== 'ALL')
      .map(qf => {
        const isActive = this.quickFilter === qf.key;
        const iconName = this.QUICK_ICON_MAP[qf.key] || 'sparkles';
        const cleanLabel = UiIcons.stripEmoji(qf.label);
        return `
          <button type="button" onclick="App.setQuickFilter('${qf.key}')" data-chip="${qf.key}" aria-pressed="${isActive}" class="filter-pill ${isActive ? 'is-active' : ''}">
            ${UiIcons.get(iconName, 'w-3.5 h-3.5')}
            <span>${escapeHtml(cleanLabel)}</span>
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
        ${UiIcons.get('layoutGrid', 'w-3.5 h-3.5')}
        <span>كل الماركات (${cars.length})</span>
      </button>
      ${brandsList.map(b => `
        <button type="button" onclick="App.selectBrandQuickPill('${escapeHtml(b)}')" class="filter-pill ${currentSelected === b ? 'is-active' : ''}">
          ${UiIcons.get('tag', 'w-3.5 h-3.5')}
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
    panel.classList.toggle('is-open', this.advancedOpen);

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
    this._userInteracted = true;
    const brandSelect = document.getElementById('filter-brand');
    if (brandSelect) {
      brandSelect.value = brandName;
      this.applyFilters();
      this.renderInteractiveBrandsStrip();
    }
  },

  setBodyCategory(categoryKey) {
    this._userInteracted = true;
    this.bodyCategory = categoryKey || 'ALL';
    this.renderBodyCategoryPills();
    this.applyFilters();
  },

  setQuickFilter(type) {
    this._userInteracted = true;
    if (!type || type === 'ALL') {
      this.quickFilter = 'ALL';
    } else {
      // Toggle behavior on quick filter pills
      this.quickFilter = this.quickFilter === type ? 'ALL' : type;
    }
    this.renderQuickFilterPills();
    this.applyFilters();
  },

  resetFilters(silent = false) {
    this._userInteracted = true;
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
      App.showToast('تم إعادة ضبط جميع الفلاتر والترتيب.', 'info');
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

    if (q || b !== 'ALL' || y !== 'ALL' || rawMaxP !== '' || rawMaxKm !== '' || sortBy !== 'NEWEST') {
      this._userInteracted = true;
    }

    const filtered = cars.filter(c => {
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

  renderSkeletons(count = 6) {
    const grid = document.getElementById('cars-grid-container');
    if (!grid) return;
    grid.innerHTML = Array.from({ length: count }).map(() => `
      <div class="car-skeleton-card" aria-hidden="true">
        <div class="aspect-[16/10] w-full skeleton-shimmer"></div>
        <div class="p-4 space-y-3">
          <div class="flex items-start justify-between gap-3">
            <div class="space-y-2 flex-1">
              <div class="h-3 w-20 rounded-full skeleton-shimmer"></div>
              <div class="h-4 w-44 rounded-lg skeleton-shimmer"></div>
            </div>
            <div class="h-6 w-12 rounded-lg skeleton-shimmer"></div>
          </div>
          <div class="flex items-center gap-3">
            <div class="h-3 w-16 rounded-full skeleton-shimmer"></div>
            <div class="h-3 w-24 rounded-full skeleton-shimmer"></div>
            <div class="h-3 w-12 rounded-full skeleton-shimmer"></div>
          </div>
          <div class="h-14 w-full rounded-2xl skeleton-shimmer"></div>
          <div class="flex items-center gap-2 pt-1">
            <div class="h-10 flex-1 rounded-xl skeleton-shimmer"></div>
            <div class="h-10 w-10 rounded-xl skeleton-shimmer"></div>
          </div>
        </div>
      </div>
    `).join('');
  },

  renderCarsGrid(cars) {
    const grid = document.getElementById('cars-grid-container');
    const countBadge = document.getElementById('cars-count-badge');
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

    // Show smooth Skeleton Loaders during initial Firebase cloud hydration
    const cloudPending = typeof FirebaseCloudService !== 'undefined' && !FirebaseCloudService.isCloudHydrated;
    if (!this._initialSyncHandled && cloudPending && !this._userInteracted) {
      this._initialSyncHandled = true;
      if (countBadge) countBadge.textContent = 'جاري التحميل...';
      this.renderSkeletons(6);
      clearTimeout(this._fallbackTimer);
      this._fallbackTimer = setTimeout(() => {
        this._userInteracted = true;
        this.applyFilters();
      }, 1350);
      return;
    }

    clearTimeout(this._fallbackTimer);
    this._initialSyncHandled = true;
    if (countBadge) countBadge.textContent = `${cars.length} سيارة`;

    if (cars.length === 0) {
      grid.innerHTML = `
        <div class="col-span-full bg-white rounded-3xl p-12 text-center border border-dashed border-slate-300">
          <div class="w-14 h-14 mx-auto mb-3 rounded-2xl bg-slate-100 text-slate-500 flex items-center justify-center">
            ${UiIcons.get('search', 'w-7 h-7')}
          </div>
          <h3 class="font-black text-base text-slate-900">لا توجد سيارات مطابقة لمعايير البحث الحالية</h3>
          <p class="text-xs text-slate-500 mt-1 mb-5">جرب تعديل الميزانية أو اختيار فئة أخرى لعرض جميع سيارات المعرض</p>
          <div class="flex flex-wrap justify-center gap-2">
            <button type="button" onclick="App.resetFilters()" class="btn-luxury-primary text-xs font-black px-5 py-2.5 rounded-xl shadow inline-flex items-center gap-1.5">
              ${UiIcons.get('repeat', 'w-4 h-4')}
              <span>عرض كل السيارات</span>
            </button>
            <button type="button" onclick="App.openVipRequestModal(document.getElementById('filter-search')?.value || '')" class="btn-luxury-accent text-xs font-black px-5 py-2.5 rounded-xl shadow inline-flex items-center gap-1.5">
              ${UiIcons.get('target', 'w-4 h-4')}
              <span>اطلبها بالطلب (VIP)</span>
            </button>
          </div>
        </div>
      `;
      return;
    }

    grid.innerHTML = cars.map((c, idx) => {
      const carIdEsc = escapeHtml(c.id);
      const isCompared = compares.includes(String(c.id));
      const isFav = favs.includes(String(c.id));
      const estMonthly = c.estimatedMonthlyInstallment;

      // Single calm frosted glass status badge above image
      let statusBadgeHtml = '';
      if (c.isReserved) {
        statusBadgeHtml = `
          <span class="car-status-badge is-reserved">
            ${UiIcons.get('lock', 'w-3 h-3')}
            <span>محجوزة</span>
          </span>`;
      } else if (c.hasDiscount) {
        statusBadgeHtml = `
          <span class="car-status-badge is-offer">
            ${UiIcons.get('tag', 'w-3 h-3')}
            <span>وفر ${c.formattedDiscount}</span>
          </span>`;
      } else {
        statusBadgeHtml = `
          <span class="car-status-badge is-available">
            ${UiIcons.get('checkCircle', 'w-3 h-3')}
            <span>متاحة</span>
          </span>`;
      }

      const favBtnClass = isFav ? (isAdmin ? 'is-active' : 'is-fav') : '';
      const favIcon = isAdmin
        ? (isFav ? UiIcons.get('starFilled', 'w-4 h-4') : UiIcons.get('star', 'w-4 h-4'))
        : (isFav ? UiIcons.get('heartFilled', 'w-4 h-4') : UiIcons.get('heart', 'w-4 h-4'));
      const favTitle = isAdmin ? 'إضافة لمفضلة الإدارة' : (isFav ? 'محفوظة بالمفضلة' : 'إضافة للمفضلة');

      return `
        <article class="car-card car-card-enter" style="animation-delay: ${Math.min(idx, 8) * 35}ms;">
          <div>
            <div class="car-card-media" onclick="App.openDetails('${carIdEsc}')">
              <img src="${escapeHtml(c.imageUrl)}" alt="${escapeHtml(c.brand)} ${escapeHtml(c.model)}" loading="lazy" onerror="this.src='${DEFAULT_CAR_IMAGE}'" />
              <div class="absolute inset-0 bg-gradient-to-t from-slate-950/30 via-transparent to-slate-950/15 pointer-events-none"></div>

              <div class="absolute top-3 inset-x-3 flex items-center justify-between gap-2 z-10">
                <div>${statusBadgeHtml}</div>
                <div class="flex items-center gap-1.5 shrink-0">
                  <button type="button" data-car-compare="${carIdEsc}" aria-pressed="${isCompared}" aria-label="${isCompared ? 'إزالة من المقارنة' : 'إضافة للمقارنة'}" onclick="event.stopPropagation(); App.toggleCompare('${carIdEsc}')" title="إضافة للمقارنة" class="car-glass-action ${isCompared ? 'is-active' : ''}">
                    ${isCompared ? UiIcons.get('check', 'w-4 h-4') : UiIcons.get('scale', 'w-4 h-4')}
                  </button>
                  <button type="button" data-car-fav="${carIdEsc}" aria-pressed="${isFav}" aria-label="${favTitle}" onclick="event.stopPropagation(); App.toggleFav('${carIdEsc}')" title="${favTitle}" class="car-glass-action ${favBtnClass}">
                    ${favIcon}
                  </button>
                </div>
              </div>
            </div>

            <div class="p-4 space-y-3 cursor-pointer" onclick="App.openDetails('${carIdEsc}')">
              <div class="flex items-start justify-between gap-2">
                <div class="min-w-0">
                  <span class="text-[11px] font-extrabold tracking-wide text-accent block">${escapeHtml(c.brand)}</span>
                  <h3 class="font-black text-base text-slate-900 truncate leading-snug mt-0.5">${escapeHtml(c.model)}</h3>
                </div>
                <span class="bg-slate-100 text-slate-800 border border-slate-200 text-[11px] font-black px-2.5 py-0.5 rounded-lg shrink-0">${c.year}</span>
              </div>

              <div class="car-spec-row">
                <span class="car-spec-item shrink-0">
                  ${UiIcons.get('gauge', 'w-3.5 h-3.5 text-slate-400')}
                  <span>${c.formattedMileage}</span>
                </span>
                <span class="opacity-35 shrink-0">•</span>
                <span class="car-spec-item truncate">
                  ${UiIcons.get('shieldCheck', 'w-3.5 h-3.5 text-accent')}
                  <span class="truncate">${escapeHtml(c.paintStatus)}</span>
                </span>
                <span class="opacity-35 shrink-0">•</span>
                <span class="car-spec-item font-black text-slate-800 shrink-0">
                  ${UiIcons.get('award', 'w-3.5 h-3.5 text-accent')}
                  <span>${c.inspectionScore}/10</span>
                </span>
              </div>

              <div class="car-price-box flex items-center justify-between gap-2">
                <div class="min-w-0">
                  <span class="text-[10px] text-slate-500 font-bold block">السعر النقدي</span>
                  ${c.hasDiscount ? `<span class="text-[11px] text-slate-400 line-through font-bold block leading-none mt-0.5">${c.formattedOldPrice}</span>` : ''}
                  <span class="font-black text-base sm:text-[17px] text-slate-900 block">${c.formattedPrice}</span>
                </div>
                <div class="car-installment-highlight text-left shrink-0">
                  <span class="text-[10px] text-slate-500 font-bold block">قسط شهري تقديري</span>
                  <span class="font-black text-xs sm:text-[13px] text-accent">${formatNumber(estMonthly)} ج.م/شهر</span>
                </div>
              </div>
            </div>
          </div>

          <div class="px-4 pb-4 pt-2.5 border-t border-slate-100 flex items-center justify-between gap-2">
            <button type="button" onclick="App.openDetails('${carIdEsc}')" class="flex-1 btn-luxury-primary text-xs font-black py-2.5 px-4 rounded-xl shadow-sm flex items-center justify-center gap-2">
              <span>التفاصيل والتقسيط</span>
              ${UiIcons.get('arrowLeft', 'w-4 h-4')}
            </button>
            <button type="button" onclick="event.stopPropagation(); App.shareCarNative('${carIdEsc}')" class="btn-luxury-outline w-10 h-10 rounded-xl flex items-center justify-center shrink-0" title="مشاركة السيارة" aria-label="مشاركة السيارة">
              ${UiIcons.get('share', 'w-4 h-4')}
            </button>
            ${isAdmin ? `
              <button type="button" onclick="event.stopPropagation(); App.openCarFormModal('${carIdEsc}')" class="btn-luxury-outline w-10 h-10 rounded-xl flex items-center justify-center shrink-0" title="تعديل السيارة" aria-label="تعديل السيارة">
                ${UiIcons.get('pencil', 'w-4 h-4')}
              </button>
            ` : ''}
          </div>
        </article>
      `;
    }).join('');
  }
};

window.CatalogUI = CatalogUI;
