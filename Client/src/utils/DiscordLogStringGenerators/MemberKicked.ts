import { DiscordLogUser } from '../../Interfaces/DiscordLog';
import { DiscordLogDisplay, DiscordLogDisplayGenerator } from '../../Interfaces/DiscordLogStringGenerator';

export class MemberKicked implements DiscordLogDisplayGenerator {
  constructor(
    private readonly kicker: DiscordLogUser,
    private readonly kickee: DiscordLogUser,
  ) {}

  getEntry(): DiscordLogDisplay {
    return { summary: `${this.kicker.username} kicked ${this.kickee.username}.` };
  }
}
