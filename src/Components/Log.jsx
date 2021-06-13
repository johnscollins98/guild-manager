import React from 'react';
import PropTypes from 'prop-types';

import { filterLogByString } from '../utils/Helpers';
import './Log.scss';
import LogEntry from './LogEntry';

const Log = ({ data, filterString }) => {
  data = filterLogByString(data, filterString);

  return (
    <div className="log-container">
      {data.map((entry) => (
        <LogEntry entryData={entry} key={`${entry.date}${entry.time}`} />
      ))}
    </div>
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
