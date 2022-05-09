import React, { ChangeEvent, useEffect, useState } from 'react';
import './RoleEdit.scss';
import { getColorFromRole } from '../../utils/Helpers';
import { addDiscordRole, fetchDiscordRoles, removeDiscordRole } from '../../utils/DataRetrieval';

import MemberRecord from '../../Interfaces/MemberRecord';
import DiscordRole from '../../Interfaces/DiscordRole';
import { AlertColor } from '@mui/material/Alert';
import Dialog from '@mui/material/Dialog';
import DialogTitle from '@mui/material/DialogTitle';
import FormGroup from '@mui/material/FormGroup';
import DialogContent from '@mui/material/DialogContent';
import FormControlLabel from '@mui/material/FormControlLabel';
import Checkbox from '@mui/material/Checkbox';

interface Props {
  selectedRecord: MemberRecord | null;
  setSelectedRecord: (member: MemberRecord | null) => void;
  modalShow: boolean;
  setModalShow: (val: boolean) => void;
  records: MemberRecord[];
  setRecords: (members: MemberRecord[]) => void;
  openToast: (msg: string, status: AlertColor) => void;
}

const RoleEdit = ({
  selectedRecord,
  setSelectedRecord,
  modalShow,
  setModalShow,
  records,
  setRecords,
  openToast
}: Props) => {
  const [allRoles, setAllRoles] = useState<DiscordRole[]>([]);
  const [edittingRole, setEdittingRole] = useState(false);
  const [anyChanges, setAnyChanges] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      setAllRoles(await fetchDiscordRoles());
    };
    fetchData();
  }, []);

  const roleChangeHandler = async (
    e: React.ChangeEvent<HTMLInputElement>,
    roleId: string,
    roleName: string,
    roleColor: number
  ) => {
    setEdittingRole(true);

    if (!selectedRecord || !selectedRecord.discordId) {
      throw new Error('Cannot change roles for this member - no discord id');
    }

    if (e.target.checked) {
      const res = await addDiscordRole(selectedRecord.discordId, roleId);
      if (res) {
        setSelectedRecord({
          ...selectedRecord,
          roles: [...(selectedRecord.roles || []), { id: roleId, name: roleName, color: roleColor }]
        });
      } else {
        openToast('Something went wrong changing roles', 'error');
      }
    } else {
      const res = await removeDiscordRole(selectedRecord.discordId, roleId);
      if (res) {
        setSelectedRecord({
          ...selectedRecord,
          roles: selectedRecord.roles.filter(r => r.id !== roleId)
        });
      } else {
        openToast('Something went wrong changing roles', 'error');
      }
    }

    setAnyChanges(true);
    setEdittingRole(false);
  };

  const closeEdit = async () => {
    if (!edittingRole) {
      setModalShow(false);
      setSelectedRecord(null);
    }

    if (anyChanges && selectedRecord) {
      const recordsCopy = [...records];
      const toEdit = recordsCopy.find(record => record.discordId === selectedRecord.discordId);
      if (toEdit) {
        toEdit.roles = selectedRecord.roles;
        setRecords(recordsCopy);
      }
      setAnyChanges(false);
    }
  };

  if (!selectedRecord) return null;
  return (
    <Dialog open={modalShow} onClose={closeEdit} className="role-edit-modal">
      <DialogTitle>Edit Roles</DialogTitle>
      <DialogContent className="role-edit-content">
        {allRoles.map(role => (
          <FormGroup row key={role.id}>
            <FormControlLabel
              control={
                <StyledCheckbox
                  color={getColorFromRole(role.name, allRoles) || ''}
                  checked={selectedRecord.roles.map(r => r.id).includes(role.id)}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                    roleChangeHandler(e, role.id, role.name, role.color)
                  }
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
