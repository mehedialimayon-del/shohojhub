export type HubModule = {
  slug: string;
  name: string;
  title: string;
  category: string;
  icon: string;
  tone: string;
  enabledKey?: string;
  description: string;
};

export const modules: HubModule[] = [
  { slug: 'chaikini', name: 'ঝুড়িভরা', title: 'ঘরের বাজার হাতের নাগালে', category: 'পণ্য', icon: '🛒', tone: 'green', enabledKey: 'storefront', description: 'মুদি, চাল-ডাল, গ্যাস, পানি, সবজি, ফল ও অনুমোদিত দোকান খুঁজুন।' },
  { slug: 'haatbazar', name: 'শখেরহাট', title: 'নতুন পণ্য, নতুন আনন্দ', category: 'পণ্য', icon: '🏬', tone: 'orange', description: 'নতুন পণ্য খুঁজুন, বিক্রির পোস্ট দিন এবং বিক্রেতার সঙ্গে যোগাযোগ করুন।' },
  { slug: 'porai', name: 'স্যারকই', title: 'পড়তে চাই, পড়াতে চাই', category: 'শিক্ষা', icon: '🎓', tone: 'blue', enabledKey: 'porai', description: 'বাসায় পড়ানো, অনলাইন, স্কুল, কলেজ, ভর্তি ও ভাষা শিক্ষার জন্য শিক্ষক খুঁজুন।' },
  { slug: 'examarena-bd', name: 'ExamArena BD', title: 'সকল পরীক্ষার পূর্ণ প্রস্তুতি', category: 'শিক্ষা', icon: '📖', tone: 'purple', description: 'স্কুল, SSC, HSC, ভর্তি, চাকরি ও ভাষা পরীক্ষার প্রস্তুতির উপকরণ।' },
  { slug: 'an-overseas', name: 'A&N Overseas', title: 'বিদেশে উচ্চশিক্ষা ও স্কলারশিপ', category: 'শিক্ষা', icon: '🌐', tone: 'pink', description: 'বিদেশে পড়াশোনা, বিশ্ববিদ্যালয়, স্কলারশিপ ও আবেদন সহায়তা।' },
  { slug: 'chakrichai', name: 'কর্মদুয়ার', title: 'চাকরি খুঁজুন, নিয়োগ দিন', category: 'চাকরি', icon: '💼', tone: 'amber', description: 'সরকারি, বেসরকারি, ব্যাংক, NGO, IT, বিক্রয়, কৃষি ও রিমোট চাকরি।' },
  { slug: 'shebachai', name: 'ডাকদিলেই', title: 'এক ডাকেই প্রয়োজনের সমাধান', category: 'সেবা', icon: '🛠️', tone: 'red', description: 'ইলেকট্রিশিয়ান, প্লাম্বার, মেরামত, পরিচ্ছন্নতা, আইন ও IT সেবা।' },
  { slug: 'varachai', name: 'ভাড়াহাট', title: 'বাসা, গাড়ি ও অন্যান্য ভাড়া', category: 'সেবা', icon: '🏠', tone: 'green', description: 'ফ্ল্যাট, রুম, হোস্টেল, অফিস, গাড়ি ও প্রয়োজনীয় যন্ত্রপাতি ভাড়া।' },
  { slug: 'kajchai', name: 'কাজেরহাট', title: 'দৈনিক কাজ ও শ্রমিকের সন্ধান', category: 'চাকরি', icon: '👷', tone: 'amber', description: 'নির্মাণ, কৃষি, ইভেন্ট ও অস্থায়ী কাজের জন্য কর্মী বা কাজ খুঁজুন।' },
  { slug: 'skilldibo', name: 'কারিগর', title: 'দক্ষতা দিয়ে আয় করুন', category: 'চাকরি', icon: '✨', tone: 'blue', description: 'গ্রাফিক্স, ওয়েব, অ্যাপ, ভিডিও, লেখা, অনুবাদ ও ডিজিটাল সেবা।' },
  { slug: 'paikarichai', name: 'মহাজন', title: 'পাইকারি দামে বড় ব্যবসা', category: 'পণ্য', icon: '📦', tone: 'orange', description: 'পাইকারি পণ্য, ক্যাটালগ, উৎপাদক ও সরবরাহকারী খুঁজুন।' },
  { slug: 'jatrachai', name: 'ঘুরেফিরে', title: 'সহজ হোক প্রতিটি যাত্রা', category: 'সেবা', icon: '🚌', tone: 'blue', description: 'রুট, যাত্রার তারিখ ও প্রয়োজন অনুযায়ী পরিবহন বা ভ্রমণসেবা খুঁজুন।' },
  { slug: 'pathai', name: 'ডাকপিয়ন', title: 'পণ্য পাঠান যেকোনো ঠিকানায়', category: 'সেবা', icon: '🚚', tone: 'green', description: 'পার্সেল, ট্রাক, পিকআপ, বাসা বদল ও পণ্য পরিবহনের কোটেশন নিন।' },
  { slug: 'krishihaat', name: 'মাটিরটান', title: 'বীজ থেকে বাজার, কৃষকের পাশে', category: 'পণ্য', icon: '🌱', tone: 'green', description: 'কৃষিপণ্য, বীজ, অনুমোদিত উপকরণ ও কৃষি পরামর্শ খুঁজুন।' },
  { slug: 'matsyahaat', name: 'মাছে ভাতে', title: 'মাছ, পোনা ও মৎস্যসেবা', category: 'পণ্য', icon: '🐟', tone: 'blue', description: 'মাছ, পোনা, হ্যাচারি, খাদ্য, সরঞ্জাম ও মৎস্য বিশেষজ্ঞ খুঁজুন।' },
  { slug: 'pranihaat', name: 'গোয়ালঘর', title: 'গবাদিপশু ও পোল্ট্রির বাজার', category: 'পণ্য', icon: '🐄', tone: 'orange', description: 'গবাদিপশু, পোলট্রি, খাদ্য, খামার সরঞ্জাম ও পশু চিকিৎসা সেবা।' },
  { slug: 'shasthosheba', name: 'ভালোথাকি', title: 'স্বাস্থ্যসেবা হাতের নাগালে', category: 'সেবা', icon: '🩺', tone: 'red', description: 'ডাক্তার, হাসপাতাল, ক্লিনিক, ডায়াগনস্টিক ও অনুমোদিত ফার্মেসি খুঁজুন।' },
  { slug: 'anusthan', name: 'আনন্দবাড়ি', title: 'বিয়ে ও অনুষ্ঠানের সব সেবা', category: 'সেবা', icon: '🎉', tone: 'pink', description: 'অনুষ্ঠান পরিকল্পনা, ভেন্যু, খাবার ও প্রয়োজনীয় সেবাদাতা খুঁজুন।' },
  { slug: 'tenderchai', name: 'বাণিজ্যদুয়ার', title: 'সুযোগ খুঁজুন, ব্যবসা বাড়ান', category: 'ব্যবসা', icon: '📋', tone: 'blue', description: 'টেন্ডার, ব্যবসার সুযোগ ও প্রয়োজনীয় বিজ্ঞপ্তি দেখুন।' },
  { slug: 'amardokan', name: 'আমারহাট', title: 'অনলাইনেই খুলুন নিজের দোকান', category: 'ব্যবসা', icon: '🏪', tone: 'orange', enabledKey: 'storefront', description: 'নিজস্ব দোকান, পণ্য ও স্টক অনলাইনে পরিচালনা করুন।' },
  { slug: 'amar-chahida', name: 'লাগবেআমার', title: 'আপনার চাহিদা, কাছেই সমাধান', category: 'পণ্য', icon: '📍', tone: 'red', description: 'নিকটবর্তী চাহিদা ও স্থানীয় অফার খুঁজুন।' },
  { slug: 'shohoj-hishab', name: 'হিসাববাবু', title: 'আয়-ব্যয়ের ডিজিটাল খাতা', category: 'ব্যবসা', icon: '🧮', tone: 'green', description: 'দৈনন্দিন আয়, ব্যয় ও হিসাবের রেকর্ড রাখুন।' },
  { slug: 'shohoj-memo', name: 'রসিদবাবু', title: 'রসিদ বানান, প্রিন্ট ও শেয়ার করুন', category: 'ব্যবসা', icon: '🧾', tone: 'amber', enabledKey: 'cash_memos', description: 'পণ্য, পরিমাণ ও মূল্য দিয়ে ডিজিটাল ক্যাশ মেমো তৈরি করুন।' },
  { slug: 'stock-manager', name: 'গুদামঘর', title: 'আপনার ডিজিটাল গুদাম', category: 'ব্যবসা', icon: '📊', tone: 'blue', enabledKey: 'storefront', description: 'পণ্যের মজুত ও লেনদেনের হিসাব রাখুন।' },
  { slug: 'shohojtools', name: 'কাজেরবাক্স', title: 'PDF, QR ও প্রয়োজনীয় টুলস', category: 'টুলস', icon: '🧰', tone: 'purple', description: 'দৈনন্দিন কাজের ছোট ডিজিটাল টুল ব্যবহার করুন।' },
  { slug: 'design-studio', name: 'রঙেরখেলা', title: 'ছবি, পোস্টার ও বিজ্ঞাপন', category: 'টুলস', icon: '🎨', tone: 'pink', description: 'ব্যবসার পোস্টার ও বিজ্ঞাপন সাজিয়ে তৈরি করুন।' },
  { slug: 'ai-assistant', name: 'বুদ্ধিবাবু', title: 'আপনার ব্যক্তিগত AI সহকারী', category: 'টুলস', icon: '🤖', tone: 'blue', description: 'লেখা, পরিকল্পনা ও তথ্য সংগঠনে সহায়তা নিন।' },
  { slug: 'dse-market-watch', name: 'দরদেখি', title: 'শেয়ারবাজার এক নজরে', category: 'ব্যবসা', icon: '📈', tone: 'green', description: 'অনুমোদিত ডেটা উৎস থেকে বাজার তথ্য দেখুন।' },
  { slug: 'shohoj-community', name: 'পাড়াপ্রতিবেশী', title: 'পাড়ার খবর, পাড়ার মানুষ', category: 'কমিউনিটি', icon: '👥', tone: 'purple', description: 'এলাকার আলোচনা ও কমিউনিটি আপডেট দেখুন।' },
  { slug: 'roktobondhu', name: 'রক্তেরডাক', title: 'রক্তদাতা ও রোগীর সেতুবন্ধন', category: 'কমিউনিটি', icon: '🩸', tone: 'red', description: 'রক্তের গ্রুপ ও এলাকার ভিত্তিতে দাতা খুঁজুন।' },
  { slug: 'khunjepai', name: 'হারিয়েপাই', title: 'হারানো ও প্রাপ্তির খবর দিন', category: 'কমিউনিটি', icon: '🔎', tone: 'amber', description: 'হারানো ও পাওয়া জিনিসের বিজ্ঞপ্তি দেখুন।' },
  { slug: 'emergency-help', name: 'বাঁচাও', title: 'জরুরি সাহায্য ও সেবার তথ্য', category: 'কমিউনিটি', icon: '🆘', tone: 'red', description: 'জরুরি প্রয়োজনে প্রয়োজনীয় যোগাযোগের তথ্য দেখুন।' },
  { slug: 'success-stories', name: 'ঘুরেদাঁড়াই', title: 'আপনার গল্প, অন্যের সাহস', category: 'কমিউনিটি', icon: '🏆', tone: 'amber', description: 'কমিউনিটির সাফল্য ও অভিজ্ঞতা পড়ুন।' },
  { slug: 'shohoj-connect', name: 'কথাকই', title: 'প্রয়োজনের মানুষের সঙ্গে কথা বলুন', category: 'কমিউনিটি', icon: '💬', tone: 'blue', enabledKey: 'messaging', description: 'অ্যাকাউন্টের মাধ্যমে বার্তা ও নোটিফিকেশন পরিচালনা করুন।' },
  { slug: 'my-dashboard', name: 'আমারঘর', title: 'আপনার ব্যক্তিগত ড্যাশবোর্ড', category: 'অ্যাকাউন্ট', icon: '👤', tone: 'purple', description: 'নিজের প্রোফাইল, পোস্ট ও অ্যাকাউন্ট কার্যক্রম দেখুন।' },
  { slug: 'credit-center', name: 'ক্রেডিটঘর', title: 'আপনার ক্রেডিট ও ব্যালেন্স', category: 'অ্যাকাউন্ট', icon: '💳', tone: 'amber', description: 'ক্রেডিট ব্যালেন্স, ব্যবহার ও প্যাকেজ দেখুন।' },
  { slug: 'referral-rewards', name: 'বন্ধুআনো', title: 'আমন্ত্রণে আনন্দ, রেফারেলে পুরস্কার', category: 'অ্যাকাউন্ট', icon: '🎁', tone: 'pink', description: 'আমন্ত্রণ কোড, রেফারেল অবস্থা ও পুরস্কারের নিয়ম দেখুন।' },
  { slug: 'advertising-center', name: 'প্রচারবাড়ি', title: 'পণ্যের প্রচার, ব্যবসার প্রসার', category: 'ব্যবসা', icon: '📣', tone: 'orange', description: 'ব্যানার, ফিচার্ড পোস্ট ও স্পনসর প্রচারণা পরিচালনা করুন।' },
  { slug: 'founder-command-center', name: 'সদরদপ্তর', title: 'সম্পূর্ণ প্ল্যাটফর্ম নিয়ন্ত্রণ', category: 'প্রশাসন', icon: '⚙️', tone: 'blue', description: 'মডিউল, ক্যাটাগরি, মূল্য, কনটেন্ট, এলাকা ও নিরাপত্তা নিয়ন্ত্রণ।' },
  { slug: 'financial-management', name: 'কোষাগার', title: 'আয়, ব্যয় ও পেমেন্ট নিয়ন্ত্রণ', category: 'প্রশাসন', icon: '💰', tone: 'green', description: 'ক্রেডিট, সদস্যপদ, বিজ্ঞাপন, রিফান্ড ও ব্যয়ের হিসাব।' },
  { slug: 'haatbazar-used', name: 'পুরোনোসোনা', title: 'পুরোনো বেচুন, সাশ্রয়ে কিনুন', category: 'পণ্য', icon: '🏬', tone: 'orange', description: 'ব্যবহৃত পণ্য খুঁজুন ও বিক্রির পোস্ট দিন।' },
  { slug: 'skill-courses', name: 'হাতেখড়ি', title: 'শিখুন, দক্ষ হোন, আয় করুন', category: 'শিক্ষা', icon: '🎓', tone: 'blue', description: 'স্কিল ও প্রশিক্ষণ কোর্স খুঁজুন।' },
];

export const featuredModuleSlugs = [
  'chaikini', 'haatbazar', 'porai', 'examarena-bd', 'an-overseas',
  'chakrichai', 'shebachai', 'varachai', 'stock-manager', 'success-stories',
];

export function getModule(slug: string) {
  return modules.find((item) => item.slug === slug);
}
