import Button from '@mui/material/Button';
import Dialog from '@mui/material/Dialog';
import DialogContent from '@mui/material/DialogContent';
import DialogTitle from '@mui/material/DialogTitle';
import TextField from '@mui/material/TextField';
import type React from 'react';
import { useCallback, useState } from 'react';

import './warning-form.scss';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (reason: string) => Promise<void>;
}

const WarningForm = ({ isOpen, onClose, onSubmit }: Props) => {
  const [warningReason, setWarningReason] = useState('');

  const submitHandler: React.FormEventHandler = useCallback(
    async (e: React.FormEvent) => {
      e.preventDefault();
      await onSubmit(warningReason);
      setWarningReason('');
      onClose();
    },
    [onClose, onSubmit, warningReason]
  );

  return (
    <Dialog open={isOpen} onClose={onClose} fullWidth={true} maxWidth="sm">
      <DialogTitle>Give Warning</DialogTitle>
      <DialogContent>
        <form onSubmit={submitHandler} className="warning-form">
          <TextField
            value={warningReason}
            onChange={e => setWarningReason(e.target.value)}
            variant="outlined"
            label="Reason"
            size="small"
            fullWidth
            required
          />
          <Button variant="contained" color="primary" size="large" type="submit">
            Submit
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default WarningForm;
