import AutoFixHigh from '@mui/icons-material/AutoFixHigh';
import Close from '@mui/icons-material/Close';
import SyncProblem from '@mui/icons-material/SyncProblem';
import {
  Alert,
  Box,
  Button,
  CircularProgress,
  Collapse,
  IconButton,
  LinearProgress,
  Slide,
  Stack,
  Typography,
  useMediaQuery
} from '@mui/material';
import { useCallback, useState, type FormEvent } from 'react';
import type { DiscordRole } from 'server';
import { config } from '../../../lib/config';
import type MemberRecord from '../../../lib/interfaces/member-record';
import { Gw2Icon } from '../../common/gw2-icon';
import ConfirmationDialog from './confirmation-dialog';
import DuplicateMatchSection from './duplicate-match-section';
import useApplySuggestedFixes from './hooks/use-apply-suggested-fixes';
import useSuggestedFixes from './hooks/use-suggested-fixes';
import ManualActionsSection from './manual-actions-section';
import ReinviteControls from './reinvite-controls';
import SuggestionGroup from './suggestion-group';
import type { SuggestedFix } from './types';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  records: MemberRecord[];
  roles: DiscordRole[];
}

const AutoFixDialog = ({ isOpen, onClose, records, roles }: Props) => {
  const isMediumScreen = useMediaQuery(theme => theme.breakpoints.up('md'));
  const [enabled, setEnabled] = useState<string[]>([]);
  const [reinviteByKick, setReinviteByKick] = useState<Record<string, boolean>>({});
  const [reason, setReason] = useState('');
  const [associationTargets, setAssociationTargets] = useState<Record<string, string>>({});
  const [confirmOpen, setConfirmOpen] = useState(false);

  const suggestions = useSuggestedFixes(records, roles);
  const activeFixes = suggestions.all.filter(
    (fix): fix is Exclude<SuggestedFix, { kind: 'manual' }> =>
      fix.kind !== 'manual' && enabled.includes(fix.key)
  );
  const missingAssociationTarget = activeFixes.some(
    fix => fix.kind === 'associate' && !associationTargets[fix.key]
  );
  const activeReinviteCount = suggestions.kicks.filter(
    fix => enabled.includes(fix.key) && reinviteByKick[fix.key]
  ).length;
  const hasEnabledKick = activeFixes.some(fix => fix.kind === 'kick');
  const inviteConfigured = Boolean(config.discordReinviteUrl);

  const resetReview = useCallback(() => {
    setEnabled([]);
    setReinviteByKick({});
    setReason('');
    setAssociationTargets({});
    setConfirmOpen(false);
  }, []);

  const finishAndClose = useCallback(() => {
    resetReview();
    onClose();
  }, [onClose, resetReview]);

  const { applyFixes, busy, progress } = useApplySuggestedFixes({
    fixes: activeFixes,
    associationTargets,
    reinviteByKick,
    reason,
    onComplete: resetReview
  });

  const close = () => {
    if (busy) return;
    finishAndClose();
  };

  const toggleEnabled = (key: string, apply: boolean) => {
    setEnabled(old => (apply ? [...new Set([...old, key])] : old.filter(item => item !== key)));
  };

  const setGroupEnabled = (fixes: SuggestedFix[], apply: boolean) => {
    const keys = fixes.map(fix => fix.key);
    setEnabled(old =>
      apply ? [...new Set([...old, ...keys])] : old.filter(key => !keys.includes(key))
    );
  };

  const handleReinviteChange = inviteConfigured
    ? (key: string, value: boolean) => {
        setReinviteByKick(old => ({ ...old, [key]: value }));
      }
    : undefined;

  const handleReinviteAll = () => {
    const enabledKickKeys = suggestions.kicks
      .filter(fix => enabled.includes(fix.key))
      .map(fix => fix.key);
    setReinviteByKick(old => ({
      ...old,
      ...Object.fromEntries(enabledKickKeys.map(key => [key, true]))
    }));
  };

  const handleReinviteNone = () => {
    const kickKeys = suggestions.kicks.map(fix => fix.key);
    setReinviteByKick(old => ({
      ...old,
      ...Object.fromEntries(kickKeys.map(key => [key, false]))
    }));
  };

  const handleRoleToggleAll = (apply: boolean) => setGroupEnabled(suggestions.roles, apply);
  const handleKickToggleAll = (apply: boolean) => setGroupEnabled(suggestions.kicks, apply);

  const handleDuplicateSelect = (key: string, accountId: string) => {
    setAssociationTargets(old => ({ ...old, [key]: accountId }));
    toggleEnabled(key, Boolean(accountId));
  };

  const handleConfirmationClose = () => setConfirmOpen(false);
  const handleConfirmApply = () => {
    void applyFixes();
  };

  const submit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!activeFixes.length || missingAssociationTarget) return;
    setConfirmOpen(true);
  };

  return (
    <Collapse
      orientation={isMediumScreen ? 'horizontal' : 'vertical'}
      in={isOpen}
      mountOnEnter
      unmountOnExit
      timeout="auto"
      sx={{ flexShrink: 0 }}
    >
      <Slide direction={isMediumScreen ? 'left' : 'up'} in={isOpen}>
        <Stack
          component="aside"
          aria-label="Review suggested fixes"
          sx={{
            flex: { xs: '0 0 auto', md: '0 0 420px', lg: '0 0 560px' },
            width: { xs: '100%', md: 420, lg: 560 },
            minWidth: 0,
            height: { xs: 'auto', md: '100%' },
            maxHeight: { xs: '60vh', md: 'none' },
            borderLeft: { xs: 0, md: 1 },
            borderTop: { xs: 1, md: 0 },
            borderColor: { xs: 'divider', md: 'divider' },
            bgcolor: 'background.paper'
          }}
        >
      <Stack
        component="form"
        onSubmit={submit}
        sx={{
          display: 'flex',
          flexDirection: 'column',
          minHeight: 0,
          height: { xs: 'auto', md: '100%' }
        }}
      >
        <Stack
          direction="row"
          alignItems="center"
          justifyContent="space-between"
          sx={{ px: 2, py: 1.5 }}
        >
          <Typography variant="h6" sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <AutoFixHigh /> Review suggested fixes
          </Typography>
          <IconButton aria-label="Close suggested fixes" onClick={close} disabled={busy}>
            <Close />
          </IconButton>
        </Stack>
        <Stack
          sx={{
            px: 2,
            py: 2,
            overflowY: 'auto',
            flex: { xs: '0 1 auto', md: 1 },
            minHeight: 0,
            borderTop: 1,
            borderBottom: 1,
            borderColor: 'divider'
          }}
        >
          {busy && <LinearProgress sx={{ mb: 2 }} />}
          {suggestions.all.length === 0 ? (
            <Alert severity="success">
              No supported fixes were found for the current roster issues.
            </Alert>
          ) : (
            <Stack spacing={2}>
              {suggestions.roles.length > 0 && (
                <SuggestionGroup
                  title={
                    <>
                      <SyncProblem color="error" /> Correct Discord roles
                    </>
                  }
                  label="Discord role fixes section"
                  fixes={suggestions.roles}
                  enabled={enabled}
                  busy={busy}
                  onToggle={toggleEnabled}
                  onToggleAll={handleRoleToggleAll}
                />
              )}
              {suggestions.duplicates.length > 0 && (
                <DuplicateMatchSection
                  fixes={suggestions.duplicates}
                  roles={roles}
                  targets={associationTargets}
                  busy={busy}
                  onSelect={handleDuplicateSelect}
                />
              )}
              {suggestions.kicks.length > 0 && (
                <SuggestionGroup
                  title={
                    <>
                      <Gw2Icon
                        width="18"
                        height="18"
                        color="var(--mui-palette-error-main)"
                        aria-label="GW2 account missing"
                      />{' '}
                      <Box component="span" sx={{ display: { xs: 'none', sm: 'inline' } }}>
                        Kick members without a GW2 account
                      </Box>
                      <Box component="span" sx={{ display: { xs: 'inline', sm: 'none' } }}>
                        Kick: no GW2 account
                      </Box>
                    </>
                  }
                  label="Discord kicks section"
                  fixes={suggestions.kicks}
                  enabled={enabled}
                  busy={busy}
                  onToggle={toggleEnabled}
                  onToggleAll={handleKickToggleAll}
                  reinviteByKick={reinviteByKick}
                  onReinviteChange={handleReinviteChange}
                  footer={
                    hasEnabledKick ? (
                      <ReinviteControls
                        reason={reason}
                        activeReinviteCount={activeReinviteCount}
                        busy={busy}
                        inviteConfigured={inviteConfigured}
                        onReasonChange={setReason}
                        onReinviteAll={handleReinviteAll}
                        onReinviteNone={handleReinviteNone}
                      />
                    ) : null
                  }
                />
              )}
              {suggestions.manual.length > 0 && (
                <ManualActionsSection fixes={suggestions.manual} roles={roles} />
              )}
            </Stack>
          )}
          {busy && (
            <Stack direction="row" spacing={1} alignItems="center" sx={{ mt: 2 }}>
              <CircularProgress size={18} />
              <Typography variant="body2">
                Applying fix {progress + 1} of {activeFixes.length}…
              </Typography>
            </Stack>
          )}
        </Stack>
        <Stack direction="row" justifyContent="flex-end" spacing={1} sx={{ p: 2 }}>
          <Button onClick={close} disabled={busy}>
            Close
          </Button>
          <Button
            type="submit"
            variant="contained"
            disabled={busy || activeFixes.length === 0 || missingAssociationTarget}
          >
            {busy
              ? 'Applying…'
              : `Apply ${activeFixes.length} fix${activeFixes.length === 1 ? '' : 'es'}`}
          </Button>
        </Stack>
      </Stack>
      <ConfirmationDialog
        open={confirmOpen}
        busy={busy}
        fixes={activeFixes}
        roles={roles}
        associationTargets={associationTargets}
        reinviteByKick={reinviteByKick}
        reinviteCount={activeReinviteCount}
        reason={reason}
        onClose={handleConfirmationClose}
        onConfirm={handleConfirmApply}
      />
        </Stack>
      </Slide>
    </Collapse>
  );
};

export default AutoFixDialog;
