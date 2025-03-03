import { useGW2Log } from '../../lib/apis/gw2-api';
import { useFilterString } from '../../lib/utils/use-filter-string';
import LogEntry from './log-entry';
import './log.scss';

const Log = () => {
  const filterString = useFilterString();
  const { data } = useGW2Log();

  const filteredData = data.filter(entry => entry.message.toLowerCase().includes(filterString));

  return (
    <div className="log-container">
      {filteredData.map(entry => (
        <LogEntry entryData={entry} key={`${entry.date}${entry.time}`} />
      ))}
    </div>
  );
};

export default Log;
