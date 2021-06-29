import React, { useState, useCallback } from 'react';
import PropTypes from 'prop-types';

import './WarningForm.scss';

import Dialog from '@material-ui/core/Dialog';
import DialogContent from '@material-ui/core/DialogContent';
import DialogTitle from '@material-ui/core/DialogTitle';
import TextField from '@material-ui/core/TextField';
import Button from '@material-ui/core/Button';

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

WarningForm.propTypes = {
  /* true if modal is open */
  isOpen: PropTypes.bool.isRequired,

  /* function to close modal */
  onClose: PropTypes.func.isRequired,

  /* funciton to call on submit */
  onSubmit: PropTypes.func.isRequired
};

export default WarningForm;
