import { LateLogNotification } from './notification';

export interface LateLogDto {
  id: number;
  givenTo: string;
  givenBy: string;
  timestamp: Date;
  notification: LateLogNotification;
}
