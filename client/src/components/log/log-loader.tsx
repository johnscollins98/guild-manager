import AccessTime from '@mui/icons-material/AccessTime';
import CalendarToday from '@mui/icons-material/CalendarToday';
import { Skeleton, Typography } from '@mui/material';
import './log-entry.scss';
import './log.scss';

export const LogLoader = () => {
  const arr = new Array(50).fill(0);

  return (
    <div className="log-container">
      {arr.map((_, idx) => (
        <div className="log-entry" key={idx}>
          <div>
            <CalendarToday color="disabled" />
            <Skeleton variant="text">
              <Typography>{new Date().toLocaleDateString()}</Typography>
            </Skeleton>
          </div>
          <div>
            <AccessTime color="disabled" />
            <Skeleton variant="text">
              <Typography>{new Date().toLocaleTimeString()}</Typography>
            </Skeleton>
          </div>
          <div>
            <Skeleton variant="text">
              <Typography>Some log message that is fairly long.</Typography>
            </Skeleton>
          </div>
        </div>
      ))}
    </div>
  );
};
