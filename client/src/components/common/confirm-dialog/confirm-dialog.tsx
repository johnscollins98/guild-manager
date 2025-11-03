import Button from '@mui/material/Button';
import Dialog from '@mui/material/Dialog';
import DialogContent from '@mui/material/DialogContent';
import DialogTitle from '@mui/material/DialogTitle';
import Typography from '@mui/material/Typography';
import { type FormEventHandler } from 'react';

import './confirm-dialog.scss';

export interface Props {
  onResponse: (v: boolean) => void;
  title: string;
  message: string;
  open: boolean;
}

const ConfirmDialog = ({ onResponse, title, message, open }: Props) => {
  const onConfirm = () => onResponse(true);
  const onCancel = () => onResponse(false);

  const handleSubmit: FormEventHandler = e => {
    e.preventDefault();
    e.stopPropagation();

    onConfirm();
  };

  return (
    <Dialog open={open} onClose={onCancel} className="confirm-modal">
      <DialogTitle>{title}</DialogTitle>
      <DialogContent className="confirm-modal-content">
        <form onSubmit={handleSubmit} onReset={onCancel}>
          <div className="confirm-modal-message">
            <Typography>{message}</Typography>
          </div>
          <div className="confirm-modal-actions">
            <Button type="reset">Cancel</Button>
            <Button color="primary" variant="contained" type="submit" autoFocus>
              Confirm
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default ConfirmDialog;
