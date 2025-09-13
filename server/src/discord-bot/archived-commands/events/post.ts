import { ChatInputCommandInteraction, SlashCommandBuilder } from 'discord.js';
import { Service } from 'typedi';
import { Permission } from '../../../dtos';
import { Command } from '../../command-gatherer';
import { EventPoster } from '../../services/events/post-updated-events';

@Service()
export default class EventsCreateCommand implements Command {
  public readonly name: string;
  constructor(private readonly updatePoster: EventPoster) {
    this.name = 'events-post';
  }

  async getConfig() {
    return new SlashCommandBuilder()
      .setName(this.name)
      .setDescription('Post events using saved settings');
  }

  async execute(interaction: ChatInputCommandInteraction) {
    await this.updatePoster.postEventSequence(interaction, '');
  }

  getRequiredPermissions(): Permission[] {
    return ['EVENTS'];
  }
}
