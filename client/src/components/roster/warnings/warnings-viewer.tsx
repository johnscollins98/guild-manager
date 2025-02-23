import Dialog from '@mui/material/Dialog';
import DialogContent from '@mui/material/DialogContent';
import DialogTitle from '@mui/material/DialogTitle';
import { useCallback } from 'react';
import { useAuth } from '../../../lib/apis/auth-api';
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
  const { data: authData, isLoading: authLoading, isError: authError } = useAuth();

  const getNameForDiscordId = useCallback(
    (givenToId: string) => {
      if (!discordMembers) return 'Unknown User';

      const discordMember = discordMembers.find(dm => dm.id === givenToId);
      return discordMember?.nickname ?? discordMember?.name ?? 'Unknown User';
    },
    [discordMembers]
  );

  if (member.warnings.length === 0 && isOpen) onClose();

  if (isError || authError)
    return <ErrorMessage>There was an error getting roster data.</ErrorMessage>;

  if (isLoading || !discordMembers || authLoading || !authData) return <LoaderPage />;

  return (
    <Dialog open={isOpen} onClose={onClose} maxWidth={false}>
      <DialogTitle>Warnings for {member.memberId}</DialogTitle>
      <DialogContent className="log-entry-viewer">
        {member.warnings.map(warning => (
          <WarningEntry
            warning={warning}
            authData={authData}
            key={warning.id}
            getNameForDiscordId={getNameForDiscordId}
          />
        ))}
      </DialogContent>
    </Dialog>
  );
};

export default WarningsViewer;
