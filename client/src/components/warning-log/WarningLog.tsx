import { Box } from '@mui/material';
import { useSuspenseQueries } from '@tanstack/react-query';
import { discordMembersQuery } from '../../lib/apis/discord-api';
import { warningsQuery } from '../../lib/apis/warnings-api';
import DiscordLogEntry from '../discord-log/discord-log-entry';

export const WarningLog = () => {
  const [{ data: warnings }, { data: discordMembers }] = useSuspenseQueries({
    queries: [warningsQuery, discordMembersQuery]
  });

  const getMemberName = (id: string) => {
    const member = discordMembers.find(m => m.id === id);

    return member?.nickname || member?.name || 'Unknown Member';
  };

  const logEntries = warnings.map(w => {
    const date = new Date(w.timestamp);

    const givenTo = getMemberName(w.givenTo);
    const givenBy = getMemberName(w.givenBy);

    const summary = `${w.type.toLocaleUpperCase()} - Given to ${givenTo} by ${givenBy}.`;

    const details = [w.reason];

    if (w.lastUpdatedBy) {
      const updatedMember = getMemberName(w.lastUpdatedBy);
      const updatedDate = new Date(w.lastUpdatedTimestamp);
      details.push(`Last updated on ${updatedDate.toLocaleString()} by ${updatedMember}.`);
    }

    return {
      date,
      summary,
      details,
      id: w.id
    };
  });

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
