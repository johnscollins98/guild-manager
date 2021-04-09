import React from 'react';
import PropTypes from 'prop-types';

import Table from './Table';
import { filterLogByString } from '../utils/Helpers';

const Log = ({ data, filterString }) => {
  data = filterLogByString(data, filterString);

  return (
    <Table>
      <thead>
        <tr>
          <th>Date</th>
          <th>Time</th>
          <th>Entry</th>
        </tr>
      </thead>
      <tbody>
        {data.map((record, i) => (
          <tr key={i}>
            <td>{record.date}</td>
            <td>{record.time}</td>
            <td>{record.message}</td>
          </tr>
        ))}
      </tbody>
    </Table>
  );
};

Log.propTypes = {
  data: PropTypes.arrayOf(
    PropTypes.shape({
      date: PropTypes.string.isRequired,
      time: PropTypes.string.isRequired,
      message: PropTypes.string.isRequired,
    }).isRequired
  ),
  filterString: PropTypes.string.isRequired,
};

export default Log;
