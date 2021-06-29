import React, { useState, useCallback } from 'react';

import './WarningForm.scss';

import Dialog from '@material-ui/core/Dialog';
import DialogContent from '@material-ui/core/DialogContent';
import DialogTitle from '@material-ui/core/DialogTitle';
import TextField from '@material-ui/core/TextField';
import Button from '@material-ui/core/Button';
import { WarningPost } from '../Interfaces/Warning';

interface Props {
  isOpen: boolean;
  onClose: (event?: {}, reason?: 'backdropClick' | 'escapeKeyDown') => void;
  onSubmit: (warning: WarningPost) => Promise<any>;
}

const WarningForm = ({ isOpen, onClose, onSubmit }: Props) => {
  const [warningReason, setWarningReason] = useState('');

  const submitHandler: React.FormEventHandler = useCallback(
    async (e: React.FormEvent) => {
      e.preventDefault();
      await onSubmit({ reason: warningReason });
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
            onChange={(e) => setWarningReason(e.target.value)}
            variant="outlined"
            label="Reason"
            size="small"
            required
          />
          <Button variant="outlined" type="submit">
            Submit
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default WarningForm;
