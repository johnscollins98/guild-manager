import React, { useState } from 'react';
import PropTypes from 'prop-types';
import RoleEdit from './RoleEdit';
import Table from './Table';
import { formatRankId, filterDataByString } from '../utils/Helpers';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faTimes,
  faPencilAlt,
  faChevronUp,
  faNotEqual,
} from '@fortawesome/free-solid-svg-icons';
import DataRetrieval from '../utils/DataRetrieval';

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
                  {record.roles?.includes('Spearmarshal') ||
                  record.roles?.includes('General') ? null : (
                    <>
                      <FontAwesomeIcon
                        icon={faPencilAlt}
                        className="action"
                        title="Edit Discord Roles"
                        onClick={() => openEdit(record)}
                      />
                      <FontAwesomeIcon
                        icon={faTimes}
                        className="action"
                        title="Kick from Discord"
                        onClick={() => onKick(record)}
                      />
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
        <img
          src={accountImage}
          width="20"
          height="20"
          className="icon"
          alt="account icon"
          title={accountTitle}
        />
        {record.issues.unmatchingRoles ? (
          <FontAwesomeIcon
            icon={faNotEqual}
            title="Unmatching Roles"
            className="icon error"
          />
        ) : null}
        {record.issues.promotionRequired ? (
          <FontAwesomeIcon
            icon={faChevronUp}
            title="Promotion Required"
            className="icon"
          />
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

export default RosterDisplay;
