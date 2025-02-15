import Button from '@mui/material/Button';
import Dialog from '@mui/material/Dialog';
import DialogContent from '@mui/material/DialogContent';
import DialogTitle from '@mui/material/DialogTitle';
import TextField from '@mui/material/TextField';
import type React from 'react';
import { useCallback, useState } from 'react';

import { Box, MenuItem } from '@mui/material';
import { WarningType, WarningTypeLabels } from 'server';
import './warning-form.scss';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (reason: string, warningType: WarningType) => Promise<void>;
}

const WarningForm = ({ isOpen, onClose, onSubmit }: Props) => {
  const [warningReason, setWarningReason] = useState('');
  const [warningType, setWarningType] = useState(WarningType.OFFICIAL);

  const submitHandler: React.FormEventHandler = useCallback(
    async (e: React.FormEvent) => {
      e.preventDefault();
      await onSubmit(warningReason, warningType);
      setWarningReason('');
      onClose();
    },
    [onClose, onSubmit, warningReason, warningType]
  );

  return (
    <Dialog open={isOpen} onClose={onClose} fullWidth={true} maxWidth="sm">
      <DialogTitle>Give Warning</DialogTitle>
      <DialogContent>
        <form onSubmit={submitHandler} onReset={onClose} className="warning-form">
          <TextField
            value={warningType}
            onChange={e => setWarningType(e.target.value as WarningType)}
            label="Warning"
            select
            variant="outlined"
            fullWidth
            size="small"
            required
          >
            {Object.values(WarningType).map(v => (
              <MenuItem key={v} value={v}>
                {WarningTypeLabels[v]}
              </MenuItem>
            ))}
          </TextField>
          <TextField
            value={warningReason}
            onChange={e => setWarningReason(e.target.value)}
            variant="outlined"
            label="Reason"
            size="small"
            fullWidth
            minRows={3}
            multiline
            required
          />
          <Box display="flex" justifyContent="flex-end" gap={2}>
            <Button variant="text" type="reset">
              Cancel
            </Button>
            <Button variant="contained" color="primary" size="large" type="submit">
              Submit
            </Button>
          </Box>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default WarningForm;
