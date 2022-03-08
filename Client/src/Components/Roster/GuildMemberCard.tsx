import React, { useCallback, useState } from 'react';

import './GuildMemberCard.scss';
import { getColorFromRole } from '../../utils/Helpers';
import { ReactComponent as DiscordLogo } from '../../assets/images/discord.svg';
import WarningForm from './Warnings/WarningForm';
import WarningsViewer from './Warnings/WarningsViewer';
import gw2Image from '../../assets/images/gw2.png';

import MemberRecord from '../../Interfaces/MemberRecord';
import DiscordRole from '../../Interfaces/DiscordRole';
import { WarningPost } from '../../Interfaces/Warning';

import Avatar from '@material-ui/core/Avatar';
import Card from '@material-ui/core/Card';
import CardContent from '@material-ui/core/CardContent';
import Typography from '@material-ui/core/Typography';
import Tooltip from '@material-ui/core/Tooltip';

import CalendarToday from '@material-ui/icons/CalendarToday';
import SyncProblem from '@material-ui/icons/SyncProblem';
import GuildMemberMenu from './GuildMemberMenu';
import { getDateString } from '../../utils/DataProcessing';
import { Timer } from '@material-ui/icons';
import GuildMemberDetails from './GuildMemberDetails';
import { PopoverPosition } from '@material-ui/core';

interface Props {
  member: MemberRecord;
  discordRoles: DiscordRole[];
  isAdmin: boolean;
  singleColumn: boolean;
  onKick: (member: MemberRecord) => Promise<any>;
  onEdit: (member: MemberRecord) => void;
  onChangeNickname: (member: MemberRecord) => void;
  onGiveWarning: (warning: WarningPost) => Promise<any>;
  onDeleteWarning: (warningId: string) => Promise<any>;
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

  const [detailsAnchor, setDetailsAnchor] = useState<PopoverPosition | undefined>(undefined);
  const [menuAnchor, setMenuAnchor] = useState<PopoverPosition | undefined>(undefined);
  const [warningOpen, setWarningOpen] = useState(false);
  const [warningViewerOpen, setWarningViewerOpen] = useState(false);

  const openDetails = useCallback(
    (e: React.MouseEvent) => {
      e.preventDefault();
      e.stopPropagation();
      setDetailsAnchor({ top: e.clientY, left: e.clientX });
    },
    [setDetailsAnchor]
  );

  const closeDetails = useCallback(() => {
    setDetailsAnchor(undefined);
  }, [setDetailsAnchor]);

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
        throw new Error('test');
      }
      await onGiveWarning({ givenTo: member.memberId, reason });
    },
    [onGiveWarning, member]
  );

  return (
    <>
      <Card
        variant="outlined"
        className={`member-card ${singleColumn ? 'fullWidth' : ''}`}
        style={{ borderLeftColor: color }}
        onClick={openMenu}
        raised
      >
        <CardContent>
          <div className="top-row">
            <div className="name">
              <Avatar
                className="avatar"
                alt={member.memberId || member.discordName}
                src={member.avatar}
                onClick={openDetails}
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
              {member.issues.over24h ? (
                <Tooltip title="Been in server over 24h">
                  <Timer className="error" />
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
      {detailsAnchor ? (
        <GuildMemberDetails
          member={member}
          detailsAnchor={detailsAnchor}
          closeDetails={closeDetails}
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
