export default interface IEventPostSettings {
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
