import { WarningType } from './warning-type';

export interface WarningCreateDTO {
  reason: string;
  givenTo: string;
  type: WarningType;
}
