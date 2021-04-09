import React from 'react';
import PropTypes from 'prop-types';

import { generateGW2RosterRecords, getExcessDiscordRecords } from '../utils/DataProcessing';

import RosterDisplay from './RosterDisplay';

const RequiredActions = ({
  gw2Members,
  discordMembers,
  filterString,
  openToast,
}) => {
  let records = [];
  if (gw2Members.length > 0 && discordMembers.length > 0) {
    records = generateGW2RosterRecords(gw2Members, discordMembers)
      .concat(getExcessDiscordRecords(gw2Members, discordMembers))
      .filter((record) =>
        Object.keys(record.issues).some((k) => record.issues[k])
      );
  }

  return (
    <RosterDisplay
      records={records}
      filterString={filterString}
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
  filterString: PropTypes.string.isRequired,
  openToast: PropTypes.func.isRequired,
};

export default RequiredActions;
