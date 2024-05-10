interface ExistingMessageIds {
  Monday: string;
  Tuesday: string;
  Wednesday: string;
  Thursday: string;
  Friday: string;
  Saturday: string;
  Sunday: string;
  Dynamic: string;
}

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
