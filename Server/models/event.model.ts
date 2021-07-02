import mongoose from 'mongoose';
import Event from '../Interfaces/Event';

const Schema = mongoose.Schema;

const EventSchema = new Schema<Event>({
  title: { type: String, required: true },
  day: { type: String, required: true },
  startTime: { type: String, required: true },
  duration: { type: String, required: true },
  leaderId: { type: String, required: true }
});

const Event = mongoose.model<Event>('Event', EventSchema);

export default Event;
