import mongoose, { Document, FilterQuery } from 'mongoose';
import MemberInfo from '../Interfaces/MemberInfo';
import Warning from '../Interfaces/Warning';

const Schema = mongoose.Schema;

interface GuildMemberModelInterface extends mongoose.Model<MemberInfo> {
  findOneOrCreate(
    findParams: FilterQuery<MemberInfo>,
    createParams: MemberInfo
  ): Promise<MemberInfo & Document<any, any>>;
}

const WarningSchema = new Schema<Warning>({
  reason: { type: String, required: true },
  givenBy: { type: String, required: true },
  timestamp: { type: Date, default: Date.now, required: true }
});

const GuildMemberSchema = new Schema<MemberInfo>({
  memberId: { type: String, required: true },
  eventsAttended: { type: Number, required: true },
  warnings: [WarningSchema]
});

GuildMemberSchema.static(
  'findOneOrCreate',

  async function (
    findParams: FilterQuery<MemberInfo>,
    createParams: MemberInfo
  ): Promise<MemberInfo & Document<any, any>> {
    const record = await GuildMember.findOne(findParams);
    if (record) return record;

    return new GuildMember(createParams).save();
  }
);

const GuildMember = mongoose.model<MemberInfo, GuildMemberModelInterface>(
  'GuildMember',
  GuildMemberSchema
);

export default GuildMember;
