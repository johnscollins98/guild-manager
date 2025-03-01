import { Box } from '@mui/material';
import Button from '@mui/material/Button';
import Dialog from '@mui/material/Dialog';
import DialogContent from '@mui/material/DialogContent';
import DialogTitle from '@mui/material/DialogTitle';
import { useMemo, useState } from 'react';
import { daysOfWeek, type EventCreateDTO } from 'server';
import DiscordSvg from '../../assets/images/discord.svg?react';
import { useAuth, useEventRoles } from '../../lib/apis/auth-api';
import { useDiscordMembers } from '../../lib/apis/discord-api';
import { useCreateEventMutation, useEvents } from '../../lib/apis/event-api';
import { useFilterString } from '../../lib/utils/use-filter-string';
import { ErrorMessage } from '../common/error-message';
import LoaderPage from '../common/loader-page';
import EventEntry from './event-entry';
import { EventFormDialog } from './event-form';
import { EventLeadersContext } from './event-leaders-context';
import EventPosterForm from './event-poster-form';

const EventPage = () => {
  const filterString = useFilterString();

  const authQuery = useAuth();
  const eventsQuery = useEvents();
  const eventRolesQuery = useEventRoles();
  const discordQuery = useDiscordMembers();
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

  if (eventsQuery.error || discordQuery.error || eventRolesQuery.error || authQuery.error) {
    return <ErrorMessage>There was an error gathering events data.</ErrorMessage>;
  }

  if (!eventRolesQuery.data || !eventsQuery.data || !discordQuery.data || !authQuery.data)
    return <LoaderPage />;

  // get possible leaders
  const leaders = discordQuery.data.filter(d =>
    d.roles.some(role => eventRolesQuery.data.includes(role.id))
  );

  const createEvent = async (eventToCreate: EventCreateDTO) => {
    await createEventMutation.mutateAsync(eventToCreate);
  };

  return (
    <EventLeadersContext.Provider value={leaders}>
      <Box display="flex" flexDirection="column" overflow="auto">
        {sortedEvents.map(event => (
          <EventEntry
            event={event}
            hasEditPermission={authQuery.data.permissions.EVENTS}
            key={event.id}
          />
        ))}
      </Box>
      <Box display="flex" justifyContent="flex-end" gap="8px" marginTop="16px">
        <Button variant="contained" color="secondary" onClick={() => setShowCreateModal(true)}>
          Create new event
        </Button>
        <Button
          onClick={() => setShowPostModal(true)}
          variant="contained"
          className="discord-button"
          startIcon={<DiscordSvg width={22} />}
          disabled={!authQuery.data.permissions.EVENTS}
        >
          Post to Discord
        </Button>
      </Box>
      <EventFormDialog
        onSubmit={createEvent}
        isOpen={showCreateModal}
        onClose={() => setShowCreateModal(false)}
      />
      <Dialog open={showPostModal} onClose={() => setShowPostModal(false)} fullWidth maxWidth="sm">
        <DialogTitle>Post to Discord</DialogTitle>
        <DialogContent>
          <EventPosterForm onClose={() => setShowPostModal(false)} />
        </DialogContent>
      </Dialog>
    </EventLeadersContext.Provider>
  );
};

export default EventPage;
