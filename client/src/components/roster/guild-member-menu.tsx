import Close from '@mui/icons-material/Close';
import Edit from '@mui/icons-material/Edit';
import List from '@mui/icons-material/List';
import Person from '@mui/icons-material/Person';
import Search from '@mui/icons-material/Search';
import Warning from '@mui/icons-material/Warning';
import Divider from '@mui/material/Divider';
import Menu from '@mui/material/Menu';
import { type PopoverPosition } from '@mui/material/Popover';
import { useCallback } from 'react';
import { type PermissionsDTO } from 'server';
import type MemberRecord from '../../lib/interfaces/member-record';
import GuildMemberDetails from './guild-member-details';
import GuildMemberMenuItem from './guild-member-menu-item';

interface Props {
  member: MemberRecord;
  menuAnchor: PopoverPosition | undefined;
  permissions: PermissionsDTO;
  memberIsHigherRole: boolean;
  closeMenu: () => void;
  onKick: (member: MemberRecord) => void;
  onEdit: (member: MemberRecord) => void;
  onAssociateMember: (member: MemberRecord) => void;
  onChangeNickname: (member: MemberRecord) => void;
  setWarningOpen: (isOpen: boolean) => void;
  setWarningViewerOpen: (isOpen: boolean) => void;
}

const GuildMemberMenu = ({
  member,
  menuAnchor,
  permissions,
  memberIsHigherRole,
  closeMenu,
  onKick,
  onEdit,
  onAssociateMember,
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
      <Divider sx={{ marginBottom: '8px' }} />
      <GuildMemberMenuItem
        Icon={Close}
        label="Kick"
        disabled={!permissions.MEMBERS || memberIsHigherRole || !member.discordId}
        className="error"
        action={() => menuAction(onKick)}
      />
      <GuildMemberMenuItem
        Icon={List}
        label="Edit Roles"
        disabled={!permissions.MEMBERS || memberIsHigherRole || !member.discordId}
        action={() => menuAction(onEdit)}
      />
      <GuildMemberMenuItem
        Icon={Edit}
        label="Edit Nickname"
        disabled={!permissions.MEMBERS || memberIsHigherRole || !member.discordId}
        action={() => menuAction(onChangeNickname)}
      />
      <GuildMemberMenuItem
        Icon={Person}
        label="Associate"
        disabled={!permissions.MEMBERS || !member.memberId}
        action={() => menuAction(() => onAssociateMember(member))}
      />
      <Divider />
      <GuildMemberMenuItem
        Icon={Warning}
        disabled={!permissions.WARNINGS || !member.discordId}
        className="warning"
        action={() => menuAction(() => setWarningOpen(true))}
        label="Give Warning"
      />
      <GuildMemberMenuItem
        Icon={Search}
        disabled={!member.discordId || member.warnings.length < 1}
        action={() => menuAction(() => setWarningViewerOpen(true))}
        label="View Warnings"
      />
    </Menu>
  );
};

export default GuildMemberMenu;
