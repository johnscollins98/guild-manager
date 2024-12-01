import { LateLogNotification } from './notification';

export interface LateLogCreateDto {
  givenTo: string;
  notification: LateLogNotification;
}
