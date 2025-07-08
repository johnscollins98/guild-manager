import {
  ActionRowBuilder,
  ChatInputCommandInteraction,
  ComponentType,
  InteractionEditReplyOptions,
  SlashCommandBuilder,
  StringSelectMenuBuilder,
  StringSelectMenuOptionBuilder
} from 'discord.js';
import { Service } from 'typedi';
import { daysOfWeek, Permission } from '../../../dtos';
import { DiscordApiFactory } from '../../../services/discord/api-factory';
import { IDiscordGuildApi } from '../../../services/discord/guild-api';
import { PaginatedEmbedCreator } from '../../../services/discord/paginated-embed-creator';
import { EventRepository } from '../../../services/repositories/event-repository';
import { Command } from '../../command-factory';

@Service()
export default class EventsDeleteCommand implements Command {
  public readonly name: string;

  private readonly discordGuildApi: IDiscordGuildApi;

  constructor(
    private readonly eventsRepo: EventRepository,
    private readonly paginatedEmbedsCreator: PaginatedEmbedCreator,
    discordApiFactory: DiscordApiFactory
  ) {
    this.name = 'events-delete';
    this.discordGuildApi = discordApiFactory.guildApi();
  }

  async getConfig() {
    return new SlashCommandBuilder().setName(this.name).setDescription('Delete an event');
  }

  getRequiredPermissions(): Permission[] {
    return ['EVENTS'];
  }

  async execute(interaction: ChatInputCommandInteraction) {
    const events = await this.eventsRepo.getAll();

    if (events.length === 0) {
      interaction.editReply('There are no events to delete.');
      return;
    }

    const members = await this.discordGuildApi.getMembers();

    const sortedEvents = events.sort((a, b) => {
      const dateSort = daysOfWeek.indexOf(a.day) - daysOfWeek.indexOf(b.day);
      if (dateSort !== 0) return dateSort;

      const parseTime = (startTime: string) => {
        return Date.parse(`1970/01/01 ${startTime}`);
      };

      const aTime = parseTime(a.startTime);
      const bTime = parseTime(b.startTime);

      return aTime - bTime;
    });

    const eventOptions = sortedEvents.map(event => {
      const leaderMember = members.find(m => m.user?.id && m.user.id === event.leaderId);
      const leaderName =
        leaderMember?.nick ??
        leaderMember?.user?.global_name ??
        leaderMember?.user?.username ??
        'Unknown User';

      return new StringSelectMenuOptionBuilder()
        .setLabel(event.title)
        .setDescription(`Run on ${event.day} by ${leaderName}`)
        .setValue(`${event.id}`);
    });

    const numEventsPerPage = 25;

    const pages: InteractionEditReplyOptions[] = [];

    for (let i = 0; i < eventOptions.length; i += numEventsPerPage) {
      const eventSelectMenu = new StringSelectMenuBuilder()
        .setCustomId('event-id')
        .setPlaceholder('Select an event to delete')
        .addOptions(eventOptions.slice(i, i + numEventsPerPage));

      const eventAction = new ActionRowBuilder<StringSelectMenuBuilder>().addComponents(
        eventSelectMenu
      );

      const page = {
        content: 'Please select an event to delete',
        components: [eventAction]
      };

      pages.push(page);
    }

    const message = await this.paginatedEmbedsCreator.create(interaction, pages);

    const collector = message.createMessageComponentCollector({
      componentType: ComponentType.StringSelect,
      time: 60_000
    });

    collector.on('collect', async i => {
      try {
        const eventId = i.values[0];
        if (!eventId) {
          throw new Error('No event id provided.');
        }

        const deleted = await this.eventsRepo.delete(parseInt(eventId));

        if (deleted) {
          i.update({ content: 'Successfully deleted event.', components: [] });
        } else {
          i.update({ content: 'Failed to delete event, please try again.', components: [] });
        }
      } catch (err) {
        console.error(err);
        interaction.editReply({
          content: 'The command did not complete. Please try again',
          components: []
        });
      }
    });
  }
}
