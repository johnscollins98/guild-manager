import React, { ChangeEvent } from 'react';
import { getColorFromRole } from '../../lib/utils/helpers';
import './role-edit.scss';

import Checkbox from '@mui/material/Checkbox';
import Dialog from '@mui/material/Dialog';
import DialogContent from '@mui/material/DialogContent';
import DialogTitle from '@mui/material/DialogTitle';
import FormControlLabel from '@mui/material/FormControlLabel';
import FormGroup from '@mui/material/FormGroup';
import {
  useAddDiscordRole,
  useDiscordRoles,
  useRemoveDiscordRole
} from '../../lib/apis/discord-api';
import DiscordRole from '../../lib/interfaces/discord-role';
import MemberRecord from '../../lib/interfaces/member-record';

interface Props {
  selectedRecord: MemberRecord | undefined;
  setSelectedRecord: (member: undefined) => void;
  modalShow: boolean;
  setModalShow: (val: boolean) => void;
}

const RoleEdit = ({ selectedRecord, setSelectedRecord, modalShow, setModalShow }: Props) => {
  const { data: roles } = useDiscordRoles();
  const addRoleMutation = useAddDiscordRole();
  const removeRoleMutation = useRemoveDiscordRole();

  const roleChangeHandler = async (e: React.ChangeEvent<HTMLInputElement>, role: DiscordRole) => {
    if (!selectedRecord || !selectedRecord.discordId) {
      throw new Error('Cannot change roles for this member - no discord id');
    }

    const body = { memberId: selectedRecord.discordId, role };

    if (e.target.checked) {
      addRoleMutation.mutateAsync(body);
    } else {
      removeRoleMutation.mutateAsync(body);
    }
  };

  const closeEdit = async () => {
    setModalShow(false);
    setSelectedRecord(undefined);
  };

  if (!selectedRecord) return null;
  return (
    <Dialog open={modalShow} onClose={closeEdit} className="role-edit-modal">
      <DialogTitle>Edit Roles</DialogTitle>
      <DialogContent className="role-edit-content">
        {roles?.map(role => (
          <FormGroup row key={role.id}>
            <FormControlLabel
              control={
                <StyledCheckbox
                  color={getColorFromRole(role.name, roles) || ''}
                  checked={selectedRecord.roles.map(r => r.id).includes(role.id)}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) => roleChangeHandler(e, role)}
                />
              }
              label={role.name}
            />
          </FormGroup>
        ))}
      </DialogContent>
    </Dialog>
  );
};

export default RoleEdit;

interface StyleProps {
  color: string;
  checked: boolean;
  onChange: (e: ChangeEvent<HTMLInputElement>) => void;
}

const StyledCheckbox = ({ color, ...props }: StyleProps) => (
  <Checkbox sx={{ color: color, '&.Mui-checked': { color: color } }} {...props} />
);
