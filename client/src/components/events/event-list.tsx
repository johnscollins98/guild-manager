import { Box } from '@mui/system';
import { useSuspenseQueries } from '@tanstack/react-query';
import { useMemo } from 'react';
import { daysOfWeek } from 'server';
import { authQuery, eventRolesQuery } from '../../lib/apis/auth-api';
import { discordMembersQuery } from '../../lib/apis/discord-api';
import { eventQuery } from '../../lib/apis/event-api';
import { useFilterString } from '../../lib/utils/use-filter-string';
import EventEntry from './event-entry';

export const EventList = () => {
  const filterString = useFilterString();

  const [auth, eventsQuery] = useSuspenseQueries({
    queries: [authQuery, eventQuery, eventRolesQuery, discordMembersQuery]
  });

  // sort events
  const sortedEvents = useMemo(
    () =>
      eventsQuery.data
        ?.filter(
          event =>
            event.title.toLowerCase().includes(filterString) ||
            event.day.toLowerCase().includes(filterString)
        )
        .sort((a, b) => {
          const dateSort = daysOfWeek.indexOf(a.day) - daysOfWeek.indexOf(b.day);
          if (dateSort !== 0) return dateSort;

          const parseTime = (startTime: string) => {
            return Date.parse(`1970/01/01 ${startTime}`);
          };

          const aTime = parseTime(a.startTime);
          const bTime = parseTime(b.startTime);

          return aTime - bTime;
        }) ?? [],
    [eventsQuery.data, filterString]
  );
  return (
    <Box display="flex" overflow="auto" flexWrap="wrap" sx={{ gap: '4px' }}>
      {sortedEvents.map(event => (
        <EventEntry event={event} hasEditPermission={auth.data.permissions.EVENTS} key={event.id} />
      ))}
    </Box>
  );
};
