import React, { useState } from 'react';
import PropTypes from 'prop-types';
import RoleEdit from './RoleEdit';
import Table from './Table';
import { formatRankId, filterDataByString } from '../utils/Helpers';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faTimes,
  faPencilAlt,
  faAngleDoubleUp,
  faNotEqual,
} from '@fortawesome/free-solid-svg-icons';
import DataRetrieval from '../utils/DataRetrieval';
import { OverlayTrigger, Tooltip } from 'react-bootstrap';

const RosterDisplay = ({ records, filterString, openToast, refresh }) => {
  const [modalShow, setModalShow] = useState(false);
  const [selectedRecord, setSelectedRecord] = useState(null);

  records = filterDataByString(records, filterString);

  const onKick = async (record) => {
    if (!record.discordId) return;

    const res = window.confirm(
      `Are you sure you want to kick ${record.discordName}?`
    );
    if (res) {
      const success = await DataRetrieval.kickDiscordMember(record.discordId);
      if (success) {
        openToast('Kicked', `Kicked ${record.discordName} from Discord.`);
        refresh();
      } else {
        openToast('Kick Failed', `Could not kick ${record.discordName}`);
      }
    }
  };

  const openEdit = (record) => {
    setModalShow(true);
    setSelectedRecord(record);
  };

  return (
    <>
      <Table>
        <colgroup>
          <col />
          <col />
          <col />
          <col width="75px" />
        </colgroup>
        <thead>
          <tr>
            <th>Account</th>
            <th>Joined</th>
            <th>Rank</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {records.map((record, i) => (
            <tr key={i}>
              <td>
                <AccountNameCell record={record} />
              </td>
              <td>{record.joinDate}</td>
              <td className={`rank ${formatRankId(record.rank)}`}>
                {record.rank}
              </td>
              <td className="actions">
                <div className="actions">
                  {record.roles.find(
                    (r) => r.name === 'Spearmarshal' || r.name === 'General'
                  ) ? null : (
                    <>
                      <TooltipWrapper
                        tooltip="Edit Discord Roles"
                        placement="left"
                      >
                        <FontAwesomeIcon
                          icon={faPencilAlt}
                          className="action"
                          onClick={() => openEdit(record)}
                        />
                      </TooltipWrapper>
                      <TooltipWrapper
                        tooltip="Kick from Discord"
                        placement="left"
                      >
                        <FontAwesomeIcon
                          icon={faTimes}
                          className="action"
                          onClick={() => onKick(record)}
                        />
                      </TooltipWrapper>
                    </>
                  )}
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </Table>
      <RoleEdit
        modalShow={modalShow}
        setModalShow={setModalShow}
        selectedRecord={selectedRecord}
        setSelectedRecord={setSelectedRecord}
        refresh={refresh}
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
  openToast: PropTypes.func,
  refresh: PropTypes.func,
};

const AccountNameCell = ({ record }) => {
  const discordImage = require('../assets/images/discord-icon.png');
  const discordErrorImage = require('../assets/images/discord-icon-red.png');
  const gw2Image = require('../assets/images/gw2.png');

  let accountImage = discordImage;
  let accountTitle = record.discordName;

  if (record.issues.missingGW2) {
    accountImage = gw2Image;
    accountTitle = "Can't find GW2 Account";
  } else if (record.issues.missingDiscord) {
    accountImage = discordErrorImage;
    accountTitle = "Can't find Discord Account";
  }

  return (
    <div className="account-name">
      {record.accountName}{' '}
      <div className="account-errors">
        <TooltipWrapper tooltip={accountTitle}>
          <img
            src={accountImage}
            width="20"
            height="20"
            className="icon"
            alt="account icon"
          />
        </TooltipWrapper>
        {record.issues.unmatchingRoles ? (
          <TooltipWrapper tooltip="Mismatched Roles">
            <FontAwesomeIcon icon={faNotEqual} className="icon error" />
          </TooltipWrapper>
        ) : null}
        {record.issues.promotionRequired ? (
          <TooltipWrapper tooltip="Promotion Required">
            <FontAwesomeIcon icon={faAngleDoubleUp} className="icon" />
          </TooltipWrapper>
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
  placement = placement || 'right';
  return (
    <OverlayTrigger
      placement={placement}
      overlay={<Tooltip id={`tooltip-${placement}`}>{tooltip}</Tooltip>}
    >
      {children}
    </OverlayTrigger>
  );
};

TooltipWrapper.propTypes = {
  tooltip: PropTypes.string.isRequired,
  children: PropTypes.node.isRequired,
  placement: PropTypes.string,
};

export default RosterDisplay;
