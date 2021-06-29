import React, { useEffect, useState } from 'react';
import PropTypes from 'prop-types';
import { useQuery } from 'react-query';
import { fetchPointLog } from '../utils/DataRetrieval';
import LoaderPage from './LoaderPage';
import './PointLog.scss';
import PointLogEntry from './PointLogEntry';

const PointLog = ({ filterString, openToast }) => {
  const [ourData, setOurData] = useState([]);

  const { isLoading, error, data } = useQuery('pointLogData', () => fetchPointLog());

  useEffect(() => {
    if (!data) return;

    const testString = filterString.toLowerCase();
    const filtered = data.filter(
      (entry) =>
        entry.givenBy.toLowerCase().includes(testString) ||
        entry.givenTo.toLowerCase().includes(testString)
    );
    setOurData(filtered);
  }, [data, filterString]);

  if (error) {
    openToast('There was an error getting the point log', 'error');
    console.error(error);
    return null;
  }
  if (isLoading) return <LoaderPage />;

  return (
    <div className="point-log-container">
      {ourData.map((entry) => (
        <PointLogEntry entry={entry} key={entry._id} />
      ))}
    </div>
  );
};

PointLog.propTypes = {
  /* string to filter data */
  filterString: PropTypes.string.isRequired,

  /* Function to open toast */
  openToast: PropTypes.func.isRequired
};

export default PointLog;
