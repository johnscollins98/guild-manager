import { ChatInputCommandInteraction, SlashCommandBuilder } from 'discord.js';
import { Service } from 'typedi';
import { config } from '../../../config';
import { DiscordController } from '../../../controllers/discord-controller';
import { Permission } from '../../../dtos';
import { EventPostSettingsRepository } from '../../../services/repositories/event-post-settings-repository';
import { Command } from '../../command-gatherer';

@Service()
export default class EventsCreateCommand implements Command {
  public readonly name: string;
  constructor(
    private readonly eventSettingsRepo: EventPostSettingsRepository,
    private readonly discordController: DiscordController
  ) {
    this.name = 'events-post';
  }

  async getConfig() {
    return new SlashCommandBuilder()
      .setName(this.name)
      .setDescription('Post events using saved settings');
  }

  async execute(interaction: ChatInputCommandInteraction) {
    const settings = await this.eventSettingsRepo.findOrCreateByGuildId(config.discordGuildId);

    if (Object.values(settings).some(v => !v)) {
      await interaction.editReply('Aborted post as not all settings are set.');
    } else {
      await interaction.editReply('Posting...');
      await this.discordController.postEventUpdates();
      await interaction.editReply('Done!');
    }
  }

  getRequiredPermissions(): Permission[] {
    return ['EVENTS'];
  }
}
