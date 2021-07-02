import mongoose from 'mongoose';

const Schema = mongoose.Schema;

interface WarningInterface extends mongoose.Document {
  givenBy: string;
  reason: string;
  timestamp: string;
  _id: string;
}

export interface GuildMemberInterface extends mongoose.Document {
  memberId: string;
  eventsAttended: number;
  warnings: mongoose.Types.DocumentArray<WarningInterface>;
};

interface GuildMemberModelInterface extends mongoose.Model<GuildMemberInterface> {
  findOneOrCreate(findParams: any, createParams: any) : Promise<GuildMemberInterface>
}

const WarningSchema = new Schema({
  reason: { type: String, required: true },
  givenBy: { type: String, required: true },
  timestamp: { type: Date, default: Date.now, required: true }
});

const GuildMemberSchema = new Schema({
  memberId: { type: String, required: true },
  eventsAttended: { type: Number, required: true },
  warnings: [WarningSchema]
});

GuildMemberSchema.static('findOneOrCreate', async function (findParams, createParams) {
  const record = await GuildMember.findOne(findParams);
  if (record) return record;

  return new GuildMember(createParams).save();
});

const GuildMember = mongoose.model<GuildMemberInterface, GuildMemberModelInterface>('GuildMember', GuildMemberSchema);

export default GuildMember;
