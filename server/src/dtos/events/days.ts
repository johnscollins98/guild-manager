export const daysOfWeek = [
  'Monday',
  'Tuesday',
  'Wednesday',
  'Thursday',
  'Friday',
  'Saturday',
  'Sunday',
  'Dynamic'
] as const;

export type DayOfWeek = (typeof daysOfWeek)[number];
