import { AccordionDetails, AccordionSummary, Typography } from '@material-ui/core';
import Accordion from '@material-ui/core/Accordion';
import { ExpandMore } from '@material-ui/icons';
import AccessTime from '@material-ui/icons/AccessTime';
import CalendarToday from '@material-ui/icons/CalendarToday';
import React from 'react';
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
          <ul style={{margin: 0}}>
            {displayEntry.details.map((d) => (
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
