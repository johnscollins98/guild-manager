import AutoFixHigh from '@mui/icons-material/AutoFixHigh';
import ArrowForward from '@mui/icons-material/ArrowForward';
import {
  Alert,
  Button,
  Box,
  Checkbox,
  CircularProgress,
  IconButton,
  LinearProgress,
  List,
  ListItem,
  ListItemText,
  Stack,
  TextField,
  Typography
} from '@mui/material';
import Close from '@mui/icons-material/Close';
import { useMemo, useState, type FormEvent } from 'react';
import { type DiscordRole } from 'server';
import { useToast } from '../common/toast/toast-context';
import { config } from '../../lib/config';
import {
  useAddDiscordRole,
  useKickDiscordMembers,
  useRemoveDiscordRole
} from '../../lib/apis/discord-api';
import type MemberRecord from '../../lib/interfaces/member-record';
import { DiscordLogo } from '../common/discord-icon';
import { Gw2Icon } from '../common/gw2-icon';
import { getColorFromRole } from '../../lib/utils/helpers';

type Fix =
  | { key: string; kind: 'role'; member: MemberRecord; role: DiscordRole }
  | { key: string; kind: 'kick'; member: MemberRecord }
  | { key: string; kind: 'manual'; member: MemberRecord; action: string; reason: string };

interface Props {
  isOpen: boolean;
  onClose: () => void;
  records: MemberRecord[];
  roles: DiscordRole[];
}

