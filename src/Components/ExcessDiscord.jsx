import React, { useEffect, useState } from 'react';
import PropTypes from 'prop-types';

import { getExcessDiscordRecords } from '../utils/DataProcessing';
import RosterDisplay from './RosterDisplay';

const ExcessDiscord = ({
  gw2Members,
  discordMembers,
  filterString,
  openToast,
}) => {
  const [records, setRecords] = useState([]);
  useEffect(() => {
    if (gw2Members.length > 0 && discordMembers.length > 0) {
      setRecords(
        getExcessDiscordRecords(gw2Members, discordMembers)
      );
    }
  }, [gw2Members, discordMembers, setRecords]);

  return (
    <RosterDisplay
      records={records}
      filterString={filterString}
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
  openToast: PropTypes.func.isRequired,
};

export default ExcessDiscord;