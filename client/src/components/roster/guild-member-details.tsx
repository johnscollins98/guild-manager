import Avatar from '@mui/material/Avatar';
import Divider from '@mui/material/Divider';
import Typography from '@mui/material/Typography';
import { ReactComponent as DiscordSvg } from '../../assets/images/discord.svg';
import Gw2Logo from '../../assets/images/gw2.png';
import MemberRecord from '../../lib/interfaces/member-record';
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
          <img src={Gw2Logo} width={24} />
        </div>
        <div>
          <div className="detail name">{member.memberId || 'N/A'}</div>
          <div className="detail rank">{member.rank || 'N/A'}</div>
        </div>
      </div>
      <Divider />
      <div className="member-detail-container">
        <div className="icon">
          <DiscordSvg width={24} />
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
