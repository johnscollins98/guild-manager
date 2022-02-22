export default interface Warning {
  reason: string;
  givenBy: string;
  givenTo: string;
  timestamp?: Date;
}