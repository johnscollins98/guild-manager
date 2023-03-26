import { Service } from 'typedi';
import { Event } from '../../models/event.model';
import { EventRepository } from '../repositories/event.repository';
import markdownTable from 'markdown-table';

@Service()
export class EventTableGenerator {
  constructor(private readonly eventRepo: EventRepository) {}

  async generateEventsTableMd() {
    const events = await this.eventRepo.getAll();
    const daysOfWeek = [
      'Monday',
      'Tuesday',
      'Wednesday',
      'Thursday',
      'Friday',
      'Saturday',
      'Sunday'
    ];

    const eventsByDay = this.getEventsByDay(events, daysOfWeek);
    const maxNumEvents = Object.values(eventsByDay).reduce(
      (max, events) => Math.max(max, events.length),
      0
    );

    const tableArray: string[][] = [daysOfWeek];
    for (let i = 0; i < maxNumEvents; i++) {
      tableArray.push(daysOfWeek.map(d => eventsByDay[d][i]?.title || '-'));
      tableArray.push(
        daysOfWeek.map(d =>
          eventsByDay[d][i] ? this.generateStartTimeLink(eventsByDay[d][i]) : '-'
        )
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

  private getEventsByDay(events: Event[], days: string[]): { [key: string]: Event[] } {
    return Object.fromEntries(days.map(day => [day, events.filter(e => e.day === day)]));
  }
}
