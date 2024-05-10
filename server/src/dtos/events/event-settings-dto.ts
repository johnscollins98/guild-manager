import { DayOfWeek } from './days';

export interface EventSettingsDTO {
  channelId?: string;
  editMessages: boolean;
  existingMessageIds: Record<DayOfWeek, string | undefined>;
}
