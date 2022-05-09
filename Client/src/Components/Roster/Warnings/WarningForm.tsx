import { Dialog, DialogTitle, DialogContent, TextField, Button } from '@mui/material';
import React, { useState, useCallback } from 'react';

import './WarningForm.scss';

interface Props {
  isOpen: boolean;
  onClose: (event?: {}, reason?: 'backdropClick' | 'escapeKeyDown') => void;
  onSubmit: (reason: string) => Promise<any>;
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
