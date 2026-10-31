import AutoFixHigh from '@mui/icons-material/AutoFixHigh';
import ArrowForward from '@mui/icons-material/ArrowForward';
import ExpandMore from '@mui/icons-material/ExpandMore';
import PeopleAlt from '@mui/icons-material/PeopleAlt';
import SyncProblem from '@mui/icons-material/SyncProblem';
import {
  Alert,
  Avatar,
  Button,
  Box,
  Checkbox,
  CircularProgress,
  Collapse,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  IconButton,
  LinearProgress,
  List,
  ListItem,
  MenuItem,
  Stack,
  TextField,
  Typography,
  useTheme
} from '@mui/material';
import Close from '@mui/icons-material/Close';
import { DateTime } from 'luxon';
import { useMemo, useState, type FormEvent, type ReactNode } from 'react';
import { type DiscordRole } from 'server';
import { useToast } from '../common/toast/toast-context';
import { config } from '../../lib/config';
import {
  useAddDiscordRole,
  useKickDiscordMembers,
  useRemoveDiscordRole
} from '../../lib/apis/discord-api';
import { useAssociateToDiscordAccountMutation } from '../../lib/apis/gw2-api';
import type MemberRecord from '../../lib/interfaces/member-record';
import { getDateString } from '../../lib/utils/data-processing';
import { DiscordLogo } from '../common/discord-icon';
import { Gw2Icon } from '../common/gw2-icon';
import { getColorFromRole } from '../../lib/utils/helpers';

type Fix =
  | { key: string; kind: 'role'; member: MemberRecord; role: DiscordRole }
  | { key: string; kind: 'kick'; member: MemberRecord }
  | { key: string; kind: 'manual'; member: MemberRecord; action: string; reason: string }
  | {
      key: string;
      kind: 'associate';
      member: MemberRecord;
      options: { value: string; label: string; avatar?: string; roles?: DiscordRole[]; joined?: string }[];
      target: 'discord' | 'gw2';
    };

interface Props {
  isOpen: boolean;
  onClose: () => void;
  records: MemberRecord[];
  roles: DiscordRole[];
}

