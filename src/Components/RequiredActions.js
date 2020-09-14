import React from "react";
import PropTypes from "prop-types";

import DataProcessing from "../utils/DataProcessing";
import { isPromotionRequired } from "../utils/Helpers";

import RosterDisplay from "./RosterDisplay";

const RequiredActions = ({ gw2Members, discordMembers, filterString }) => {
  let records = [];
  let excessDiscord = [];
  if (gw2Members.length > 0 && discordMembers.length > 0) {
    records = DataProcessing.generateGW2RosterRecords(
      gw2Members,
      discordMembers
    );

    excessDiscord = DataProcessing.getExcessDiscordRecords(
      gw2Members,
      discordMembers
    )
      .filter((o) =>
        [
          "First Spear",
          "Second Spear",
          "Captain",
          "General",
          "Spearmarshal",
          "NOT FOUND",
        ].includes(o.role)
      )
      .map((o) => ({
        accountName: "-",
        rank: "-",
        joinDate: "-",
        discordName: o.name,
        role: o.role,
        comments: "EXTRA DISCORD. NOT GUEST/BOT",
      }));
  }
  records = records
    .filter(
      (record) =>
        record.comments !== "" ||
        isPromotionRequired(record.rank, record.joinDate)
    )
    .concat(excessDiscord);

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
      roles: PropTypes.array.isRequired,
    }).isRequired
  ),
  filterString: PropTypes.string.isRequired,
};

export default RequiredActions;
