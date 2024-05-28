import { DayOfWeek } from './days';

export interface EventDTO {
  id: number;
  title: string;
  day: DayOfWeek;
  startTime: string;
  duration: string;
  leaderId: string;
  ignore: boolean;
}
