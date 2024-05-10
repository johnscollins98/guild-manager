export interface EventSettingsDTO {
  channelId?: string;
  editMessages: boolean;
  existingMessageIds: {
    Monday?: string;
    Tuesday?: string;
    Wednesday?: string;
    Thursday?: string;
    Friday?: string;
    Saturday?: string;
    Sunday?: string;
    Dynamic?: string;
  };
}
