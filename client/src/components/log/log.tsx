import { useGW2Log } from '../../lib/apis/gw2-api';
import { useFilterString } from '../../lib/utils/use-filter-string';
import { ErrorMessage } from '../common/error-message';
import LoaderPage from '../common/loader-page';
import './log.scss';
import LogEntry from './log-entry';

const Log = () => {
  const filterString = useFilterString();
  const { isLoading, data, error } = useGW2Log();

  if (error) {
    return <ErrorMessage>There was an error loading log data.</ErrorMessage>;
  }

  if (isLoading || !data) return <LoaderPage />;

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