const AutoFixDialog = ({ isOpen, onClose, records, roles }: Props) => {
  const openToast = useToast();
  const addRole = useAddDiscordRole();
  const removeRole = useRemoveDiscordRole();
  const kick = useKickDiscordMembers();
  const [enabled, setEnabled] = useState<string[]>([]);
  const [reinviteByKick, setReinviteByKick] = useState<Record<string, boolean>>({});
  const [reason, setReason] = useState('');
  const [working, setWorking] = useState(false);
  const [progress, setProgress] = useState(0);

  const fixes = useMemo<Fix[]>(() => {
    const proposed: Fix[] = [];
    records.forEach(member => {
      if (member.issues.unmatchingRoles && member.discordId && member.rank) {
        const role = roles.find(r => r.name.toLowerCase() === member.rank?.toLowerCase());
        if (role) proposed.push({ key: `role:${member.discordId}`, kind: 'role', member, role });
      }
      if (member.issues.missingGW2 && member.discordId) {
        proposed.push({ key: `kick:${member.discordId}`, kind: 'kick', member });
      }
      if (member.issues.missingDiscord && member.memberId) {
        proposed.push({
          key: `manual-gw2-kick:${member.memberId}`,
          kind: 'manual',
          member,
          action: 'Kick from GW2',
          reason: 'No matching Discord member was found. Review this account and remove it from the GW2 guild if appropriate.'
        });
      }
    });
    return proposed;
  }, [records, roles]);

  const roleFixes = useMemo(() => fixes.filter((fix): fix is Extract<Fix, { kind: 'role' }> => fix.kind === 'role'), [fixes]);
  const kickFixes = useMemo(() => fixes.filter((fix): fix is Extract<Fix, { kind: 'kick' }> => fix.kind === 'kick'), [fixes]);
  const manualFixes = useMemo(() => fixes.filter((fix): fix is Extract<Fix, { kind: 'manual' }> => fix.kind === 'manual'), [fixes]);
  const activeFixes = fixes.filter(fix => fix.kind !== 'manual' && enabled.includes(fix.key));
  const activeReinviteCount = kickFixes.filter(fix =>
    enabled.includes(fix.key) && reinviteByKick[fix.key]
  ).length;
  const busy = working || addRole.isPending || removeRole.isPending || kick.isPending;

  const close = () => {
    if (busy) return;
    setEnabled([]);
    setReinviteByKick({});
    setReason('');
    setProgress(0);
    onClose();
  };

  const toggleEnabled = (key: string, apply: boolean) => {
    setEnabled(old => apply ? [...new Set([...old, key])] : old.filter(item => item !== key));
  };

  const setGroupEnabled = (items: Fix[], apply: boolean) => {
    const keys = items.map(item => item.key);
    setEnabled(old => apply
      ? [...new Set([...old, ...keys])]
      : old.filter(key => !keys.includes(key)));
  };

  const submit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!activeFixes.length) return;
    setWorking(true);
    setProgress(0);
    let failures = 0;
    for (const [index, fix] of activeFixes.entries()) {
      const name = fix.member.nickname || fix.member.discordName || fix.member.accountName;
      try {
        if (fix.kind === 'role' && fix.member.discordId) {
          const currentRoleIds = fix.member.roles.map(role => role.id);
          for (const role of fix.member.roles) {
            if (role.name.toLowerCase() !== fix.role.name.toLowerCase()) {
              await removeRole.mutateAsync({ memberId: fix.member.discordId, role });
            }
          }
          if (!currentRoleIds.includes(fix.role.id)) {
            await addRole.mutateAsync({ memberId: fix.member.discordId, role: fix.role });
          }
          openToast(`Updated ${name}'s role to ${fix.role.name}.`, 'success');
        } else if (fix.kind === 'kick' && fix.member.discordId) {
          await kick.mutateAsync({
            memberIds: [fix.member.discordId],
            reinvite: !!reinviteByKick[fix.key],
            reason: reason.trim() || undefined
          }, {
            onSuccess: () => openToast(`Kicked ${name}.`, 'success'),
            onError: () => openToast(`Could not kick ${name}.`, 'error')
          });
        }
      } catch {
        failures += 1;
        openToast(`Could not apply suggested fix for ${name}.`, 'error');
      }
      setProgress(index + 1);
    }
    setWorking(false);
    if (failures === 0) {
      openToast(`Finished applying ${activeFixes.length} suggested fix${activeFixes.length === 1 ? '' : 'es'}.`, 'success');
      close();
    } else {
      openToast(`Finished with ${failures} failed fix${failures === 1 ? '' : 'es'}.`, 'warning');
    }
  };

  return (
    <Stack component="aside" aria-label="Review suggested fixes" sx={{
      display: isOpen ? 'flex' : 'none',
      width: { xs: '100%', lg: 560 }, minWidth: 0,
      height: { xs: 'auto', lg: '100%' }, maxHeight: { xs: '60vh', lg: 'none' },
      borderLeft: { xs: 0, lg: '1px solid rgba(255, 255, 255, 0.08)' },
      borderTop: { xs: '1px solid rgba(255, 255, 255, 0.08)', lg: 0 },
      bgcolor: 'background.paper'
    }}>
      <form onSubmit={submit} style={{ display: 'flex', flexDirection: 'column', minHeight: 0, height: '100%' }}>
        <Stack direction="row" alignItems="center" justifyContent="space-between" sx={{ px: 2, py: 1.5 }}>
          <Typography variant="h6" sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <AutoFixHigh /> Review suggested fixes
          </Typography>
          <IconButton aria-label="Close suggested fixes" onClick={close} disabled={busy}><Close /></IconButton>
        </Stack>
        <Stack sx={{ px: 2, py: 2, overflowY: 'auto', flex: 1, minHeight: 0, borderTop: 1, borderBottom: 1, borderColor: 'divider' }}>
          {busy && <LinearProgress sx={{ mb: 2 }} />}
          <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
            Enable the fixes you want to apply. Disabled suggestions will be skipped.
          </Typography>
          {fixes.length === 0 ? (
            <Alert severity="success">No supported fixes were found for the current roster issues.</Alert>
          ) : (
            <Stack spacing={2}>
              {roleFixes.length > 0 && <SuggestionGroup
                title="Correct Discord roles"
                fixes={roleFixes}
                enabled={enabled}
                busy={busy}
                onToggle={toggleEnabled}
                onToggleAll={apply => setGroupEnabled(roleFixes, apply)}
              />}
              {kickFixes.length > 0 && <SuggestionGroup
                title="Kick members without a GW2 account"
                fixes={kickFixes}
                enabled={enabled}
                busy={busy}
                onToggle={toggleEnabled}
                onToggleAll={apply => setGroupEnabled(kickFixes, apply)}
                reinviteByKick={reinviteByKick}
                onReinviteChange={(key, value) => setReinviteByKick(old => ({ ...old, [key]: value }))}
              />}
              {activeFixes.some(fix => fix.kind === 'kick') && (
                <Stack spacing={0.5}>
                  <TextField
                    label="Re-invite reason (optional)"
                    value={reason}
                    disabled={busy || activeReinviteCount === 0}
                    onChange={event => setReason(event.target.value)}
                    fullWidth
                    size="small"
                    helperText={activeReinviteCount > 0 ? `Included for ${activeReinviteCount} re-invite${activeReinviteCount === 1 ? '' : 's'}.` : 'Enable re-invite for at least one selected kick to add a reason.'}
                  />
                  <Stack direction="row" spacing={1}>
                    <Button
                      size="small"
                      disabled={busy || !config.discordReinviteUrl}
                      onClick={() => setReinviteByKick(old => ({
                        ...old,
                        ...Object.fromEntries(kickFixes.filter(fix => enabled.includes(fix.key)).map(fix => [fix.key, true]))
                      }))}
                    >
                      Re-invite all
                    </Button>
                    <Button
                      size="small"
                      disabled={busy}
                      onClick={() => setReinviteByKick(old => ({
                        ...old,
                        ...Object.fromEntries(kickFixes.map(fix => [fix.key, false]))
                      }))}
                    >
                      Re-invite none
                    </Button>
                  </Stack>
                </Stack>
              )}
              {manualFixes.length > 0 && (
                <Stack spacing={1}>
                  <Typography variant="subtitle1">Manual actions</Typography>
                  {manualFixes.map(fix => (
                    <Alert key={fix.key} severity="info">
                      <Typography variant="body2" fontWeight={600}>
                        {fix.action}: {fix.member.accountName}
                      </Typography>
                      <Typography variant="body2">{fix.reason}</Typography>
                    </Alert>
                  ))}
                </Stack>
              )}
            </Stack>
          )}
          {busy && (
            <Stack direction="row" spacing={1} alignItems="center" sx={{ mt: 2 }}>
              <CircularProgress size={18} />
              <Typography variant="body2">Applying fix {progress + 1} of {activeFixes.length}…</Typography>
            </Stack>
          )}
        </Stack>
        <Stack direction="row" justifyContent="flex-end" spacing={1} sx={{ p: 2 }}>
          <Button onClick={close} disabled={busy}>Close</Button>
          <Button type="submit" variant="contained" disabled={busy || activeFixes.length === 0}>
            {busy ? 'Applying…' : `Apply ${activeFixes.length} fix${activeFixes.length === 1 ? '' : 'es'}`}
          </Button>
        </Stack>
      </form>
    </Stack>
  );
};

