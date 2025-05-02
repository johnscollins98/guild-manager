import Button from '@mui/material/Button';
import Checkbox from '@mui/material/Checkbox';
import Dialog from '@mui/material/Dialog';
import DialogContent from '@mui/material/DialogContent';
import DialogTitle from '@mui/material/DialogTitle';
import FormControlLabel from '@mui/material/FormControlLabel';
import FormGroup from '@mui/material/FormGroup';
import TextField from '@mui/material/TextField';
import Typography from '@mui/material/Typography';
import { useCallback, useState, type FunctionComponent } from 'react';
import { useKickDiscordMembers } from '../../lib/apis/discord-api';
import './kick-modal.scss';

interface KickModalProps {
  ids: string[];
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
}

const KickModal: FunctionComponent<KickModalProps> = ({ ids, isOpen, onClose, onConfirm }) => {
  const [reasonText, setReasonText] = useState<string>('');
  const [reinvite, setReinvite] = useState<boolean>(false);
  const kickMutation = useKickDiscordMembers();

  const onFormSubmitted: React.FormEventHandler<HTMLFormElement> = useCallback(
    async e => {
      e.preventDefault();
      kickMutation.mutate({ memberIds: ids, reason: reasonText, reinvite });
      onConfirm();
      onClose();
    },
    [ids, reinvite, reasonText, onClose, kickMutation, onConfirm]
  );

  return (
    <Dialog open={isOpen} onClose={onClose}>
      <DialogTitle>Kick User(s)</DialogTitle>
      <DialogContent className="kick-modal-content">
        <form onSubmit={onFormSubmitted} onReset={onClose}>
          <Typography className="kick-modal-message">
            Are you sure you want to kick these user(s)?
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
            <Button variant="text" type="reset" disabled={kickMutation.isPending}>
              Cancel
            </Button>
            <Button
              variant="contained"
              type="submit"
              disabled={kickMutation.isPending}
              loading={kickMutation.isPending}
              color="primary"
            >
              Kick
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default KickModal;
