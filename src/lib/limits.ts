export const MAX_TEXT_LENGTH = 10000;

export const FREE_LIMITS = {
  dumpsPerWeek: 3,
  maxLumenLevel: 2,
  voiceEnabled: false,
  exportEnabled: false,
  shareEnabled: false,
  weeklySummaryEnabled: false,
  gratitudeEnabled: false,
};

export const PRO_LIMITS = {
  dumpsPerWeek: Infinity,
  maxLumenLevel: 5,
  voiceEnabled: true,
  exportEnabled: true,
  shareEnabled: true,
  weeklySummaryEnabled: true,
  gratitudeEnabled: true,
};

export function getUserLimits(isPremium: boolean) {
  return isPremium ? PRO_LIMITS : FREE_LIMITS;
}
