import React, { useCallback, useEffect, useState } from 'react';
import './GuildMemberMenu.scss';

import MemberRecord from '../Interfaces/MemberRecord';

import Divider from '@material-ui/core/Divider';
import Menu from '@material-ui/core/Menu';
import MenuItem from '@material-ui/core/MenuItem';

import Add from '@material-ui/icons/Add';
import Close from '@material-ui/icons/Close';
import Edit from '@material-ui/icons/Edit';
import List from '@material-ui/icons/List';
import Remove from '@material-ui/icons/Remove';
import Search from '@material-ui/icons/Search';
import Warning from '@material-ui/icons/Warning';

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
      <MenuItem
        disabled={!isAdmin || memberIsAdmin}
        onClick={() => menuAction(onKick)}
        className="error"
      >
        <span className="menu-item error">
          <Close className="icon" />
          Kick
        </span>
      </MenuItem>
      <MenuItem
        disabled={!isAdmin || memberIsAdmin || !member.discordId}
        onClick={() => menuAction(onEdit)}
      >
        <span className="menu-item">
          <List className="icon" />
          Edit Roles
        </span>
      </MenuItem>
      <MenuItem
        disabled={!isAdmin || memberIsAdmin || !member.discordId}
        onClick={() => menuAction(onChangeNickname)}
      >
        <span className="menu-item">
          <Edit className="icon" />
          Edit Nickname
        </span>
      </MenuItem>
      <Divider />
      <MenuItem disabled={!member.memberId} onClick={() => menuAction(addPoint)}>
        <span className="menu-item">
          <Add className="icon" />
          Add Point
        </span>
      </MenuItem>
      <MenuItem disabled={!member.memberId} onClick={() => menuAction(removePoint)}>
        <span className="menu-item">
          <Remove className="icon" />
          Remove Point
        </span>
      </MenuItem>
      <Divider />
      <MenuItem
        disabled={!isAdmin || !member.memberId}
        onClick={() => menuAction(() => setWarningOpen(true))}
        className="warning"
      >
        <span className="menu-item warning">
          <Warning className="icon" />
          Give Warning
        </span>
      </MenuItem>
      <MenuItem
        disabled={!member.memberId || member.warnings.length < 1}
        onClick={() => menuAction(() => setWarningViewerOpen(true))}
      >
        <span className="menu-item">
          <Search className="icon" />
          View Warnings
        </span>
      </MenuItem>
    </Menu>
  );
};

export default GuildMemberMenu;
