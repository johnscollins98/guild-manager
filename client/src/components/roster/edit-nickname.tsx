import {
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  TextField
} from '@mui/material';
import { useState, type FormEvent } from 'react';
import { useUpdateDiscordMember } from '../../lib/apis/discord-api';
import type MemberRecord from '../../lib/interfaces/member-record';

export interface EditNicknameProps {
  isOpen: boolean;
  onClose: () => void;
  member: MemberRecord;
}

export const EditNickNameDialog = ({ isOpen, onClose, member }: EditNicknameProps) => {
  return (
    <Dialog open={isOpen} onClose={onClose} maxWidth="xs" fullWidth>
      <DialogTitle>Edit Nickname</DialogTitle>
      <EditNicknameForm member={member} onClose={onClose} />
    </Dialog>
  );
};

interface EditNicknameFormProps {
  member: MemberRecord;
  onClose: () => void;
}

const EditNicknameForm = ({ member, onClose }: EditNicknameFormProps) => {
  const changeMemberMutation = useUpdateDiscordMember();
  const [nickname, setNickname] = useState(member.discordName ?? '');

  const submitHandler = async (e: FormEvent<HTMLFormElement>) => {
    e.stopPropagation();
    e.preventDefault();
    if (member.discordId) {
      await changeMemberMutation.mutateAsync({
        memberId: member.discordId,
        nick: nickname
      });

      onClose();
    }
  };

  return (
    <form onSubmit={submitHandler} onReset={onClose}>
      <DialogContent>
        <TextField
          label="Nickname"
          value={nickname}
          fullWidth
          onChange={e => setNickname(e.target.value)}
        />
      </DialogContent>
      <DialogActions>
        <Button type="reset" disabled={changeMemberMutation.isPending}>
          Cancel
        </Button>
        <Button
          color="primary"
          variant="contained"
          type="submit"
          disabled={changeMemberMutation.isPending}
          loading={changeMemberMutation.isPending}
        >
          Submit
        </Button>
      </DialogActions>
    </form>
  );
};
