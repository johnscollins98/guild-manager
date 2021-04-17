import React, { useCallback, useEffect, useState } from 'react';
import PropTypes from 'prop-types';
import RoleEdit from './RoleEdit';
import Table from './Table';
import { filterDataByString, getColorFromRole } from '../utils/Helpers';
import { kickDiscordMember, setGuildMember } from '../utils/DataRetrieval';
import { ReactComponent as DiscordLogo } from '../assets/images/discord.svg';

import './RosterDisplay.scss';
import {
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  Tooltip,
} from '@material-ui/core';
import {
  Add,
  Close,
  Create,
  Error,
  ExpandLess,
  Remove,
  SyncProblem,
} from '@material-ui/icons';

const gw2Image = require('../assets/images/gw2.png');

const RosterDisplay = ({
  records,
  discordRoles,
  filterString,
  openToast,
  authInfo,
}) => {
  const [modalShow, setModalShow] = useState(false);
  const [selectedRecord, setSelectedRecord] = useState(null);
  const [recordState, setRecordState] = useState(records);
  const [filteredRecords, setFilteredRecords] = useState(recordState);

  const [adminActionsEnabled, setAdminActionsEnabled] = useState(false);

  useEffect(() => {
    setAdminActionsEnabled(authInfo.isAdmin);
  }, [authInfo]);

  useEffect(() => {
    setRecordState(records);
  }, [records]);

  useEffect(() => {
    setFilteredRecords(filterDataByString(recordState, filterString));
  }, [recordState, filterString]);

  const onKick = useCallback(
    async (record) => {
      if (!record.discordId) return;

      const res = window.confirm(
        `Are you sure you want to kick ${record.discordName}?`
      );
      if (res) {
        const success = await kickDiscordMember(record.discordId);
        if (success) {
          openToast(`Kicked ${record.discordName} from Discord.`, 'success');
          setRecordState(
            recordState.filter((m) => m.discordId !== record.discordId)
          );
        } else {
          openToast(`Could not kick ${record.discordName}`, 'error');
        }
      }
    },
    [recordState, setRecordState, openToast]
  );

  const openEdit = useCallback(
    (record) => {
      setModalShow(true);
      setSelectedRecord(record);
    },
    [setModalShow, setSelectedRecord]
  );

  const changeEventAttended = useCallback(
    async (memberId, eventsAttended) => {
      try {
        const newObject = await setGuildMember({
          memberId,
          eventsAttended,
        });

        const recordsCopy = [...recordState];
        const toEdit = recordsCopy.find((record) => {
          return record.memberId === newObject.memberId;
        });
        toEdit.eventsAttended = newObject.eventsAttended;

        setRecordState(recordsCopy);
      } catch (err) {
        openToast('There was an error updating attendance.', 'error');
      }
    },
    [setRecordState, openToast, recordState]
  );

  const incrementEventAttended = useCallback(
    (record) => {
      const current = parseInt(record.eventsAttended);
      changeEventAttended(record.memberId, current + 1);
    },
    [changeEventAttended]
  );

  const decrementEventAttended = useCallback(
    (record) => {
      const current = parseInt(record.eventsAttended);
      changeEventAttended(record.memberId, current - 1);
    },
    [changeEventAttended]
  );

  return (
    <>
      <Table>
        <colgroup>
          <col />
          <col />
          <col />
          <col />
          <col />
          {adminActionsEnabled ? <col width="100px" /> : null}
        </colgroup>
        <TableHead>
          <TableRow>
            <TableCell>Account</TableCell>
            <TableCell>Joined</TableCell>
            <TableCell>GW2 Rank</TableCell>
            <TableCell>Discord Role</TableCell>
            <TableCell>Points</TableCell>
            {adminActionsEnabled ? <TableCell>Actions</TableCell> : null}
          </TableRow>
        </TableHead>
        <TableBody>
          {filteredRecords.map((record, i) => (
            <TableRow key={i}>
              <TableCell>
                <AccountNameCell record={record} />
              </TableCell>
              <TableCell>{record.joinDate}</TableCell>
              <TableCell
                className="rank"
                style={{
                  backgroundColor: getColorFromRole(record.rank, discordRoles),
                }}
              >
                {record.rank}
              </TableCell>
              <TableCell
                style={{
                  backgroundColor: getColorFromRole(
                    record.roles[0]?.name,
                    discordRoles
                  ),
                }}
                className="rank"
              >
                {record.roles[0]?.name || '-'}
              </TableCell>
              <TableCell>
                <span className="events-attended">
                  {record.eventsAttended}{' '}
                  <span className="actions">
                    <Tooltip title="Increase by one">
                      <Add
                        className="action"
                        onClick={() => incrementEventAttended(record)}
                      />
                    </Tooltip>{' '}
                    <Tooltip title="Decrease by one">
                      <Remove
                        className="action"
                        onClick={() => decrementEventAttended(record)}
                      />
                    </Tooltip>
                  </span>
                </span>
              </TableCell>
              {adminActionsEnabled ? (
                <TableCell className="actions">
                  <div className="actions">
                    {adminActionsEnabled &&
                    record.roles.find(
                      (r) => r.name === 'Spearmarshal' || r.name === 'General'
                    ) ? null : (
                      <>
                        <Tooltip title="Edit Discord Roles">
                          <Create
                            className="action"
                            onClick={() => openEdit(record)}
                          />
                        </Tooltip>
                        <Tooltip title="Kick from Discord">
                          <Close
                            className="action"
                            onClick={() => onKick(record)}
                          />
                        </Tooltip>
                      </>
                    )}
                  </div>
                </TableCell>
              ) : null}
            </TableRow>
          ))}
        </TableBody>
      </Table>
      <RoleEdit
        modalShow={modalShow}
        setModalShow={setModalShow}
        selectedRecord={selectedRecord}
        setSelectedRecord={setSelectedRecord}
        records={recordState}
        setRecords={setRecordState}
        openToast={openToast}
      />
    </>
  );
};

