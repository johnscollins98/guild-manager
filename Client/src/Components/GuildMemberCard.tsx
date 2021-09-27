import React, { useCallback, useState } from 'react';

import './GuildMemberCard.scss';
import { getColorFromRole } from '../utils/Helpers';
import { ReactComponent as DiscordLogo } from '../assets/images/discord.svg';
import WarningForm from './WarningForm';
import WarningsViewer from './WarningsViewer';
import gw2Image from '../assets/images/gw2.png';

import MemberRecord from '../Interfaces/MemberRecord';
import DiscordRole from '../Interfaces/DiscordRole';
import { WarningPost } from '../Interfaces/Warning';

import Avatar from '@material-ui/core/Avatar';
import Card from '@material-ui/core/Card';
import CardContent from '@material-ui/core/CardContent';
import Typography from '@material-ui/core/Typography';
import Tooltip from '@material-ui/core/Tooltip';

import CalendarToday from '@material-ui/icons/CalendarToday';
import ErrorIcon from '@material-ui/icons/Error';
import SyncProblem from '@material-ui/icons/SyncProblem';
import GuildMemberMenu from './GuildMemberMenu';

interface Props {
  member: MemberRecord;
  discordRoles: DiscordRole[];
  isAdmin: boolean;
  singleColumn: boolean;
  onKick: (member: MemberRecord) => Promise<any>;
  onEdit: (member: MemberRecord) => void;
  onChangeNickname: (member: MemberRecord) => void;
  onGiveWarning: (memberId: string, warning: WarningPost) => Promise<any>;
  onDeleteWarning: (memberId: string, warningId: string) => Promise<any>;
}

const GuildMemberCard = ({
  member,
  discordRoles,
  onKick,
  onEdit,
  onChangeNickname,
  onGiveWarning,
  onDeleteWarning,
  isAdmin,
  singleColumn
}: Props) => {
  const rank = member.rank || member.roles[0]?.name;
  const color = getColorFromRole(rank, discordRoles);

  const [menuAnchor, setMenuAnchor] = useState(null);
  const [warningOpen, setWarningOpen] = useState(false);
  const [warningViewerOpen, setWarningViewerOpen] = useState(false);

  const handleClick = useCallback(
    (e) => {
      setMenuAnchor(e.currentTarget);
    },
    [setMenuAnchor]
  );

  const closeMenu = useCallback(() => {
    setMenuAnchor(null);
  }, [setMenuAnchor]);

  const warningSubmitHandler = useCallback(
    async (warningObject: WarningPost) => {
      if (!member.memberId) {
        throw new Error('test');
      }
      await onGiveWarning(member.memberId, warningObject);
    },
    [onGiveWarning, member]
  );

  return (
    <>
      <Card
        variant="outlined"
        className={`member-card ${singleColumn ? 'fullWidth' : ''}`}
        style={{ borderLeftColor: color }}
        onClick={handleClick}
        raised
      >
        <CardContent onClick={handleClick}>
          <div className="top-row">
            <div className="name">
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
              <span className="details">
                <Typography className="name">{member.memberId || member.discordName}</Typography>
                {member.joinDate ? (
                  <span className="date">
                    <CalendarToday />
                    <Typography>{member.joinDate}</Typography>
                  </span>
                ) : null}
              </span>
            </div>
            <div className="icons-container">
              {member.issues.multipleRoles ? (
                <Tooltip title="Multiple Discord Roles">
                  <ErrorIcon className="error" />
                </Tooltip>
              ) : null}
              {member.issues.unmatchingRoles ? (
                <Tooltip
                  title={`Unmatching Roles (${member.rank} / ${
                    member.roles[0]?.name || 'No Role'
                  })`}
                >
                  <SyncProblem className="error" />
                </Tooltip>
              ) : null}
              {member.issues.missingGW2 ? (
                <Tooltip title="GW2 Account Not Found">
                  <img src={gw2Image} alt="missing gw2" width="24" height="24" className="error" />
                </Tooltip>
              ) : null}
              {member.issues.missingDiscord ? (
                <Tooltip title="Discord Account Not Found">
                  <DiscordLogo width="24" height="24" className="error" />
                </Tooltip>
              ) : null}
              {member.discordName ? (
                <Tooltip title={member.discordName}>
                  <DiscordLogo width="24" height="24" />
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
          closeMenu={closeMenu}
          onKick={onKick}
          onEdit={onEdit}
          onChangeNickname={onChangeNickname}
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
        onDeleteWarning={onDeleteWarning}
        member={member}
      />
    </>
  );
};

export default GuildMemberCard;
