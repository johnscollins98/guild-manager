import React, { useEffect, useState } from 'react';
import PropTypes from 'prop-types';

import { getExcessDiscordRecords } from '../utils/DataProcessing';
import RosterDisplay from './RosterDisplay';

const ExcessDiscord = ({
  gw2Members,
  discordMembers,
  discordRoles,
  guildRanks,
  filterString,
  singleColumn,
  authInfo,
  openToast,
}) => {
  const [records, setRecords] = useState([]);
  useEffect(() => {
    if (gw2Members.length > 0 && discordMembers.length > 0) {
      setRecords(
        getExcessDiscordRecords(gw2Members, discordMembers, guildRanks)
      );
    }
  }, [gw2Members, discordMembers, setRecords, guildRanks]);

  return (
    <RosterDisplay
      records={records}
      discordRoles={discordRoles}
      singleColumn={singleColumn}
      filterString={filterString}
      authInfo={authInfo}
      openToast={openToast}
    />
  );
};

ExcessDiscord.propTypes = {
  gw2Members: PropTypes.arrayOf(
    PropTypes.shape({
      name: PropTypes.string.isRequired,
      rank: PropTypes.string.isRequired,
      joined: PropTypes.string.isRequired,
    })
  ).isRequired,
  filterString: PropTypes.string.isRequired,
  discordMembers: PropTypes.arrayOf(
    PropTypes.shape({
      name: PropTypes.string.isRequired,
      roles: PropTypes.array.isRequired,
    }).isRequired
  ),
  authInfo: PropTypes.object.isRequired,
  openToast: PropTypes.func.isRequired,
};

export default ExcessDiscord;
