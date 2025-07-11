import LogEntry from '../common/log-entry';
import { useWarningList } from './use-warning-list';

export const WarningList = () => {
  const logEntries = useWarningList();
  return logEntries.map(e => (
    <LogEntry date={e.date} key={e.id} displayEntry={{ summary: e.summary, details: e.details }} />
  ));
};
