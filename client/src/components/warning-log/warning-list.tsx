import LogEntry from '../common/log-entry';
import { useWarningList } from './use-warning-list';

export const WarningList = () => {
  const logEntries = useWarningList();
  return logEntries.map(e => (
    <LogEntry date={e.date} key={e.id} details={e.details}>
      {e.summary}
    </LogEntry>
  ));
};
