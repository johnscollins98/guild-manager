import { Service } from 'typedi';
import { Repository } from 'typeorm';
import { InjectRepository } from 'typeorm-typedi-extensions';
import { Event } from '../../models/event.model';
import { BaseRepository } from './base.repository';

@Service()
export class EventRepository extends BaseRepository<Event> {
  constructor(@InjectRepository(Event) eventRepo: Repository<Event>) {
    super(eventRepo);
  }

  async getEventsOnADay(day: string): Promise<Event[]> {
    return await this.repo.find({ day });
  }
}
