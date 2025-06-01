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
import { useAuth } from '../../lib/apis/auth-api';
import { useRemoveAssociation } from '../../lib/apis/gw2-api';
import type MemberRecord from '../../lib/interfaces/member-record';
import { useConfirm } from '../common/confirm-dialog';
import GuildMemberDetails from './guild-member-details';
import GuildMemberMenuItem from './guild-member-menu-item';
import { useIsHigherRole } from './use-is-higher-role';

interface Props {
  member?: MemberRecord;
  menuAnchor: PopoverPosition | undefined;
  closeMenu: () => void;
  onKick: (member: MemberRecord) => void;
  onEdit: (member: MemberRecord) => void;
  onAssociateMember: (member: MemberRecord) => void;
  onChangeNickname: (member: MemberRecord) => void;
  openWarningForm: (member: MemberRecord) => void;
  openWarningViewer: (member: MemberRecord) => void;
}

const GuildMemberMenu = ({ menuAnchor, member, ...props }: Props) => {
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
      open={Boolean(menuAnchor) && !!member}
      onClose={props.closeMenu}
    >
      {member && <MenuContent member={member} {...props} />}
    </Menu>
  );
};

const MenuContent = ({
  closeMenu,
  member,
  onEdit,
  onKick,
  onAssociateMember,
  onChangeNickname,
  openWarningForm,
  openWarningViewer
}: Omit<Props, 'menuAnchor' | 'member'> & { member: MemberRecord }) => {
  const { data: authInfo } = useAuth();
  const permissions = authInfo.permissions;

  const menuAction = useCallback(
    async (func: (member: MemberRecord) => Promise<void> | void) => {
      await func(member);
      closeMenu();
    },
    [member, closeMenu]
  );

  const confirm = useConfirm();

  const removeAssociationMutation = useRemoveAssociation();
  const associationRemoveHandler = useCallback(async () => {
    if (!member.memberId) return;
    const res = await confirm('Are you sure you want to remove this association?');
    if (res) {
      removeAssociationMutation.mutate(member.memberId);
    }
  }, [removeAssociationMutation, confirm, member.memberId]);

  const memberIsHigherRole = useIsHigherRole(member);

  return (
    <>
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
      <Divider />
      <GuildMemberMenuItem
        Icon={Person}
        label="Associate"
        disabled={!permissions.MEMBERS || !member.memberId}
        action={() => menuAction(() => onAssociateMember(member))}
      />
      <GuildMemberMenuItem
        Icon={Close}
        label="Remove Association"
        className="error"
        disabled={!permissions.MEMBERS || !member.manualMatch}
        action={() => menuAction(() => associationRemoveHandler())}
      />
      <Divider />
      <GuildMemberMenuItem
        Icon={Warning}
        disabled={!permissions.WARNINGS || !member.discordId}
        className="warning"
        action={() => menuAction(() => openWarningForm(member))}
        label="Give Warning"
      />
      <GuildMemberMenuItem
        Icon={Search}
        disabled={!member.discordId || member.warnings.length < 1}
        action={() => menuAction(() => openWarningViewer(member))}
        label="View Warnings"
      />
    </>
  );
};

export default GuildMemberMenu;
