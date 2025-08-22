import ExpandMore from '@mui/icons-material/ExpandMore';
import { Box } from '@mui/material';
import Accordion from '@mui/material/Accordion';
import AccordionDetails from '@mui/material/AccordionDetails';
import AccordionSummary from '@mui/material/AccordionSummary';
import Typography from '@mui/material/Typography';
import { type ReactNode } from 'react';
import './log-entry.scss';

interface Props {
  date: Date;
  avatarUrl?: string;
  children: ReactNode;
  details?: ReactNode[];
}

const LogEntry = ({ children, details, date, avatarUrl }: Props) => {
  return (
    <Accordion className="log-entry" disableGutters={details ? details.length === 0 : true}>
      <AccordionSummary
        expandIcon={details?.length ? <ExpandMore /> : null}
        className="log-summary"
        slotProps={{ content: { className: 'summary-content' } }}
      >
        <Box display="flex" alignItems="center" gap={1.5}>
          <Box sx={{ width: '30px', display: 'flex', alignItems: 'center' }}>
            {avatarUrl && (
              <img
                style={{ height: '30px', width: '30px', borderRadius: '100%' }}
                loading="lazy"
                src={avatarUrl}
              />
            )}
          </Box>
          <Box>
            <Typography>{children}</Typography>
            <Typography variant="caption" color="textDisabled">
              {date.toLocaleString(undefined, { dateStyle: 'short', timeStyle: 'short' })}
            </Typography>
          </Box>
        </Box>
      </AccordionSummary>
      {details ? (
        <AccordionDetails>
          <ul style={{ margin: 0 }}>
            {details.map(d => (
              <li key={d?.toString()}>
                <Typography>{d}</Typography>
              </li>
            ))}
          </ul>
        </AccordionDetails>
      ) : null}
    </Accordion>
  );
};

export default LogEntry;
