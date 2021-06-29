export default interface Warning {
  givenBy: string;
  reason: string;
  timestamp: string;
  _id: string;
}

export interface WarningPost {
  reason: string;
}
