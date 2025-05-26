import { getColorFromRole } from '../../lib/utils/helpers';
import './role-edit.scss';

import { MenuItem } from '@mui/material';
import Checkbox from '@mui/material/Checkbox';
import Dialog from '@mui/material/Dialog';
import DialogContent from '@mui/material/DialogContent';
import DialogTitle from '@mui/material/DialogTitle';
import FormControlLabel from '@mui/material/FormControlLabel';
import FormGroup from '@mui/material/FormGroup';
import { useSuspenseQueries } from '@tanstack/react-query';
import { useCallback, useMemo } from 'react';
import { type DiscordRole } from 'server';
import {
  discordBotRolesQuery,
  discordMembersQuery,
  discordRolesQuery,
  useAddDiscordRole,
  useRemoveDiscordRole
} from '../../lib/apis/discord-api';

interface Props {
  selectedRecordId: string | undefined;
  setSelectedRecord: (string: undefined) => void;
  modalShow: boolean;
  setModalShow: (val: boolean) => void;
}

const RoleEdit = ({ selectedRecordId, setSelectedRecord, modalShow, setModalShow }: Props) => {
  const [discordRoles, botRoles, discordMembers] = useSuspenseQueries({
    queries: [discordRolesQuery, discordBotRolesQuery, discordMembersQuery]
  });

  const selectedRecord = useMemo(
    () => discordMembers.data.find(r => r.id === selectedRecordId),
    [selectedRecordId, discordMembers.data]
  );

  const addRoleMutation = useAddDiscordRole();
  const removeRoleMutation = useRemoveDiscordRole();

  const roleIsAboveBot = useCallback(
    (r: DiscordRole) => {
      return botRoles.data.every(br => br.position < r.position) ?? false;
    },
    [botRoles]
  );

  const roleChangeHandler = async (role: DiscordRole) => {
    if (!selectedRecord || !selectedRecord.id) {
      throw new Error('Cannot change roles for this member - no discord id');
    }

    const enabled = selectedRecord.roles.find(r => r.id === role.id);

    const body = { memberId: selectedRecord.id, role };

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

  return (
    <Dialog open={modalShow} onClose={closeEdit} className="role-edit-modal">
      <DialogTitle>Edit Roles</DialogTitle>
      <DialogContent className="role-edit-content">
        {modalShow &&
          selectedRecord &&
          discordRoles.data.map(role => (
            <MenuItem
              className="role-menu-item"
              dense
              disabled={roleIsAboveBot(role)}
              key={role.id}
              onClick={() => roleChangeHandler(role)}
            >
              <FormGroup row key={role.id}>
                <FormControlLabel
                  control={
                    <StyledCheckbox
                      color={getColorFromRole(role.name, discordRoles.data) || ''}
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
