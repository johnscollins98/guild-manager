import { DiscordLogUser } from '../../Interfaces/DiscordLog';
import { DiscordLogStringGenerator } from '../../Interfaces/DiscordLogStringGenerator';

export class MemberKicked implements DiscordLogStringGenerator {
  constructor(
    private readonly kicker: DiscordLogUser,
    private readonly kickee: DiscordLogUser,
  ) {}

  getEntry(): string {
    return `${this.kicker.username} kicked ${this.kickee.username}.`;
  }
}
