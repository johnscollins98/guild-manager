import { useTheme } from '@mui/material';
import Avatar from '@mui/material/Avatar';
import Divider from '@mui/material/Divider';
import Typography from '@mui/material/Typography';
import type MemberRecord from '../../lib/interfaces/member-record';
import './guild-member-details.scss';

interface Props {
  member: MemberRecord;
}

const GuildMemberDetails = ({ member }: Props) => {
  const theme = useTheme();
  return (
    <>
      <div className="member-header">
        <Avatar src={member.avatar} className="avatar" />
        <Typography variant="h6">{member.accountName}</Typography>
      </div>
      <Divider />
      <div className="member-detail-container">
        <div className="icon">
          <img
            src="gw2.png"
            height="24"
            width="24"
            loading="lazy"
            style={{
              filter: `opacity(1) drop-shadow(-1000px 0px 0 ${theme.palette.action.active})`,
              transform: `translateX(1000px)`,
              backgroundAttachment: 'fixed',
              backgroundSize: 'cover'
            }}
          ></img>
        </div>
        <div>
          <div className="detail name">{member.memberId || 'N/A'}</div>
          <div className="detail rank">{member.rank || 'N/A'}</div>
        </div>
      </div>
      <Divider />
      <div className="member-detail-container">
        <div className="icon">
          <svg height="24" width="24">
            <use href="discord.svg"></use>
          </svg>
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
