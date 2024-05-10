import { DayOfWeek } from './days';

export type ExistingMessageIds = Record<DayOfWeek, string>;

export type EventSettingsUpsertDTO = {
  channelId: string;
} & (
  | {
      editMessages: true;
      existingMessageIds: ExistingMessageIds;
    }
  | {
      editMessages: false;
      existingMessageIds?: ExistingMessageIds;
    }
);
