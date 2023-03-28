import './GuildMemberDetails.scss';
import MemberRecord from '../../lib/interfaces/member-record';
import Popover, { PopoverPosition } from '@mui/material/Popover';
import Avatar from '@mui/material/Avatar';
import Typography from '@mui/material/Typography';
import Divider from '@mui/material/Divider';

interface Props {
  member: MemberRecord;
  detailsAnchor: PopoverPosition | undefined;
  closeDetails: () => void;
}

const GuildMemberDetails = ({ member, detailsAnchor, closeDetails }: Props) => {
  return (
    <Popover
      anchorReference="anchorPosition"
      anchorPosition={detailsAnchor}
      anchorOrigin={{
        vertical: 'top',
        horizontal: 'left'
      }}
      transformOrigin={{
        vertical: 'top',
        horizontal: 'left'
      }}
      keepMounted
      open={Boolean(detailsAnchor)}
      onClose={closeDetails}
    >
      <div className="member-details">
        <div className="member-header">
          <Avatar src={member.avatar} className="avatar" />
          <Typography variant="h6">{member.accountName}</Typography>
        </div>
        <Divider />
        <GuildMemberDetail>
          <Typography>GW2 Name: {member.memberId || 'N/A'}</Typography>
        </GuildMemberDetail>
        <GuildMemberDetail>
          <Typography>GW2 Rank: </Typography>
          {member.rankImage && <img src={member.rankImage} alt="rank icon" />}
          <Typography>{member.rank || 'N/A'}</Typography>
        </GuildMemberDetail>
        <GuildMemberDetail>
          <Typography>Discord Name: {member.discordName || 'N/A'}</Typography>
        </GuildMemberDetail>
        <GuildMemberDetail>
          <Typography>Discord Role: {member.roles[0]?.name || 'N/A'}</Typography>
        </GuildMemberDetail>
      </div>
    </Popover>
  );
};

interface DetailProps {
  children: React.ReactNode;
}

const GuildMemberDetail = ({ children }: DetailProps) => {
  return <div className="detail">{children}</div>;
};

export default GuildMemberDetails;
