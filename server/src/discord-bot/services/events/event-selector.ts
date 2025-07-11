import { SelectMenuComponentOptionData } from 'discord.js';
import { Service } from 'typedi';
import { daysOfWeek } from '../../../dtos';
import { DiscordApiFactory } from '../../../services/discord/api-factory';
import { IDiscordGuildApi } from '../../../services/discord/guild-api';
import { EventRepository } from '../../../services/repositories/event-repository';
import { EditorHelpers } from '../editor-helpers';
import { respond, RespondableInteraction } from '../respond';

@Service()
export class EventSelector {
  private readonly discordGuildApi: IDiscordGuildApi;
  constructor(
    private readonly eventsRepo: EventRepository,
    private readonly editorHelpers: EditorHelpers,
    discordApiFactory: DiscordApiFactory
  ) {
    this.discordGuildApi = discordApiFactory.guildApi();
  }

  async selectEvent(interaction: RespondableInteraction) {
    const events = await this.eventsRepo.getAll();

    if (events.length === 0) {
      respond(interaction, { content: 'There are no events.' });
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

    const eventOptions: SelectMenuComponentOptionData[] = sortedEvents.map(event => {
      const leaderMember = members.find(m => m.user?.id && m.user.id === event.leaderId);
      const leaderName =
        leaderMember?.nick ??
        leaderMember?.user?.global_name ??
        leaderMember?.user?.username ??
        'Unknown User';

      return {
        label: event.title,
        description: `Run on ${event.day} by ${leaderName}`,
        value: event.id.toString()
      };
    });

    return await this.editorHelpers.fetchFromList(
      interaction,
      eventOptions,
      'event-id',
      'Please select an event'
    );
  }
}
