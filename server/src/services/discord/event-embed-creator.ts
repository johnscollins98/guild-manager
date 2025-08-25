import { Service } from 'typedi';
import { DayOfWeek, daysOfWeek, DiscordEmbed } from '../../dtos';
import { Event } from '../../models/event.model';
import { EventRepository } from '../repositories/event-repository';

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
  constructor(private readonly eventsRepository: EventRepository) {}

  async createEmbeds(): Promise<DiscordEmbed[]> {
    const embeds = await Promise.all(
      daysOfWeek.map(async day => {
        const events = await this.eventsRepository.getEventsOnADay(day, { ignore: false });
        if (day === 'Dynamic' && events.length === 0) return null;

        const parseTime = (str: string) => {
          return Date.parse(`1970/01/01 ${str}`);
        };

        const sorted = events.sort((a, b) => {
          const aTime = parseTime(a.startTime);
          const bTime = parseTime(b.startTime);

          return aTime - bTime;
        });

        return this.createEmbed(day, sorted);
      })
    );

    return embeds.filter(e => e !== null);
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
}
