import mongoose from 'mongoose';

const Schema = mongoose.Schema;

const MessgeIDSchema = new Schema({
  Monday: { type: String, required: true },
  Tuesday: { type: String, required: true },
  Wednesday: { type: String, required: true },
  Thursday: { type: String, required: true },
  Friday: { type: String, required: true },
  Saturday: { type: String, required: true },
  Sunday: { type: String, required: true }
});

const EventPostSettingsSchema = new Schema({
  guildId: { type: String, required: true },
  channelId: { type: String, required: true },
  editMessages: { type: Boolean, required: true },
  existingMessageIds: MessgeIDSchema
});

const EventPostSettings = mongoose.model('EventPostSettings', EventPostSettingsSchema);

module.exports = EventPostSettings;
