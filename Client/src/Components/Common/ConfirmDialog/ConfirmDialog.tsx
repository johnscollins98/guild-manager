import { Button, Dialog, DialogContent, DialogTitle, Typography } from '@material-ui/core';
import React from 'react';

import './ConfirmDialog.scss';
import useConfirm from './useConfirm';

const ConfirmDialog = () => {
  const { onConfirm, onCancel, confirmModalState } = useConfirm();

  return (
    <Dialog open={confirmModalState.show} onClose={onCancel} className="confirm-modal">
      <DialogTitle>{confirmModalState.title}</DialogTitle>
      <DialogContent className="confirm-modal-content">
        <form onSubmit={onConfirm} onReset={onCancel}>
          <div className="confirm-modal-message">
            <Typography>{confirmModalState.message}</Typography>
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
