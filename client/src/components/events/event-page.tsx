import { Box } from '@mui/material';
import Button from '@mui/material/Button';
import Dialog from '@mui/material/Dialog';
import DialogContent from '@mui/material/DialogContent';
import DialogTitle from '@mui/material/DialogTitle';
import { useSuspenseQueries } from '@tanstack/react-query';
import { useMemo, useState } from 'react';
import { daysOfWeek, type EventCreateDTO } from 'server';
import DiscordSvg from '../../assets/images/discord.svg?react';
import { authQuery, eventRolesQuery } from '../../lib/apis/auth-api';
import { discordMembersQuery } from '../../lib/apis/discord-api';
import { eventQuery, useCreateEventMutation } from '../../lib/apis/event-api';
import { useFilterString } from '../../lib/utils/use-filter-string';
import { QueryBoundary } from '../common/query-boundary';
import EventEntry from './event-entry';
import { EventFormDialog } from './event-form';
import { EventLeadersContext } from './event-leaders-context';
import EventPosterForm from './event-poster-form';

const EventPage = () => {
  const filterString = useFilterString();

  const [auth, eventsQuery, eventRoles, discordQuery] = useSuspenseQueries({
    queries: [authQuery, eventQuery, eventRolesQuery, discordMembersQuery]
  });

  const createEventMutation = useCreateEventMutation();

  const [showPostModal, setShowPostModal] = useState(false);
  const [showCreateModal, setShowCreateModal] = useState(false);

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

  // get possible leaders
  const leaders = discordQuery.data.filter(d =>
    d.roles.some(role => eventRoles.data.includes(role.id))
  );

  const createEvent = async (eventToCreate: EventCreateDTO) => {
    await createEventMutation.mutateAsync(eventToCreate);
  };

  return (
    <EventLeadersContext.Provider value={leaders}>
      <Box display="flex" justifyContent="flex-end" gap="8px" marginBottom="12px">
        <Button variant="contained" color="secondary" onClick={() => setShowCreateModal(true)}>
          Create new event
        </Button>
        <Button
          onClick={() => setShowPostModal(true)}
          variant="contained"
          className="discord-button"
          startIcon={<DiscordSvg width={22} />}
          disabled={!auth.data.permissions.EVENTS}
        >
          Post to Discord
        </Button>
      </Box>
      <Box display="flex" overflow="auto" flexWrap="wrap" sx={{ gap: { md: '4px' } }}>
        {sortedEvents.map(event => (
          <EventEntry
            event={event}
            hasEditPermission={auth.data.permissions.EVENTS}
            key={event.id}
          />
        ))}
      </Box>
      <EventFormDialog
        onSubmit={createEvent}
        isOpen={showCreateModal}
        onClose={() => setShowCreateModal(false)}
      />
      <Dialog open={showPostModal} onClose={() => setShowPostModal(false)} fullWidth maxWidth="sm">
        <DialogTitle>Post to Discord</DialogTitle>
        <DialogContent>
          <QueryBoundary>
            <EventPosterForm onClose={() => setShowPostModal(false)} />
          </QueryBoundary>
        </DialogContent>
      </Dialog>
    </EventLeadersContext.Provider>
  );
};

export default EventPage;