RosterDisplay.propTypes = {
  records: PropTypes.arrayOf(
    PropTypes.shape({
      accountName: PropTypes.string.isRequired,
      joinDate: PropTypes.string.isRequired,
      rank: PropTypes.string.isRequired,
      roles: PropTypes.array.isRequired,
    })
  ).isRequired,
  filterString: PropTypes.string.isRequired,
  authInfo: PropTypes.object.isRequired,
  openToast: PropTypes.func,
};

const AccountNameCell = ({ record }) => {
  let accountImage = <DiscordLogo width="20" height="20" className="icon" />;
  let accountTitle = record.discordName;

  if (record.issues.missingGW2) {
    accountImage = (
      <img
        src={gw2Image}
        width="20"
        height="20"
        className="icon"
        alt="account icon"
      />
    );
    accountTitle = "Can't find GW2 Account";
  } else if (record.issues.missingDiscord) {
    accountImage = (
      <DiscordLogo width="20" height="20" className="icon error" />
    );
    accountTitle = "Can't find Discord Account";
  }

  return (
    <div className="account-name">
      {record.accountName}{' '}
      <div className="account-errors">
        {record.rank !== 'Alt' ? (
          <Tooltip title={accountTitle}>{accountImage}</Tooltip>
        ) : null}
        {record.issues.multipleRoles ? (
          <Tooltip
            title={`Multiple Roles: ${record.roles
              .map((r) => r.name)
              .join(', ')}`}
          >
            <Error />
          </Tooltip>
        ) : record.issues.unmatchingRoles ? (
          <Tooltip
            title={`Mismatched Roles - ${record.rank}/${
              record.roles[0]?.name || 'None'
            } (GW2/Discord)`}
          >
            <SyncProblem />
          </Tooltip>
        ) : null}
        {record.issues.promotionRequired ? (
          <Tooltip title="Promotion Required">
            <ExpandLess />
          </Tooltip>
        ) : null}
      </div>
    </div>
  );
};

AccountNameCell.propTypes = {
  record: PropTypes.shape({
    accountName: PropTypes.string.isRequired,
    joinDate: PropTypes.string.isRequired,
    rank: PropTypes.string.isRequired,
    roles: PropTypes.array.isRequired,
  }).isRequired,
};

const TooltipWrapper = ({ tooltip, children, placement }) => {
  return (
    <Tooltip title={tooltip} aria-label="add">
      {children}
    </Tooltip>
  );
};

TooltipWrapper.propTypes = {
  tooltip: PropTypes.string.isRequired,
  children: PropTypes.node.isRequired,
  placement: PropTypes.string,
};

export default RosterDisplay;
