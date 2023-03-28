import Button from '@mui/material/Button';
import Checkbox from '@mui/material/Checkbox';
import Dialog from '@mui/material/Dialog';
import DialogContent from '@mui/material/DialogContent';
import DialogTitle from '@mui/material/DialogTitle';
import FormControlLabel from '@mui/material/FormControlLabel';
import FormGroup from '@mui/material/FormGroup';
import TextField from '@mui/material/TextField';
import Typography from '@mui/material/Typography';
import { FunctionComponent, useCallback, useState } from 'react';
import { useKickDiscordMember } from '../../lib/apis/discord-api';
import MemberRecord from '../../lib/interfaces/member-record';
import './kick-modal.scss';

interface KickModalProps {
  user: MemberRecord;
  isOpen: boolean;
  onClose: () => void;
}

const KickModal: FunctionComponent<KickModalProps> = ({ user, isOpen, onClose }) => {
  const [reasonText, setReasonText] = useState<string>('');
  const [reinvite, setReinvite] = useState<boolean>(false);
  const kickMutation = useKickDiscordMember();

  const onFormSubmitted: React.FormEventHandler<HTMLFormElement> = useCallback(
    async e => {
      e.preventDefault();
      if (user.discordId) {
        await kickMutation.mutateAsync({ memberId: user.discordId, reason: reasonText, reinvite });
      }
      onClose();
    },
    [user, reinvite, reasonText, onClose]
  );

  return (
    <Dialog open={isOpen} onClose={onClose}>
      <DialogTitle>Kick User "{user.accountName}"</DialogTitle>
      <DialogContent className="kick-modal-content">
        <form onSubmit={onFormSubmitted} onReset={onClose}>
          <Typography className="kick-modal-message">
            Are you sure you want to kick {user.accountName}?
          </Typography>
          <div className="kick-reinvite-form">
            <FormGroup>
              <FormControlLabel
                control={<Checkbox checked={reinvite} onChange={(_, v) => setReinvite(v)} />}
                label="Send re-invite message"
              />
            </FormGroup>
            {reinvite && (
              <TextField
                id="reason-field"
                label="Reason for kick"
                variant="outlined"
                onChange={e => setReasonText(e.target.value)}
                value={reasonText}
                fullWidth
                required
              />
            )}
          </div>
          <div className="kick-modal-actions">
            <Button variant="text" type="reset">
              Cancel
            </Button>
            <Button variant="contained" type="submit" color="primary">
              Kick
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default KickModal;
