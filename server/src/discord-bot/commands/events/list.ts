import { ChatInputCommandInteraction, EmbedBuilder, SlashCommandBuilder } from 'discord.js';
import { Service } from 'typedi';
import { daysOfWeek, Permission } from '../../../dtos';
import { EventEmbedCreator } from '../../../services/discord/event-embed-creator';
import { EventRepository } from '../../../services/repositories/event-repository';
import { Command } from '../../command-factory';

@Service()
export default class EventsListCommand implements Command {
  public readonly name: string;
  constructor(
    private readonly eventRepo: EventRepository,
    private readonly embedCreator: EventEmbedCreator
  ) {
    this.name = 'events-list';
  }

  async getConfig() {
    return new SlashCommandBuilder().setName(this.name).setDescription('List all events');
  }

  getRequiredPermissions(): Permission[] {
    return [];
  }

  async execute(interaction: ChatInputCommandInteraction) {
    const embeds = await Promise.all(
      daysOfWeek.map(async d => {
        const events = await this.eventRepo.getEventsOnADay(d, { ignore: false });

        const parseTime = (str: string) => {
          return Date.parse(`1970/01/01 ${str}`);
        };

        const sorted = events.sort((a, b) => {
          const aTime = parseTime(a.startTime);
          const bTime = parseTime(b.startTime);

          return aTime - bTime;
        });

        const embedData = this.embedCreator.createEmbed(d, sorted);
        const embedBuilder = new EmbedBuilder(embedData);
        return embedBuilder;
      })
    );

    interaction.editReply({ embeds });
  }
}
