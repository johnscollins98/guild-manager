import React from "react";
import PropTypes from "prop-types";

import Table from "./Table";
import {
  formatRankId,
  isPromotionRequired,
  filterDataByString,
} from "../utils/Helpers";

const RosterDisplay = ({ records, filterString }) => {
  records = filterDataByString(records, filterString);

  return (
    <Table>
      <thead>
        <tr>
          <th>Account Name</th>
          <th>Join Date</th>
          <th>Rank</th>
          <th>Discord Name</th>
          <th>Role</th>
          <th>Comments</th>
          <th>Promotion Required?</th>
        </tr>
      </thead>
      <tbody>
        {records.map((record, i) => (
          <tr key={i}>
            <td>{record.accountName}</td>
            <td>{record.joinDate}</td>
            <td className={`rank ${formatRankId(record.rank)}`}>
              {record.rank}
            </td>
            <td>{record.discordName}</td>
            <td className={`rank ${formatRankId(record.role)}`}>
              {record.role}
            </td>
            <td>{record.comments}</td>
            <td>{isPromotionRequired(record.rank, record.joinDate)}</td>
          </tr>
        ))}
      </tbody>
    </Table>
  );
};

RosterDisplay.propTypes = {
  records: PropTypes.arrayOf(
    PropTypes.shape({
      accountName: PropTypes.string.isRequired,
      joinDate: PropTypes.string.isRequired,
      rank: PropTypes.string.isRequired,
      role: PropTypes.string.isRequired,
      comments: PropTypes.string.isRequired,
    })
  ).isRequired,
  filterString: PropTypes.string.isRequired,
};

export default RosterDisplay;
