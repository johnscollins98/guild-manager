export enum WarningType {
  OFFICIAL = 'official',
  INFORMAL = 'informal',
  EVENT = 'event'
}

export const WarningTypeLabels: Record<WarningType, string> = {
  [WarningType.OFFICIAL]: 'Official',
  [WarningType.INFORMAL]: 'Informal',
  [WarningType.EVENT]: 'Event'
};
