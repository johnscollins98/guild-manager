import Dialog from '@mui/material/Dialog';
import DialogContent from '@mui/material/DialogContent';
import DialogTitle from '@mui/material/DialogTitle';
import { useCallback } from 'react';
import { useDiscordMembers } from '../../../lib/apis/discord-api';
import type MemberRecord from '../../../lib/interfaces/member-record';
import { ErrorMessage } from '../../common/error-message';
import LoaderPage from '../../common/loader-page';
import '../log-entry-viewer.scss';
import { WarningEntry } from './warning-entry';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  member: MemberRecord;
}

const WarningsViewer = ({ isOpen, onClose, member }: Props) => {
  const { data: discordMembers, isLoading, isError } = useDiscordMembers();

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
          <WarningEntry
            warning={warning}
            key={warning.id}
            getNameForDiscordId={getNameForDiscordId}
            onClose={onClose}
          />
        ))}
      </DialogContent>
    </Dialog>
  );
};

export default WarningsViewer;
