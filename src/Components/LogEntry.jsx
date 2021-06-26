import React from 'react';

import './LogEntry.scss';

import Card from '@material-ui/core/Card';
import Typography from '@material-ui/core/Typography';

import AccessTime from '@material-ui/icons/AccessTime';
import CalendarToday from '@material-ui/icons/CalendarToday';

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
