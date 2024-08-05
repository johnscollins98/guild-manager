import { Service } from 'typedi';
import { config } from '../../config';
import { DiscordController } from '../../controllers/discord-controller';
import { EventPostSettingsRepository } from '../repositories/event-post-settings-repository';

@Service()
export class EventUpdater {
  constructor(
    private readonly discordController: DiscordController,
    private readonly eventSettingsRepo: EventPostSettingsRepository
  ) {}

  updateEventsEvery(timestepMs: number) {
    return setInterval(async () => {
      const eventSettings = await this.eventSettingsRepo.findOrCreateByGuildId(
        config.discordGuildId
      );
      if (eventSettings.editMessages) {
        console.log('Updating event posts');
        await this.discordController.postEventUpdates();
      } else {
        console.log('Skipping event post update');
      }
    }, timestepMs);
  }
}
