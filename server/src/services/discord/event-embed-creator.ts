import { Service } from 'typedi';
import { DayOfWeek, DiscordEmbed } from '../../dtos';
import { Event } from '../../models/event.model';

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
  createEmbed(day: string, events: Event[]): DiscordEmbed {
    return {
      color: 3447003,
      title: `${day} Events`,
      fields: events.map((event, i) => {
        return {
          name: `\u200b${i !== 0 ? '\n' : ''}📅 **${event.title}**`,
          value: `⏰ ${
            event.startTime ? this.generateTimestamp(event) : 'TBD'
          }${`\u200b\u3000`.repeat(15)}\n⏳ ${event.duration}\n👑 <@${event.leaderId}>`
        };
      })
    };
  }

  private generateTimestamp(event: Event): string {
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
