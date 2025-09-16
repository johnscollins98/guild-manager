import { ChatInputCommandInteraction, SlashCommandBuilder } from 'discord.js';
import { Service } from 'typedi';
import { Permission } from '../../../dtos';
import { EventEmbedCreator } from '../../../services/discord/event-embed-creator';
import { Command } from '../../command-gatherer';

@Service()
export default class EventsListCommand implements Command {
  public readonly name: string;
  constructor(private readonly embedCreator: EventEmbedCreator) {
    this.name = 'events-list';
  }

  async getConfig() {
    return new SlashCommandBuilder().setName(this.name).setDescription('List all events');
  }

  getRequiredPermissions(): Permission[] {
    return [];
  }

  async execute(interaction: ChatInputCommandInteraction) {
    const embeds = await this.embedCreator.createEmbeds();
    interaction.editReply(embeds);
  }
}
