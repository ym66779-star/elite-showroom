/* ============================================================================
   Abu Bahaa Showroom - CarModel Entity & Technical Inspection Schema (v9)
   ============================================================================ */

class CarModel {
  constructor(data = {}) {
    this.id = data.id || ('CAR-' + Date.now().toString().slice(-4) + Math.floor(10 + Math.random() * 89));
    this.brand = String(data.brand || '').trim();
    this.model = String(data.model || '').trim();
    this.year = Number(data.year) || 2025;
    this.price = Math.max(0, Number(data.price) || 0);
    this.oldPrice = Math.max(0, Number(data.oldPrice) || 0);

    // Backward-compatible mileage & inspection score normalization
    const rawMileage = data.mileageKm !== undefined ? data.mileageKm : data.mileage;
    this.mileageKm = Math.max(0, Number(rawMileage) || 0);

    this.inspectionScore = Math.min(10, Math.max(1, Number(data.inspectionScore) || 9.5));
    this.engineScore = Number(data.engineScore) || this.inspectionScore;
    this.gearScore = Number(data.gearScore) || this.inspectionScore;
    this.bodyScore = Number(data.bodyScore) || this.inspectionScore;
    this.interiorScore = Number(data.interiorScore) || this.inspectionScore;

    // حالة الفابريكة والدهان التفصيلية
    const rawPaint = String(data.paintStatus || data.condition || '').trim();
    this.paintStatus = rawPaint || (this.bodyScore >= 9.2 ? 'فابريكة بالكامل' : 'فابريكة دواخل - رشة حزام نظافة');
    this.paintDetails = String(data.paintDetails || '').trim() || (
      this.paintStatus === 'فابريكة بالكامل'
        ? 'الدواخل والأساسيات والسقف والكبوت والشنطة والجانبين بدهان المصنع بالكامل'
        : 'الدواخل والشاسيه والأساسيات والسقف فابريكة 100% بدون أي ملاحظات'
    );

    const fixBrokenUrl = (u) => String(u || '').trim().replace('photo-1618843479319-56172926f442', 'photo-1617788138017-80ad40651399');
    const validImages = Array.isArray(data.images) ? data.images.map(fixBrokenUrl).filter(Boolean) : [];
    const primaryImage = fixBrokenUrl(data.imageUrl || data.image);
    this.imageUrl = primaryImage || validImages[0] || DEFAULT_CAR_IMAGE;
    this.images = validImages.length > 0 ? validImages : [this.imageUrl];

    this.description = String(data.description || '').trim();
    const rawPhone = String(data.dealerPhone || DEFAULT_DEALER_PHONE).replace(/[^0-9]/g, '');
    this.dealerPhone = (!rawPhone || rawPhone === '201000000001') ? DEFAULT_DEALER_PHONE : rawPhone;
    this.maxInstallmentMonths = Math.min(120, Math.max(6, Number(data.maxInstallmentMonths) || 60));

    const rawViews = data.viewsCount !== undefined ? data.viewsCount : data.views;
    this.viewsCount = Math.max(0, Number(rawViews) || 0);
    this.favoritesCount = Math.max(0, Number(data.favoritesCount) || 0);
    this.lastViewedAt = data.lastViewedAt || 'لم تُشاهد بعد';
    this.soldAt = data.soldAt || null;
    this.soldBy = data.soldBy || null;
    this.soldViaStaff = data.soldViaStaff || null;
    this.isReserved = Boolean(data.isReserved || data.status === 'reserved');
    this.reservedByClient = data.reservedByClient || null;

    // بيانات التكلفة السرية وصافي الربح وحد التفاوض المسموح
    const rawPurchaseCost = data.purchaseCost !== undefined && data.purchaseCost !== ''
      ? data.purchaseCost
      : data.purchasePrice;
    this.purchaseCost = Math.max(0, Number(rawPurchaseCost) || Math.round(this.price * 0.90));

    const rawPrepCost = data.prepCost !== undefined && data.prepCost !== ''
      ? data.prepCost
      : data.expenses;
    this.prepCost = Math.max(0, rawPrepCost !== undefined && rawPrepCost !== '' ? Number(rawPrepCost) : 15000);

    const rawMinAllowed = data.minAllowedPrice !== undefined && data.minAllowedPrice !== ''
      ? data.minAllowedPrice
      : data.minPrice;
    this.minAllowedPrice = Math.max(0, Number(rawMinAllowed) || Math.round(this.price * 0.97));
  }

  get totalCost() {
    return this.purchaseCost + this.prepCost;
  }

  get expectedProfit() {
    return this.price - this.totalCost;
  }

  get minProfitAtLimit() {
    return this.minAllowedPrice - this.totalCost;
  }

  get maxNegotiationDiscount() {
    return Math.max(0, this.price - this.minAllowedPrice);
  }

  get fullTitle() {
    return `${this.brand} ${this.model}`.trim();
  }

  get estimatedMonthlyInstallment() {
    if (!this.price) return 0;
    const minDown = Math.round(this.price * 0.20);
    const months = this.maxInstallmentMonths || 60;
    const financed = Math.max(0, this.price - minDown);
    return Math.round((financed + (financed * 0.135 * (months / 12))) / months);
  }

  toMap() {
    return { ...this };
  }

  get formattedPrice() {
    return this.price.toLocaleString('ar-EG') + ' ج.م';
  }

  get formattedOldPrice() {
    return this.oldPrice.toLocaleString('ar-EG') + ' ج.م';
  }

  get hasDiscount() {
    return this.oldPrice > this.price;
  }

  get discountAmount() {
    return this.hasDiscount ? (this.oldPrice - this.price) : 0;
  }

  get formattedDiscount() {
    return this.discountAmount.toLocaleString('ar-EG') + ' ج.م';
  }

  get formattedMileage() {
    return this.mileageKm.toLocaleString('ar-EG') + ' كم';
  }

  get inspectionBadge() {
    if (this.inspectionScore >= 9.5) return '⭐ فحص ممتاز (بحالة الزيرو)';
    if (this.inspectionScore >= 8.5) return '💎 استعمال راقٍ جداً';
    return '🚗 حالة فنية جيدة جداً';
  }

  get bodyZones() {
    const isFullFab = this.paintStatus === 'فابريكة بالكامل';
    const isBumpers = this.paintStatus.includes('إكصدامات');
    const isCleanBelt = this.paintStatus.includes('حزام');
    return [
      { part: 'الدواخل والشاسيه', state: 'فابريكة 100%', ok: true },
      { part: 'السقف والقوائم', state: 'فابريكة 100%', ok: true },
      { part: 'الكبوت الأمامي', state: isFullFab || isBumpers || isCleanBelt ? 'فابريكة' : 'رش تجميلي', ok: isFullFab || isBumpers || isCleanBelt },
      { part: 'الشنطة الخلفية', state: isFullFab || isBumpers || isCleanBelt ? 'فابريكة' : 'رش تجميلي', ok: isFullFab || isBumpers || isCleanBelt },
      { part: 'الجانبان والأبواب', state: isFullFab || isBumpers ? 'فابريكة' : 'رش نظافة خارجي', ok: isFullFab || isBumpers },
      { part: 'الإكصدامات', state: isFullFab ? 'فابريكة' : 'تجميلي نظافة', ok: isFullFab }
    ];
  }
}

window.CarModel = CarModel;
