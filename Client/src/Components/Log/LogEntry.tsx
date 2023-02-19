import AccessTime from '@mui/icons-material/AccessTime';
import CalendarToday from '@mui/icons-material/CalendarToday';
import Card from '@mui/material/Card';
import Typography from '@mui/material/Typography';
import GW2LogEntry from '../../Interfaces/GW2LogEntry';
import './LogEntry.scss';

interface Props {
  entryData: GW2LogEntry;
}

const LogEntry = ({ entryData }: Props) => {
  return (
    <Card variant="outlined" className="log-entry">
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
    </Card>
  );
};

export default LogEntry;
