import {
  Button,
  Checkbox,
  Dialog,
  DialogContent,
  DialogTitle,
  FormControlLabel,
  FormGroup,
  TextField,
  Typography
} from '@material-ui/core';
import { FunctionComponent, useCallback, useState } from 'react';
import MemberRecord from '../../Interfaces/MemberRecord';
import './KickModal.scss';

interface KickModalProps {
  user: MemberRecord;
  isOpen: boolean;
  onClose: () => void;
  onKick: (userId: string, reinvite: boolean, reason?: string) => Promise<void>;
}

const KickModal: FunctionComponent<KickModalProps> = ({ user, isOpen, onClose, onKick }) => {
  const [reasonText, setReasonText] = useState<string>('');
  const [reinvite, setReinvite] = useState<boolean>(false);

  const onFormSubmitted: React.FormEventHandler<HTMLFormElement> = useCallback(async (e) => {
    e.preventDefault();
    if (user.discordId) {
      await onKick(user.discordId, reinvite, reasonText);
    }
    onClose();
  }, [user, reinvite, reasonText, onClose, onKick]);

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
            <Button variant="contained" type="reset">
              Cancel
            </Button>
            <Button variant="contained" color="primary" type="submit">
              Kick
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default KickModal;
