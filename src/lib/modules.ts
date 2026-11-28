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
  { slug: 'chaikini', name: 'ChaaiKini', title: 'দৈনন্দিন পণ্য ও স্থানীয় দোকান', category: 'পণ্য', icon: '🛒', tone: 'green', enabledKey: 'storefront', description: 'মুদি, চাল-ডাল, গ্যাস, পানি, সবজি, ফল ও অনুমোদিত দোকান খুঁজুন।' },
  { slug: 'haatbazar', name: 'HaatBazar', title: 'নতুন ও পুরোনো পণ্য কেনাবেচা', category: 'পণ্য', icon: '🏬', tone: 'orange', description: 'নতুন ও ব্যবহৃত পণ্য খুঁজুন, বিক্রির পোস্ট দিন এবং বিক্রেতার সঙ্গে যোগাযোগ করুন।' },
  { slug: 'porai', name: 'Porai', title: 'টিউশন ও শিক্ষক খুঁজুন', category: 'শিক্ষা', icon: '🎓', tone: 'blue', enabledKey: 'porai', description: 'বাসায় পড়ানো, অনলাইন, স্কুল, কলেজ, ভর্তি ও ভাষা শিক্ষার জন্য শিক্ষক খুঁজুন।' },
  { slug: 'examarena-bd', name: 'ExamArena BD', title: 'সম্পূর্ণ শিক্ষা ও পরীক্ষা প্রস্তুতি', category: 'শিক্ষা', icon: '📖', tone: 'purple', description: 'স্কুল, SSC, HSC, ভর্তি, চাকরি ও ভাষা পরীক্ষার প্রস্তুতির উপকরণ।' },
  { slug: 'an-overseas', name: 'A&N Overseas', title: 'বিদেশে উচ্চশিক্ষা ও স্কলারশিপ', category: 'শিক্ষা', icon: '🌐', tone: 'pink', description: 'বিদেশে পড়াশোনা, বিশ্ববিদ্যালয়, স্কলারশিপ ও আবেদন সহায়তা।' },
  { slug: 'chakrichai', name: 'ChakriChai', title: 'চাকরি খুঁজুন ও নিয়োগ দিন', category: 'চাকরি', icon: '💼', tone: 'amber', description: 'সরকারি, বেসরকারি, ব্যাংক, NGO, IT, বিক্রয়, কৃষি ও রিমোট চাকরি।' },
  { slug: 'shebachai', name: 'ShebaChai', title: 'স্থানীয় ও পেশাদার সেবা', category: 'সেবা', icon: '🛠️', tone: 'red', description: 'ইলেকট্রিশিয়ান, প্লাম্বার, মেরামত, পরিচ্ছন্নতা, আইন ও IT সেবা।' },
  { slug: 'varachai', name: 'VaraChai', title: 'বাসা, গাড়ি ও অন্যান্য ভাড়া', category: 'সেবা', icon: '🏠', tone: 'green', description: 'ফ্ল্যাট, রুম, হোস্টেল, অফিস, গাড়ি ও প্রয়োজনীয় যন্ত্রপাতি ভাড়া।' },
  { slug: 'kajchai', name: 'KajChai', title: 'দৈনিক কাজ ও কর্মী', category: 'চাকরি', icon: '👷', tone: 'amber', description: 'নির্মাণ, কৃষি, ইভেন্ট ও অস্থায়ী কাজের জন্য কর্মী বা কাজ খুঁজুন।' },
  { slug: 'skilldibo', name: 'SkillDibo', title: 'ফ্রিল্যান্সিং ও ডিজিটাল সেবা', category: 'চাকরি', icon: '✨', tone: 'blue', description: 'গ্রাফিক্স, ওয়েব, অ্যাপ, ভিডিও, লেখা, অনুবাদ ও ডিজিটাল সেবা।' },
  { slug: 'paikarichai', name: 'PaikariChai', title: 'পাইকারি পণ্য ও সরবরাহকারী', category: 'পণ্য', icon: '📦', tone: 'orange', description: 'পাইকারি পণ্য, ক্যাটালগ, উৎপাদক ও সরবরাহকারী খুঁজুন।' },
  { slug: 'jatrachai', name: 'JatraChai', title: 'যাতায়াত ও ভ্রমণসেবা', category: 'সেবা', icon: '🚌', tone: 'blue', description: 'রুট, যাত্রার তারিখ ও প্রয়োজন অনুযায়ী পরিবহন বা ভ্রমণসেবা খুঁজুন।' },
  { slug: 'pathai', name: 'Pathai', title: 'কুরিয়ার ও পণ্য পরিবহন', category: 'সেবা', icon: '🚚', tone: 'green', description: 'পার্সেল, ট্রাক, পিকআপ, বাসা বদল ও পণ্য পরিবহনের কোটেশন নিন।' },
  { slug: 'krishihaat', name: 'KrishiHaat', title: 'কৃষিপণ্য ও কৃষি উপকরণ', category: 'পণ্য', icon: '🌱', tone: 'green', description: 'কৃষিপণ্য, বীজ, অনুমোদিত উপকরণ ও কৃষি পরামর্শ খুঁজুন।' },
  { slug: 'matsyahaat', name: 'MatsyaHaat', title: 'মাছ, পোনা ও মৎস্য ব্যবসা', category: 'পণ্য', icon: '🐟', tone: 'blue', description: 'মাছ, পোনা, হ্যাচারি, খাদ্য, সরঞ্জাম ও মৎস্য বিশেষজ্ঞ খুঁজুন।' },
  { slug: 'pranihaat', name: 'PraniHaat', title: 'গবাদিপশু ও পোলট্রি', category: 'পণ্য', icon: '🐄', tone: 'orange', description: 'গবাদিপশু, পোলট্রি, খাদ্য, খামার সরঞ্জাম ও পশু চিকিৎসা সেবা।' },
  { slug: 'shasthosheba', name: 'ShasthoSheba', title: 'ডাক্তার ও স্বাস্থ্যসেবা', category: 'সেবা', icon: '🩺', tone: 'red', description: 'ডাক্তার, হাসপাতাল, ক্লিনিক, ডায়াগনস্টিক ও অনুমোদিত ফার্মেসি খুঁজুন।' },
  { slug: 'anusthan', name: 'Anusthan', title: 'বিয়ে ও অনুষ্ঠান আয়োজন', category: 'সেবা', icon: '🎉', tone: 'pink', description: 'অনুষ্ঠান পরিকল্পনা, ভেন্যু, খাবার ও প্রয়োজনীয় সেবাদাতা খুঁজুন।' },
  { slug: 'tenderchai', name: 'TenderChai', title: 'টেন্ডার ও ব্যবসার সুযোগ', category: 'ব্যবসা', icon: '📋', tone: 'blue', description: 'টেন্ডার, ব্যবসার সুযোগ ও প্রয়োজনীয় বিজ্ঞপ্তি দেখুন।' },
  { slug: 'amardokan', name: 'AmarDokan', title: 'নিজস্ব অনলাইন দোকান', category: 'ব্যবসা', icon: '🏪', tone: 'orange', enabledKey: 'storefront', description: 'নিজস্ব দোকান, পণ্য ও স্টক অনলাইনে পরিচালনা করুন।' },
  { slug: 'amar-chahida', name: 'Amar Chahida', title: 'লাইভ চাহিদা ও স্থানীয় অফার', category: 'পণ্য', icon: '📍', tone: 'red', description: 'নিকটবর্তী চাহিদা ও স্থানীয় অফার খুঁজুন।' },
  { slug: 'shohoj-hishab', name: 'ShohojHishab', title: 'ব্যবসার আয়-ব্যয়ের হিসাব', category: 'ব্যবসা', icon: '🧮', tone: 'green', description: 'দৈনন্দিন আয়, ব্যয় ও হিসাবের রেকর্ড রাখুন।' },
  { slug: 'shohoj-memo', name: 'ShohojMemo', title: 'ডিজিটাল ক্যাশ মেমো', category: 'ব্যবসা', icon: '🧾', tone: 'amber', enabledKey: 'cash_memos', description: 'পণ্য, পরিমাণ ও মূল্য দিয়ে ডিজিটাল ক্যাশ মেমো তৈরি করুন।' },
  { slug: 'stock-manager', name: 'Stock Manager', title: 'পণ্য ও স্টক নিয়ন্ত্রণ', category: 'ব্যবসা', icon: '📊', tone: 'blue', enabledKey: 'storefront', description: 'পণ্যের মজুত ও লেনদেনের হিসাব রাখুন।' },
  { slug: 'shohojtools', name: 'ShohojTools', title: 'PDF, QR ও প্রয়োজনীয় টুলস', category: 'টুলস', icon: '🧰', tone: 'purple', description: 'দৈনন্দিন কাজের ছোট ডিজিটাল টুল ব্যবহার করুন।' },
  { slug: 'design-studio', name: 'Design Studio', title: 'পোস্টার ও বিজ্ঞাপন তৈরি', category: 'টুলস', icon: '🎨', tone: 'pink', description: 'ব্যবসার পোস্টার ও বিজ্ঞাপন সাজিয়ে তৈরি করুন।' },
  { slug: 'ai-assistant', name: 'AI Assistant', title: 'AI দিয়ে কাজের সহায়তা', category: 'টুলস', icon: '🤖', tone: 'blue', description: 'লেখা, পরিকল্পনা ও তথ্য সংগঠনে সহায়তা নিন।' },
  { slug: 'dse-market-watch', name: 'DSE Market Watch', title: 'শেয়ারবাজার তথ্য', category: 'ব্যবসা', icon: '📈', tone: 'green', description: 'অনুমোদিত ডেটা উৎস থেকে বাজার তথ্য দেখুন।' },
  { slug: 'shohoj-community', name: 'Shohoj Community', title: 'স্থানীয় কমিউনিটি', category: 'কমিউনিটি', icon: '👥', tone: 'purple', description: 'এলাকার আলোচনা ও কমিউনিটি আপডেট দেখুন।' },
  { slug: 'roktobondhu', name: 'RoktoBondhu', title: 'রক্তদাতা খুঁজুন', category: 'কমিউনিটি', icon: '🩸', tone: 'red', description: 'রক্তের গ্রুপ ও এলাকার ভিত্তিতে দাতা খুঁজুন।' },
  { slug: 'khunjepai', name: 'KhunjePai', title: 'হারানো জিনিস খুঁজুন', category: 'কমিউনিটি', icon: '🔎', tone: 'amber', description: 'হারানো ও পাওয়া জিনিসের বিজ্ঞপ্তি দেখুন।' },
  { slug: 'emergency-help', name: 'Emergency Help', title: 'জরুরি যোগাযোগ', category: 'কমিউনিটি', icon: '🆘', tone: 'red', description: 'জরুরি প্রয়োজনে প্রয়োজনীয় যোগাযোগের তথ্য দেখুন।' },
  { slug: 'success-stories', name: 'Success Stories', title: 'সাফল্যের গল্প', category: 'কমিউনিটি', icon: '🏆', tone: 'amber', description: 'কমিউনিটির সাফল্য ও অভিজ্ঞতা পড়ুন।' },
  { slug: 'shohoj-connect', name: 'Shohoj Connect', title: 'চ্যাট ও নোটিফিকেশন', category: 'কমিউনিটি', icon: '💬', tone: 'blue', enabledKey: 'messaging', description: 'অ্যাকাউন্টের মাধ্যমে বার্তা ও নোটিফিকেশন পরিচালনা করুন।' },
  { slug: 'my-dashboard', name: 'My Dashboard', title: 'নিজের প্রোফাইল ও কার্যক্রম', category: 'অ্যাকাউন্ট', icon: '👤', tone: 'purple', description: 'নিজের প্রোফাইল, পোস্ট ও অ্যাকাউন্ট কার্যক্রম দেখুন।' },
  { slug: 'credit-center', name: 'Credit Center', title: 'ক্রেডিট রিচার্জ ও সদস্যপদ', category: 'অ্যাকাউন্ট', icon: '💳', tone: 'amber', description: 'ক্রেডিট ব্যালেন্স, ব্যবহার ও প্যাকেজ দেখুন।' },
  { slug: 'referral-rewards', name: 'Referral & Rewards', title: 'বন্ধু আমন্ত্রণ ও পুরস্কার', category: 'অ্যাকাউন্ট', icon: '🎁', tone: 'pink', description: 'আমন্ত্রণ কোড, রেফারেল অবস্থা ও পুরস্কারের নিয়ম দেখুন।' },
  { slug: 'advertising-center', name: 'Advertising Center', title: 'বিজ্ঞাপন পরিচালনা', category: 'ব্যবসা', icon: '📣', tone: 'orange', description: 'ব্যানার, ফিচার্ড পোস্ট ও স্পনসর প্রচারণা পরিচালনা করুন।' },
  { slug: 'founder-command-center', name: 'Founder Command Center', title: 'সম্পূর্ণ প্ল্যাটফর্ম নিয়ন্ত্রণ', category: 'প্রশাসন', icon: '⚙️', tone: 'blue', description: 'মডিউল, ক্যাটাগরি, মূল্য, কনটেন্ট, এলাকা ও নিরাপত্তা নিয়ন্ত্রণ।' },
  { slug: 'financial-management', name: 'Financial Management', title: 'আয়, ব্যয় ও পেমেন্ট নিয়ন্ত্রণ', category: 'প্রশাসন', icon: '💰', tone: 'green', description: 'ক্রেডিট, সদস্যপদ, বিজ্ঞাপন, রিফান্ড ও ব্যয়ের হিসাব।' },
];

export const featuredModuleSlugs = [
  'chaikini', 'haatbazar', 'porai', 'examarena-bd', 'an-overseas',
  'chakrichai', 'shebachai', 'varachai',
];

export function getModule(slug: string) {
  return modules.find((item) => item.slug === slug);
}
