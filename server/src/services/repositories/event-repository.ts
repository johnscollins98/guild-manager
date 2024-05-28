import { Service } from 'typedi';
import { FindOptionsWhere } from 'typeorm';
import { dataSource } from '../../dataSource';
import { DayOfWeek } from '../../dtos';
import { Event } from '../../models/event.model';
import { BaseRepository } from './base-repository';

@Service()
export class EventRepository extends BaseRepository<Event> {
  constructor() {
    super(dataSource.getRepository(Event));
  }

  async getEventsOnADay(day: DayOfWeek, options?: FindOptionsWhere<Event>): Promise<Event[]> {
    return await this.repo.findBy({ day, ...options });
  }
}
