import { useGW2Log } from '../../lib/apis/gw2-api';
import { useFilterString } from '../../lib/utils/use-filter-string';
import LogEntry from '../common/log-entry';
import './log.scss';

const Log = () => {
  const filterString = useFilterString();
  const { data } = useGW2Log();

  const filteredData = data.filter(entry => entry.message.toLowerCase().includes(filterString));

  return (
    <div className="log-container">
      {filteredData.map(entry => (
        <LogEntry
          key={entry.date}
          displayEntry={{ summary: entry.message }}
          date={new Date(entry.date)}
        />
      ))}
    </div>
  );
};

export default Log;
