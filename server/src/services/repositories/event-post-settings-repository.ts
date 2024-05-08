import { Service } from 'typedi';
import { DeepPartial } from 'typeorm';
import { EventPostSettings } from '../../models/event-post-settings.model';
import { dataSource } from '../../server';
import { BaseRepository } from './base-repository';

@Service()
export class EventPostSettingsRepository extends BaseRepository<EventPostSettings> {
  constructor() {
    super(dataSource.getRepository(EventPostSettings));
  }

  async findOrCreateByGuildId(guildId: string): Promise<EventPostSettings> {
    const result = await this.repo.findOne({ where: { guildId } });
    if (result) {
      return result;
    } else {
      return await this.repo.save({ guildId });
    }
  }

  async updateByGuildId(
    guildId: string,
    updated: DeepPartial<EventPostSettings>
  ): Promise<EventPostSettings> {
    await this.repo.update({ guildId }, updated);
    return this.findOrCreateByGuildId(guildId);
  }
}
