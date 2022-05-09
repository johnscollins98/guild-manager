import { ExpandMore, CalendarToday, AccessTime } from '@mui/icons-material';
import { Accordion, AccordionSummary, Typography, AccordionDetails } from '@mui/material';
import { DiscordLogDisplay } from '../../Interfaces/DiscordLogStringGenerator';
import './DiscordLogEntry.scss';

interface Props {
  displayEntry: DiscordLogDisplay;
  date: Date;
}

const DiscordLogEntry = ({ displayEntry, date }: Props) => {
  return (
    <Accordion>
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
              <li>
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
