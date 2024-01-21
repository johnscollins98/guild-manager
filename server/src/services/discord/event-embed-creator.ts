import { Service } from 'typedi';
import { Event } from '../../models/event.model';
import DiscordEmbed from '../../models/interfaces/discord-embed';

@Service()
export class EventEmbedCreator {
  createEmbed(day: string, events: Event[]): DiscordEmbed {
    return {
      color: '3447003',
      title: `${day} Events`,
      fields: events.map((event, i) => {
        const timeLink = encodeURI(
          `https://www.starts-at.com/e/?t=${event.startTime}&tz=UTC&d=Next${event.day}&title=${event.title}`
        );
        return {
          name: `\u200b${i !== 0 ? '\n' : ''}📅 **${event.title}**`,
          value: `⏰ ${
            event.startTime ? `[${event.startTime} UTC](${timeLink})` : 'TBD'
          }${`\u200b\u3000`.repeat(15)}\n⏳ ${event.duration}\n👑 <@${event.leaderId}>`
        };
      })
    };
  }
}
