import React, { useCallback, useEffect, useState } from 'react';

import MemberRecord from '../Interfaces/MemberRecord';

import Divider from '@material-ui/core/Divider';
import Menu from '@material-ui/core/Menu';

import Add from '@material-ui/icons/Add';
import Close from '@material-ui/icons/Close';
import Edit from '@material-ui/icons/Edit';
import List from '@material-ui/icons/List';
import Remove from '@material-ui/icons/Remove';
import Search from '@material-ui/icons/Search';
import Warning from '@material-ui/icons/Warning';
import GuildMemberMenuItem from './GuildMemberMenuItem';

interface Props {
  member: MemberRecord;
  menuAnchor: Element | null;
  isAdmin: boolean;
  closeMenu: () => void;
  onKick: (member: MemberRecord) => Promise<any>;
  onEdit: (member: MemberRecord) => void;
  onChangeNickname: (member: MemberRecord) => void;
  addPoint: (member: MemberRecord) => Promise<any>;
  removePoint: (member: MemberRecord) => Promise<any>;
  setWarningOpen: (isOpen: boolean) => void;
  setWarningViewerOpen: (isOpen: boolean) => void;
}

const GuildMemberMenu = ({
  member,
  menuAnchor,
  isAdmin,
  closeMenu,
  onKick,
  onEdit,
  onChangeNickname,
  addPoint,
  removePoint,
  setWarningOpen,
  setWarningViewerOpen
}: Props) => {
  const [memberIsAdmin, setMemberIsAdmin] = useState(true);

  useEffect(() => {
    setMemberIsAdmin(member.rank === 'General' || member.rank === 'Spearmarshal');
  }, [member]);

  const menuAction = useCallback(
    async (func: Function) => {
      await func(member);
      closeMenu();
    },
    [member, closeMenu]
  );

  return (
    <Menu anchorEl={menuAnchor} keepMounted open={Boolean(menuAnchor)} onClose={closeMenu}>
      <GuildMemberMenuItem
        Icon={Close}
        label="Kick"
        disabled={!isAdmin || memberIsAdmin}
        className="error"
        action={() => menuAction(onKick)}
      />
      <GuildMemberMenuItem
        Icon={List}
        label="Edit Roles"
        disabled={!isAdmin || memberIsAdmin || !member.discordId}
        action={() => menuAction(onEdit)}
      />
      <GuildMemberMenuItem
        Icon={Edit}
        label="Edit Nickname"
        disabled={!isAdmin || memberIsAdmin || !member.discordId}
        action={() => menuAction(onChangeNickname)}
      />
      <Divider />
      <GuildMemberMenuItem
        Icon={Add}
        label="Add Point"
        disabled={!member.memberId}
        action={() => menuAction(addPoint)}
      />
      <GuildMemberMenuItem
        Icon={Remove}
        label="Remove Point"
        disabled={!member.memberId}
        action={() => menuAction(removePoint)}
      />
      <Divider />
      <GuildMemberMenuItem
        Icon={Warning}
        disabled={!isAdmin || !member.memberId}
        className="warning"
        action={() => menuAction(() => setWarningOpen(true))}
        label="Give Warning"
      />
      <GuildMemberMenuItem
        Icon={Search}
        disabled={!member.memberId || member.warnings.length < 1}
        action={() => menuAction(() => setWarningViewerOpen(true))}
        label="View Warnings"
      />
    </Menu>
  );
};

export default GuildMemberMenu;
