import { Box } from '@mui/material';
import DiscordLogEntry from '../discord-log/discord-log-entry';
import { useWarningList } from './useWarningList';

export const WarningLog = () => {
  const logEntries = useWarningList();

  return (
    <Box sx={{ overflowX: 'hidden', overflowY: 'auto' }}>
      {logEntries.map(e => (
        <DiscordLogEntry
          date={e.date}
          key={e.id}
          displayEntry={{ summary: e.summary, details: e.details }}
        />
      ))}
    </Box>
  );
};
