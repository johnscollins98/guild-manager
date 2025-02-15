import { WarningType } from './warning-type';

export interface WarningDTO {
  id: number;
  reason: string;
  givenBy: string;
  givenTo: string;
  timestamp: Date;
  type: WarningType;
}
