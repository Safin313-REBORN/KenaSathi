export interface DemoCasePreset {
  id: string;
  caseKey: string;
  badgeBn: string;
  badgeEn: string;
  taglineBn: string;
  taglineEn: string;
  statutorySection: string;
  priceBdt: number;
  iconName: 'Headphones' | 'ShieldAlert' | 'Sparkles' | 'AlertTriangle' | 'PackageCheck';
  summaryBn: string;
  summaryEn: string;
}

export const DEMO_CASE_PRESETS: DemoCasePreset[] = [
  {
    id: 'headphones-nondelivery',
    caseKey: 'case_headphone_nondelivery',
    badgeBn: 'পণ্য সরবরাহ না করা (ধারা ৪৫)',
    badgeEn: 'Non-Delivery (Section 45)',
    taglineBn: 'সনি হেডফোন (৳৮,৫০০) — ৩ দিনের ডেলিভারি প্রতিশ্রুতি ভঙ্গ ও যোগাযোগ বন্ধ',
    taglineEn: 'Sony WH-1000XM5 (৳8,500) — Promised 3-day delivery violated & communication severed',
    statutorySection: 'ধারা ৪৫, ধারা ৬০ ও ধারা ৭৬(৪) (ভোক্তা অধিকার সংরক্ষণ আইন ২০০৯)',
    priceBdt: 8500,
    iconName: 'Headphones',
    summaryBn:
      'বিকাশ স্টেটমেন্ট (BK9X81729L) ও ফেসবুক পেজের চ্যাট স্ক্রিনশটসহ ৮,৫০০ টাকার অনাদায়ী পণ্যের প্রমাণভিত্তিক অভিযোগ।',
    summaryEn:
      'Real-world benchmark scenario: advance bKash payment with timestamped ad & messenger chat logs.',
  },
  {
    id: 'airpods-counterfeit',
    caseKey: 'airpods_scam',
    badgeBn: 'জাল/ক্লোন ইলেকট্রনিক্স (ধারা ৫০)',
    badgeEn: 'Counterfeiting (Section 50)',
    taglineBn: 'অ্যাপল এয়ারপডস প্রো (৳৪,৫০০) — বাজারদরের ৮৪% কম ও ভুয়া হলোগ্রাম',
    taglineEn: 'Apple AirPods Pro (৳4,500) — 84% below MSRP, counterfeit hologram',
    statutorySection: 'ধারা ৫০ ও ধারা ৪৪ (ভোক্তা অধিকার সংরক্ষণ আইন ২০০৯)',
    priceBdt: 4500,
    iconName: 'ShieldAlert',
    summaryBn:
      'অরিজিনাল বলে ক্লোন ডিভাইস সরবরাহ। মাইক্রো-টাইপোগ্রাফি অসংগতি ও ওয়ারেন্টি চাওয়ায় ক্রেতাকে ব্লক করার প্রমাণ।',
    summaryEn:
      'Counterfeit clone supplied as genuine; micro-typography flaws detected; seller blocked buyer.',
  },
  {
    id: 'cosmetics-unregistered',
    caseKey: 'cerave_cosmetics',
    badgeBn: 'অনিবন্ধিত ক্ষতিকর প্রসাধন (ধারা ৪১)',
    badgeEn: 'Adulteration & False Goods (Section 41)',
    taglineBn: 'সেরাভে ফেসিয়াল ক্লিনজার (৳৯৫০) — জিএস১ ভুয়া বারকোড ও মেয়াদোত্তীর্ণ লট',
    taglineEn: 'CeraVe Cleanser (৳950) — Unregistered GS1 barcode & fake lot stamp',
    statutorySection: 'ধারা ৪১ ও ধারা ৫০ (ভোক্তা অধিকার সংরক্ষণ আইন ২০০৯)',
    priceBdt: 950,
    iconName: 'Sparkles',
    summaryBn:
      'ইউএসএ জিএস১ রেজিস্ট্রি ছাড়া অননুমোদিত কসমেটিক্স বিক্রয়; দারাজ ইনভয়েস ও বোতলের বারকোড নথিভুক্ত।',
    summaryEn:
      'Uncertified cosmetic item lacking GS1 verification; invoice and macro-optical barcode archived.',
  },
];
