import { Box } from '@mui/material';
import Dialog from '@mui/material/Dialog';
import DialogContent from '@mui/material/DialogContent';
import DialogTitle from '@mui/material/DialogTitle';
import { useSuspenseQueries } from '@tanstack/react-query';
import { useCallback, useEffect } from 'react';
import { authQuery } from '../../../lib/apis/auth-api';
import { discordMembersQuery } from '../../../lib/apis/discord-api';
import type MemberRecord from '../../../lib/interfaces/member-record';
import { QueryBoundary } from '../../common/query-boundary';
import { WarningEntry } from './warning-entry';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  member?: MemberRecord;
}

const WarningsViewerDialog = ({ isOpen, onClose, member }: Props) => {
  useEffect(() => {
    if (member?.warnings.length === 0 && isOpen) onClose();
  }, [onClose, member?.warnings, isOpen]);

  return (
    <Dialog open={isOpen && !!member} onClose={onClose} fullWidth maxWidth="sm">
      {member && (
        <>
          <DialogTitle>Warnings for {member.memberId}</DialogTitle>
          <DialogContent>
            <QueryBoundary>
              <WarningViewerContent member={member} />
            </QueryBoundary>
          </DialogContent>
        </>
      )}
    </Dialog>
  );
};

interface WarningViewerContentProps {
  member: MemberRecord;
}

const WarningViewerContent = ({ member }: WarningViewerContentProps) => {
  const [{ data: discordMembers }, { data: authData }] = useSuspenseQueries({
    queries: [discordMembersQuery, authQuery]
  });

  const getNameForDiscordId = useCallback(
    (givenToId?: string) => {
      if (!discordMembers || !givenToId) return undefined;
      const discordMember = discordMembers.find(dm => dm.id === givenToId);
      return discordMember;
    },
    [discordMembers]
  );

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
