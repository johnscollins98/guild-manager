import {
  ChatInputCommandInteraction,
  EmbedBuilder,
  PermissionFlagsBits,
  SlashCommandBuilder
} from 'discord.js';
import { Service } from 'typedi';
import { daysOfWeek } from '../../dtos';
import { EventEmbedCreator } from '../../services/discord/event-embed-creator';
import { EventRepository } from '../../services/repositories/event-repository';
import { Command } from '../command-factory';

@Service()
export class EventsListCommand implements Command {
  public readonly name: string;
  constructor(
    private readonly eventRepo: EventRepository,
    private readonly embedCreator: EventEmbedCreator
  ) {
    this.name = 'events-list';
  }

  async getConfig() {
    return new SlashCommandBuilder()
      .setName(this.name)
      .setDescription('List all events')
      .setDefaultMemberPermissions(PermissionFlagsBits.Administrator);
  }

  async execute(interaction: ChatInputCommandInteraction) {
    const embeds = await Promise.all(
      daysOfWeek.map(async d => {
        const events = await this.eventRepo.getEventsOnADay(d, { ignore: false });
        const embedData = this.embedCreator.createEmbed(d, events);
        const embedBuilder = new EmbedBuilder(embedData);
        return embedBuilder;
      })
    );

    interaction.editReply({ embeds });
  }
}