const AutoFixDialog = ({ isOpen, onClose, records, roles }: Props) => {
  const theme = useTheme();
  const openToast = useToast();
  const addRole = useAddDiscordRole();
  const removeRole = useRemoveDiscordRole();
  const kick = useKickDiscordMembers();
  const associate = useAssociateToDiscordAccountMutation();
  const [enabled, setEnabled] = useState<string[]>([]);
  const [reinviteByKick, setReinviteByKick] = useState<Record<string, boolean>>({});
  const [reason, setReason] = useState('');
  const [associationTargets, setAssociationTargets] = useState<Record<string, string>>({});
  const [working, setWorking] = useState(false);
  const [progress, setProgress] = useState(0);
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [duplicateExpanded, setDuplicateExpanded] = useState(true);
  const [kickExpanded, setKickExpanded] = useState(true);
  const [manualExpanded, setManualExpanded] = useState(true);

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
          reason: 'No matching Discord member was found.'
        });
      }
      if (member.issues.duplicateMatch && member.memberId && member.matchingDiscordMembers && member.matchingDiscordMembers.length > 1) {
        proposed.push({
          key: `associate:${member.memberId}`,
          kind: 'associate',
          member,
          target: 'discord',
          options: member.matchingDiscordMembers.map(candidate => ({
            value: candidate.id,
            label: candidate.name,
            avatar: candidate.avatar,
            roles: candidate.roles,
            joined: candidate.joined
          }))
        });
      }
    });
    return proposed;
  }, [records, roles]);

  const roleFixes = useMemo(() => fixes.filter((fix): fix is Extract<Fix, { kind: 'role' }> => fix.kind === 'role'), [fixes]);
  const kickFixes = useMemo(() => fixes.filter((fix): fix is Extract<Fix, { kind: 'kick' }> => fix.kind === 'kick'), [fixes]);
  const manualFixes = useMemo(() => fixes.filter((fix): fix is Extract<Fix, { kind: 'manual' }> => fix.kind === 'manual'), [fixes]);
  const associationFixes = useMemo(() => fixes.filter((fix): fix is Extract<Fix, { kind: 'associate' }> => fix.kind === 'associate'), [fixes]);
  const activeFixes = fixes.filter(fix => fix.kind !== 'manual' && enabled.includes(fix.key));
  const missingAssociationTarget = activeFixes.some(
    fix => fix.kind === 'associate' && !associationTargets[fix.key]
  );
  const activeReinviteCount = kickFixes.filter(fix =>
    enabled.includes(fix.key) && reinviteByKick[fix.key]
  ).length;
  const busy = working || addRole.isPending || removeRole.isPending || kick.isPending || associate.isPending;

  const close = () => {
    if (busy) return;
    setEnabled([]);
    setReinviteByKick({});
    setReason('');
    setAssociationTargets({});
    setProgress(0);
    setConfirmOpen(false);
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

  const submit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!activeFixes.length || missingAssociationTarget) return;
    setConfirmOpen(true);
  };

  const applyFixes = async () => {
    setConfirmOpen(false);
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
        } else if (fix.kind === 'associate') {
          const selected = associationTargets[fix.key];
          const target = selected;
          const gw2AccountName = fix.target === 'gw2' ? target : fix.member.memberId;
          const discordAccountId = fix.target === 'discord' ? target : fix.member.discordId;
          if (!gw2AccountName || !discordAccountId) throw new Error('Missing association target');
          await associate.mutateAsync({ gw2AccountName, discordAccountId });
          openToast(`Associated ${gw2AccountName} to a Discord account.`, 'success');
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
          {fixes.length === 0 ? (
            <Alert severity="success">No supported fixes were found for the current roster issues.</Alert>
          ) : (
            <Stack spacing={2}>
              {roleFixes.length > 0 && <SuggestionGroup
                title={<><SyncProblem sx={{ color: theme.palette.error.main }} /> Correct Discord roles</>}
                order={0}
                fixes={roleFixes}
                enabled={enabled}
                busy={busy}
                onToggle={toggleEnabled}
                onToggleAll={apply => setGroupEnabled(roleFixes, apply)}
              />}
              {kickFixes.length > 0 && <SuggestionGroup
                title={<><Gw2Icon width="18" height="18" color={theme.palette.error.main} aria-label="GW2 account missing" /> Kick members without a GW2 account</>}
                order={2}
                fixes={kickFixes}
                enabled={enabled}
                busy={busy}
                onToggle={toggleEnabled}
                onToggleAll={apply => setGroupEnabled(kickFixes, apply)}
                expanded={kickExpanded}
                onExpandedChange={setKickExpanded}
                reinviteByKick={reinviteByKick}
                onReinviteChange={(key, value) => setReinviteByKick(old => ({ ...old, [key]: value }))}
                footer={activeFixes.some(fix => fix.kind === 'kick') ? (
                  <Stack spacing={0.5} sx={{ mt: 1 }}>
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
                ) : null}
              />}
              {associationFixes.length > 0 && (
                <Stack spacing={1} sx={{ order: 1 }}>
                  <Stack direction="row" justifyContent="space-between" alignItems="center">
                    <Stack direction="row" alignItems="center" spacing={0.5}>
                      <IconButton
                        size="small"
                        aria-expanded={duplicateExpanded}
                        aria-label="Toggle duplicate matches section"
                        onClick={() => setDuplicateExpanded(open => !open)}
                      >
                        <ExpandMore sx={{ transform: duplicateExpanded ? 'rotate(180deg)' : 'none', transition: 'transform 150ms' }} />
                      </IconButton>
                      <Typography
                        variant="subtitle1"
                        role="button"
                        tabIndex={0}
                        aria-expanded={duplicateExpanded}
                        onClick={() => setDuplicateExpanded(open => !open)}
                        onKeyDown={event => {
                          if (event.key === 'Enter' || event.key === ' ') {
                            event.preventDefault();
                            setDuplicateExpanded(open => !open);
                          }
                        }}
                        sx={{ display: 'flex', alignItems: 'center', gap: 1, cursor: 'pointer' }}
                      >
                        <PeopleAlt sx={{ color: theme.palette.error.main }} />
                        Resolve duplicate matches
                      </Typography>
                    </Stack>
                  </Stack>
                  <Collapse in={duplicateExpanded}>
                  <List disablePadding>
                    {associationFixes.map(fix => (
                      <ListItem
                        key={fix.key}
                        divider
                        component="div"
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
                          bgcolor: 'transparent',
                          '&:hover': { bgcolor: 'transparent' },
                          '&:focus-visible': { outline: '2px solid', outlineColor: 'primary.main', outlineOffset: -2 }
                        }}
                      >
                        <Stack spacing={0.5} sx={{ minWidth: 0, flex: 1 }}>
                          <Typography
                            variant="body2"
                            fontWeight={600}
                            sx={{ color: getColorFromRole(fix.member.rank, roles) ?? 'text.primary' }}
                          >
                            {fix.member.memberId ?? fix.member.accountName}
                            <Box component="span" sx={{ ml: 1, color: 'text.secondary', fontWeight: 400, fontSize: '0.75rem' }}>
                              · Joined {getDateString(fix.member.joinDate)}
                            </Box>
                          </Typography>
                          <TextField
                            select
                            size="small"
                            label="Discord account"
                            value={associationTargets[fix.key] ?? ''}
                            disabled={busy}
                            onChange={event => {
                              const value = event.target.value;
                              setAssociationTargets(old => ({ ...old, [fix.key]: value || '' }));
                              toggleEnabled(fix.key, !!value);
                            }}
                          >
                            <MenuItem value="">Do nothing</MenuItem>
                            {fix.options.map(option => (
                              <MenuItem key={option.value} value={option.value}>
                                <Stack direction="row" spacing={1} alignItems="center">
                                  <Avatar src={option.avatar} alt="" sx={{ width: 24, height: 24 }} />
                                  <Stack>
                                    <Typography
                                      variant="body2"
                                      sx={{ color: option.roles?.[0] ? getColorFromRole(option.roles[0].name, option.roles) : 'text.primary' }}
                                    >
                                      {option.label}
                                    </Typography>
                                    <Typography variant="caption" color="text.secondary">
                                      {option.roles?.[0] && (
                                        <Box component="span" sx={{ color: getColorFromRole(option.roles[0].name, option.roles) ?? 'text.secondary' }}>
                                          {option.roles[0].name}
                                        </Box>
                                      )}
                                      {option.roles?.[0] && option.joined ? ' · ' : ''}
                                      {option.joined ? `Joined ${getDateString(DateTime.fromISO(option.joined, { zone: 'utc' }))}` : ''}
                                    </Typography>
                                  </Stack>
                                </Stack>
                              </MenuItem>
                            ))}
                          </TextField>
                        </Stack>
                      </ListItem>
                    ))}
                  </List>
                  </Collapse>
                </Stack>
              )}
              {manualFixes.length > 0 && (
                <Stack spacing={1} sx={{ order: 4 }}>
                  <Stack direction="row" alignItems="center" spacing={0.5}>
                    <IconButton
                      size="small"
                      aria-expanded={manualExpanded}
                      aria-label="Toggle manual actions section"
                      onClick={() => setManualExpanded(open => !open)}
                    >
                      <ExpandMore sx={{ transform: manualExpanded ? 'rotate(180deg)' : 'none', transition: 'transform 150ms' }} />
                    </IconButton>
                    <Typography
                      variant="subtitle1"
                      role="button"
                      tabIndex={0}
                      aria-expanded={manualExpanded}
                      onClick={() => setManualExpanded(open => !open)}
                      onKeyDown={event => {
                        if (event.key === 'Enter' || event.key === ' ') {
                          event.preventDefault();
                          setManualExpanded(open => !open);
                        }
                      }}
                      sx={{ cursor: 'pointer' }}
                    >
                      Manual actions
                    </Typography>
                  </Stack>
                  <Collapse in={manualExpanded}>
                  <List disablePadding>
                    {manualFixes.map(fix => (
                      <ListItem
                        key={fix.key}
                        divider
                        sx={{
                          width: '100%',
                          borderLeft: 0,
                          borderRight: 0,
                          borderTop: 0,
                          borderBottom: '1px solid',
                          borderColor: 'divider',
                          boxShadow: 'none',
                          borderRadius: 0
                        }}
                      >
                        <DiscordLogo
                          width="24"
                          height="24"
                          color={theme.palette.error.main}
                          aria-label="Discord account missing"
                          style={{ marginLeft: '0px', marginRight: '24px', flexShrink: 0 }}
                        />
                        <Stack spacing={0.5} sx={{ minWidth: 0 }}>
                          <Typography variant="body2" fontWeight={600}>
                            {fix.action}:{' '}
                            <Box component="span" sx={{ color: getColorFromRole(fix.member.rank, roles) ?? 'text.primary' }}>
                              {fix.member.accountName}
                            </Box>
                          </Typography>
                          <Typography variant="caption" color="text.secondary">{fix.reason}</Typography>
                        </Stack>
                      </ListItem>
                    ))}
                  </List>
                  </Collapse>
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
          <Button type="submit" variant="contained" disabled={busy || activeFixes.length === 0 || missingAssociationTarget}>
            {busy ? 'Applying…' : `Apply ${activeFixes.length} fix${activeFixes.length === 1 ? '' : 'es'}`}
          </Button>
        </Stack>
      </form>
      <Dialog open={confirmOpen} onClose={() => setConfirmOpen(false)} fullWidth maxWidth="sm">
        <DialogTitle>Confirm suggested changes</DialogTitle>
        <DialogContent dividers>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
            Review the selected actions. Nothing will be changed until you confirm.
          </Typography>
          <List dense>
            {activeFixes.map((fix, index) => {
              if (fix.kind === 'manual') return null;
              let name = fix.member.nickname || fix.member.discordName || fix.member.accountName;
              let avatar = fix.member.avatar;
              let nameColor = 'text.primary';
              let detail: ReactNode;
              if (fix.kind === 'role') {
                nameColor = getColorFromRole(fix.member.rank, [fix.role]) ?? 'text.primary';
                detail = <>Update Discord role to <Box component="span" sx={{ color: getColorFromRole(fix.role.name, [fix.role]) ?? 'inherit', fontWeight: 600 }}>{fix.role.name}</Box></>;
              } else if (fix.kind === 'kick') {
                nameColor = getColorFromRole(fix.member.roles[0]?.name, fix.member.roles) ?? 'text.primary';
                detail = `Kick from Discord${reinviteByKick[fix.key] ? ' · Send a re-invite' : ''}`;
              } else {
                const selected = fix.options.find(option => option.value === associationTargets[fix.key]);
                if (selected) {
                  name = selected.label;
                  avatar = selected.avatar;
                  nameColor = selected.roles?.[0]
                    ? getColorFromRole(selected.roles[0].name, selected.roles) ?? 'text.primary'
                    : 'text.primary';
                }
                detail = <>
                  Associate <Box component="span" sx={{ color: getColorFromRole(fix.member.rank, roles) ?? 'text.primary', fontWeight: 600 }}>
                    {fix.member.memberId}
                  </Box> with this Discord account
                </>;
              }
              return (
                <ListItem key={fix.key} divider={index < activeFixes.length - 1} sx={{ px: 2, py: 1 }}>
                  <Avatar src={avatar} alt="" sx={{ width: 32, height: 32, mr: 1.5 }}>
                    {name.slice(0, 1).toUpperCase()}
                  </Avatar>
                  <Stack spacing={0} sx={{ minWidth: 0 }}>
                    <Typography variant="body2" sx={{ color: nameColor }}>{name}</Typography>
                    <Typography variant="caption" color="text.secondary">{detail}</Typography>
                  </Stack>
                </ListItem>
              );
            })}
          </List>
          {activeReinviteCount > 0 && reason.trim() && (
            <Alert severity="info">Re-invite reason: {reason.trim()}</Alert>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setConfirmOpen(false)} disabled={busy}>Cancel</Button>
          <Button
            variant="contained"
            onClick={() => void applyFixes()}
            disabled={busy || !activeFixes.length || missingAssociationTarget}
          >
            Confirm and apply
          </Button>
        </DialogActions>
      </Dialog>
    </Stack>
  );
};

interface GroupProps {
  title: ReactNode;
  order?: number;
  expanded?: boolean;
  onExpandedChange?: (expanded: boolean) => void;
  footer?: ReactNode;
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
  order,
  expanded: expandedProp,
  onExpandedChange,
  footer,
  fixes,
  enabled,
  busy,
  onToggle,
  onToggleAll,
  reinviteByKick,
  onReinviteChange
}: GroupProps) => {
  const [localExpanded, setLocalExpanded] = useState(true);
  const expanded = expandedProp ?? localExpanded;
  const setExpanded = onExpandedChange ?? setLocalExpanded;

  return (
  <Stack sx={{ order }}>
    <Stack direction="row" justifyContent="space-between" alignItems="center">
      <Stack direction="row" alignItems="center" spacing={0.5}>
        <IconButton
          size="small"
          aria-expanded={expanded}
          aria-label="Toggle suggested fixes section"
          onClick={() => setExpanded(!expanded)}
        >
          <ExpandMore sx={{ transform: expanded ? 'rotate(180deg)' : 'none', transition: 'transform 150ms' }} />
        </IconButton>
        <Typography
          variant="subtitle1"
          role="button"
          tabIndex={0}
          aria-expanded={expanded}
          onClick={() => setExpanded(!expanded)}
          onKeyDown={event => {
            if (event.key === 'Enter' || event.key === ' ') {
              event.preventDefault();
              setExpanded(!expanded);
            }
          }}
          sx={{ display: 'flex', alignItems: 'center', gap: 1, cursor: 'pointer' }}
        >
          {title}
        </Typography>
      </Stack>
      <Stack direction="row" spacing={1}>
        <Button size="small" disabled={busy} onClick={() => onToggleAll(true)}>Enable all</Button>
        <Button size="small" disabled={busy} onClick={() => onToggleAll(false)}>Disable all</Button>
      </Stack>
    </Stack>
    <Collapse in={expanded}>
    <List disablePadding>
      {fixes.map(fix => {
        const name = fix.member.nickname || fix.member.discordName || fix.member.accountName;
        const roleChange = fix.kind === 'role';
        const nameColor = getColorFromRole(
          fix.kind === 'role' ? fix.member.rank : fix.member.roles[0]?.name,
          fix.kind === 'role' ? [fix.role] : fix.member.roles
        );
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
            <Avatar src={fix.member.avatar} alt="" sx={{ width: 32, height: 32, mr: 1 }}>
              {name.slice(0, 1).toUpperCase()}
            </Avatar>
            {roleChange ? (
              <Stack spacing={0.5} sx={{ minWidth: 0 }}>
                <Typography variant="body2" fontWeight={600} sx={{ color: nameColor ?? 'text.primary' }}>{name}</Typography>
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
              <Stack sx={{ minWidth: 0 }}>
                <Typography variant="body2" sx={{ color: nameColor ?? 'text.primary' }}>{name}</Typography>
                <Typography variant="caption" color="text.secondary">Kick from Discord</Typography>
              </Stack>
            )}
            {fix.kind === 'kick' && onReinviteChange && config.discordReinviteUrl && (
              <Stack direction="row" alignItems="center" spacing={0.5} sx={{ ml: 'auto', flexShrink: 0 }}>
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
    {footer}
    </Collapse>
  </Stack>
  );
};

export default AutoFixDialog;
