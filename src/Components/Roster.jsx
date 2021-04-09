import React from 'react';
import PropTypes from 'prop-types';

import { generateGW2RosterRecords } from '../utils/DataProcessing';

import RosterDisplay from './RosterDisplay';

const Roster = ({
  gw2Members,
  discordMembers,
  filterString,
  openToast,
  refresh,
}) => {
  let records = [];
  if (gw2Members.length > 0 && discordMembers.length > 0) {
    records = generateGW2RosterRecords(gw2Members, discordMembers);
  }

  return (
    <RosterDisplay
      records={records}
      filterString={filterString}
      openToast={openToast}
    />
  );
};

Roster.propTypes = {
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
  openToast: PropTypes.func,
  refresh: PropTypes.func,
};

export default Roster;
