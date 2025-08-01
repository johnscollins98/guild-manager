import { Service } from 'typedi';
import { FindOptionsWhere } from 'typeorm';
import { User } from '../../controllers/interfaces/user';
import { dataSource } from '../../dataSource';
import { DayOfWeek, EventCreateDTO } from '../../dtos';
import { Event } from '../../models/event.model';
import { AuditLogRepository } from './audit-log-repository';
import { BaseRepository } from './base-repository';

@Service()
export class EventRepository extends BaseRepository<Event> {
  constructor(private readonly auditLogRepo: AuditLogRepository) {
    super(dataSource.getRepository(Event));
  }

  async createAndLog(sourceUser: User, event: EventCreateDTO) {
    const res = await this.create(event);

    if (res) {
      await this.auditLogRepo.logEventCreate(sourceUser, res.id);
    }

    return res;
  }

  async updateAndLog(sourceUser: User, id: number, event: EventCreateDTO) {
    const res = await this.update(id, event);

    if (res) {
      await this.auditLogRepo.logEventUpdate(sourceUser, id);
    }

    return res;
  }

  async deletedAndLog(sourceUser: User, id: number) {
    const res = await this.delete(id);

    if (res) {
      await this.auditLogRepo.logEventRemove(sourceUser, id);
    }

    return res;
  }

  async getEventsOnADay(day: DayOfWeek, options?: FindOptionsWhere<Event>): Promise<Event[]> {
    return await this.repo.findBy({ day, ...options });
  }
}
