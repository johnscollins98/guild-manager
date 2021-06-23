const mongoose = require('mongoose');

const Schema = mongoose.Schema;

const WarningSchema = new Schema({
  reason: { type: String, required: true },
  givenBy: { type: String, required: true },
  timestamp: { type: Date, default: Date.now, required: true },
});

const GuildMemberSchema = new Schema({
  memberId: { type: String, required: true },
  eventsAttended: { type: Number, required: true },
  warnings: [WarningSchema],
});

GuildMemberSchema.static(
  'findOneOrCreate',
  async function (findParams, createParams) {
    const record = await GuildMember.findOne(findParams);
    if (record) return record;

    return new GuildMember(createParams).save();
  }
);

const GuildMember = mongoose.model('GuildMember', GuildMemberSchema);

module.exports = GuildMember;
