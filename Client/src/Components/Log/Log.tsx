import { useGW2Log } from '../../utils/apis/gw2-api';
import LoaderPage from '../LoaderPage';
import './Log.scss';
import LogEntry from './LogEntry';

interface Props {
  filterString: string;
}

const Log = ({ filterString }: Props) => {
  const { isLoading, data, error } = useGW2Log();

  if (error) {
    return <>There was an error loading log data.</>;
  }

  if (isLoading || !data) return <LoaderPage />;

  const lowerCaseFilterString = filterString.toLowerCase();
  const filteredData = data.filter(entry =>
    entry.message.toLowerCase().includes(lowerCaseFilterString)
  );

  return (
    <div className="log-container">
      {filteredData.map(entry => (
        <LogEntry entryData={entry} key={`${entry.date}${entry.time}`} />
      ))}
    </div>
  );
};

export default Log;
