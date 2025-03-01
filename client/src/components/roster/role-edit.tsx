import { getColorFromRole } from '../../lib/utils/helpers';
import './role-edit.scss';

import { MenuItem } from '@mui/material';
import Checkbox from '@mui/material/Checkbox';
import Dialog from '@mui/material/Dialog';
import DialogContent from '@mui/material/DialogContent';
import DialogTitle from '@mui/material/DialogTitle';
import FormControlLabel from '@mui/material/FormControlLabel';
import FormGroup from '@mui/material/FormGroup';
import { type DiscordRole } from 'server';
import {
  useAddDiscordRole,
  useDiscordRoles,
  useRemoveDiscordRole
} from '../../lib/apis/discord-api';
import type MemberRecord from '../../lib/interfaces/member-record';

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

  const roleChangeHandler = async (role: DiscordRole) => {
    if (!selectedRecord || !selectedRecord.discordId) {
      throw new Error('Cannot change roles for this member - no discord id');
    }

    const enabled = selectedRecord.roles.find(r => r.id === role.id);

    const body = { memberId: selectedRecord.discordId, role };

    if (!enabled) {
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
          <MenuItem
            className="role-menu-item"
            dense
            key={role.id}
            onClick={() => roleChangeHandler(role)}
          >
            <FormGroup row key={role.id}>
              <FormControlLabel
                control={
                  <StyledCheckbox
                    color={getColorFromRole(role.name, roles) || ''}
                    checked={selectedRecord.roles.map(r => r.id).includes(role.id)}
                  />
                }
                label={role.name}
              />
            </FormGroup>
          </MenuItem>
        ))}
      </DialogContent>
    </Dialog>
  );
};

export default RoleEdit;

interface StyleProps {
  color: string;
  checked: boolean;
}

const StyledCheckbox = ({ color, ...props }: StyleProps) => (
  <Checkbox sx={{ color: color, '&.Mui-checked': { color: color } }} size="small" {...props} />
);
