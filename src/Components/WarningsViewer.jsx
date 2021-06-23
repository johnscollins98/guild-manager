import {
  Card,
  Dialog,
  DialogContent,
  DialogTitle,
  IconButton,
  Typography,
} from '@material-ui/core';
import { Assignment, CalendarToday, Close, Person } from '@material-ui/icons';
import React from 'react';
import { useCallback } from 'react';
import './WarningsViewer.scss';

const WarningsViewer = ({ isOpen, onClose, onDeleteWarning, member }) => {
  const handleDeleteWarning = useCallback(
    async (warning) => {
      const res = window.confirm(
        'Are you sure you want to delete this warning?'
      );
      if (res) {
        await onDeleteWarning(member.memberId, warning._id);
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
              <Typography>
                {new Date(warning.timestamp).toDateString()}
              </Typography>
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
