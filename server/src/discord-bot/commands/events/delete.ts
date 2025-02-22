import {
  ActionRowBuilder,
  ChatInputCommandInteraction,
  SlashCommandBuilder,
  StringSelectMenuBuilder,
  StringSelectMenuOptionBuilder
} from 'discord.js';
import { Service } from 'typedi';
import { daysOfWeek, Permission } from '../../../dtos';
import { DiscordApiFactory } from '../../../services/discord/api-factory';
import { IDiscordGuildApi } from '../../../services/discord/guild-api';
import { EventRepository } from '../../../services/repositories/event-repository';
import { Command } from '../../command-factory';

@Service()
export default class EventsDeleteCommand implements Command {
  public readonly name: string;

  private readonly discordGuildApi: IDiscordGuildApi;

  constructor(
    private readonly eventsRepo: EventRepository,
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

    const eventSelectMenu = new StringSelectMenuBuilder()
      .setCustomId('event-id')
      .setPlaceholder('Select an event to delete')
      .addOptions(eventOptions);

    const eventAction = new ActionRowBuilder<StringSelectMenuBuilder>().addComponents(
      eventSelectMenu
    );

    const response = await interaction.editReply({
      content: 'Please select an event to delete',
      components: [eventAction]
    });

    try {
      const reply = await response.awaitMessageComponent({ time: 60_000 });

      if (!('values' in reply)) {
        throw new Error('No values in reply.');
      }

      const eventId = reply.values[0];
      if (!eventId) {
        throw new Error('No event id provided.');
      }

      const deleted = await this.eventsRepo.delete(parseInt(eventId));

      if (deleted) {
        reply.update({ content: 'Successfully deleted event.', components: [] });
      } else {
        reply.update({ content: 'Failed to delete event, please try again.', components: [] });
      }
    } catch (err) {
      console.error(err);
      interaction.editReply({
        content: 'The command did not complete. Please try again',
        components: []
      });
    }
  }
}
