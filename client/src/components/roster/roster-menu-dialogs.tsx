import { type PopoverPosition } from '@mui/material';
import { type Dispatch, type SetStateAction, useCallback, useMemo, useState } from 'react';
import { type WarningType } from 'server';
import { useAddWarningMutation } from '../../lib/apis/warnings-api';
import type MemberRecord from '../../lib/interfaces/member-record';
import { LinkDiscordAccountDialog, LinkGW2AccountDialog } from './associate-member';
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

  const [linkDiscordOpen, setLinkDiscordOpen] = useState(false);
  const onLinkDiscordAccount = useCallback(
    (member: MemberRecord) => {
      setSelectedRecordId(member.memberId);
      setLinkDiscordOpen(true);
    },
    [setSelectedRecordId]
  );

  const closeLinkDiscord = useCallback(() => {
    setLinkDiscordOpen(false);
  }, []);

  const [linkGW2Open, setLinkGW2Open] = useState(false);
  const onLinkGW2Account = useCallback(
    (member: MemberRecord) => {
      setSelectedRecordId(member.discordId);
      setLinkGW2Open(true);
    },
    [setSelectedRecordId]
  );

  const closeLinkGW2 = useCallback(() => {
    setLinkGW2Open(false);
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
        onLinkDiscordAccount={onLinkDiscordAccount}
        onLinkGW2Account={onLinkGW2Account}
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
      <LinkDiscordAccountDialog
        isOpen={linkDiscordOpen}
        onClose={closeLinkDiscord}
        member={member}
      />
      <LinkGW2AccountDialog isOpen={linkGW2Open} onClose={closeLinkGW2} member={member} />
      <EditNickNameDialog isOpen={nicknameOpen} onClose={closeNickname} member={member} />
      <RoleEdit modalShow={roleEditOpen} onClose={closeRoleEdit} selectedRecord={member} />
    </>
  );
};
