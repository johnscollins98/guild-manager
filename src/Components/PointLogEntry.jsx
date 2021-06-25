import { Avatar, Card, Typography } from '@material-ui/core';
import {
  ArrowForward,
  CalendarToday,
  ExposureNeg1,
  ExposurePlus1,
  Person,
} from '@material-ui/icons';
import React from 'react';
import './PointLogEntry.scss';

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
        {entry.newVal - entry.oldVal >= 0 ? (
          <ExposurePlus1 />
        ) : (
          <ExposureNeg1 />
        )}
        <Avatar className="point-value">{entry.newVal}</Avatar>
      </div>
    </Card>
  );
};

export default PointLogEntry;
