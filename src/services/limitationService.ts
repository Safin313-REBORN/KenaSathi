/**
 * KenaSathi AI — Section 60 Statutory Limitation Engine
 * Aligned strictly with Section 60 of the Consumer Rights Protection Act, 2009 (CRPA 2009):
 * 
 * "কারণ উদ্ভব হইবার ৩০ (ত্রিশ) দিনের মধ্যে মহাপরিচালক কিংবা অধিদপ্তরের ক্ষমতাপ্রাপ্ত
 * কোনো কর্মকর্তার নিকট লিখিত অভিযোগ দাখিল করিতে হইবে।"
 * 
 * Rules:
 * 1. 30 calendar days (not 30 working days).
 * 2. Calculated strictly from user-provided cause-of-action date.
 * 3. Never fabricates today's date or 25 days fallback when date is unknown.
 * 4. Timezone-safe using Bangladesh Standard Time (UTC+6).
 */

export interface Section60LimitationResult {
  limitationRemainingDays: number | null;
  isTimeBarred: boolean;
  isFutureDate: boolean;
  isExpiringSoon: boolean;
  daysElapsed: number | null;
  statusBn: string;
  statusEn: string;
  statutoryWarningBn: string;
  statutoryWarningEn: string;
}

export function calculateSection60Limitation(
  incidentDateStr?: string | null,
  referenceNow?: Date
): Section60LimitationResult {
  if (!incidentDateStr || !incidentDateStr.trim()) {
    return {
      limitationRemainingDays: null,
      isTimeBarred: false,
      isFutureDate: false,
      isExpiringSoon: false,
      daysElapsed: null,
      statusBn: 'তারিখ দেওয়া হয়নি / কারণ উদ্ভবের তারিখ অনির্ধারিত',
      statusEn: 'Cause-of-action date not confirmed',
      statutoryWarningBn:
        'ভোক্তা অধিকার সংরক্ষণ আইন, ২০০৯-এর ধারা ৬০ অনুযায়ী কারণ উদ্ভব হওয়ার ৩০ দিনের মধ্যে লিখিত অভিযোগ দায়ের করতে হয়। কারণ উদ্ভবের তারিখ পরিস্থিতি অনুযায়ী নির্ধারিত হতে পারে। তারিখ নিশ্চিত হতে বা আইনি বিলম্ব মার্জনার বিষয়ে ভোক্তা অধিকার অধিদপ্তরের ১৬১২১ হটলাইনে যোগাযোগ করুন।',
      statutoryWarningEn:
        'Under Section 60 of CRPA 2009, written complaints must be filed within 30 days of the cause of action arising. The date depends on factual circumstances. If uncertain, consult DNCRP helpline 16121.',
    };
  }

  // Parse YYYY-MM-DD format safely
  const match = incidentDateStr.trim().match(/^(\d{4})-(\d{1,2})-(\d{1,2})$/);
  if (!match) {
    return {
      limitationRemainingDays: null,
      isTimeBarred: false,
      isFutureDate: false,
      isExpiringSoon: false,
      daysElapsed: null,
      statusBn: 'অকার্যকর তারিখ ফরম্যাট',
      statusEn: 'Invalid date format',
      statutoryWarningBn: 'প্রদত্ত তারিখটি সঠিক ফরম্যাটে (YYYY-MM-DD) নয়।',
      statutoryWarningEn: 'Provided date is not in valid YYYY-MM-DD format.',
    };
  }

  const inYear = parseInt(match[1], 10);
  const inMonth = parseInt(match[2], 10);
  const inDay = parseInt(match[3], 10);

  // Validate calendar bounds
  if (inMonth < 1 || inMonth > 12 || inDay < 1 || inDay > 31) {
    return {
      limitationRemainingDays: null,
      isTimeBarred: false,
      isFutureDate: false,
      isExpiringSoon: false,
      daysElapsed: null,
      statusBn: 'অকার্যকর তারিখ',
      statusEn: 'Invalid calendar date',
      statutoryWarningBn: 'প্রদত্ত তারিখটি ক্যালেন্ডার অনুসারে বৈধ নয়।',
      statutoryWarningEn: 'Provided date is invalid.',
    };
  }

  const incidentUtc = Date.UTC(inYear, inMonth - 1, inDay);

  // Normalize current date to Asia/Dhaka calendar midnight
  const now = referenceNow || new Date();
  let todayYear = now.getUTCFullYear();
  let todayMonth = now.getUTCMonth() + 1;
  let todayDay = now.getUTCDate();

  try {
    const dtf = new Intl.DateTimeFormat('en-CA', {
      timeZone: 'Asia/Dhaka',
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
    });
    const parts = dtf.format(now).split('-');
    if (parts.length === 3) {
      todayYear = parseInt(parts[0], 10);
      todayMonth = parseInt(parts[1], 10);
      todayDay = parseInt(parts[2], 10);
    }
  } catch {
    // Fallback to UTC if timezone unavailable
  }

  const todayUtc = Date.UTC(todayYear, todayMonth - 1, todayDay);
  const msDiff = todayUtc - incidentUtc;
  const daysElapsed = Math.floor(msDiff / 86400000);

  // Check future date
  if (daysElapsed < 0) {
    return {
      limitationRemainingDays: null,
      isTimeBarred: false,
      isFutureDate: true,
      isExpiringSoon: false,
      daysElapsed,
      statusBn: 'ভবিষ্যতের তারিখ গৃহীত নয়',
      statusEn: 'Future date not accepted',
      statutoryWarningBn:
        'ঘটনার তারিখ হিসেবে ভবিষ্যতের তারিখ দেওয়া হয়েছে। সঠিক তারিখ নিশ্চিত করুন।',
      statutoryWarningEn:
        'Incident date cannot be in the future. Please provide the actual past date of grievance.',
    };
  }

  // Exact 30 Calendar Days Calculation
  const isTimeBarred = daysElapsed > 30;
  const limitationRemainingDays = Math.max(0, 30 - daysElapsed);
  const isExpiringSoon = !isTimeBarred && limitationRemainingDays <= 7;

  let statusBn: string;
  let statusEn: string;

  if (isTimeBarred) {
    statusBn = `৩০ দিনের তামাদি মেয়াদ উত্তীর্ণ (${daysElapsed} দিন পূর্বে)`;
    statusEn = `Statutory 30-day window expired (${daysElapsed} days ago)`;
  } else if (limitationRemainingDays === 0) {
    statusBn = 'আজই তামাদি মেয়াদের শেষ দিন (৩০তম দিন)';
    statusEn = 'Final statutory day (Day 30)';
  } else {
    statusBn = `${limitationRemainingDays} দিন বাকি`;
    statusEn = `${limitationRemainingDays} days remaining`;
  }

  return {
    limitationRemainingDays,
    isTimeBarred,
    isFutureDate: false,
    isExpiringSoon,
    daysElapsed,
    statusBn,
    statusEn,
    statutoryWarningBn: isTimeBarred
      ? `সতর্কতা: ধারা ৬০ অনুসারে ঘটনার কারণ উদ্ভব হওয়ার ৩০ ক্যালেন্ডার দিন অতিক্রান্ত হয়েছে (${daysElapsed} দিন)। বিশেষ আইনি বিলম্ব মার্জনার কোনো সুযোগ আছে কি না জানতে ভোক্তা অধিকার কার্যালয়ে (১৬১২১) যোগাযোগ করুন।`
      : `ধারা ৬০ সতর্কবার্তা: ঘটনার ৩০ দিনের মধ্যে অভিযোগ দাখিল করতে হবে। অবশিষ্ট সময়: ${limitationRemainingDays} দিন।`,
    statutoryWarningEn: isTimeBarred
      ? `Notice: Under Section 60, more than 30 calendar days have elapsed since the incident (${daysElapsed} days). Please consult DNCRP (16121) to confirm eligibility.`
      : `Section 60 statutory window: Must file within 30 days of the incident. Remaining: ${limitationRemainingDays} days.`,
  };
}
