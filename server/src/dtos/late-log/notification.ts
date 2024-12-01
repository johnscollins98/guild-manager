export const notifications = {
  BEFORE: 'before',
  AFTER: 'after',
  NEVER: 'never'
} as const;

export type LateLogNotification = (typeof notifications)[keyof typeof notifications];
