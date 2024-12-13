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
import { type WarningDTO } from 'server';
import { useDiscordMembers } from '../../../lib/apis/discord-api';
import { useDeleteWarningMutation } from '../../../lib/apis/warnings-api';
import type MemberRecord from '../../../lib/interfaces/member-record';
import { useConfirm } from '../../common/confirm-dialog';
import { ErrorMessage } from '../../common/error-message';
import LoaderPage from '../../common/loader-page';
import '../log-entry-viewer.scss';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  member: MemberRecord;
}

const WarningsViewer = ({ isOpen, onClose, member }: Props) => {
  const confirm = useConfirm();
  const deleteWarningMutation = useDeleteWarningMutation();
  const { data: discordMembers, isLoading, isError } = useDiscordMembers();

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

  const getNameForDiscordId = useCallback(
    (givenToId: string) => {
      if (!discordMembers) return 'Unknown User';

      const discordMember = discordMembers.find(dm => dm.id === givenToId);
      return discordMember?.nickname ?? discordMember?.name ?? 'Unknown User';
    },
    [discordMembers]
  );

  if (isError) return <ErrorMessage>There was an error getting roster data.</ErrorMessage>;

  if (isLoading || !discordMembers) return <LoaderPage />;

  return (
    <Dialog open={isOpen} onClose={onClose} maxWidth={false}>
      <DialogTitle>Warnings for {member.memberId}</DialogTitle>
      <DialogContent className="log-entry-viewer">
        {member.warnings.map(warning => (
          <Card
            variant="outlined"
            className="log-entry-card"
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
                <Typography>{getNameForDiscordId(warning.givenBy)}</Typography>
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
