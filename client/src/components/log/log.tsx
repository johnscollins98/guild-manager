import { useCallback } from 'react';
import { useGW2Log } from '../../lib/apis/gw2-api';
import { useFilterString } from '../../lib/utils/use-filter-string';
import LogEntry from '../common/log-entry';
import { useRoster } from '../roster/use-roster';
import './log.scss';

const Log = () => {
  const filterString = useFilterString();
  const { data } = useGW2Log();
  const roster = useRoster();

  const filteredData = data.filter(entry => entry.message.toLowerCase().includes(filterString));

  const findAvatar = useCallback(
    (gw2AccountName: string | undefined) => {
      if (!gw2AccountName) return undefined;

      const user = roster.roster.find(m => m.memberId === gw2AccountName);

      if (!user) return undefined;

      return user.avatar;
    },
    [roster]
  );

  return (
    <div className="log-container">
      {filteredData.map(entry => (
        <LogEntry key={entry.date} date={new Date(entry.date)} avatarUrl={findAvatar(entry.user)}>
          {entry.message}
        </LogEntry>
      ))}
    </div>
  );
};

export default Log;
