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

export const EditNickName = ({ isOpen, onClose, member }: EditNicknameProps) => {
  const changeMemberMutation = useUpdateDiscordMember();
  const [nickname, setNickname] = useState(member.discordName ?? '');

  const submitHandler = (e: FormEvent<HTMLFormElement>) => {
    e.stopPropagation();
    e.preventDefault();
    if (member.discordId) {
      changeMemberMutation.mutate({
        memberId: member.discordId,
        nick: nickname
      });

      onClose();
    }
  };

  return (
    <Dialog open={isOpen} onClose={onClose} maxWidth="xs" fullWidth>
      <DialogTitle>Edit Nickname</DialogTitle>
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
          <Button type="reset">Cancel</Button>
          <Button color="primary" variant="contained" type="submit">
            Submit
          </Button>
        </DialogActions>
      </form>
    </Dialog>
  );
};
