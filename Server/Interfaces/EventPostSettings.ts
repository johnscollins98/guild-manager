export default interface EventPostSettings {
  guildId: string;
  channelId: string;
  editMessages: boolean;
  existingMessageIds: MessageIDs;
}

export interface MessageIDs {
  Monday: string;
  Tuesday: string;
  Wednesday: string;
  Thursday: string;
  Friday: string;
  Saturday: string;
  Sunday: string;
}
