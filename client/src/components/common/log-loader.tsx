import { Accordion, AccordionSummary, Box, Skeleton, Typography } from '@mui/material';
import './log-entry.scss';

export const LogLoader = () => {
  const arr = new Array(50).fill(0);

  return (
    <Box overflow="auto">
      {arr.map((_, idx) => (
        <Accordion className="log-entry" key={idx} disableGutters>
          <AccordionSummary
            className="log-summary"
            slotProps={{ content: { className: 'summary-content' } }}
          >
            <Skeleton variant="text">
              <Typography>Some log message that is fairly long.</Typography>
            </Skeleton>
            <Skeleton variant="text">
              <Typography variant="caption">
                {new Date().toLocaleString(undefined, {
                  dateStyle: 'short',
                  timeStyle: 'short'
                })}
              </Typography>
            </Skeleton>
          </AccordionSummary>
        </Accordion>
      ))}
    </Box>
  );
};
