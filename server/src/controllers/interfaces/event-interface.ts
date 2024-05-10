import { DayOfWeek, EventCreateDTO, EventDTO, EventSettingsDTO } from '../../dtos';

export interface IEventsController {
  getGuildSettings(): Promise<EventSettingsDTO>;
  getAll(): Promise<EventDTO[]>;
  get(id: number): Promise<EventDTO | null>;
  getEventsOnADay(day: DayOfWeek): Promise<EventDTO[]>;
  delete(id: number): Promise<void>;
  create(event: EventCreateDTO): Promise<EventDTO>;
  update(id: number, event: EventCreateDTO): Promise<EventDTO | null>;
}
