import { WarningType } from './warning-type';

export interface WarningCreateDTO {
  reason: string;
  givenTo: string;
  type: WarningType;
  lastUpdatedBy?: string;
  givenBy?: string;
  lastUpdatedTimestamp?: Date;
  timestamp?: Date;
  id?: number;
}
