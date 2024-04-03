import { Service } from 'typedi';
import { Event } from '../../models/event.model';
import { dataSource } from '../../server';
import { BaseRepository } from './base-repository';

@Service()
export class EventRepository extends BaseRepository<Event> {
  constructor() {
    super(dataSource.getMongoRepository(Event));
  }

  async getEventsOnADay(day: string): Promise<Event[]> {
    return await this.repo.find({ day });
  }
}
