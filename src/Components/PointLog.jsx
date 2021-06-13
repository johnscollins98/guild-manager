import React, { useEffect, useState } from 'react';
import './PointLog.scss';
import PointLogEntry from './PointLogEntry';

const PointLog = ({ data, filterString }) => {
  const [ourData, setOurData] = useState([]);

  useEffect(() => {
    const testString = filterString.toLowerCase();
    const filtered = data.filter(
      (entry) =>
        entry.givenBy.toLowerCase().includes(testString) ||
        entry.givenTo.toLowerCase().includes(testString)
    );
    setOurData(filtered);
  }, [data, filterString]);

  return (
    <div className="point-log-container">
      {ourData.map((entry) => (
        <PointLogEntry entry={entry} />
      ))}
    </div>
  );
};

export default PointLog;
