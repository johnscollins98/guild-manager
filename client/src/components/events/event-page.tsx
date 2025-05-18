import { QueryBoundary } from '../common/query-boundary';
import { EventActions } from './event-actions';
import { EventLeadersProvider } from './event-leaders-context';
import { EventList } from './event-list';
import { EventLoader } from './event-loader';

const EventPage = () => {
  return (
    <EventLeadersProvider>
      <EventActions />
      <QueryBoundary fallback={<EventLoader />}>
        <EventList />
      </QueryBoundary>
    </EventLeadersProvider>
  );
};

export default EventPage;
