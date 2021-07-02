import mongoose from 'mongoose';

const Schema = mongoose.Schema;

const PointLogSchema = new Schema(
  {
    givenBy: { type: String, required: true },
    givenTo: { type: String, required: true },
    oldVal: { type: Number, required: true },
    newVal: { type: Number, required: true },
    timestamp: { type: Date, default: Date.now, required: true }
  },
  { capped: 10000 }
);

const PointLog = mongoose.model('PointLog', PointLogSchema);

module.exports = PointLog;
