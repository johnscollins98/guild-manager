import React from "react";
import PropTypes from "prop-types";

import DataProcessing from "../utils/DataProcessing";
import RosterDisplay from './RosterDisplay';

const ExcessDiscord = ({ gw2Members, discordMembers, filterString, openToast, refresh }) => {
  let records = [];
  if (gw2Members.length > 0 && discordMembers.length > 0) {
    records = DataProcessing.getExcessDiscordRecords(
      gw2Members,
      discordMembers
    );
  }

  return (
    <RosterDisplay 
      records={records}
      filterString={filterString}
      openToast={openToast}
      refresh={refresh}
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
};

export default ExcessDiscord;
