import PeopleAlt from '@mui/icons-material/PeopleAlt';
import { Avatar, Box, List, ListItem, MenuItem, Stack, TextField, Typography } from '@mui/material';
import { DateTime } from 'luxon';
import type { ChangeEvent } from 'react';
import { getDateString } from '../../../lib/utils/data-processing';
import { getColorFromRole } from '../../../lib/utils/helpers';
import CollapsibleSection from './collapsible-section';
import type { SuggestedFix } from './types';

interface Props {
  fixes: Extract<SuggestedFix, { kind: 'associate' }>[];
  roles: Parameters<typeof getColorFromRole>[1];
  targets: Record<string, string>;
  busy: boolean;
  onSelect: (key: string, accountId: string) => void;
}

const DuplicateMatchSection = ({ fixes, roles, targets, busy, onSelect }: Props) => (
  <CollapsibleSection
    label="duplicate matches section"
    title={
      <>
        <PeopleAlt sx={{ color: 'error.main' }} /> Resolve duplicate matches
      </>
    }
  >
    <List disablePadding>
      {fixes.map(fix => {
        const handleSelect = (event: ChangeEvent<HTMLInputElement>) => {
          onSelect(fix.key, event.target.value);
        };
        const memberColor = getColorFromRole(fix.member.rank, roles) ?? 'text.primary';

        return (
          <ListItem key={fix.key} divider>
            <Stack spacing={0.5} sx={{ minWidth: 0, flex: 1 }}>
              <Typography variant="body2" fontWeight={600} sx={{ color: memberColor }}>
                {fix.member.memberId ?? fix.member.accountName}
                <Box
                  component="span"
                  sx={{ ml: 1, color: 'text.secondary', fontWeight: 400, fontSize: '0.75rem' }}
                >
                  · Joined {getDateString(fix.member.joinDate)}
                </Box>
              </Typography>
              <TextField
                select
                size="small"
                margin="dense"
                label="Discord account"
                value={targets[fix.key] ?? ''}
                disabled={busy}
                onChange={handleSelect}
                sx={{ mt: 0.5 }}
              >
                <MenuItem value="">Do nothing</MenuItem>
                {fix.options.map(option => (
                  <MenuItem key={option.value} value={option.value}>
                    <Stack direction="row" spacing={1} alignItems="center">
                      <Avatar src={option.avatar} alt="" sx={{ width: 24, height: 24 }} />
                      <Stack>
                        <Typography
                          variant="body2"
                          sx={{
                            color: option.roles?.[0]
                              ? getColorFromRole(option.roles[0].name, option.roles)
                              : 'text.primary'
                          }}
                        >
                          {option.label}
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                          {option.roles?.[0] && (
                            <Box
                              component="span"
                              sx={{
                                color:
                                  getColorFromRole(option.roles[0].name, option.roles) ??
                                  'text.secondary'
                              }}
                            >
                              {option.roles[0].name}
                            </Box>
                          )}
                          {option.roles?.[0] && option.joined ? ' · ' : ''}
                          {option.joined
                            ? `Joined ${getDateString(DateTime.fromISO(option.joined, { zone: 'utc' }))}`
                            : ''}
                        </Typography>
                      </Stack>
                    </Stack>
                  </MenuItem>
                ))}
              </TextField>
            </Stack>
          </ListItem>
        );
      })}
    </List>
  </CollapsibleSection>
);

export default DuplicateMatchSection;
