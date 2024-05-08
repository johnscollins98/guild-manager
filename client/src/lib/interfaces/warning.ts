export default interface Warning {
  givenBy: string;
  givenTo: string;
  reason: string;
  timestamp: string;
  id: number;
}

export interface WarningPost {
  reason: string;
  givenTo: string;
}
