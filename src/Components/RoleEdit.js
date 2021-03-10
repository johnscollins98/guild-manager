import React, { useEffect, useState } from "react";
import PropTypes from "prop-types";
import Modal from "react-bootstrap/Modal";
import Form from "react-bootstrap/Form";
import DataRetrieval from "../utils/DataRetrieval";

const RoleEdit = ({
  selectedRecord,
  setSelectedRecord,
  modalShow,
  setModalShow,
  refresh,
}) => {
  const [allRoles, setAllRoles] = useState([]);
  const [edittingRole, setEdittingRole] = useState(false);
  const [anyChanges, setAnyChanges] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      setAllRoles(await DataRetrieval.fetchDiscordRoles());
    };
    fetchData();
  }, []);

  const roleChangeHandler = async (e, roleId, roleName) => {
    setEdittingRole(true);

    if (e.target.checked) {
      await DataRetrieval.addDiscordRole(selectedRecord.discordId, roleId);
      setSelectedRecord({
        ...selectedRecord,
        roles: [...selectedRecord.roles, { id: roleId, name: roleName }],
      });
    } else {
      await DataRetrieval.removeDiscordRole(selectedRecord.discordId, roleId);
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
      refresh();
      setAnyChanges(false);
    }
  };

  if (!selectedRecord) return null;
  return (
    <Modal show={modalShow} onHide={closeEdit}>
      <Modal.Header closeButton>
        <Modal.Title>Edit Roles</Modal.Title>
      </Modal.Header>
      <Modal.Body>
        <Form>
          {allRoles.map((role) => (
            <Form.Check
              key={role.id}
              label={role.name}
              checked={selectedRecord.roles.map((r) => r.id).includes(role.id)}
              onChange={(e) => roleChangeHandler(e, role.id, role.name)}
            />
          ))}
        </Form>
      </Modal.Body>
    </Modal>
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
  refresh: PropTypes.func.isRequired,
};

export default RoleEdit;
