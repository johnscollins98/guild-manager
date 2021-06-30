export default interface PointLogEntry {
  _id: string;
  givenBy: string;
  givenTo: string;
  oldVal: number;
  newVal: number;
  __v: number;
  timestamp: string;
}
