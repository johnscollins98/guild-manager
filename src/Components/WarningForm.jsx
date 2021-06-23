import {
  Dialog,
  DialogContent,
  DialogTitle,
  TextField,
  Button,
} from '@material-ui/core';
import './WarningForm.scss';
import React, { useState, useCallback } from 'react';

const WarningForm = ({ isOpen, onClose, onSubmit }) => {
  const [warningReason, setWarningReason] = useState('');

  const submitHandler = useCallback(
    async (e) => {
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
