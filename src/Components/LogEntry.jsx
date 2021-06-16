import { Card, Typography } from '@material-ui/core';
import { AccessTime, CalendarToday } from '@material-ui/icons';
import React from 'react';
import './LogEntry.scss';

const LogEntry = ({ entryData }) => {
  return (
    <Card variant="outlined" className="log-entry">
      <div>
        <CalendarToday />
        <Typography>{entryData.date}</Typography>
      </div>
      <div>
        <AccessTime />
        <Typography>{entryData.time}</Typography>
      </div>
      <div>
        <Typography>{entryData.message}</Typography>
      </div>
    </Card>
  );
};

export default LogEntry;
