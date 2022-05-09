import { Close, Edit, List, Search, Warning } from '@mui/icons-material';
import Divider from '@mui/material/Divider';
import Menu from '@mui/material/Menu';
import { PopoverPosition } from '@mui/material/Popover';
import { useCallback, useEffect, useState } from 'react';
import MemberRecord from '../../Interfaces/MemberRecord';
import { getAdminRoles } from '../../utils/DataRetrieval';
import GuildMemberMenuItem from './GuildMemberMenuItem';

interface Props {
  member: MemberRecord;
  menuAnchor: PopoverPosition | undefined;
  isAdmin: boolean;
  closeMenu: () => void;
  onKick: (member: MemberRecord) => void;
  onEdit: (member: MemberRecord) => void;
  onChangeNickname: (member: MemberRecord) => void;
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
  setWarningOpen,
  setWarningViewerOpen
}: Props) => {
  const [memberIsAdmin, setMemberIsAdmin] = useState(true);

  useEffect(() => {
    getAdminRoles().then(adminRoles => {
      setMemberIsAdmin(member.roles.some(r => adminRoles.includes(r.id)));
    });
  }, [member]);

  const menuAction = useCallback(
    async (func: Function) => {
      await func(member);
      closeMenu();
    },
    [member, closeMenu]
  );

  return (
    <Menu
      anchorReference="anchorPosition"
      anchorPosition={menuAnchor}
      anchorOrigin={{
        vertical: 'top',
        horizontal: 'left'
      }}
      transformOrigin={{
        vertical: 'top',
        horizontal: 'left'
      }}
      keepMounted
      open={Boolean(menuAnchor)}
      onClose={closeMenu}
    >
      <GuildMemberMenuItem
        Icon={Close}
        label="Kick"
        disabled={!isAdmin || memberIsAdmin || !member.discordId}
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
