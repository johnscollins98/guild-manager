import { Service } from 'typedi';
import { DayOfWeek } from '../../dtos';
import { Event } from '../../models/event.model';
import { dataSource } from '../../server';
import { BaseRepository } from './base-repository';

@Service()
export class EventRepository extends BaseRepository<Event> {
  constructor() {
    super(dataSource.getRepository(Event));
  }

  async getEventsOnADay(day: DayOfWeek): Promise<Event[]> {
    return await this.repo.findBy({ day });
  }
}
