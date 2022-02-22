import mongoose from 'mongoose';
import IEvent from '../interfaces/event.interface';

const Schema = mongoose.Schema;

const EventSchema = new Schema<IEvent>({
  title: { type: String, required: true },
  day: { type: String, required: true },
  startTime: { type: String, required: true },
  duration: { type: String, required: true },
  leaderId: { type: String, required: true }
});

const Event = mongoose.model<IEvent>('Event', EventSchema);

export default Event;
