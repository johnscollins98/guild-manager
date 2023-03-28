import { DiscordLogUser } from '../../interfaces/discord-log';
import {
  DiscordLogDisplay,
  DiscordLogDisplayGenerator
} from '../../interfaces/discord-log-string-generator';

export class MemberKicked implements DiscordLogDisplayGenerator {
  constructor(private readonly kicker: DiscordLogUser, private readonly kickee: DiscordLogUser) {}

  getEntry(): DiscordLogDisplay {
    return { summary: `${this.kicker.username} kicked ${this.kickee.username}.` };
  }
}