interface GroupProps {
  title: string;
  fixes: Fix[];
  enabled: string[];
  busy: boolean;
  onToggle: (key: string, apply: boolean) => void;
  onToggleAll: (apply: boolean) => void;
  reinviteByKick?: Record<string, boolean>;
  onReinviteChange?: (key: string, value: boolean) => void;
}

const SuggestionGroup = ({
  title,
  fixes,
  enabled,
  busy,
  onToggle,
  onToggleAll,
  reinviteByKick,
  onReinviteChange
}: GroupProps) => (
  <Stack>
    <Stack direction="row" justifyContent="space-between" alignItems="center">
      <Typography variant="subtitle1">{title}</Typography>
      <Stack direction="row" spacing={1}>
        <Button size="small" disabled={busy} onClick={() => onToggleAll(true)}>Enable all</Button>
        <Button size="small" disabled={busy} onClick={() => onToggleAll(false)}>Disable all</Button>
      </Stack>
    </Stack>
    <List disablePadding>
      {fixes.map(fix => {
        const name = fix.member.nickname || fix.member.discordName || fix.member.accountName;
        const roleChange = fix.kind === 'role';
        return (
          <ListItem
            key={fix.key}
            divider
            component="button"
            type="button"
            aria-label={`Apply fix for ${name}`}
            aria-pressed={enabled.includes(fix.key)}
            disabled={busy}
            onClick={() => onToggle(fix.key, !enabled.includes(fix.key))}
            sx={{
              width: '100%',
              textAlign: 'left',
              color: 'inherit',
              font: 'inherit',
              appearance: 'none',
              borderLeft: 0,
              borderRight: 0,
              borderTop: 0,
              borderBottom: '1px solid',
              borderColor: 'divider',
              boxShadow: 'none',
              borderRadius: 0,
              cursor: busy ? 'default' : 'pointer',
              bgcolor: 'transparent',
              '&:hover': { bgcolor: 'transparent' },
              '&:focus-visible': { outline: '2px solid', outlineColor: 'primary.main', outlineOffset: -2 }
            }}
          >
            <Checkbox
              inputProps={{ 'aria-label': `Apply fix for ${name}` }}
              checked={enabled.includes(fix.key)}
              disabled={busy}
              onClick={event => event.stopPropagation()}
              onChange={(_, checked) => onToggle(fix.key, checked)}
              sx={{ ml: -1, mr: 1 }}
            />
            {roleChange ? (
              <Stack spacing={0.5} sx={{ minWidth: 0 }}>
                <Typography variant="body2" fontWeight={600}>{name}</Typography>
                <Stack direction="row" spacing={0.75} alignItems="center" flexWrap="wrap">
                  <DiscordLogo width="18" height="18" aria-label="Current Discord roles" />
                  <Typography variant="body2" component="span" sx={{ color: fix.member.roles[0] ? `#${fix.member.roles[0].color.toString(16).padStart(6, '0')}` : 'text.secondary' }}>
                    {fix.member.roles.length ? fix.member.roles.map(role => role.name).join(', ') : 'No role'}
                  </Typography>
                  <ArrowForward fontSize="small" color="action" />
                  <Gw2Icon width="18" height="18" aria-label="GW2 rank" />
                  <Typography variant="body2" component="span" sx={{ color: getColorFromRole(fix.member.rank, [fix.role]) ?? 'text.primary' }}>
                    {fix.member.rank}
                  </Typography>
                </Stack>
                <Typography variant="caption" color="text.secondary">
                  Update Discord role to match GW2 Rank. Applies{' '}
                  <Box component="span" sx={{ color: getColorFromRole(fix.role.name, [fix.role]) ?? 'inherit', fontWeight: 600 }}>
                    {fix.role.name}
                  </Box>{' '}
                  role
                </Typography>
              </Stack>
            ) : (
              <ListItemText primary={name} secondary="Kick from Discord (no linked GW2 account found)" />
            )}
            {fix.kind === 'kick' && onReinviteChange && config.discordReinviteUrl && (
              <Stack direction="row" alignItems="center" spacing={0.5} sx={{ ml: 1 }}>
                <Typography variant="caption">Re-invite</Typography>
                <Checkbox
                  inputProps={{ 'aria-label': `Send a re-invite to ${name}` }}
                  checked={reinviteByKick?.[fix.key] ?? false}
                  disabled={busy || !enabled.includes(fix.key)}
                  onClick={event => event.stopPropagation()}
                  onChange={(_, checked) => onReinviteChange(fix.key, checked)}
                />
              </Stack>
            )}
          </ListItem>
        );
      })}
    </List>
  </Stack>
);

export default AutoFixDialog;
