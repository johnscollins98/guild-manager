import { type DiscordLogUser } from 'server';
import {
  type DiscordLogDisplay,
  type DiscordLogDisplayGenerator
} from '../../interfaces/discord-log-string-generator';

export class MemberKicked implements DiscordLogDisplayGenerator {
  constructor(
    private readonly kicker: DiscordLogUser,
    private readonly kickee: DiscordLogUser
  ) {}

  getEntry(): DiscordLogDisplay {
    return { summary: `${this.kicker.username} kicked ${this.kickee.username}.` };
  }
}
