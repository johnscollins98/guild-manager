import MailIcon from '@mui/icons-material/Mail';
import PersonIcon from '@mui/icons-material/Person';
import ScheduleSendIcon from '@mui/icons-material/ScheduleSend';
import SyncProblem from '@mui/icons-material/SyncProblem';
import Timer from '@mui/icons-material/Timer';
import { Checkbox, useTheme } from '@mui/material';
import Avatar from '@mui/material/Avatar';
import { type PopoverPosition } from '@mui/material/Popover';
import Tooltip from '@mui/material/Tooltip';
import type React from 'react';
import { useCallback, useMemo, type Dispatch, type SetStateAction } from 'react';
import { WarningType, type DiscordRole, type WarningDTO } from 'server';
import type MemberRecord from '../../lib/interfaces/member-record';
import { getDateString } from '../../lib/utils/data-processing';
import { getColorFromRole } from '../../lib/utils/helpers';
import './guild-member-card.scss';
import { useIsHigherRole } from './use-is-higher-role';

interface Props {
  member: MemberRecord;
  discordRoles: DiscordRole[];
  selection: string[];
  setSelection: Dispatch<SetStateAction<string[]>>;
  kickMode: boolean;
  openMenu(v: PopoverPosition | undefined): void;
}

const GuildMemberCard = ({
  member,
  discordRoles,
  selection,
  setSelection,
  kickMode,
  openMenu
}: Props) => {
  const rank = member.rank || member.roles[0]?.name;
  const color = getColorFromRole(rank, discordRoles);

  const theme = useTheme();

  const openMenuHandler = useCallback(
    (e: React.MouseEvent) => {
      e.preventDefault();
      openMenu({ top: e.clientY, left: e.clientX });
    },
    [openMenu]
  );

  const warningsByType: Record<WarningType, WarningDTO[]> = useMemo(() => {
    const byType: Record<WarningType, WarningDTO[]> = {
      event: [],
      informal: [],
      official: []
    };

    member.warnings.forEach(w => byType[w.type].push(w));

    return byType;
  }, [member.warnings]);

  const memberIsHigherRole = useIsHigherRole(member);

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
      <div
        className={`member-card ${kickMode ? 'kick-mode' : ''}`}
        style={{ borderLeftColor: color }}
        onClick={kickMode ? () => onClickKickMode() : openMenuHandler}
      >
        <div className="top-row">
          <div className="name">
            {kickMode && member.discordId && !memberIsHigherRole ? (
              <Checkbox disabled={!selected && selection.length >= 5} checked={selected} />
            ) : (
              <img
                className="avatar"
                alt={member.memberId || member.discordName}
                src={member.avatar || 'https://cdn.discordapp.com/embed/avatars/0.png'}
                loading="lazy"
              />
            )}
            <span className="details">
              <div className="name" style={{ color }}>
                {member.memberId || member.discordName}
              </div>
              {member.joinDate ? (
                <span className="date">{getDateString(member.joinDate)}</span>
              ) : null}
            </span>
          </div>
          <div className="icons-container">
            {member.issues.unmatchingRoles ? (
              <Tooltip
                title={`Unmatching Roles (${member.rank} / ${member.roles[0]?.name || 'No Role'})`}
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
                  <img
                    src="gw2.png"
                    width="24"
                    height="24"
                    loading="lazy"
                    style={{
                      filter: `opacity(1) drop-shadow(-1000px 0px 0 ${theme.palette.error.main})`,
                      transform: `translateX(1000px)`,
                      backgroundAttachment: 'fixed',
                      backgroundSize: 'cover'
                    }}
                  />
                </span>
              </Tooltip>
            ) : null}
            {member.issues.missingDiscord ? (
              <Tooltip title="Discord Account Not Found">
                <span>
                  <svg className="error" width="24" height="24">
                    <use href="discord.svg" />
                  </svg>
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
                <svg width="24" height="24">
                  <use href="discord.svg" />
                </svg>
              </Tooltip>
            ) : null}
            {member.rankImage && member.rank ? (
              <Tooltip title={member.rank}>
                <span>
                  <img
                    alt={member.rank}
                    src={member.rankImage}
                    loading="lazy"
                    style={{
                      filter: `opacity(1) drop-shadow(-1000px 0px 0 ${theme.palette.action.active})`,
                      transform: `translateX(1000px)`
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
      </div>
    </>
  );
};

export default GuildMemberCard;
