import { Box, List, ListItem, Stack, Typography } from '@mui/material';
import { getColorFromRole } from '../../../lib/utils/helpers';
import { DiscordLogo } from '../../common/discord-icon';
import CollapsibleSection from './collapsible-section';
import type { SuggestedFix } from './types';

interface Props {
  fixes: Extract<SuggestedFix, { kind: 'manual' }>[];
  roles: Parameters<typeof getColorFromRole>[1];
}

const ManualActionsSection = ({ fixes, roles }: Props) => (
  <CollapsibleSection label="manual actions section" title="Manual actions">
    <List disablePadding>
      {fixes.map(fix => (
        <ListItem key={fix.key} divider>
          <Box
            sx={{
              width: theme => theme.spacing(5.25),
              mr: 1,
              display: 'flex',
              justifyContent: 'center',
              flexShrink: 0
            }}
          >
            <DiscordLogo
              width="24"
              height="24"
              color="var(--mui-palette-error-main)"
              aria-label="Discord account missing"
            />
          </Box>
          <Stack spacing={0.5} sx={{ minWidth: 0 }}>
            <Typography variant="body2" fontWeight={600}>
              {fix.action}:{' '}
              <Typography
                component="span"
                variant="body2"
                sx={{ color: getColorFromRole(fix.member.rank, roles) ?? 'text.primary' }}
              >
                {fix.member.accountName}
              </Typography>
            </Typography>
            <Typography variant="caption" color="text.secondary">
              {fix.reason}
            </Typography>
          </Stack>
        </ListItem>
      ))}
    </List>
  </CollapsibleSection>
);

export default ManualActionsSection;
