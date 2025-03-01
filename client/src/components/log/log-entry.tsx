import AccessTime from '@mui/icons-material/AccessTime';
import CalendarToday from '@mui/icons-material/CalendarToday';
import Typography from '@mui/material/Typography';
import { type GW2LogEntryDTO } from 'server';
import './log-entry.scss';

interface Props {
  entryData: GW2LogEntryDTO;
}

const LogEntry = ({ entryData }: Props) => {
  return (
    <div className="log-entry">
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
    </div>
  );
};

export default LogEntry;
