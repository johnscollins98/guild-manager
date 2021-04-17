import React, { useEffect, useState } from 'react';
import PropTypes from 'prop-types';

import { generateGW2RosterRecords } from '../utils/DataProcessing';

import RosterDisplay from './RosterDisplay';

const PointsLeaderboard = ({ gw2Members, discordMembers, discordRoles, filterString, authInfo, openToast }) => {
  const [records, setRecords] = useState([]);

  useEffect(() => {
    if (gw2Members.length > 0 && discordMembers.length > 0) {
      setRecords(
        generateGW2RosterRecords(gw2Members, discordMembers).sort(
          (a, b) => b.eventsAttended - a.eventsAttended
        )
      );
    }
  }, [gw2Members, discordMembers, setRecords]);

  return (
    <RosterDisplay
      records={records}
      discordRoles={discordRoles}
      filterString={filterString}
      authInfo={authInfo}
      openToast={openToast}
    />
  );
};

PointsLeaderboard.propTypes = {
  gw2Members: PropTypes.arrayOf(
    PropTypes.shape({
      name: PropTypes.string.isRequired,
      rank: PropTypes.string.isRequired,
      joined: PropTypes.string.isRequired,
    })
  ).isRequired,
  discordMembers: PropTypes.arrayOf(
    PropTypes.shape({
      name: PropTypes.string.isRequired,
      roles: PropTypes.array.isRequired,
    }).isRequired
  ),
  authInfo: PropTypes.object.isRequired,
  filterString: PropTypes.string.isRequired,
  openToast: PropTypes.func,
};

export default PointsLeaderboard;
