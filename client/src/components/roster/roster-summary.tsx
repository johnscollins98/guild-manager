import MailIcon from '@mui/icons-material/Mail';
import { Box, Typography } from '@mui/material';
import { useSuspenseQueries } from '@tanstack/react-query';
import { discordMembersQuery } from '../../lib/apis/discord-api';
import { gw2MembersQuery } from '../../lib/apis/gw2-api';
import { DiscordLogo } from '../common/discord-icon';
import { Gw2Icon } from '../common/gw2-icon';

export const RosterSummary = () => {
  const [gw2Members, discordMembers] = useSuspenseQueries({
    queries: [gw2MembersQuery, discordMembersQuery]
  });

  const inviteCount = gw2Members.data.filter(m => m.rank === 'invited').length;
  const gw2MemberCount = gw2Members.data.length - inviteCount;

  return (
    <Box display="flex" gap={3} justifyContent="flex-end" paddingTop={1}>
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
        <Typography>{discordMembers.data.length}</Typography>
      </Box>
    </Box>
  );
};
