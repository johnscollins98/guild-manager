import DiscordLogEntry from '../discord-log/discord-log-entry';
import { useWarningList } from './useWarningList';

export const WarningList = () => {
  const logEntries = useWarningList();
  return logEntries.map(e => (
    <DiscordLogEntry
      date={e.date}
      key={e.id}
      displayEntry={{ summary: e.summary, details: e.details }}
    />
  ));
};
