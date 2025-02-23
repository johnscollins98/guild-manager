import { type DateTime } from 'luxon';
import { type DiscordRole, type WarningDTO } from 'server';

export default interface MemberRecord {
  accountName: string;
  memberId?: string;
  rank?: string;
  rankImage?: string;
  joinDate: DateTime;
  nickname?: string;
  discordName?: string;
  manualMatch: boolean;
  discordId?: string;
  roles: DiscordRole[];
  avatar?: string;
  warnings: WarningDTO[];
  issues: {
    missingGW2?: boolean;
    missingDiscord?: boolean;
    unmatchingRoles?: boolean;
    over24h?: boolean;
    overAWeek?: boolean;
    invited?: boolean;
  };
}
