import Button from '@mui/material/Button';
import Dialog from '@mui/material/Dialog';
import DialogContent from '@mui/material/DialogContent';
import DialogTitle from '@mui/material/DialogTitle';
import Typography from '@mui/material/Typography';
import { FormEventHandler, useEffect, useRef } from 'react';

import './confirm-dialog.scss';
import useConfirm from './use-confirm';

const ConfirmDialog = () => {
  const { onConfirm, onCancel, confirmModalState } = useConfirm();

  const submitRef = useRef<HTMLButtonElement>(null);
  useEffect(() => {
    if (submitRef && submitRef.current) {
      submitRef.current.focus();
    }
  }, [submitRef, confirmModalState]);

  const handleSubmit: FormEventHandler = e => {
    e.preventDefault();
    e.stopPropagation();

    onConfirm();
  };

  return (
    <Dialog open={confirmModalState.show} onClose={onCancel} className="confirm-modal">
      <DialogTitle>{confirmModalState.title}</DialogTitle>
      <DialogContent className="confirm-modal-content">
        <form onSubmit={handleSubmit} onReset={onCancel}>
          <div className="confirm-modal-message">
            <Typography>{confirmModalState.message}</Typography>
          </div>
          <div className="confirm-modal-actions">
            <Button type="reset">Cancel</Button>
            <Button color="primary" variant="contained" type="submit" ref={submitRef}>
              Confirm
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default ConfirmDialog;
