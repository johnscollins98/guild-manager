import React, { useState, useEffect } from 'react';
import PropTypes from 'prop-types';

import { filterLogByString } from '../utils/Helpers';
import './Log.scss';
import LogEntry from './LogEntry';
import LoaderPage from './LoaderPage';
import { useQuery } from 'react-query';
import { fetchGW2Log } from '../utils/DataRetrieval';

const Log = ({ filterString, openToast }) => {
  const [filteredData, setFilteredData] = useState([]);

  const { isLoading, data, error } = useQuery('gw2log', () => fetchGW2Log());

  useEffect(() => {
    if (!data) return;
    setFilteredData(filterLogByString(data, filterString));
  }, [data, filterString]);

  if (error) {
    openToast('There was an error getting the log', 'error');
    console.error(error);
    return null;
  }
  if (isLoading) return <LoaderPage />;
  return (
    <div className="log-container">
      {filteredData.map((entry) => (
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
