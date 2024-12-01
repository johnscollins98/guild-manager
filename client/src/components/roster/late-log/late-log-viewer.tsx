import CalendarToday from '@mui/icons-material/CalendarToday';
import Close from '@mui/icons-material/Close';
import NotificationsActive from '@mui/icons-material/NotificationsActive';
import Person from '@mui/icons-material/Person';
import { capitalize } from '@mui/material';
import Card from '@mui/material/Card';
import Dialog from '@mui/material/Dialog';
import DialogContent from '@mui/material/DialogContent';
import DialogTitle from '@mui/material/DialogTitle';
import IconButton from '@mui/material/IconButton';
import Typography from '@mui/material/Typography';
import { useCallback } from 'react';
import { type LateLogDto } from 'server';
import { useDiscordMembers } from '../../../lib/apis/discord-api';
import { useDeleteLateLogMutation } from '../../../lib/apis/late-log-api';
import type MemberRecord from '../../../lib/interfaces/member-record';
import useConfirm from '../../common/confirm-dialog/use-confirm';
import { ErrorMessage } from '../../common/error-message';
import LoaderPage from '../../common/loader-page';
import '../log-entry-viewer.scss';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  member: MemberRecord;
}

const LateLogViewer = ({ isOpen, onClose, member }: Props) => {
  const { confirm } = useConfirm();
  const deleteLateLogMutation = useDeleteLateLogMutation();
  const { data: discordMembers, isLoading, isError } = useDiscordMembers();

  const handleDeleteEntry = useCallback(
    async (lateLog: LateLogDto) => {
      const res = await confirm('Are you sure you want to delete this entry?', 'Delete Log Entry');
      if (res) {
        await deleteLateLogMutation.mutateAsync(lateLog.id);
      }
      onClose();
    },
    [deleteLateLogMutation, onClose, confirm]
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
      <DialogTitle>Late Log entries for {member.memberId}</DialogTitle>
      <DialogContent className="log-entry-viewer">
        {member.lateLog.map(entry => (
          <Card
            variant="outlined"
            className="log-entry-card"
            key={entry.id}
            sx={{ backgroundColor: 'inherit' }}
          >
            <div className="data">
              <span className="date field">
                <CalendarToday className="icon" />
                <Typography>{new Date(entry.timestamp).toDateString()}</Typography>
              </span>
              <span className="given-by field">
                <Person className="icon" />
                <Typography>{getNameForDiscordId(entry.givenBy)}</Typography>
              </span>
              <span className="noitification field">
                <NotificationsActive className="icon" />
                <Typography>{capitalize(entry.notification)}</Typography>
              </span>
            </div>
            <div className="actions">
              <IconButton onClick={() => handleDeleteEntry(entry)}>
                <Close />
              </IconButton>
            </div>
          </Card>
        ))}
      </DialogContent>
    </Dialog>
  );
};

export default LateLogViewer;
