const mongoose = require('mongoose');

const Schema = mongoose.Schema;

const PointLogSchema = new Schema(
  {
    givenBy: { type: String, required: true },
    givenTo: { type: String, required: true },
    newVal: { type: Number, required: true },
  },
  { capped: 10000 }
);

const PointLog = mongoose.model('PointLog', PointLogSchema);

module.exports = PointLog;
