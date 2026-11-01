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
import {
  useAssociateToDiscordAccountMutation,
  useGW2Members,
  useRemoveAssociation
} from '../../lib/apis/gw2-api';
import type MemberRecord from '../../lib/interfaces/member-record';
import { QueryBoundary } from '../common/query-boundary';
import './associate-member.scss';

export interface LinkAccountDialogProps {
  member?: MemberRecord;
  isOpen: boolean;
  onClose: () => void;
}

export const LinkDiscordAccountDialog = ({ member, isOpen, onClose }: LinkAccountDialogProps) => {
  return (
    <Dialog open={isOpen && !!member} onClose={onClose} fullWidth maxWidth="xs">
      {member && (
        <>
          <DialogTitle>Link Discord Account to {member.memberId}</DialogTitle>
          <DialogContent>
            <QueryBoundary>
              <LinkDiscordAccountForm member={member} onClose={onClose} />
            </QueryBoundary>
          </DialogContent>
        </>
      )}
    </Dialog>
  );
};

export const LinkGW2AccountDialog = ({ member, isOpen, onClose }: LinkAccountDialogProps) => {
  return (
    <Dialog open={isOpen && !!member} onClose={onClose} fullWidth maxWidth="xs">
      {member && (
        <>
          <DialogTitle>
            Link GW2 Account to {member.discordName ?? member.discordId}
          </DialogTitle>
          <DialogContent>
            <QueryBoundary>
              <LinkGW2AccountForm
                key={`${member.discordId}-${isOpen}`}
                member={member}
                onClose={onClose}
              />
            </QueryBoundary>
          </DialogContent>
        </>
      )}
    </Dialog>
  );
};

interface LinkAccountFormProps {
  member: MemberRecord;
  onClose: () => void;
}

const LinkDiscordAccountForm = ({ member, onClose }: LinkAccountFormProps) => {
  const { data } = useDiscordMembers();

  const associateMutation = useAssociateToDiscordAccountMutation();

  const [discordAccount, setDiscordAccount] = useState(() =>
    member.discordId
      ? {
          value: member.discordId,
          label: member.discordName ?? member.discordId
        }
      : null
  );

  const submitHandler = useCallback(
    async (e: FormEvent<HTMLFormElement>) => {
      e.preventDefault();
      e.stopPropagation();

      if (discordAccount && member.memberId) {
        await associateMutation.mutateAsync({
          discordAccountId: discordAccount.value,
          gw2AccountName: member.memberId
        });
      }

      onClose();
    },
    [associateMutation, discordAccount, member.memberId, onClose]
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
          <div>Please use nickname association where possible.</div>
        </Box>
      </Alert>
      <Autocomplete
        value={discordAccount}
        onChange={(_e, v) => setDiscordAccount(v)}
        isOptionEqualToValue={(option, value) => option.value === value.value}
        options={data
          .filter(member => member.id !== undefined && member.name !== undefined)
          .map(member => ({
            label: member.nickname ?? member.name!,
            value: member.id!
          }))}
        renderInput={p => (
          <TextField
            label="Select Discord Account"
            required
            {...p}
            slotProps={{
              input: { ...p.InputProps, disableUnderline: true, sx: { borderRadius: '4px' } }
            }}
          />
        )}
        fullWidth
      />
      <div className="actions">
        <Button type="reset" disabled={associateMutation.isPending}>
          Cancel
        </Button>
        <Button
          variant="contained"
          type="submit"
          disabled={!discordAccount || associateMutation.isPending}
          loading={associateMutation.isPending}
        >
          Link Account
        </Button>
      </div>
    </form>
  );
};

const LinkGW2AccountForm = ({ member, onClose }: LinkAccountFormProps) => {
  const { data } = useGW2Members();
  const associateMutation = useAssociateToDiscordAccountMutation();
  const removeAssociationMutation = useRemoveAssociation();
  const linkedAccountNames = data
    .filter(gw2Member => gw2Member.discordId === member.discordId)
    .map(gw2Member => gw2Member.name);
  const [gw2AccountNames, setGW2AccountNames] = useState<string[]>(linkedAccountNames);
  const accountsToLink = gw2AccountNames.filter(name => !linkedAccountNames.includes(name));
  const accountsToUnlink = linkedAccountNames.filter(name => !gw2AccountNames.includes(name));
  const isPending = associateMutation.isPending || removeAssociationMutation.isPending;

  const submitHandler = useCallback(
    async (e: FormEvent<HTMLFormElement>) => {
      e.preventDefault();
      e.stopPropagation();

      if (!member.discordId) return;

      for (const gw2AccountName of accountsToUnlink) {
        await removeAssociationMutation.mutateAsync(gw2AccountName);
      }

      for (const gw2AccountName of accountsToLink) {
        await associateMutation.mutateAsync({
          discordAccountId: member.discordId,
          gw2AccountName
        });
      }

      onClose();
    },
    [
      accountsToLink,
      accountsToUnlink,
      associateMutation,
      member.discordId,
      onClose,
      removeAssociationMutation
    ]
  );

  if (!member.discordId) {
    return null;
  }

  const options = data
    .filter(gw2Member => !gw2Member.discordId || gw2Member.discordId === member.discordId)
    .map(gw2Member => gw2Member.name);

  return (
    <form onSubmit={submitHandler} onReset={onClose} className="associate-form">
      <Alert severity="warning">
        <Box display="flex" flexDirection="column" gap="8px">
          <div>
            <b>Manual association should only be done where necessary or for alt accounts.</b>
          </div>
          <div>Please use nickname association where possible.</div>
        </Box>
      </Alert>
      <Autocomplete
        multiple
        value={gw2AccountNames}
        onChange={(_e, values) => setGW2AccountNames(values)}
        options={options}
        filterSelectedOptions
        renderInput={p => (
          <TextField
            label="GW2 Accounts"
            {...p}
            slotProps={{
              input: { ...p.InputProps, disableUnderline: true, sx: { borderRadius: '4px' } }
            }}
          />
        )}
        fullWidth
      />
      <div>Select linked accounts to keep; clear an account from the selection to unlink it.</div>
      <div className="actions">
        <Button type="reset" disabled={isPending}>
          Cancel
        </Button>
        <Button
          variant="contained"
          type="submit"
          disabled={(!accountsToLink.length && !accountsToUnlink.length) || isPending}
          loading={isPending}
        >
          Save Links
        </Button>
      </div>
    </form>
  );
};
