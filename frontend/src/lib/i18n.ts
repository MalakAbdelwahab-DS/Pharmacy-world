export const languages = ["en", "ar"] as const;
export type Lang = (typeof languages)[number];

export const dir = (lang: Lang) => (lang === "ar" ? "rtl" : "ltr");

// One glossary for the whole site: every screen uses these words (Dr. Sakher's note 5).
const en = {
  brand: "Pharmacy World",
  tagline: "You come first",
  otherLanguage: "العربية",
  searchPlaceholder: "Search a medicine or ask a question",
  search: "Search",
  heroTitle: "Know your medicine",
  heroText: "Look up any medicine sold in Jordan: what it is, what it costs, and whether the same medicine is available for less.",
  results: (n: number, q: string) => `${n} results for "${q}"`,
  noResults: (q: string) => `No results for "${q}"`,
  didYouMean: "Did you mean",
  noResultsHelp: "Check the spelling, or search by the active ingredient, for example paracetamol.",
  sponsored: "Sponsored",
  manufacturer: "Manufacturer",
  publicPrice: "Public price",
  from: "from",
  per: "per",
  priceNote: "Public prices in Jordanian dinars (JOD).",
  sameMedicine: "Same medicine",
  sameMedicineHelp: "Same active ingredient, strength and form, from a different manufacturer. These can usually be swapped, but check with your pharmacist.",
  lowerPrice: "Same medicine, lower price",
  similar: "Similar medicines",
  similarHelp: "Used for similar symptoms, but with a different ingredient or strength. Don't switch without asking your pharmacist.",
  discontinued: "Discontinued",
  noLongerAvailable: "This medicine is no longer available in Jordan",
  packs: "Pack sizes",
  disclaimer: "This information helps you understand your medicine. It does not replace advice from your pharmacist or doctor.",
  loading: "Loading…",
  error: "Something went wrong. Please try again.",
  notFound: "Medicine not found",
  currency: "JOD",
  madeIn: "Made in",
};

type Dict = typeof en;

const ar: Dict = {
  brand: "فارمسي وورلد",
  tagline: "أنتم أولاً",
  otherLanguage: "English",
  searchPlaceholder: "ابحث عن دواء أو اطرح سؤالاً",
  search: "بحث",
  heroTitle: "اعرف دواءك",
  heroText: "ابحث عن أي دواء يُباع في الأردن: ما هو، وكم سعره، وهل يتوفر نفس الدواء بسعر أقل.",
  results: (n, q) => `${n} نتيجة لـ "${q}"`,
  noResults: (q) => `لا توجد نتائج لـ "${q}"`,
  didYouMean: "هل تقصد",
  noResultsHelp: "تأكد من الإملاء، أو ابحث باسم المادة الفعالة، مثل باراسيتامول.",
  sponsored: "مُموَّل",
  manufacturer: "الشركة المصنّعة",
  publicPrice: "سعر الجمهور",
  from: "من",
  per: "لكل",
  priceNote: "أسعار الجمهور بالدينار الأردني (د.أ).",
  sameMedicine: "نفس الدواء",
  sameMedicineHelp: "نفس المادة الفعالة والتركيز والشكل، من شركة مصنّعة مختلفة. يمكن عادةً استبدالها، لكن استشر الصيدلي أولاً.",
  lowerPrice: "نفس الدواء بسعر أقل",
  similar: "أدوية مشابهة",
  similarHelp: "تُستخدم لأعراض مشابهة، لكن بمادة فعالة أو تركيز مختلف. لا تستبدل الدواء دون استشارة الصيدلي.",
  discontinued: "متوقف",
  noLongerAvailable: "هذا الدواء لم يعد متوفراً في الأردن",
  packs: "أحجام العبوة",
  disclaimer: "تساعدك هذه المعلومات على فهم دوائك، ولا تغني عن استشارة الصيدلي أو الطبيب.",
  loading: "جارٍ التحميل…",
  error: "حدث خطأ ما. يرجى المحاولة مرة أخرى.",
  notFound: "لم يتم العثور على الدواء",
  currency: "د.أ",
  madeIn: "صُنع في",
};

export const dictionaries: Record<Lang, Dict> = { en, ar };
export const isLang = (value: string): value is Lang => (languages as readonly string[]).includes(value);
