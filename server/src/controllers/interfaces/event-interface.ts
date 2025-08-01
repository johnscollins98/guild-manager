import { DayOfWeek, EventCreateDTO, EventDTO, EventSettingsDTO } from '../../dtos';
import { User } from './user';

export interface IEventsController {
  getGuildSettings(): Promise<EventSettingsDTO>;
  getAll(): Promise<EventDTO[]>;
  get(id: number): Promise<EventDTO | null>;
  getEventsOnADay(day: DayOfWeek): Promise<EventDTO[]>;
  delete(id: number, user?: User): Promise<void>;
  create(event: EventCreateDTO, user?: User): Promise<EventDTO>;
  update(id: number, event: EventCreateDTO, user?: User): Promise<EventDTO | null>;
}
