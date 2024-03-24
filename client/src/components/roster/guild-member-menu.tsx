import Close from '@mui/icons-material/Close';
import Edit from '@mui/icons-material/Edit';
import List from '@mui/icons-material/List';
import Search from '@mui/icons-material/Search';
import Warning from '@mui/icons-material/Warning';
import Divider from '@mui/material/Divider';
import Menu from '@mui/material/Menu';
import { PopoverPosition } from '@mui/material/Popover';
import { useCallback } from 'react';
import MemberRecord from '../../lib/interfaces/member-record';
import GuildMemberDetails from './guild-member-details';
import GuildMemberMenuItem from './guild-member-menu-item';

interface Props {
  member: MemberRecord;
  menuAnchor: PopoverPosition | undefined;
  isAdmin: boolean;
  memberIsAdmin: boolean;
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
  memberIsAdmin,
  closeMenu,
  onKick,
  onEdit,
  onChangeNickname,
  setWarningOpen,
  setWarningViewerOpen
}: Props) => {
  const menuAction = useCallback(
    async (func: (member: MemberRecord) => Promise<void> | void) => {
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
      <GuildMemberDetails member={member} />
      <Divider />
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
