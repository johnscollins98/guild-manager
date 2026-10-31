import { Button, Stack, TextField } from '@mui/material';

interface Props {
  reason: string;
  activeReinviteCount: number;
  busy: boolean;
  inviteConfigured: boolean;
  onReasonChange: (reason: string) => void;
  onReinviteAll: () => void;
  onReinviteNone: () => void;
}

const ReinviteControls = ({
  reason,
  activeReinviteCount,
  busy,
  inviteConfigured,
  onReasonChange,
  onReinviteAll,
  onReinviteNone
}: Props) => (
  <Stack spacing={0.5} sx={{ mt: 1 }}>
    <TextField
      label="Re-invite reason (optional)"
      value={reason}
      disabled={busy || activeReinviteCount === 0}
      onChange={event => onReasonChange(event.target.value)}
      fullWidth
      size="small"
      helperText={activeReinviteCount > 0
        ? `Included for ${activeReinviteCount} re-invite${activeReinviteCount === 1 ? '' : 's'}.`
        : 'Enable re-invite for at least one selected kick to add a reason.'}
    />
    <Stack direction="row" spacing={1}>
      <Button size="small" disabled={busy || !inviteConfigured} onClick={onReinviteAll}>
        Re-invite all
      </Button>
      <Button size="small" disabled={busy} onClick={onReinviteNone}>
        Re-invite none
      </Button>
    </Stack>
  </Stack>
);

export default ReinviteControls;
