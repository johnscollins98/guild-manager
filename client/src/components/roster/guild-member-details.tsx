import Avatar from '@mui/material/Avatar';
import Divider from '@mui/material/Divider';
import Typography from '@mui/material/Typography';
import type MemberRecord from '../../lib/interfaces/member-record';
import { DiscordLogo } from '../common/discord-icon';
import { Gw2Icon } from '../common/gw2-icon';
import './guild-member-details.scss';

interface Props {
  member: MemberRecord;
}

const GuildMemberDetails = ({ member }: Props) => {
  return (
    <>
      <div className="member-header">
        <Avatar src={member.avatar} className="avatar" />
        <Typography variant="h6">{member.accountName}</Typography>
      </div>
      <Divider />
      <div className="member-detail-container">
        <div className="icon">
          <Gw2Icon height="20" width="20" />
        </div>
        <div>
          <div className="detail name">{member.memberId || 'N/A'}</div>
          <div className="detail rank">{member.rank || 'N/A'}</div>
        </div>
      </div>
      <Divider />
      <div className="member-detail-container">
        <div className="icon">
          <DiscordLogo height="20" width="20" />
        </div>
        <div>
          <div className="detail name">{member.discordName || 'N/A'}</div>
          <div className="detail rank">{member.roles[0]?.name || 'N/A'}</div>
        </div>
      </div>
    </>
  );
};

export default GuildMemberDetails;
