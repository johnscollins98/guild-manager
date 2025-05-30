import CalendarToday from '@mui/icons-material/CalendarToday';
import MailIcon from '@mui/icons-material/Mail';
import PersonIcon from '@mui/icons-material/Person';
import ScheduleSendIcon from '@mui/icons-material/ScheduleSend';
import SyncProblem from '@mui/icons-material/SyncProblem';
import Timer from '@mui/icons-material/Timer';
import { CardActionArea, Checkbox, useTheme } from '@mui/material';
import Avatar from '@mui/material/Avatar';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import { type PopoverPosition } from '@mui/material/Popover';
import Tooltip from '@mui/material/Tooltip';
import Typography from '@mui/material/Typography';
import type React from 'react';
import { useCallback, useMemo, useState, type Dispatch, type SetStateAction } from 'react';
import { WarningType, type AuthInfo, type DiscordRole, type WarningDTO } from 'server';
import DiscordLogo from '../../assets/images/discord.svg?react';
import Gw2Logo from '../../assets/images/gw2.svg?react';
import { useRemoveAssociation } from '../../lib/apis/gw2-api';
import { useAddWarningMutation } from '../../lib/apis/warnings-api';
import type MemberRecord from '../../lib/interfaces/member-record';
import { getDateString } from '../../lib/utils/data-processing';
import { getColorFromRole } from '../../lib/utils/helpers';
import { useConfirm } from '../common/confirm-dialog';
import { AssociateMemberDialog } from './associate-member';
import { EditNickNameDialog } from './edit-nickname';
import './guild-member-card.scss';
import GuildMemberMenu from './guild-member-menu';
import WarningFormDialog from './warnings/warning-form';
import WarningsViewerDialog from './warnings/warnings-viewer';

interface Props {
  member: MemberRecord;
  discordRoles: DiscordRole[];
  botRoles: DiscordRole[];
  authInfo: AuthInfo;
  onKick: (member: MemberRecord) => void;
  onEdit: (member: MemberRecord) => void;
  selection: string[];
  setSelection: Dispatch<SetStateAction<string[]>>;
  kickMode: boolean;
}

