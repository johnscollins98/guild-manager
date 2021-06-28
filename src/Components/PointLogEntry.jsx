import React from 'react';

import './PointLogEntry.scss';

import Avatar from '@material-ui/core/Avatar';
import Card from '@material-ui/core/Card';
import Typography from '@material-ui/core/Typography';

import ArrowForward from '@material-ui/icons/ArrowForward';
import CalendarToday from '@material-ui/icons/CalendarToday';
import ExposureNeg1 from '@material-ui/icons/ExposureNeg1';
import ExposurePlus1 from '@material-ui/icons/ExposurePlus1';
import Person from '@material-ui/icons/Person';

const PointLogEntry = ({ entry }) => {
  return (
    <Card variant="outlined" className="point-log-entry">
      <div className="transfer">
        <Person />
        <Typography>{entry.givenBy}</Typography>
        <ArrowForward />
        <Typography>{entry.givenTo}</Typography>
      </div>
      {entry.timestamp ? (
        <div className="timestamp">
          <CalendarToday />
          <Typography>{new Date(entry.timestamp).toLocaleString()}</Typography>
        </div>
      ) : null}
      <div className="values">
        <Avatar className="point-value">{entry.oldVal}</Avatar>
        {entry.newVal - entry.oldVal >= 0 ? <ExposurePlus1 /> : <ExposureNeg1 />}
        <Avatar className="point-value">{entry.newVal}</Avatar>
      </div>
    </Card>
  );
};

export default PointLogEntry;
