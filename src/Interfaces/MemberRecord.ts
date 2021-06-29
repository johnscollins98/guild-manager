import DiscordRole from './DiscordRole';
import Warning from './Warning';

export default interface MemberRecord {
  accountName: string;
  rank?: string;
  joinDate: string;
  discordName?: string;
  discordId?: string;
  roles?: DiscordRole[];
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
