import React, { useEffect, useState } from 'react';
import PropTypes from 'prop-types';

import {
  generateGW2RosterRecords,
  getExcessDiscordRecords,
} from '../utils/DataProcessing';

import RosterDisplay from './RosterDisplay';

const RequiredActions = ({
  gw2Members,
  discordMembers,
  filterString,
  authInfo,
  openToast,
}) => {
  const [records, setRecords] = useState([]);
  useEffect(() => {
    if (gw2Members.length > 0 && discordMembers.length > 0) {
      setRecords(
        generateGW2RosterRecords(gw2Members, discordMembers)
          .concat(getExcessDiscordRecords(gw2Members, discordMembers))
          .filter((record) =>
            Object.keys(record.issues).some((k) => record.issues[k])
          )
      );
    }
  }, [gw2Members, discordMembers, setRecords]);

  return (
    <RosterDisplay
      records={records}
      filterString={filterString}
      authInfo={authInfo}
      openToast={openToast}
    />
  );
};

RequiredActions.propTypes = {
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
  openToast: PropTypes.func.isRequired,
};

export default RequiredActions;
