import { DateTime } from 'luxon';
import { DiscordRole } from 'server';
import Warning from './warning';

export default interface MemberRecord {
  accountName: string;
  memberId?: string;
  rank?: string;
  rankImage?: string;
  joinDate: DateTime;
  nickname?: string;
  discordName?: string;
  discordId?: string;
  roles: DiscordRole[];
  avatar?: string;
  warnings: Warning[];
  issues: {
    missingGW2?: boolean;
    missingDiscord?: boolean;
    unmatchingRoles?: boolean;
    over24h?: boolean;
    invited?: boolean;
  };
}
