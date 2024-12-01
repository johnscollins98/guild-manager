import Button from '@mui/material/Button';
import Dialog from '@mui/material/Dialog';
import DialogContent from '@mui/material/DialogContent';
import DialogTitle from '@mui/material/DialogTitle';
import type React from 'react';
import { useCallback, useState } from 'react';

import { MenuItem, Select } from '@mui/material';
import { type LateLogNotification, notifications } from 'server';
import './late-log-form.scss';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (reason: LateLogNotification) => Promise<void>;
}

const LateLogForm = ({ isOpen, onClose, onSubmit }: Props) => {
  const [notification, setNotification] = useState<LateLogNotification>('never');

  const submitHandler: React.FormEventHandler = useCallback(
    async (e: React.FormEvent) => {
      e.preventDefault();
      await onSubmit(notification);
      setNotification('never');
      onClose();
    },
    [onClose, onSubmit, notification]
  );

  return (
    <Dialog open={isOpen} onClose={onClose} fullWidth={true} maxWidth="sm">
      <DialogTitle>Add Late Log Entry</DialogTitle>
      <DialogContent>
        <form onSubmit={submitHandler} className="late-log-form">
          <Select
            value={notification}
            onChange={v => setNotification(v.target.value as LateLogNotification)}
            variant="standard"
            label="Reason"
            size="small"
            required
          >
            {Object.values(notifications).map(n => (
              <MenuItem value={n} key={n}>
                {n}
              </MenuItem>
            ))}
          </Select>
          <Button variant="contained" color="primary" size="large" type="submit">
            Submit
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default LateLogForm;
