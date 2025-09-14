import { APIGuildScheduledEvent, MessageEditOptions } from 'discord.js';
import { Service } from 'typedi';
import { config } from '../../config';
import { DayOfWeek } from '../../dtos';
import { Event } from '../../models/event.model';
import { DiscordApiFactory } from './api-factory';
import { IDiscordGuildApi } from './guild-api';

const dayOfWeekToIndex: Record<DayOfWeek, number> = {
  Dynamic: 1,
  Sunday: 0,
  Monday: 1,
  Tuesday: 2,
  Wednesday: 3,
  Thursday: 4,
  Friday: 5,
  Saturday: 6
};

@Service()
export class EventEmbedCreator {
  private readonly guildApi: IDiscordGuildApi;
  constructor(discordApiFactory: DiscordApiFactory) {
    this.guildApi = discordApiFactory.guildApi();
  }

  async createEmbeds(): Promise<MessageEditOptions> {
    const events = await this.guildApi.getEvents();

    const in7Days = new Date();
    in7Days.setDate(in7Days.getDate() + 7);
    const [upcoming, later] = events.reduce(
      ([u, l], event) => {
        const isUpcoming = new Date(event.scheduled_start_time).valueOf() <= in7Days.valueOf();
        return isUpcoming ? [[...u, event], l] : [u, [...l, event]];
      },
      [[], []] as [APIGuildScheduledEvent[], APIGuildScheduledEvent[]]
    );

    const upcomingMessage = this.eventListToMessage(upcoming);
    const laterMessage = this.eventListToMessage(later);

    const laterMessagesPart = laterMessage ? `\n\n**Events coming later:**\n${laterMessage}` : '';

    return {
      content: `**Upcoming Sunspear Order Events:**\n${upcomingMessage}${laterMessagesPart}\n\n~~--------------------------------------------~~`,
      embeds: []
    };
  }

  public createEmbed(day: DayOfWeek, events: Omit<Event, 'id'>[]) {
    const fields = events.map(event => ({
      name: `\u200b\n📅 **${event.title}**`,
      value: `⏰ ${
        event.startTime ? this.generateTimestamp(event) : ''
      }\n⏳ ${event.duration}\n👑 <@${event.leaderId}>${event.ignore ? `\n*Ignored*` : ''}`
    }));

    if (fields.length === 0) {
      fields.push({ name: '', value: 'None :(' });
    }

    return {
      color: 3447003,
      title: `${day} Events`,
      fields,
      footer: { text: '\u200b'.padEnd(150) + '\u200b' }
    };
  }

  private generateTimestamp(event: Omit<Event, 'id'>): string {
    const dayIndex = dayOfWeekToIndex[event.day];

    const today = new Date();
    today.setDate(today.getDate() + ((dayIndex + (7 - today.getDay())) % 7));

    const time = new Date(`2020-01-01T${event.startTime}:00Z`);
    today.setUTCHours(time.getUTCHours());
    today.setUTCMinutes(time.getUTCMinutes());
    today.setUTCSeconds(0);

    return `<t:${Math.floor(today.valueOf() / 1000)}:t>`;
  }

  private eventListToMessage(events: APIGuildScheduledEvent[]) {
    return events
      .sort((a, b) => {
        const bDate = new Date(b.scheduled_start_time);
        const aDate = new Date(a.scheduled_start_time);

        return aDate.valueOf() - bDate.valueOf();
      })
      .map(e => {
        const name = e.name;
        const timestamp = new Date(e.scheduled_start_time);

        return `* [${name}](https://discord.com/events/${config.discordGuildId}/${e.id}) (<t:${Math.floor(timestamp.valueOf() / 1000)}:F>)`;
      })
      .join('\n');
  }
}
