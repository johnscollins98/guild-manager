import AccessTime from '@mui/icons-material/AccessTime';
import CalendarToday from '@mui/icons-material/CalendarToday';
import ExpandMore from '@mui/icons-material/ExpandMore';
import Accordion from '@mui/material/Accordion';
import AccordionDetails from '@mui/material/AccordionDetails';
import AccordionSummary from '@mui/material/AccordionSummary';
import Typography from '@mui/material/Typography';
import { type DiscordLogDisplay } from '../../lib/interfaces/discord-log-string-generator';
import './discord-log-entry.scss';

interface Props {
  displayEntry: DiscordLogDisplay;
  date: Date;
}

const DiscordLogEntry = ({ displayEntry, date }: Props) => {
  return (
    <Accordion className="discord-log-entry">
      <AccordionSummary
        expandIcon={displayEntry.details?.length ? <ExpandMore /> : null}
        className="discord-log-summary"
      >
        <div>
          <CalendarToday />
          <Typography>{date.toLocaleDateString()}</Typography>
        </div>
        <div>
          <AccessTime />
          <Typography>{date.toLocaleTimeString()}</Typography>
        </div>
        <div>
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

export default DiscordLogEntry;
