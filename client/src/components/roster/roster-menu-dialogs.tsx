import { type PopoverPosition } from '@mui/material';
import { type Dispatch, type SetStateAction, useCallback, useMemo, useState } from 'react';
import { type WarningType } from 'server';
import { useAddWarningMutation } from '../../lib/apis/warnings-api';
import type MemberRecord from '../../lib/interfaces/member-record';
import { AssociateMemberDialog } from './associate-member';
import { EditNickNameDialog } from './edit-nickname';
import GuildMemberMenu from './guild-member-menu';
import RoleEdit from './role-edit';
import WarningFormDialog from './warnings/warning-form';
import WarningsViewerDialog from './warnings/warnings-viewer';

interface Props {
  roster: MemberRecord[];
  selectedRecordId: string | undefined;
  setSelectedRecordId: Dispatch<SetStateAction<string | undefined>>;
  closeMenu: () => void;
  menuAnchor: PopoverPosition | undefined;
  onKick: (member: MemberRecord) => void;
}

export const RosterMenuDialogs = ({
  roster,
  menuAnchor,
  selectedRecordId,
  setSelectedRecordId,
  closeMenu,
  onKick
}: Props) => {
  const [warningFormOpen, setWarningFormOpen] = useState(false);
  const [warningViewerOpen, setWarningViewerOpen] = useState(false);
  const [roleEditOpen, setRoleEditOpen] = useState(false);
  const [nicknameOpen, setNicknameOpen] = useState(false);

  const member = useMemo(() => {
    if (!selectedRecordId) return undefined;
    return roster.find(m => m.discordId === selectedRecordId || m.memberId === selectedRecordId);
  }, [selectedRecordId, roster]);

  const onRoleEdit = useCallback(
    (member: MemberRecord) => {
      setSelectedRecordId(member.discordId);
      setRoleEditOpen(true);
    },
    [setSelectedRecordId]
  );

  const closeRoleEdit = useCallback(() => {
    setRoleEditOpen(false);
  }, []);

  const onEditNickname = useCallback(
    (member: MemberRecord) => {
      setSelectedRecordId(member.discordId);
      setNicknameOpen(true);
    },
    [setSelectedRecordId]
  );

  const closeNickname = useCallback(() => {
    setNicknameOpen(false);
  }, []);

  const [associateOpen, setAssociateOpen] = useState(false);
  const onAssociate = useCallback(
    (member: MemberRecord) => {
      setSelectedRecordId(member.memberId);
      setAssociateOpen(true);
    },
    [setSelectedRecordId]
  );

  const closeAssociate = useCallback(() => {
    setAssociateOpen(false);
  }, []);

  const openWarningForm = useCallback(
    (member: MemberRecord) => {
      setSelectedRecordId(member.discordId);
      setWarningFormOpen(true);
    },
    [setSelectedRecordId]
  );

  const closeWarningForm = useCallback(() => {
    setWarningFormOpen(false);
  }, []);

  const openWarningViewer = useCallback(
    (member: MemberRecord) => {
      setSelectedRecordId(member.discordId);
      setWarningViewerOpen(true);
    },
    [setSelectedRecordId]
  );

  const closeWarningViewer = useCallback(() => {
    setWarningViewerOpen(false);
  }, []);

  const addWarningMutation = useAddWarningMutation();

  const warningSubmitHandler = useCallback(
    async (reason: string, warningType: WarningType) => {
      console.log(member);
      if (!member?.discordId) {
        throw new Error('Member does not exist');
      }
      await addWarningMutation.mutateAsync({
        givenTo: member.discordId,
        reason,
        type: warningType
      });
    },
    [addWarningMutation, member]
  );
  return (
    <>
      <GuildMemberMenu
        member={member}
        menuAnchor={menuAnchor}
        closeMenu={closeMenu}
        onKick={onKick}
        onEdit={onRoleEdit}
        onAssociateMember={onAssociate}
        onChangeNickname={onEditNickname}
        openWarningForm={openWarningForm}
        openWarningViewer={openWarningViewer}
      />
      <WarningFormDialog
        isOpen={warningFormOpen}
        onClose={closeWarningForm}
        onSubmit={warningSubmitHandler}
        isPending={addWarningMutation.isPending}
      />
      <WarningsViewerDialog
        isOpen={warningViewerOpen}
        onClose={closeWarningViewer}
        member={member}
      />
      <AssociateMemberDialog isOpen={associateOpen} onClose={closeAssociate} member={member} />
      <EditNickNameDialog isOpen={nicknameOpen} onClose={closeNickname} member={member} />
      <RoleEdit modalShow={roleEditOpen} onClose={closeRoleEdit} selectedRecord={member} />
    </>
  );
};
