/* ============================================================================
   Abu Bahaa Showroom - Configuration & Domain Constants (v9)
   ============================================================================ */

// وضع التجربة الآمن:
// true  = كل رسائل الواتساب تذهب لرقمك الشخصي (201066980075)
// false = كل رسائل الواتساب تذهب لرقم معرض أبو بهاء الرسمي (201060970007)
const SANDBOX_TEST_MODE = true;
const MY_PERSONAL_TEST_PHONE = '201066980075';
const ABU_BAHAA_MAIN_PHONE = '201060970007';

const DEFAULT_DEALER_PHONE = SANDBOX_TEST_MODE ? MY_PERSONAL_TEST_PHONE : ABU_BAHAA_MAIN_PHONE;
const DEALER_BRAND_NAME = 'أبو بهاء لتجارة السيارات';
const DEALER_ADDRESS = 'أسيوط الأزهر - شارع الـ14 عمارة - عمارة 9';
const DEALER_PHONES_DISPLAY = '01060970007 - 01001446377 - 01091167083 - 01063764207';
const DEALER_PHONES_ARRAY = ['01060970007', '01001446377', '01091167083', '01063764207'];
const DEFAULT_CAR_IMAGE = 'https://images.unsplash.com/photo-1503376780353-7e6692767b70?auto=format&fit=crop&w=900&q=80';

const FIREBASE_DEFAULT_CONFIG = {
  apiKey: 'AIzaSyCPnc4qit9-e8cwQoQF6pUrngfXsIFuvmE',
  authDomain: 'elite-showroom.firebaseapp.com',
  projectId: 'elite-showroom',
  storageBucket: 'elite-showroom.firebasestorage.app',
  messagingSenderId: '888173683784',
  appId: '1:888173683784:web:1f25e6de059c3786e8647d',
  measurementId: 'G-5KS1NLDPHC'
};

const INSTALLMENT_PROGRAMS = {
  ID_ONLY: {
    name: '⚡ بصورة البطاقة فقط (موافقة فورية)',
    downPct: 0.40,
    interest: 16.5,
    docs: '📄 الأوراق المطلوبة: صورة البطاقة الشخصية سارية فقط + إيصال مرافق حديث (موافقة واستلام خلال 24 ساعة بدون إثبات دخل).'
  },
  BANK_EMP: {
    name: '🏦 تمويل بنكي (موظفين / معاشات)',
    downPct: 0.20,
    interest: 13.5,
    docs: '📄 الأوراق المطلوبة: مفردات مرتب حديثة (أو كشف حساب بنكي لآخر 6 أشهر) + صورة البطاقة الشخصية.'
  },
  BUSINESS: {
    name: '🏢 أصحاب الأعمال والسجل التجاري',
    downPct: 0.30,
    interest: 14.5,
    docs: '📄 الأوراق المطلوبة: مستخرج سجل تجاري حديث + بطاقة ضريبية سارية + صورة البطاقة الشخصية.'
  }
};

