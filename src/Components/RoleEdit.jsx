import React, { useEffect, useState } from 'react';

import { getColorFromRole } from '../utils/Helpers';
import { addDiscordRole, fetchDiscordRoles, removeDiscordRole } from '../utils/DataRetrieval';

import Checkbox from '@material-ui/core/Checkbox';
import Dialog from '@material-ui/core/Dialog';
import DialogContent from '@material-ui/core/DialogContent';
import DialogTitle from '@material-ui/core/DialogTitle';
import FormControlLabel from '@material-ui/core/FormControlLabel';
import FormGroup from '@material-ui/core/FormGroup';
import withStyles from '@material-ui/core/styles/withStyles';

const RoleEdit = ({
  selectedRecord,
  setSelectedRecord,
  modalShow,
  setModalShow,
  records,
  setRecords,
  openToast
}) => {
  const [allRoles, setAllRoles] = useState([]);
  const [edittingRole, setEdittingRole] = useState(false);
  const [anyChanges, setAnyChanges] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      setAllRoles(await fetchDiscordRoles());
    };
    fetchData();
  }, []);

  const roleChangeHandler = async (e, roleId, roleName) => {
    setEdittingRole(true);

    if (e.target.checked) {
      const res = await addDiscordRole(selectedRecord.discordId, roleId);
      if (res) {
        setSelectedRecord({
          ...selectedRecord,
          roles: [...selectedRecord.roles, { id: roleId, name: roleName }]
        });
      } else {
        openToast('Something went wrong changing roles', 'error');
      }
    } else {
      const res = await removeDiscordRole(selectedRecord.discordId, roleId);
      if (res) {
        setSelectedRecord({
          ...selectedRecord,
          roles: selectedRecord.roles.filter((r) => r.id !== roleId)
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

    if (anyChanges) {
      const recordsCopy = [...records];
      const toEdit = recordsCopy.find((record) => record.discordId === selectedRecord.discordId);
      toEdit.roles = selectedRecord.roles;

      setRecords(recordsCopy);
      setAnyChanges(false);
    }
  };

  if (!selectedRecord) return null;
  return (
    <Dialog open={modalShow} onClose={closeEdit}>
      <DialogTitle>Edit Roles</DialogTitle>
      <DialogContent>
        {allRoles.map((role) => (
          <FormGroup row key={role.id}>
            <FormControlLabel
              control={
                <StyledCheckbox
                  color={getColorFromRole(role.name, allRoles)}
                  checked={selectedRecord.roles.map((r) => r.id).includes(role.id)}
                  onChange={(e) => roleChangeHandler(e, role.id, role.name)}
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

const StyledCheckbox = ({ color, ...props }) => {
  const OurCheckbox = withStyles({
    root: {
      color: color,
      '&$checked': {
        color: color
      }
    },
    checked: {}
  })((props) => <Checkbox color="default" {...props} />);

  return <OurCheckbox {...props} />;
};
