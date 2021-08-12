import DiscordRole from './DiscordRole';
import Warning from './Warning';

export default interface MemberRecord {
  accountName: string;
  memberId?: string;
  rank?: string;
  rankImage?: string;
  eventsAttended?: number;
  joinDate: string;
  nickname?: string,
  discordName?: string;
  discordId?: string;
  roles: DiscordRole[];
  avatar?: string;
  warnings: Warning[];
  issues: {
    missingGW2?: boolean;
    missingDiscord?: boolean;
    multipleRoles?: boolean;
    unmatchingRoles?: boolean;
    promotionRequired?: boolean;
  };
}