// قائمة كاملة للبنوك وشركات التمويل المصرية (45 جهة تمويل + خيار الإدخال المخصص)
const BANK_GROUPS = [
  {
    label: '🏦 البنوك الحكومية والتجارية الكبرى',
    options: [
      { value: 'البنك الأهلي المصري — إدارة تمويل السيارات', label: 'البنك الأهلي المصري (NBE) — إدارة تمويل السيارات' },
      { value: 'بنك مصر — إدارة تمويل السيارات', label: 'بنك مصر — إدارة تمويل السيارات', selected: true },
      { value: 'بنك القاهرة — إدارة القروض وتمويل السيارات', label: 'بنك القاهرة — إدارة القروض وتمويل السيارات' },
      { value: 'البنك التجاري الدولي (CIB) — إدارة تمويل السيارات', label: 'البنك التجاري الدولي (CIB) — إدارة تمويل السيارات' },
      { value: 'بنك قطر الوطني (QNB مصر) — إدارة تمويل السيارات', label: 'بنك قطر الوطني (QNB مصر) — إدارة تمويل السيارات' },
      { value: 'البنك العربي الأفريقي الدولي (AAIB) — إدارة تمويل السيارات', label: 'البنك العربي الأفريقي الدولي (AAIB) — تمويل السيارات' },
      { value: 'بنك الإسكندرية — إدارة تمويل السيارات', label: 'بنك الإسكندرية — إدارة تمويل السيارات' },
      { value: 'بنك كريدي أجريكول مصر — إدارة تمويل السيارات', label: 'بنك كريدي أجريكول مصر — إدارة تمويل السيارات' },
      { value: 'بنك إتش إس بي سي مصر (HSBC) — إدارة تمويل السيارات', label: 'بنك HSBC مصر — إدارة تمويل السيارات' },
      { value: 'بنك الكويت الوطني مصر (NBK) — إدارة تمويل السيارات', label: 'بنك الكويت الوطني مصر (NBK) — تمويل السيارات' },
      { value: 'بنك الإمارات دبي الوطني مصر — إدارة تمويل السيارات', label: 'بنك الإمارات دبي الوطني مصر — تمويل السيارات' },
      { value: 'التجاري وفا بنك إيجيبت — إدارة تمويل السيارات', label: 'التجاري وفا بنك إيجيبت — إدارة تمويل السيارات' },
      { value: 'البنك الأهلي الكويتي مصر (ABK) — إدارة تمويل السيارات', label: 'البنك الأهلي الكويتي مصر (ABK) — تمويل السيارات' },
      { value: 'بنك التعمير والإسكان — إدارة تمويل السيارات', label: 'بنك التعمير والإسكان — إدارة تمويل السيارات' },
      { value: 'البنك الزراعي المصري — إدارة تمويل السيارات', label: 'البنك الزراعي المصري — إدارة تمويل السيارات' },
      { value: 'بنك قناة السويس — إدارة تمويل السيارات', label: 'بنك قناة السويس — إدارة تمويل السيارات' },
      { value: 'البنك المصري لتنمية الصادرات (EBank) — تمويل السيارات', label: 'البنك المصري لتنمية الصادرات (EBank) — تمويل السيارات' },
      { value: 'بنك نكست (Bank NXT) — إدارة تمويل السيارات', label: 'بنك نكست (Bank NXT) — إدارة تمويل السيارات' },
      { value: 'بنك سايب (SAIB) — إدارة تمويل السيارات', label: 'بنك سايب (SAIB) — إدارة تمويل السيارات' },
      { value: 'المصرف المتحد — إدارة تمويل السيارات', label: 'المصرف المتحد — إدارة تمويل السيارات' },
      { value: 'ميد بنك (MIDBANK) — إدارة تمويل السيارات', label: 'ميد بنك (MIDBANK) — إدارة تمويل السيارات' },
      { value: 'بنك المشرق مصر — إدارة تمويل السيارات', label: 'بنك المشرق مصر — إدارة تمويل السيارات' },
      { value: 'البنك العربي — إدارة تمويل السيارات', label: 'البنك العربي — إدارة تمويل السيارات' }
    ]
  },
  {
    label: '🕌 البنوك الإسلامية (مرابحة السيارات)',
    options: [
      { value: 'مصرف أبو ظبي الإسلامي مصر (ADIB) — مرابحة السيارات', label: 'مصرف أبو ظبي الإسلامي مصر (ADIB) — مرابحة السيارات' },
      { value: 'بنك فيصل الإسلامي المصري — إدارة المرابحة وتمويل السيارات', label: 'بنك فيصل الإسلامي المصري — مرابحة السيارات' },
      { value: 'بنك البركة مصر — إدارة تمويل ومرابحة السيارات', label: 'بنك البركة مصر — مرابحة السيارات' },
      { value: 'بيت التمويل الكويتي مصر — إدارة تمويل السيارات', label: 'بيت التمويل الكويتي مصر — تمويل السيارات' },
      { value: 'بنك أبو ظبي الأول مصر (FABMISR) — إدارة تمويل السيارات', label: 'بنك أبو ظبي الأول مصر (FABMISR) — تمويل السيارات' }
    ]
  },
  {
    label: '🏢 شركات التمويل وتقسيط السيارات الكبرى',
    options: [
      { value: 'شركة كونتكت للتمويل (Contact Auto) — تمويل السيارات', label: 'شركة كونتكت للتمويل (Contact Auto)' },
      { value: 'شركة درايف للتمويل والخدمات المالية غير المصرفية (Drive Finance)', label: 'شركة درايف للتمويل (Drive Finance - غبور)' },
      { value: 'شركة عبد اللطيف جميل للتمويل مصر (أوتو جميل)', label: 'شركة عبد اللطيف جميل للتمويل مصر' },
      { value: 'شركة مباشر أوتو لتمويل السيارات (Mubasher Auto)', label: 'شركة مباشر أوتو لتمويل السيارات (Mubasher Auto)' },
      { value: 'شركة أمان للتمويل الاستهلاكي — قطاع السيارات (AMAN Auto)', label: 'شركة أمان للتمويل السيارات (AMAN Auto)' },
      { value: 'شركة فاليو للتمويل الاستهلاكي — تمويل السيارات (ValU Auto)', label: 'شركة فاليو للتمويل السيارات (ValU Auto)' },
      { value: 'شركة حالا للتمويل الاستهلاكي — تمويل السيارات (Halan Auto)', label: 'شركة حالا للتمويل السيارات (Halan Auto)' },
      { value: 'شركة سهولة للتمويل الاستهلاكي (Sohoula Auto Finance)', label: 'شركة سهولة للتمويل السيارات (Sohoula)' },
      { value: 'شركة سيفن للتمويل الاستهلاكي (Seven - بلتون)', label: 'شركة سيفن للتمويل الاستهلاكي (Seven / Beltone)' },
      { value: 'شركة ثروة للتمويل الاستهلاكي — تمويل السيارات (Sarwa Finance)', label: 'شركة ثروة للتمويل السيارات (Sarwa Finance)' },
      { value: 'شركة رواج للتمويل الاستهلاكي (Rawaj Auto Finance)', label: 'شركة رواج للتمويل السيارات (Rawaj Auto)' },
      { value: 'شركة مشروعي / تساهيل لتمويل المركبات والسيارات', label: 'شركة مشروعي / تساهيل لتمويل السيارات' },
      { value: 'شركة التوفيق للتأجير التمويلي والتمويل (A.T.Lease)', label: 'شركة التوفيق للتمويل (A.T.Lease)' },
      { value: 'شركة كوربليس للتمويل (Corplease)', label: 'شركة كوربليس للتمويل (Corplease)' },
      { value: 'شركة جلوبال كورب للخدمات المالية (GlobalCorp / Ollin)', label: 'شركة جلوبال كورب للتمويل (GlobalCorp)' },
      { value: 'شركة أوريكس مصر للتمويل (ORIX Egypt)', label: 'شركة أوريكس مصر للتمويل (ORIX)' },
      { value: 'نظام التقسيط المباشر — معرض أبو بهاء لتجارة السيارات', label: 'نظام التقسيط المباشر — معرض أبو بهاء لتجارة السيارات' }
    ]
  }
];

