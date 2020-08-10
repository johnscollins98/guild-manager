import React from "react";
import PropTypes from "prop-types";
import Table from "react-bootstrap/Table";

import DataProcessing from "../utils/DataProcessing";
import { formatRankId, filterDataByString } from "../utils/Helpers";

const ExcessDiscord = ({ gw2Members, discordMembers, filterString }) => {
  let records = [];
  if (gw2Members.length > 0 && discordMembers.length > 0) {
    records = DataProcessing.getExcessDiscordRecords(
      gw2Members,
      discordMembers
    );
  }

  records = filterDataByString(records, filterString);

  return (
    <Table striped bordered hover size="sm" variant="dark">
      <thead>
        <tr>
          <th>Name</th>
          <th>Role</th>
        </tr>
      </thead>
      <tbody>
        {records.map((record, i) => (
          <tr key={i}>
            <td>{record.name}</td>
            <td className={`rank ${formatRankId(record.role)}`}>
              {record.role}
            </td>
          </tr>
        ))}
      </tbody>
    </Table>
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
};

export default ExcessDiscord;
