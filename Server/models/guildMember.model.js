const mongoose = require("mongoose");

const Schema = mongoose.Schema;

const GuildMemberSchema = new Schema({
  memberId: { type: String, required: true },
  eventsAttended: { type: Number, required: true },
});

const GuildMember = mongoose.model("GuildMember", GuildMemberSchema);

module.exports = GuildMember;
