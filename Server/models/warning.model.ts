import mongoose from 'mongoose';
import Warning from '../interfaces/warning.interface';

const Schema = mongoose.Schema;

const WarningSchema = new Schema<Warning>({
  reason: { type: String, required: true },
  givenBy: { type: String, required: true },
  givenTo: { type: String, required: true },
  timestamp: { type: Date, default: Date.now, required: true }
});

const Warning = mongoose.model<Warning>('Warning', WarningSchema);

export default Warning;
