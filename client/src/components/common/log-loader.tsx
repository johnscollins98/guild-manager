import AssignmentIcon from '@mui/icons-material/Assignment';
import CalendarToday from '@mui/icons-material/CalendarToday';
import { Box, Skeleton, Typography } from '@mui/material';
import './log-entry.scss';

export const LogLoader = () => {
  const arr = new Array(50).fill(0);

  return (
    <Box overflow="auto">
      {arr.map((_, idx) => (
        <div className="log-entry" key={idx}>
          <div className="log-summary">
            <div className="summary-content">
              <div>
                <CalendarToday color="disabled" />
                <Skeleton variant="text">
                  <Typography>
                    {new Date().toLocaleString(undefined, {
                      dateStyle: 'short',
                      timeStyle: 'short'
                    })}
                  </Typography>
                </Skeleton>
              </div>
              <div>
                <AssignmentIcon color="disabled" />
                <Skeleton variant="text">
                  <Typography>Some log message that is fairly long.</Typography>
                </Skeleton>
              </div>
            </div>
          </div>
        </div>
      ))}
    </Box>
  );
};
