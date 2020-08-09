import React from "react";
import PropTypes from "prop-types";

import DataProcessing from "../utils/DataProcessing";
import { isPromotionRequired } from "../utils/Helpers";

import RosterDisplay from "./RosterDisplay";

const RequiredActions = ({ gw2Members, discordMembers, filterString }) => {
  let records = [];
  if (gw2Members.length > 0 && discordMembers.length > 0) {
    records = DataProcessing.generateGW2RosterRecords(
      gw2Members,
      discordMembers
    );
  }
  records = records.filter(
    (record) =>
      record.comments !== "" ||
      isPromotionRequired(record.rank, record.joinDate)
  );

  return <RosterDisplay records={records} filterString={filterString} />;
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
      role: PropTypes.string.isRequired,
    }).isRequired
  ),
  filterString: PropTypes.string.isRequired,
};

export default RequiredActions;
