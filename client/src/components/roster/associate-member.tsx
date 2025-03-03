import {
  Alert,
  Autocomplete,
  Box,
  Button,
  Dialog,
  DialogContent,
  DialogTitle,
  TextField
} from '@mui/material';
import { useCallback, useState, type FormEvent } from 'react';
import { useDiscordMembers } from '../../lib/apis/discord-api';
import { useAssociateToDiscordAccountMutation } from '../../lib/apis/gw2-api';
import type MemberRecord from '../../lib/interfaces/member-record';
import { QueryBoundary } from '../common/query-boundary';
import './associate-member.scss';

export interface AssociateMemberDialogProps {
  member: MemberRecord;
  isOpen: boolean;
  onClose: () => void;
}

export const AssociateMemberDialog = ({ member, isOpen, onClose }: AssociateMemberDialogProps) => {
  return (
    <Dialog open={isOpen} onClose={onClose} fullWidth maxWidth="xs">
      <DialogTitle>Associate {member.memberId}</DialogTitle>
      <DialogContent>
        <QueryBoundary>
          <AssociateMemberForm member={member} onClose={onClose} />
        </QueryBoundary>
      </DialogContent>
    </Dialog>
  );
};

interface AssociateMemberFormProps {
  member: MemberRecord;
  onClose: () => void;
}
const AssociateMemberForm = ({ member, onClose }: AssociateMemberFormProps) => {
  const { data } = useDiscordMembers();

  const { mutate: associateMember } = useAssociateToDiscordAccountMutation();

  const [discordAccountId, setDiscordId] = useState({
    value: member.discordId ?? '',
    label: member.discordName ?? ''
  });

  const submitHandler = useCallback(
    (e: FormEvent<HTMLFormElement>) => {
      e.preventDefault();
      e.stopPropagation();

      if (discordAccountId && member.memberId) {
        associateMember({
          discordAccountId: discordAccountId.value,
          gw2AccountName: member.memberId
        });
      }

      onClose();
    },
    [associateMember, discordAccountId, member.memberId, onClose]
  );

  if (!member.memberId) {
    return null;
  }

  return (
    <form onSubmit={submitHandler} onReset={onClose} className="associate-form">
      <Alert severity="warning">
        <Box display="flex" flexDirection="column" gap="8px">
          <div>
            <b>Manual association should only be done where necessary or for alt accounts.</b>
          </div>
          <div>Please use nickname assocation where possible.</div>
        </Box>
      </Alert>
      <Autocomplete
        value={discordAccountId}
        onChange={(_e, v) => v && setDiscordId(v)}
        options={data
          .filter(member => member.id !== undefined && member.name !== undefined)
          .map(member => ({ label: member.nickname ?? member.name!, value: member.id! }))}
        renderInput={p => <TextField label="Select Discord Member" required {...p} />}
        fullWidth
      />
      <div className="actions">
        <Button type="reset">Cancel</Button>
        <Button variant="contained" type="submit" disabled={!discordAccountId}>
          Submit
        </Button>
      </div>
    </form>
  );
};