const GuildMemberCard = ({
  member,
  discordRoles,
  onKick,
  onEdit,
  authInfo,
  botRoles,
  selection,
  setSelection,
  kickMode
}: Props) => {
  const rank = member.rank || member.roles[0]?.name;
  const color = getColorFromRole(rank, discordRoles);

  const theme = useTheme();

  const confirm = useConfirm();

  const [menuAnchor, setMenuAnchor] = useState<PopoverPosition | undefined>(undefined);
  const [warningOpen, setWarningOpen] = useState(false);
  const [warningViewerOpen, setWarningViewerOpen] = useState(false);

  const addWarningMutation = useAddWarningMutation();
  const removeAssociationMutation = useRemoveAssociation();

  const openMenu = useCallback(
    (e: React.MouseEvent) => {
      e.preventDefault();
      setMenuAnchor({ top: e.clientY, left: e.clientX });
    },
    [setMenuAnchor]
  );

  const closeMenu = useCallback(() => {
    setMenuAnchor(undefined);
  }, [setMenuAnchor]);

  const warningSubmitHandler = useCallback(
    async (reason: string, warningType: WarningType) => {
      if (!member.discordId) {
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

  const associationRemoveHandler = useCallback(async () => {
    if (!member.memberId) return;
    const res = await confirm('Are you sure you want to remove this association?');
    if (res) {
      removeAssociationMutation.mutate(member.memberId);
    }
  }, [member.memberId, removeAssociationMutation, confirm]);

  const [editOpen, setEditOpen] = useState(false);
  const onEditNickname = () => {
    setEditOpen(true);
  };

  const [associateOpen, setAssociateOpen] = useState(false);
  const onAssociate = () => {
    setAssociateOpen(true);
  };

  const warningsByType: Record<WarningType, WarningDTO[]> = useMemo(() => {
    const byType: Record<WarningType, WarningDTO[]> = {
      event: [],
      informal: [],
      official: []
    };

    member.warnings.forEach(w => byType[w.type].push(w));

    return byType;
  }, [member.warnings]);

  const userRoles = useMemo(() => {
    return authInfo.roles.map(id => discordRoles.find(r => r.id === id)).filter(r => !!r);
  }, [authInfo.roles, discordRoles]);

  const memberIsHigherRole = useMemo(
    () =>
      member.roles.some(
        r =>
          userRoles.every(ur => r.position >= ur.position) ||
          botRoles.every(br => r.position >= br.position)
      ),
    [member.roles, userRoles, botRoles]
  );

  const selected = useMemo(
    () => !!member.discordId && selection.includes(member.discordId),
    [member.discordId, selection]
  );

  const onClickKickMode = useCallback(() => {
    const id = member.discordId;
    if (!id) return;
    if (memberIsHigherRole) return;

    if (selected) {
      setSelection(old => old.filter(m => m !== id));
    } else {
      if (selection.length >= 5) return;
      setSelection(old => [...old, id]);
    }
  }, [member.discordId, memberIsHigherRole, selected, selection.length, setSelection]);

  return (
    <>
      <Card
        variant="outlined"
        className={`member-card ${kickMode ? 'kick-mode' : ''}`}
        style={{ borderLeftColor: color }}
        onClick={kickMode ? () => onClickKickMode() : openMenu}
      >
        <CardActionArea>
          <CardContent>
            <div className="top-row">
              <div className="name">
                {kickMode && member.discordId && !memberIsHigherRole ? (
                  <Checkbox disabled={!selected && selection.length >= 5} checked={selected} />
                ) : (
                  <Avatar
                    className="avatar"
                    alt={member.memberId || member.discordName}
                    src={member.avatar}
                  >
                    {member.memberId
                      ? member.memberId[0]
                      : member.discordName
                        ? member.discordName[0]
                        : null}
                  </Avatar>
                )}
                <span className="details">
                  <Typography className="name" sx={{ color }}>
                    {member.memberId || member.discordName}
                  </Typography>
                  {member.joinDate ? (
                    <span className="date">
                      <CalendarToday />
                      <Typography>{getDateString(member.joinDate)}</Typography>
                    </span>
                  ) : null}
                </span>
              </div>
              <div className="icons-container">
                {member.issues.unmatchingRoles ? (
                  <Tooltip
                    title={`Unmatching Roles (${member.rank} / ${
                      member.roles[0]?.name || 'No Role'
                    })`}
                  >
                    <SyncProblem className="error" />
                  </Tooltip>
                ) : null}
                {member.issues.pending ? (
                  <Tooltip title={`Waiting for invitation`}>
                    <ScheduleSendIcon className="error" />
                  </Tooltip>
                ) : null}
                {member.issues.invited ? (
                  <Tooltip title={`Unaccepted invitation`}>
                    <MailIcon className="error" />
                  </Tooltip>
                ) : null}
                {member.issues.over24h ? (
                  <Tooltip title="Been in server over 24h">
                    <Timer className="error" />
                  </Tooltip>
                ) : null}
                {member.issues.overAWeek ? (
                  <Tooltip title="Been in server over a week">
                    <Timer className="error" />
                  </Tooltip>
                ) : null}
                {member.issues.missingGW2 ? (
                  <Tooltip title="GW2 Account Not Found">
                    <span>
                      <Gw2Logo width="24" height="24" className="error" />
                    </span>
                  </Tooltip>
                ) : null}
                {member.issues.missingDiscord ? (
                  <Tooltip title="Discord Account Not Found">
                    <span>
                      <DiscordLogo width="24" height="24" className="error" />
                    </span>
                  </Tooltip>
                ) : null}
                {member.manualMatch ? (
                  <Tooltip title="This member has been matched manually">
                    <PersonIcon />
                  </Tooltip>
                ) : null}
                {member.discordName ? (
                  <Tooltip title={member.discordName}>
                    <span>
                      <DiscordLogo width="24" height="24" color={theme.palette.action.active} />
                    </span>
                  </Tooltip>
                ) : null}
                {member.rankImage && member.rank ? (
                  <Tooltip title={member.rank}>
                    <span>
                      <img
                        alt={member.rank}
                        src={member.rankImage}
                        style={{
                          filter: `drop-shadow(0px 100px 0 ${theme.palette.action.active})`,
                          transform: 'translateY(-100px)'
                        }}
                        width="24"
                        height="24"
                        className="rank-image"
                      />
                    </span>
                  </Tooltip>
                ) : null}
                {Object.values(WarningType).map(type =>
                  warningsByType[type].length ? (
                    <Tooltip title={`Number of ${type} warnings`} key={type}>
                      <Avatar className={`number ${type}`}>{warningsByType[type].length}</Avatar>
                    </Tooltip>
                  ) : null
                )}
              </div>
            </div>
          </CardContent>
        </CardActionArea>
      </Card>
      <GuildMemberMenu
        member={member}
        menuAnchor={menuAnchor}
        permissions={authInfo.permissions}
        memberIsHigherRole={memberIsHigherRole}
        closeMenu={closeMenu}
        onKick={onKick}
        onEdit={onEdit}
        onAssociateMember={onAssociate}
        removeAssociation={associationRemoveHandler}
        onChangeNickname={onEditNickname}
        setWarningOpen={setWarningOpen}
        setWarningViewerOpen={setWarningViewerOpen}
      />
      <WarningFormDialog
        isOpen={warningOpen}
        onClose={() => setWarningOpen(false)}
        onSubmit={warningSubmitHandler}
        isPending={addWarningMutation.isPending}
      />
      <WarningsViewerDialog
        isOpen={warningViewerOpen}
        onClose={() => setWarningViewerOpen(false)}
        member={member}
      />
      <AssociateMemberDialog
        isOpen={associateOpen}
        onClose={() => setAssociateOpen(false)}
        member={member}
      />
      <EditNickNameDialog isOpen={editOpen} onClose={() => setEditOpen(false)} member={member} />
    </>
  );
};

export default GuildMemberCard;
