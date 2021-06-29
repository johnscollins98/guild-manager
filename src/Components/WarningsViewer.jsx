import React, { useCallback } from 'react';
import PropTypes from 'prop-types';

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

const WarningsViewer = ({ isOpen, onClose, onDeleteWarning, member }) => {
  const handleDeleteWarning = useCallback(
    async (warning) => {
      const res = window.confirm('Are you sure you want to delete this warning?');
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

WarningsViewer.propTypes = {
  /* true if modal is open */
  isOpen: PropTypes.bool.isRequired,

  /* func to close modal */
  onClose: PropTypes.func.isRequired,

  /* func to delete warning */
  onDeleteWarning: PropTypes.func.isRequired,

  /* member object to display from */
  member: PropTypes.object.isRequired
};

export default WarningsViewer;
