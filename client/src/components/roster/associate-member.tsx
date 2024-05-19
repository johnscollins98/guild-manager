import { Autocomplete, Button, Dialog, DialogContent, DialogTitle, TextField } from '@mui/material';
import { useCallback, useState, type FormEvent } from 'react';
import { useDiscordMembers } from '../../lib/apis/discord-api';
import { useAssociateToDiscordAccountMutation } from '../../lib/apis/gw2-api';
import type MemberRecord from '../../lib/interfaces/member-record';
import './associate-member.scss';

export interface AssociateMemberProps {
  member: MemberRecord;
  isOpen: boolean;
  onClose: () => void;
}

export const AssociateMember = ({ member, isOpen, onClose }: AssociateMemberProps) => {
  const { data, isLoading, isError } = useDiscordMembers();

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

  if (isLoading || !member.memberId) {
    return null;
  }

  return (
    <Dialog open={isOpen} onClose={onClose} fullWidth maxWidth="xs">
      <DialogTitle>Associate {member.memberId}</DialogTitle>
      <DialogContent>
        {data && (
          <form onSubmit={submitHandler} onReset={onClose} className="associate-form">
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
        )}
        {isError && <>There was an error gathering discord data.</>}
      </DialogContent>
    </Dialog>
  );
};
