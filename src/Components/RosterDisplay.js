import React, { useState } from "react";
import PropTypes from "prop-types";

import Table from "./Table";
import {
  formatRankId,
  isPromotionRequired,
  filterDataByString,
} from "../utils/Helpers";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faTimes } from "@fortawesome/free-solid-svg-icons";
import DataRetrieval from "../utils/DataRetrieval";

const RosterDisplay = ({ records, filterString, openToast, refresh }) => {
  records = filterDataByString(records, filterString);

  const onKick = async (record) => {
    if (!record.discordId) return;

    const res = window.confirm(
      `Are you sure you want to kick ${record.discordName}?`
    );
    if (res) {
      const success = await DataRetrieval.kickDiscordMember(record.discordId);
      if (success) {
        openToast("Kicked", `Kicked ${record.discordName} from Discord.`);
        refresh();
      } else {
        openToast("Kick Failed", `Could not kick ${record.discordName}`);
      }
    }
  };

  return (
    <>
      <Table>
        <thead>
          <tr>
            <th>Account Name</th>
            <th>Join Date</th>
            <th>Rank</th>
            <th>Discord Name</th>
            <th>Role</th>
            <th>Actions</th>
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
              <td className={`rank ${formatRankId(record.roleString)}`}>
                {record.roleString}
              </td>
              <td className="actions">
                <div className="actions">
                  {record.roleString.includes("Spearmarshal") ||
                  record.roleString.includes("General") ? null : (
                    <>
                      <FontAwesomeIcon
                        icon={faTimes}
                        className="action"
                        title="Kick from Discord"
                        onClick={() => onKick(record)}
                      />
                    </>
                  )}
                </div>
              </td>
              <td>{record.comments}</td>
              <td>{isPromotionRequired(record.rank, record.joinDate)}</td>
            </tr>
          ))}
        </tbody>
      </Table>
    </>
  );
};

RosterDisplay.propTypes = {
  records: PropTypes.arrayOf(
    PropTypes.shape({
      accountName: PropTypes.string.isRequired,
      joinDate: PropTypes.string.isRequired,
      rank: PropTypes.string.isRequired,
      roleString: PropTypes.string.isRequired,
      roles: PropTypes.array.isRequired,
      comments: PropTypes.string.isRequired,
    })
  ).isRequired,
  filterString: PropTypes.string.isRequired,
  openToast: PropTypes.func,
  refresh: PropTypes.func,
};

export default RosterDisplay;
