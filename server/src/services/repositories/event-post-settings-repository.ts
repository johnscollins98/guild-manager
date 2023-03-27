import { Service } from 'typedi';
import { Repository } from 'typeorm';
import { InjectRepository } from 'typeorm-typedi-extensions';
import { EventPostSettings } from '../../models/event-post-settings.model';
import { BaseRepository } from './base-repository';

@Service()
export class EventPostSettingsRepository extends BaseRepository<EventPostSettings> {
  constructor(
    @InjectRepository(EventPostSettings) eventPostSettingsRepo: Repository<EventPostSettings>
  ) {
    super(eventPostSettingsRepo);
  }

  async findOrCreateByGuildId(guildId: string): Promise<EventPostSettings> {
    const result = await this.repo.findOne({ guildId });
    if (result) {
      return result;
    } else {
      return await this.repo.save({ guildId });
    }
  }

  async updateByGuildId(guildId: string, updated: EventPostSettings): Promise<EventPostSettings> {
    await this.repo.update({ guildId }, updated);
    return this.findOrCreateByGuildId(guildId);
  }
}

