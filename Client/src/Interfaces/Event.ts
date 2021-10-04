export default interface Event {
  [key: string]: string | undefined;
  title: string;
  day: string;
  startTime: string;
  duration: string;
  leaderId: string;
  _id?: string | undefined;
}
