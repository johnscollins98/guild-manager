import MailIcon from '@mui/icons-material/Mail';
import { Box, Typography } from '@mui/material';
import { DiscordLogo } from '../common/discord-icon';
import { Gw2Icon } from '../common/gw2-icon';

interface Props {
  inviteCount: number;
  gw2MemberCount: number;
  discordMemberCount: number;
}

export const RosterSummary = ({ inviteCount, gw2MemberCount, discordMemberCount }: Props) => {
  return (
    <Box display="flex" gap={3} justifyContent="flex-end" sx={{ pt: 1, pr: { xs: 0, md: 2 } }}>
      {inviteCount !== 0 && (
        <Box display="flex" alignItems="center" gap={0.5}>
          <MailIcon />
          <Typography>{inviteCount}</Typography>
        </Box>
      )}
      <Box display="flex" alignItems="center" gap={0.5}>
        <Gw2Icon height={24} width={24} />
        <Typography>{gw2MemberCount}</Typography>
      </Box>
      <Box display="flex" alignItems="center" gap={0.5}>
        <DiscordLogo height={24} width={24} />
        <Typography>{discordMemberCount}</Typography>
      </Box>
    </Box>
  );
};
