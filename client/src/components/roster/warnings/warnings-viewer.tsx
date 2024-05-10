import Assignment from '@mui/icons-material/Assignment';
import CalendarToday from '@mui/icons-material/CalendarToday';
import Close from '@mui/icons-material/Close';
import Person from '@mui/icons-material/Person';
import Card from '@mui/material/Card';
import Dialog from '@mui/material/Dialog';
import DialogContent from '@mui/material/DialogContent';
import DialogTitle from '@mui/material/DialogTitle';
import IconButton from '@mui/material/IconButton';
import Typography from '@mui/material/Typography';
import { useCallback } from 'react';
import { WarningDTO } from 'server';
import { useDeleteWarningMutation } from '../../../lib/apis/warnings-api';
import MemberRecord from '../../../lib/interfaces/member-record';
import useConfirm from '../../common/confirm-dialog/use-confirm';
import './warnings-viewer.scss';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  member: MemberRecord;
}

const WarningsViewer = ({ isOpen, onClose, member }: Props) => {
  const { confirm } = useConfirm();
  const deleteWarningMutation = useDeleteWarningMutation();

  const handleDeleteWarning = useCallback(
    async (warning: WarningDTO) => {
      const res = await confirm('Are you sure you want to delete this warning?', 'Delete Warning');
      if (res) {
        await deleteWarningMutation.mutateAsync(warning.id);
      }
      onClose();
    },
    [deleteWarningMutation, onClose, confirm]
  );

  return (
    <Dialog open={isOpen} onClose={onClose} maxWidth={false}>
      <DialogTitle>Warnings for {member.memberId}</DialogTitle>
      <DialogContent className="warning-content">
        {member.warnings.map(warning => (
          <Card
            variant="outlined"
            className="warning-card"
            key={warning.id}
            sx={{ backgroundColor: 'inherit' }}
          >
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
