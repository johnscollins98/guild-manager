import ArrowForward from '@mui/icons-material/ArrowForward';
import {
  Avatar,
  Box,
  Checkbox,
  List,
  ListItem,
  ListItemButton,
  Stack,
  Typography
} from '@mui/material';
import type { ChangeEvent, MouseEvent, ReactNode } from 'react';
import { getColorFromRole } from '../../../lib/utils/helpers';
import { DiscordLogo } from '../../common/discord-icon';
import { Gw2Icon } from '../../common/gw2-icon';
import CollapsibleSection from './collapsible-section';
import type { SuggestedFix } from './types';

type GroupFix = Extract<SuggestedFix, { kind: 'role' | 'kick' }>;

interface Props {
  title: ReactNode;
  label: string;
  fixes: GroupFix[];
  enabled: string[];
  busy: boolean;
  onToggle: (key: string, apply: boolean) => void;
  onToggleAll: (apply: boolean) => void;
  reinviteByKick?: Record<string, boolean>;
  onReinviteChange?: (key: string, value: boolean) => void;
  footer?: ReactNode;
}

const SuggestionGroup = ({
  title,
  label,
  fixes,
  enabled,
  busy,
  onToggle,
  onToggleAll,
  reinviteByKick,
  onReinviteChange,
  footer
}: Props) => {
  const enabledCount = fixes.filter(fix => enabled.includes(fix.key)).length;
  const allEnabled = enabledCount === fixes.length;
  const someEnabled = enabledCount > 0 && !allEnabled;
  const handleToggleAll = () => onToggleAll(!allEnabled);

  return (
    <CollapsibleSection
      title={title}
      label={label}
      actions={
        <Checkbox
          size="small"
          checked={allEnabled}
          indeterminate={someEnabled}
          disabled={busy}
          onChange={handleToggleAll}
          inputProps={{ 'aria-label': `Enable all ${label.toLowerCase()}` }}
          sx={{ mr: 0, ml: 0.5 }}
        />
      }
    >
      <List disablePadding>
        {fixes.map(fix => {
          const name = fix.member.nickname || fix.member.discordName || fix.member.accountName;
          const isRoleFix = fix.kind === 'role';
          const isEnabled = enabled.includes(fix.key);
          const nameColor = getColorFromRole(
            isRoleFix ? fix.member.rank : fix.member.roles[0]?.name,
            isRoleFix ? [fix.role] : fix.member.roles
          );
          const discordRoleColor = fix.member.roles[0]
            ? `#${fix.member.roles[0].color.toString(16).padStart(6, '0')}`
            : undefined;
          const rankColor = isRoleFix ? getColorFromRole(fix.member.rank, [fix.role]) : undefined;
          const targetRoleColor = isRoleFix
            ? getColorFromRole(fix.role.name, [fix.role])
            : undefined;

          const handleToggleFix = () => onToggle(fix.key, !isEnabled);
          const stopCardToggle = (event: MouseEvent<HTMLButtonElement>) => event.stopPropagation();
          const handleCheckboxChange = (_event: ChangeEvent<HTMLInputElement>, checked: boolean) =>
            onToggle(fix.key, checked);
          const handleReinviteChange = (_event: ChangeEvent<HTMLInputElement>, checked: boolean) =>
            onReinviteChange?.(fix.key, checked);

          return (
            <ListItem key={fix.key} disablePadding divider>
              <ListItemButton
                component="button"
                type="button"
                aria-label={`Apply fix for ${name}`}
                aria-pressed={isEnabled}
                disabled={busy}
                onClick={handleToggleFix}
              >
                <Checkbox
                  inputProps={{ 'aria-label': `Apply fix for ${name}` }}
                  checked={isEnabled}
                  disabled={busy}
                  onClick={stopCardToggle}
                  onChange={handleCheckboxChange}
                  sx={{ ml: -1, mr: 1 }}
                />
                <Avatar src={fix.member.avatar} alt="" sx={{ width: 32, height: 32, mr: 1 }}>
                  {name.slice(0, 1).toUpperCase()}
                </Avatar>
                {isRoleFix ? (
                  <Stack spacing={0.5} sx={{ minWidth: 0 }}>
                    <Typography
                      variant="body2"
                      fontWeight={600}
                      sx={{ color: nameColor ?? 'text.primary' }}
                    >
                      {name}
                    </Typography>
                    <Stack direction="row" spacing={0.75} alignItems="center" flexWrap="wrap">
                      <DiscordLogo width="18" height="18" aria-label="Current Discord roles" />
                      <Typography
                        variant="body2"
                        component="span"
                        sx={{
                          color: discordRoleColor ?? 'text.secondary'
                        }}
                      >
                        {fix.member.roles.length
                          ? fix.member.roles.map(role => role.name).join(', ')
                          : 'No role'}
                      </Typography>
                      <ArrowForward fontSize="small" color="action" />
                      <Gw2Icon width="18" height="18" aria-label="GW2 rank" />
                      <Typography
                        variant="body2"
                        component="span"
                        sx={{
                          color: rankColor ?? 'text.primary'
                        }}
                      >
                        {fix.member.rank}
                      </Typography>
                    </Stack>
                    <Typography variant="caption" color="text.secondary">
                      Update Discord role to match GW2 Rank. Applies{' '}
                      <Box
                        component="span"
                        sx={{
                          color: targetRoleColor ?? 'inherit',
                          fontWeight: 600
                        }}
                      >
                        {fix.role.name}
                      </Box>{' '}
                      role
                    </Typography>
                  </Stack>
                ) : (
                  <Stack sx={{ minWidth: 0 }}>
                    <Typography variant="body2" sx={{ color: nameColor ?? 'text.primary' }}>
                      {name}
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      Kick from Discord
                    </Typography>
                  </Stack>
                )}
                {fix.kind === 'kick' && onReinviteChange && reinviteByKick && (
                  <Stack
                    direction="row"
                    alignItems="center"
                    spacing={0.5}
                    sx={{ ml: 'auto', flexShrink: 0 }}
                  >
                    <Typography variant="caption">Re-invite</Typography>
                    <Checkbox
                      inputProps={{ 'aria-label': `Send a re-invite to ${name}` }}
                      checked={reinviteByKick[fix.key] ?? false}
                      disabled={busy || !isEnabled}
                      onClick={stopCardToggle}
                      onChange={handleReinviteChange}
                    />
                  </Stack>
                )}
              </ListItemButton>
            </ListItem>
          );
        })}
      </List>
      {footer}
    </CollapsibleSection>
  );
};

export default SuggestionGroup;
