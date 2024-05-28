import { DayOfWeek } from './days';

export interface EventCreateDTO {
  title: string;
  day: DayOfWeek;
  startTime: string;
  duration: string;
  leaderId: string;
  ignore: boolean;
}
