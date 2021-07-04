export default interface IPointLogEntry {
  givenBy: string;
  givenTo: string;
  oldVal: number;
  newVal: number;
  timestamp: Date;
}
