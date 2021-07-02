export default interface PointLogEntry {
  givenBy: string;
  givenTo: string;
  oldVal: number;
  newVal: number;
  timestamp: Date;
}
