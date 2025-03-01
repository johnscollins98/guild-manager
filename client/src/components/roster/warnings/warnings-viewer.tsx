import { Box } from '@mui/material';
import Dialog from '@mui/material/Dialog';
import DialogContent from '@mui/material/DialogContent';
import DialogTitle from '@mui/material/DialogTitle';
import { useCallback, useEffect } from 'react';
import { useAuth } from '../../../lib/apis/auth-api';
import { useDiscordMembers } from '../../../lib/apis/discord-api';
import type MemberRecord from '../../../lib/interfaces/member-record';
import { ErrorMessage } from '../../common/error-message';
import LoaderPage from '../../common/loader-page';
import { WarningEntry } from './warning-entry';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  member: MemberRecord;
}

const WarningsViewerDialog = ({ isOpen, onClose, member }: Props) => {
  useEffect(() => {
    if (member.warnings.length === 0 && isOpen) onClose();
  }, [onClose, member.warnings, isOpen]);

  return (
    <Dialog open={isOpen} onClose={onClose} fullWidth maxWidth="sm">
      <DialogTitle>Warnings for {member.memberId}</DialogTitle>
      <DialogContent>
        <WarningViewerContent member={member} />
      </DialogContent>
    </Dialog>
  );
};

interface WarningViewerContentProps {
  member: MemberRecord;
}

const WarningViewerContent = ({ member }: WarningViewerContentProps) => {
  const { data: discordMembers, isLoading, isError } = useDiscordMembers();
  const { data: authData, isLoading: authLoading, isError: authError } = useAuth();

  const getNameForDiscordId = useCallback(
    (givenToId?: string) => {
      if (!discordMembers || !givenToId) return undefined;
      const discordMember = discordMembers.find(dm => dm.id === givenToId);
      return discordMember;
    },
    [discordMembers]
  );

  if (isError || authError)
    return <ErrorMessage>There was an error getting roster data.</ErrorMessage>;

  if (isLoading || !discordMembers || authLoading || !authData) return <LoaderPage />;

  return (
    <Box display="flex" flexDirection="column">
      {member.warnings.map(warning => (
        <WarningEntry
          warning={warning}
          authData={authData}
          key={warning.id}
          getDiscordMemberById={getNameForDiscordId}
        />
      ))}
    </Box>
  );
};

export default WarningsViewerDialog;