const BODY_CATEGORIES = [
  { key: 'ALL', label: 'الكل', icon: '✨' },
  { key: 'SEDAN', label: 'سيدان', icon: '🚗' },
  { key: 'SUV', label: 'SUV', icon: '🚙' },
  { key: 'CROSSOVER', label: 'كروس أوفر', icon: '🛞' },
  { key: 'HATCHBACK', label: 'هاتشباك', icon: '🏎️' },
  { key: 'LUXURY', label: 'فارهة', icon: '👑' },
  { key: 'ECONOMY', label: 'اقتصادية', icon: '💰' }
];

const QUICK_FILTERS = [
  { key: 'ALL', label: 'الكل' },
  { key: 'AVAILABLE', label: 'متاحة فوراً' },
  { key: 'FABRIKA', label: '🛡️ فابريكة' },
  { key: 'TOP_SCORE', label: '⭐ فحص +9.5' },
  { key: 'DISCOUNT', label: '🔥 خصومات' },
  { key: 'UNDER_2M', label: '💰 أقل من 2م' }
];

const PAINT_STATUS_OPTIONS = [
  { value: 'فابريكة بالكامل', label: '🛡️ فابريكة بالكامل (من الإكصدام للإكصدام)' },
  { value: 'فابريكة دواخل - رشة إكصدامات فقط', label: '✨ فابريكة بالكامل عدا الإكصدامات (تجميلي)' },
  { value: 'فابريكة دواخل - رشة حزام نظافة', label: '🚗 فابريكة دواخل وسقف - رشة حزام نظافة' },
  { value: 'فابريكة دواخل - رشة أجزاء خارجية', label: '🔧 فابريكة دواخل - رشة أجزاء خارجية' }
];

