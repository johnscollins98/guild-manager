import { APIGuildScheduledEvent, MessageEditOptions, SnowflakeUtil } from 'discord.js';
import { Options, RRule, Weekday } from 'rrule';
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

type AdjustedEvent = APIGuildScheduledEvent & { effective_scheduled_start_time?: string };
type EventWithExceptions = APIGuildScheduledEvent & {
  guild_scheduled_event_exceptions?: { event_id?: string; event_exception_id: string }[];
};

@Service()
export class EventEmbedCreator {
  private readonly guildApi: IDiscordGuildApi;
  constructor(discordApiFactory: DiscordApiFactory) {
    this.guildApi = discordApiFactory.guildApi();
  }

  async createEmbeds(): Promise<MessageEditOptions> {
    const events = await this.guildApi.getEvents();
    const adjustedEvents = this.getEventsAfterExceptions(events as EventWithExceptions[]);

    const in7Days = new Date();
    in7Days.setDate(in7Days.getDate() + 7);
    const in7DaysNum = in7Days.valueOf();

    const in21Days = new Date();
    const in21DaysNum = in21Days.setDate(in21Days.getDate() + 21).valueOf();

    const [upcoming, later] = adjustedEvents.reduce(
      ([u, l], event) => {
        const eventDate = new Date(
          event.effective_scheduled_start_time ?? event.scheduled_start_time
        ).valueOf();
        const isUpcoming = eventDate <= in7DaysNum;

        if (isUpcoming) {
          return [[...u, event], l];
        }

        const isLater = eventDate <= in21DaysNum;

        if (isLater) {
          return [u, [...l, event]];
        }

        return [u, l];
      },
      [[], []] as [AdjustedEvent[], AdjustedEvent[]]
    );

    const upcomingMessage = this.eventListToMessage(upcoming);
    const laterMessage = this.eventListToMessage(later);

    const laterMessagesPart = laterMessage ? `\n\n**Events Coming Later:**\n${laterMessage}` : '';

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

  private eventListToMessage(events: AdjustedEvent[]) {
    return events
      .sort((a, b) => {
        const bDate = new Date(b.effective_scheduled_start_time ?? b.scheduled_start_time);
        const aDate = new Date(a.effective_scheduled_start_time ?? a.scheduled_start_time);

        return aDate.valueOf() - bDate.valueOf();
      })
      .map(e => {
        const name = e.name;
        const timestamp = new Date(e.effective_scheduled_start_time ?? e.scheduled_start_time);

        return `* [${name}](https://discord.com/events/${config.discordGuildId}/${e.id}) (<t:${Math.floor(timestamp.valueOf() / 1000)}:F>)`;
      })
      .join('\n');
  }

  private getEventsAfterExceptions(events: EventWithExceptions[]): AdjustedEvent[] {
    // For recurring series: parse the RRULE (if present) and find the next
    // occurrence (on or after the scheduled start) that is NOT listed in
    // `guild_scheduled_event_exceptions`. If there's no recurrence, only keep
    // the event if its scheduled start isn't cancelled.
    return events
      .map(e => {
        const exceptions = e.guild_scheduled_event_exceptions;

        const exceptionTimestamps = new Set<number>(
          (exceptions || []).map(ex => SnowflakeUtil.timestampFrom(ex.event_exception_id))
        );

        const originalDate = new Date(e.scheduled_start_time);
        let occurrenceMs: number | null = null;

        const recurrenceRule = e.recurrence_rule;

        if (!recurrenceRule) {
          // Not recurring: keep if not cancelled for its scheduled start
          if (exceptionTimestamps.has(originalDate.valueOf())) return null;
          occurrenceMs = originalDate.valueOf();
        } else {
          try {
            const freq =
              recurrenceRule.frequency === 0
                ? RRule.YEARLY
                : recurrenceRule.frequency === 1
                  ? RRule.MONTHLY
                  : recurrenceRule.frequency === 2
                    ? RRule.WEEKLY
                    : RRule.DAILY;

            const wkdayMap = [RRule.MO, RRule.TU, RRule.WE, RRule.TH, RRule.FR, RRule.SA, RRule.SU];

            const options: Partial<Options> = {
              freq,
              interval: recurrenceRule.interval ?? 1,
              dtstart: new Date(recurrenceRule.start)
            };

            if (recurrenceRule.end) options.until = new Date(recurrenceRule.end);
            if (recurrenceRule.count != null) options.count = recurrenceRule.count;
            if (recurrenceRule.by_month) options.bymonth = recurrenceRule.by_month;
            if (recurrenceRule.by_month_day) options.bymonthday = recurrenceRule.by_month_day;
            if (recurrenceRule.by_year_day) options.byyearday = recurrenceRule.by_year_day;

            const byweekday: Weekday[] = [];
            if (recurrenceRule.by_weekday) {
              for (const d of recurrenceRule.by_weekday) {
                const wd = wkdayMap[d];
                if (wd) byweekday.push(wd);
              }
            }

            if (recurrenceRule.by_n_weekday) {
              for (const nwd of recurrenceRule.by_n_weekday) {
                const wd = wkdayMap[nwd.day];
                if (wd) byweekday.push(wd.nth(nwd.n));
              }
            }

            if (byweekday.length) options.byweekday = byweekday;

            const rule = new RRule(options);

            // Iterate occurrences starting at dtstart until we find one
            // that's not in the exceptions set. Limit iterations to avoid
            // infinite loops on malformed RRULEs.
            let next = rule.after(originalDate, true);
            const oneMonthFromNow = new Date();
            oneMonthFromNow.setMonth(oneMonthFromNow.getMonth() + 1);

            while (next && next <= oneMonthFromNow) {
              if (!exceptionTimestamps.has(next.valueOf())) {
                occurrenceMs = next.valueOf();
                break;
              }
              // Advance just past this occurrence and ask for the next one
              next = rule.after(new Date(next.valueOf() + 1), true);
            }

            if (occurrenceMs === null) return null;
          } catch {
            // If RRULE parsing fails, skip the series to avoid incorrect data
            return null;
          }
        }

        return {
          ...e,
          effective_scheduled_start_time: new Date(occurrenceMs!).toISOString()
        } as AdjustedEvent;
      })
      .filter(Boolean) as AdjustedEvent[];
  }
}
