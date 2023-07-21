import markdownTable from 'markdown-table';
import { Service } from 'typedi';
import { Event } from '../../models/event.model';
import { EventRepository } from '../repositories/event-repository';

const daysOfWeek = [
  'Monday',
  'Tuesday',
  'Wednesday',
  'Thursday',
  'Friday',
  'Saturday',
  'Sunday'
] as const;

type DaysOfWeek = typeof daysOfWeek;
type DayOfWeek = DaysOfWeek[number];

@Service()
export class EventTableGenerator {
  constructor(private readonly eventRepo: EventRepository) {}

  async generateEventsTableMd() {
    const events = await this.eventRepo.getAll();

    const eventsByDay = this.getEventsByDay(events, daysOfWeek);
    const maxNumEvents = Object.values(eventsByDay).reduce(
      (max, events) => Math.max(max, events.length),
      0
    );

    const tableArray: string[][] = [[...daysOfWeek]];
    for (let i = 0; i < maxNumEvents; i++) {
      tableArray.push(daysOfWeek.map(d => eventsByDay[d][i]?.title || '-'));
      tableArray.push(
        daysOfWeek.map(d => {
          const event = eventsByDay[d][i];
          return event ? this.generateStartTimeLink(event) : '-';
        })
      );
    }

    return markdownTable(tableArray);
  }

  private generateStartTimeLink(event: Event): string {
    return this.generateLink(`${event.startTime} UTC`, this.generateStartTimeUrl(event));
  }

  private generateLink(text: string, url: string): string {
    return `[${text}](${url})`;
  }

  private generateStartTimeUrl(event: Event): string {
    return encodeURI(
      `https://dateful.com/eventlink/e/?t=${event.startTime}&tz=UTC&d=Next${event.day}&title=${event.title}`
    );
  }

  private getEventsByDay(events: Event[], days: DaysOfWeek): Record<DayOfWeek, Event[]> {
    return Object.fromEntries(days.map(day => [day, events.filter(e => e.day === day)])) as Record<
      DayOfWeek,
      Event[]
    >;
  }
}
