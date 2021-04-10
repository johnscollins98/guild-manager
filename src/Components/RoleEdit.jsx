import React, { useEffect, useState } from 'react';
import PropTypes from 'prop-types';
import {
  Checkbox,
  Dialog,
  DialogContent,
  DialogTitle,
  FormControlLabel,
  FormGroup,
} from '@material-ui/core';
import {
  addDiscordRole,
  fetchDiscordRoles,
  removeDiscordRole,
} from '../utils/DataRetrieval';

const RoleEdit = ({
  selectedRecord,
  setSelectedRecord,
  modalShow,
  setModalShow,
  records,
  setRecords,
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
      await addDiscordRole(selectedRecord.discordId, roleId);
      setSelectedRecord({
        ...selectedRecord,
        roles: [...selectedRecord.roles, { id: roleId, name: roleName }],
      });
    } else {
      await removeDiscordRole(selectedRecord.discordId, roleId);
      setSelectedRecord({
        ...selectedRecord,
        roles: selectedRecord.roles.filter((r) => r.id !== roleId),
      });
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
      const toEdit = recordsCopy.find(
        (record) => record.discordId === selectedRecord.discordId
      );
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
                <Checkbox
                  checked={selectedRecord.roles
                    .map((r) => r.id)
                    .includes(role.id)}
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

RoleEdit.propTypes = {
  selectedRecord: PropTypes.shape({
    accountName: PropTypes.string.isRequired,
    joinDate: PropTypes.string.isRequired,
    rank: PropTypes.string.isRequired,
    roles: PropTypes.array.isRequired,
  }),
  setSelectedRecord: PropTypes.func.isRequired,
  modalShow: PropTypes.bool.isRequired,
  setModalShow: PropTypes.func.isRequired,
  records: PropTypes.array.isRequired,
  setRecords: PropTypes.func.isRequired,
};

export default RoleEdit;
