import AssignmentIcon from '@mui/icons-material/Assignment';
import CalendarToday from '@mui/icons-material/CalendarToday';
import ExpandMore from '@mui/icons-material/ExpandMore';
import Accordion from '@mui/material/Accordion';
import AccordionDetails from '@mui/material/AccordionDetails';
import AccordionSummary from '@mui/material/AccordionSummary';
import Typography from '@mui/material/Typography';
import { type LogDisplay } from '../../lib/interfaces/log-string-generator';
import './log-entry.scss';

interface Props {
  displayEntry: LogDisplay;
  date: Date;
}

const LogEntry = ({ displayEntry, date }: Props) => {
  return (
    <Accordion
      className="log-entry"
      disableGutters={!displayEntry.details || !displayEntry.details.length}
    >
      <AccordionSummary
        expandIcon={displayEntry.details?.length ? <ExpandMore /> : null}
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
          <Typography>{displayEntry.summary}</Typography>
        </div>
      </AccordionSummary>
      {displayEntry.details ? (
        <AccordionDetails>
          <ul style={{ margin: 0 }}>
            {displayEntry.details.map(d => (
              <li key={d}>
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
