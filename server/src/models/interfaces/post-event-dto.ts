export interface PostEventDto {
  channelId: string;
  editMessages: boolean;
  existingMessageIds?: {
    [key: string]: string;
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
