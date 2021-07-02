import mongoose from 'mongoose';
import EventPostSettings, { MessageIDs } from '../Interfaces/EventPostSettings';

const Schema = mongoose.Schema;

const MessgeIDSchema = new Schema<MessageIDs>({
  Monday: { type: String, required: true },
  Tuesday: { type: String, required: true },
  Wednesday: { type: String, required: true },
  Thursday: { type: String, required: true },
  Friday: { type: String, required: true },
  Saturday: { type: String, required: true },
  Sunday: { type: String, required: true }
});

const EventPostSettingsSchema = new Schema<EventPostSettings>({
  guildId: { type: String, required: true },
  channelId: { type: String, required: true },
  editMessages: { type: Boolean, required: true },
  existingMessageIds: MessgeIDSchema
});

const EventPostSettings = mongoose.model<EventPostSettings>(
  'EventPostSettings',
  EventPostSettingsSchema
);

export default EventPostSettings;
