import { APIGuildScheduledEvent, GuildScheduledEventRecurrenceRuleFrequency } from 'discord.js';
import markdownTable from 'markdown-table';
import { Service } from 'typedi';
import { DayOfWeek, daysOfWeek } from '../../dtos';
import { DiscordApiFactory } from '../discord/api-factory';
import { IDiscordGuildApi } from '../discord/guild-api';

const daysOfWeekExcludingDynamic = daysOfWeek.filter(
  (day: DayOfWeek): day is Exclude<DayOfWeek, 'Dynamic'> => day !== 'Dynamic'
);

@Service()
export class EventTableGenerator {
  private readonly guildApi: IDiscordGuildApi;

  constructor(discordApiFactory: DiscordApiFactory) {
    this.guildApi = discordApiFactory.guildApi();
  }

  async generateEventsTableMd() {
    const events = await this.guildApi.getEvents();

    const weeklyOnly = events.filter(e => {
      return (
        e.recurrence_rule &&
        e.recurrence_rule.frequency === GuildScheduledEventRecurrenceRuleFrequency.Weekly
      );
    });

    const eventsByDay = this.getEventsByDay(weeklyOnly);
    const maxNumEvents = Object.values(eventsByDay).reduce(
      (max, events) => Math.max(max, events.length),
      0
    );

    const tableArray: string[][] = [[...daysOfWeekExcludingDynamic]];

    for (let i = 0; i < maxNumEvents; i++) {
      tableArray.push(
        daysOfWeekExcludingDynamic.map(d => {
          const event = eventsByDay[d][i];
          const timeClarification =
            event?.recurrence_rule?.interval !== 1
              ? ` (Every ${event?.recurrence_rule?.interval} weeks)`
              : '';
          return event
            ? `**${event.name}**<br/>${this.generateStartTimeLink(event)}${timeClarification}`
            : '-';
        })
      );
    }

    return markdownTable(tableArray);
  }

  private generateStartTimeLink(event: APIGuildScheduledEvent): string {
    if (!event.scheduled_start_time) {
      return '-';
    }

    return this.generateLink(
      `${new Date(event.scheduled_start_time).toLocaleTimeString(undefined, { timeZone: 'UTC', timeZoneName: 'short', hour: '2-digit', minute: '2-digit' })}`,
      this.generateStartTimeUrl(event)
    );
  }

  private generateLink(text: string, url: string): string {
    return `[${text}](${url})`;
  }

  private generateStartTimeUrl(event: APIGuildScheduledEvent): string {
    return `https://dateful.com/eventlink/e/?iso=${encodeURIComponent(event.scheduled_start_time)}&title=${encodeURIComponent(event.name)}`;
  }

  private getEventsByDay(
    events: APIGuildScheduledEvent[]
  ): Record<DayOfWeek, APIGuildScheduledEvent[]> {
    return Object.fromEntries(
      daysOfWeekExcludingDynamic.map((day, i) => [
        day,
        events
          .filter(e => {
            return (
              e.recurrence_rule?.by_weekday?.some(v => v === i) ||
              e.recurrence_rule?.by_n_weekday?.some(v => v.day === i)
            );
          })
          .sort((a, b) => {
            const dateB = new Date(b.scheduled_start_time).valueOf() ?? 0;
            const dateA = new Date(a.scheduled_start_time).valueOf() ?? 0;

            return dateA - dateB;
          })
      ])
    ) as Record<DayOfWeek, APIGuildScheduledEvent[]>;
  }
}
