import { Button, Dialog, DialogContent, DialogTitle, Typography } from '@material-ui/core';
import React from 'react';

import './ConfirmDialog.scss';

interface Props {
  isOpen: boolean;
  onCancel: () => unknown;
  onConfirm: () => unknown;
  title?: string;
  message?: string;
}

const ConfirmDialog = ({
  isOpen,
  onCancel,
  onConfirm,
  title = 'Confirm',
  message = 'Are you sure would like to proceed?',
  ...props
}: Props) => {
  return (
    <Dialog open={isOpen} onClose={onCancel} className="confirm-modal" {...props}>
      <DialogTitle>{title}</DialogTitle>
      <DialogContent className="confirm-modal-content">
        <form onSubmit={onConfirm} onReset={onCancel}>
          <div className="confirm-modal-message">
            <Typography>{message}</Typography>
          </div>
          <div className="confirm-modal-actions">
            <Button color="secondary" variant="contained" type="reset">
              Cancel
            </Button>
            <Button color="primary" variant="contained" type="submit">
              Confirm
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default ConfirmDialog;
