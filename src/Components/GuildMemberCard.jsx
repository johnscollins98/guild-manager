import React, { useCallback, useEffect } from 'react';
import './GuildMemberCard.scss';
import {
  Avatar,
  Card,
  CardContent,
  Typography,
  Tooltip,
  Menu,
  MenuItem,
} from '@material-ui/core';
import { getColorFromRole } from '../utils/Helpers';
import { ReactComponent as DiscordLogo } from '../assets/images/discord.svg';
import {
  Add,
  CalendarToday,
  Close,
  Edit,
  Error,
  ExpandLess,
  Remove,
  SyncProblem,
  Warning,
} from '@material-ui/icons';
import gw2Image from '../assets/images/gw2.png';
import { useState } from 'react';
import WarningForm from './WarningForm';

const GuildMemberCard = ({
  member,
  discordRoles,
  onKick,
  onEdit,
  onGiveWarning,
  isAdmin,
  addPoint,
  removePoint,
  singleColumn,
}) => {
  const rank = member.rank || member.roles[0]?.name;
  const color = getColorFromRole(rank, discordRoles);

  const [menuAnchor, setMenuAnchor] = useState(null);
  const [memberIsAdmin, setMemberIsAdmin] = useState(true);
  const [warningOpen, setWarningOpen] = useState(false);

  useEffect(() => {
    setMemberIsAdmin(
      member.rank === 'General' || member.rank === 'Spearmarshal'
    );
  }, [member]);

  const handleClick = useCallback(
    (e) => {
      setMenuAnchor(e.currentTarget);
    },
    [setMenuAnchor]
  );

  const closeMenu = useCallback(() => {
    setMenuAnchor(null);
  }, [setMenuAnchor]);

  const menuAction = useCallback(
    async (func) => {
      await func(member);
      closeMenu();
    },
    [member, closeMenu]
  );

  const warningSubmitHandler = useCallback(
    async (warningObject) => {
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
                <Typography className="name">
                  {member.memberId || member.discordName}
                </Typography>
                {member.joinDate ? (
                  <span className="date">
                    <CalendarToday />
                    <Typography>{member.joinDate}</Typography>
                  </span>
                ) : null}
              </span>
            </div>
            <div className="icons-container">
              {member.issues.promotionRequired ? (
                <Tooltip title="Promotion Required">
                  <ExpandLess />
                </Tooltip>
              ) : null}
              {member.issues.multipleRoles ? (
                <Tooltip title="Multiple Discord Roles">
                  <Error className="error" />
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
                  <img
                    src={gw2Image}
                    alt="missing gw2"
                    width="24"
                    height="24"
                    className="error"
                  />
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
              {member.rankImage ? (
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
                  <Avatar className="number warnings">
                    {member.warnings.length}
                  </Avatar>
                </Tooltip>
              ) : null}
              {member.eventsAttended !== null &&
              member.eventsAttended !== undefined ? (
                <Tooltip title="Number of points">
                  <Avatar className="number points">
                    {member.eventsAttended}
                  </Avatar>
                </Tooltip>
              ) : null}
            </div>
          </div>
        </CardContent>
      </Card>
      {menuAnchor ? (
        <Menu
          anchorEl={menuAnchor}
          keepMounted
          open={Boolean(menuAnchor)}
          onClose={closeMenu}
        >
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
            disabled={!isAdmin || memberIsAdmin}
            onClick={() => menuAction(onEdit)}
          >
            <span className="menu-item">
              <Edit className="icon" />
              Edit Roles
            </span>
          </MenuItem>
          <MenuItem
            disabled={!member.memberId}
            onClick={() => menuAction(addPoint)}
          >
            <span className="menu-item">
              <Add className="icon" />
              Add Point
            </span>
          </MenuItem>
          <MenuItem
            disabled={!member.memberId}
            onClick={() => menuAction(removePoint)}
          >
            <span className="menu-item">
              <Remove className="icon" />
              Remove Point
            </span>
          </MenuItem>
        </Menu>
      ) : null}
      <WarningForm
        isOpen={warningOpen}
        onClose={() => setWarningOpen(false)}
        onSubmit={warningSubmitHandler}
      />
    </>
  );
};

export default GuildMemberCard;
