import mongoose from 'mongoose';

const Schema = mongoose.Schema;

const UserSchema = new Schema({
  id: { type: String, required: true },
  username: { type: String, required: true },
  guilds: { type: [Object], required: true }
});

const DiscordUser = mongoose.model('DiscordUser', UserSchema);

export default DiscordUser;
