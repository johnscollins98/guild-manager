import AssignmentIcon from '@mui/icons-material/Assignment';
import CalendarToday from '@mui/icons-material/CalendarToday';
import ExpandMore from '@mui/icons-material/ExpandMore';
import Accordion from '@mui/material/Accordion';
import AccordionDetails from '@mui/material/AccordionDetails';
import AccordionSummary from '@mui/material/AccordionSummary';
import Typography from '@mui/material/Typography';
import { type ReactNode } from 'react';
import './log-entry.scss';

interface Props {
  date: Date;
  children: ReactNode;
  details?: ReactNode[];
}

const LogEntry = ({ children, details, date }: Props) => {
  return (
    <Accordion className="log-entry" disableGutters={details ? details.length === 0 : true}>
      <AccordionSummary
        expandIcon={details?.length ? <ExpandMore /> : null}
        className="log-summary"
        slotProps={{ content: { className: 'summary-content' } }}
      >
        <div>
          <CalendarToday />
          <Typography>
            {date.toLocaleString(undefined, { dateStyle: 'short', timeStyle: 'short' })}
          </Typography>
        </div>
        <div>
          <AssignmentIcon />
          <Typography>{children}</Typography>
        </div>
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
