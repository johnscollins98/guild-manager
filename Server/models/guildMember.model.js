const mongoose = require('mongoose');

const Schema = mongoose.Schema;

const GuildMemberSchema = new Schema({
  memberId: { type: String, required: true },
  eventsAttended: { type: Number, required: true },
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
