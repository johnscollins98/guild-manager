import React, { useCallback } from 'react';

import './WarningsViewer.scss';

import MemberRecord from '../../../Interfaces/MemberRecord';
import Warning from '../../../Interfaces/Warning';

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
import useConfirm from '../../Common/ConfirmDialog/useConfirm';

interface Props {
  isOpen: boolean;
  onClose: (event?: {}, reason?: 'backdropClick' | 'escapeKeyDown') => void;
  onDeleteWarning: (warningId: string) => Promise<any>;
  member: MemberRecord;
}

const WarningsViewer = ({ isOpen, onClose, onDeleteWarning, member }: Props) => {
  const { confirm } = useConfirm();

  const handleDeleteWarning = useCallback(
    async (warning: Warning) => {
      const res = await confirm('Are you sure you want to delete this warning?', 'Delete Warning');
      if (res) {
        if (member.memberId) {
          await onDeleteWarning(warning._id);
        } else {
          throw new Error('Chosen member has no memberId');
        }
      }
      onClose();
    },
    [onDeleteWarning, onClose, member, confirm]
  );

  return (
    <Dialog open={isOpen} onClose={onClose} maxWidth={false}>
      <DialogTitle>Warnings for {member.memberId}</DialogTitle>
      <DialogContent className="warning-content">
        {member.warnings.map((warning) => (
          <Card variant="outlined" className="warning-card" key={warning._id}>
            <div className="data">
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
            </div>
            <div className="actions">
              <IconButton onClick={() => handleDeleteWarning(warning)}>
                <Close />
              </IconButton>
            </div>
          </Card>
        ))}
      </DialogContent>
    </Dialog>
  );
};

export default WarningsViewer;
