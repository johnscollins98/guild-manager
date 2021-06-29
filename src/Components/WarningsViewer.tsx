import React, { useCallback } from 'react';

import './WarningsViewer.scss';

import Card from '@material-ui/core/Card';
import Dialog from '@material-ui/core/Dialog';
import DialogContent from '@material-ui/core/DialogContent';
import DialogTitle from '@material-ui/core/DialogTitle';
import IconButton from '@material-ui/core/IconButton';
import Typography from '@material-ui/core/Typography';

import Assignment from '@material-ui/icons/Assignment';
import CalendarToday from '@material-ui/icons/CalendarToday';
import Close from '@material-ui/icons/Close';
import Person from '@material-ui/icons/Person';
import MemberRecord from '../Interfaces/MemberRecord';

interface Props {
  isOpen: boolean;
  onClose: (event?: {}, reason?: 'backdropClick' | 'escapeKeyDown') => void;
  onDeleteWarning: (memberId: string, warningId: string) => Promise<any>;
  member: MemberRecord;
}

const WarningsViewer = ({ isOpen, onClose, onDeleteWarning, member }: Props) => {
  const handleDeleteWarning = useCallback(
    async (warning) => {
      const res = window.confirm('Are you sure you want to delete this warning?');
      if (res) {
        if (member.memberId) {
          await onDeleteWarning(member.memberId, warning._id);
        } else {
          throw 'Chosen member has no memberId';
        }
      }
      onClose();
    },
    [onDeleteWarning, onClose, member]
  );

  return (
    <Dialog open={isOpen} onClose={onClose} fullWidth maxWidth={false}>
      <DialogTitle>Warnings for {member.memberId}</DialogTitle>
      <DialogContent className="warning-content">
        {member.warnings.map((warning) => (
          <Card variant="outlined" className="warning-card" key={warning._id}>
            <span className="date field">
              <CalendarToday className="icon" />
              <Typography>{new Date(warning.timestamp).toDateString()}</Typography>
            </span>
            <span className="given-by field">
              <Person className="icon" />
              <Typography>{warning.givenBy}</Typography>
            </span>
            <span className="reason field">
              <Assignment className="icon" />
              <Typography>{warning.reason}</Typography>
            </span>
            <span className="actions field">
              <IconButton onClick={() => handleDeleteWarning(warning)}>
                <Close />
              </IconButton>
            </span>
          </Card>
        ))}
      </DialogContent>
    </Dialog>
  );
};

export default WarningsViewer;
