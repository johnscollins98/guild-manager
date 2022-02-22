import mongoose from 'mongoose';

const Schema = mongoose.Schema;

const UserSchema = new Schema<Express.User>({
  id: { type: String, required: true },
  username: { type: String, required: true },
});

const DiscordUser = mongoose.model<Express.User>('DiscordUser', UserSchema);

export default DiscordUser;
