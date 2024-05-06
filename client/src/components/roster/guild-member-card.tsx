import CalendarToday from '@mui/icons-material/CalendarToday';
import MailIcon from '@mui/icons-material/Mail';
import SyncProblem from '@mui/icons-material/SyncProblem';
import Timer from '@mui/icons-material/Timer';
import { Checkbox } from '@mui/material';
import Avatar from '@mui/material/Avatar';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import { PopoverPosition } from '@mui/material/Popover';
import Tooltip from '@mui/material/Tooltip';
import Typography from '@mui/material/Typography';
import React, { Dispatch, SetStateAction, useCallback, useState } from 'react';
import DiscordLogo from '../../assets/images/discord.svg?react';
import Gw2Logo from '../../assets/images/gw2.svg?react';
import { useAdminRoles } from '../../lib/apis/auth-api';
import { useAddWarningMutation } from '../../lib/apis/warnings-api';
import DiscordRole from '../../lib/interfaces/discord-role';
import MemberRecord from '../../lib/interfaces/member-record';
import { getDateString } from '../../lib/utils/data-processing';
import { getColorFromRole } from '../../lib/utils/helpers';
import { EditNickName } from './edit-nickname';
import './guild-member-card.scss';
import GuildMemberMenu from './guild-member-menu';
import WarningForm from './warnings/warning-form';
import WarningsViewer from './warnings/warnings-viewer';

interface Props {
  member: MemberRecord;
  discordRoles: DiscordRole[];
  isAdmin: boolean;
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
  isAdmin,
  selection,
  setSelection,
  kickMode
}: Props) => {
  const rank = member.rank || member.roles[0]?.name;
  const color = getColorFromRole(rank, discordRoles);

  const [menuAnchor, setMenuAnchor] = useState<PopoverPosition | undefined>(undefined);
  const [warningOpen, setWarningOpen] = useState(false);
  const [warningViewerOpen, setWarningViewerOpen] = useState(false);

  const addWarningMutation = useAddWarningMutation();

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
    async (reason: string) => {
      if (!member.memberId) {
        throw new Error('Member does not exist');
      }
      await addWarningMutation.mutateAsync({ givenTo: member.memberId, reason });
    },
    [addWarningMutation, member]
  );

  const [editOpen, setEditOpen] = useState(false);
  const onEditNickname = () => {
    setEditOpen(true);
  };

  const { data: adminRoles } = useAdminRoles();
  const memberIsAdmin = member.roles.some(role => adminRoles?.includes(role.id) ?? false);

  const selected = !!member.discordId && selection.includes(member.discordId);
  const onClickKickMode = () => {
    const id = member.discordId;
    if (!id) return;
    if (memberIsAdmin) return;

    if (selected) {
      setSelection(old => old.filter(m => m !== id));
    } else {
      if (selection.length >= 5) return;
      setSelection(old => [...old, id]);
    }
  };

  return (
    <>
      <Card
        variant="outlined"
        className={`member-card ${kickMode ? 'kick-mode' : ''}`}
        style={{ borderLeftColor: color }}
        onClick={kickMode ? () => onClickKickMode() : openMenu}
      >
        <CardContent>
          <div className="top-row">
            <div className="name">
              {kickMode && member.discordId && !memberIsAdmin ? (
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
                <Typography className="name">{member.memberId || member.discordName}</Typography>
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
              {member.issues.invited ? (
                <Tooltip title={`Unaccepted invitation`}>
                  <MailIcon className="error" />
                </Tooltip>
              ) : null}
              {member.issues.missingGW2 ? (
                <Tooltip title="GW2 Account Not Found">
                  <Gw2Logo width="24" height="24" className="error" />
                </Tooltip>
              ) : null}
              {member.issues.missingDiscord ? (
                <Tooltip title="Discord Account Not Found">
                  <span>
                    <DiscordLogo width="24" height="24" className="error" />
                  </span>
                </Tooltip>
              ) : null}
              {member.issues.over24h ? (
                <Tooltip title="Been in server over 24h">
                  <Timer className="error" />
                </Tooltip>
              ) : null}
              {member.discordName ? (
                <Tooltip title={member.discordName}>
                  <span>
                    <DiscordLogo width="24" height="24" />
                  </span>
                </Tooltip>
              ) : null}
              {member.rankImage && member.rank ? (
                <Tooltip title={member.rank}>
                  <img
                    alt={member.rank}
                    src={member.rankImage}
                    width="24"
                    height="24"
                    className="rank-image"
                  />
                </Tooltip>
              ) : null}
              {member.warnings.length ? (
                <Tooltip title="Number of warnings">
                  <Avatar className="number warnings">{member.warnings.length}</Avatar>
                </Tooltip>
              ) : null}
            </div>
          </div>
        </CardContent>
      </Card>
      {menuAnchor ? (
        <GuildMemberMenu
          member={member}
          menuAnchor={menuAnchor}
          isAdmin={isAdmin}
          memberIsAdmin={memberIsAdmin}
          closeMenu={closeMenu}
          onKick={onKick}
          onEdit={onEdit}
          onChangeNickname={onEditNickname}
          setWarningOpen={setWarningOpen}
          setWarningViewerOpen={setWarningViewerOpen}
        />
      ) : null}
      <WarningForm
        isOpen={warningOpen}
        onClose={() => setWarningOpen(false)}
        onSubmit={warningSubmitHandler}
      />
      <WarningsViewer
        isOpen={warningViewerOpen}
        onClose={() => setWarningViewerOpen(false)}
        member={member}
      />
      <EditNickName isOpen={editOpen} onClose={() => setEditOpen(false)} member={member} />
    </>
  );
};

export default GuildMemberCard;
