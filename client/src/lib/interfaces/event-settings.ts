export interface EventSettings {
  channelId: string;
  editMessages: boolean;
  Monday: string;
  Tuesday: string;
  Wednesday: string;
  Thursday: string;
  Friday: string;
  Saturday: string;
  Sunday: string;
  Dynamic: string;
}

export interface EventPostSettings {
  channelId: string;
  editMessages: boolean;
  existingMessageIds: {
    Monday: string;
    Tuesday: string;
    Wednesday: string;
    Thursday: string;
    Friday: string;
    Saturday: string;
    Sunday: string;
    Dynamic: string;
  };
}