const CRM_STATUSES = [
  'مهتم - جاري المتابعة',
  'في انتظار أوراق البنك',
  'موعد معاينة بالمعرض',
  'تم البيع والتعاقد'
];

const FINANCE_PARTNERS = [
  'البنك الأهلي المصري',
  'بنك مصر',
  'البنك التجاري الدولي CIB',
  'QNB مصر',
  'مصرف أبو ظبي الإسلامي',
  'كونتكت Contact',
  'درايف Drive',
  'أمان AMAN',
  'فاليو ValU',
  'إنستاباي InstaPay'
];

const DEFAULT_ADMINS = [
  { username: 'admin', pass: 'Elite@2026#Secure', role: 'SuperAdmin', name: 'المدير العام' },
  { username: 'yasser', pass: 'Yasser*99', role: 'Staff', name: 'يسري (مشرف المبيعات)' }
];

const DEFAULT_CARS_DATA = [
  {
    id: 'CAR-1001',
    brand: 'مرسيدس بنز',
    model: 'C200 AMG Night Package',
    year: 2025,
    price: 3650000,
    oldPrice: 3750000,
    mileageKm: 8000,
    inspectionScore: 9.8,
    engineScore: 10,
    gearScore: 10,
    bodyScore: 9.8,
    interiorScore: 9.6,
    paintStatus: 'فابريكة بالكامل',
    paintDetails: 'فابريكة بالكامل من الإكصدام للإكصدام بدون خربوش - عليها أفلام حماية TPU كاملة.',
    imageUrl: 'https://images.unsplash.com/photo-1617788138017-80ad40651399?auto=format&fit=crop&w=900&q=80',
    images: [
      'https://images.unsplash.com/photo-1617788138017-80ad40651399?auto=format&fit=crop&w=900&q=80',
      'https://images.unsplash.com/photo-1549399542-7e3f8b79c341?auto=format&fit=crop&w=900&q=80'
    ],
    description: 'بحالة الزيرو تماماً، باقة AMG الرياضية الكاملة، سقف بانوراما، كاميرات 360 درجة، صيانات توكيل.',
    maxInstallmentMonths: 60,
    viewsCount: 25,
    dealerPhone: DEFAULT_DEALER_PHONE
  },
  {
    id: 'CAR-1002',
    brand: 'بي إم دبليو',
    model: 'X5 M-Sport xDrive40i',
    year: 2024,
    price: 5900000,
    oldPrice: 0,
    mileageKm: 19000,
    inspectionScore: 9.4,
    engineScore: 9.6,
    gearScore: 9.5,
    bodyScore: 9.2,
    interiorScore: 9.4,
    paintStatus: 'فابريكة بالكامل',
    paintDetails: 'دهان المصنع الأصلي بالكامل داخلياً وخارجياً بضمان الفحص المعتمد.',
    imageUrl: 'https://images.unsplash.com/photo-1555215695-3004980ad54e?auto=format&fit=crop&w=900&q=80',
    images: [
      'https://images.unsplash.com/photo-1555215695-3004980ad54e?auto=format&fit=crop&w=900&q=80',
      'https://images.unsplash.com/photo-1580273916550-e323be2ae537?auto=format&fit=crop&w=900&q=80'
    ],
    description: 'دفع رباعي xDrive، فرش جلد طبيعي جملي، نظام صوتي Harman Kardon، فبريكا بالكامل بدون خدوش.',
    maxInstallmentMonths: 72,
    viewsCount: 19,
    dealerPhone: DEFAULT_DEALER_PHONE
  },
  {
    id: 'CAR-1003',
    brand: 'تويوتا',
    model: 'كورولا فئة أولى Comfort',
    year: 2024,
    price: 1350000,
    oldPrice: 1410000,
    mileageKm: 32000,
    inspectionScore: 9.0,
    engineScore: 9.5,
    gearScore: 9.2,
    bodyScore: 8.8,
    interiorScore: 8.7,
    paintStatus: 'فابريكة بالكامل',
    paintDetails: 'فابريكة دواخل وخوارج بالكامل من الإكصدام للإكصدام.',
    imageUrl: 'https://images.unsplash.com/photo-1623869675781-80aa31012a5a?auto=format&fit=crop&w=900&q=80',
    images: [
      'https://images.unsplash.com/photo-1623869675781-80aa31012a5a?auto=format&fit=crop&w=900&q=80'
    ],
    description: 'اعتمادية فائقة، استعمال راقٍ جداً، فبريكا بالكامل من الإكصدام للإكصدام، استهلاك اقتصادي للوقود.',
    maxInstallmentMonths: 60,
    viewsCount: 41,
    dealerPhone: DEFAULT_DEALER_PHONE
  },
  {
    id: 'CAR-1004',
    brand: 'كيا',
    model: 'سبورتاج GT-Line Turbo',
    year: 2025,
    price: 1950000,
    oldPrice: 2020000,
    mileageKm: 5000,
    inspectionScore: 9.7,
    engineScore: 9.9,
    gearScore: 9.8,
    bodyScore: 9.7,
    interiorScore: 9.5,
    paintStatus: 'فابريكة بالكامل',
    paintDetails: 'بحالة الزيرو دهان المصنع بالكامل بدون أي ملاحظات.',
    imageUrl: 'https://images.unsplash.com/photo-1609521263047-f8f205293f24?auto=format&fit=crop&w=900&q=80',
    images: [
      'https://images.unsplash.com/photo-1609521263047-f8f205293f24?auto=format&fit=crop&w=900&q=80'
    ],
    description: 'أعلى فئة GT-Line، شاشات بانورامية منحنية، كراسي كهرباء وتبريد، بحالة الزيرو.',
    maxInstallmentMonths: 60,
    viewsCount: 33,
    dealerPhone: DEFAULT_DEALER_PHONE
  }
];

window.EliteConfig = {
  SANDBOX_TEST_MODE,
  MY_PERSONAL_TEST_PHONE,
  ABU_BAHAA_MAIN_PHONE,
  DEFAULT_DEALER_PHONE,
  DEALER_BRAND_NAME,
  DEALER_ADDRESS,
  DEALER_PHONES_DISPLAY,
  DEALER_PHONES_ARRAY,
  DEFAULT_CAR_IMAGE,
  FIREBASE_DEFAULT_CONFIG,
  INSTALLMENT_PROGRAMS,
  BANK_GROUPS,
  BODY_CATEGORIES,
  QUICK_FILTERS,
  PAINT_STATUS_OPTIONS,
  CRM_STATUSES,
  FINANCE_PARTNERS,
  DEFAULT_ADMINS,
  DEFAULT_CARS_DATA
};
