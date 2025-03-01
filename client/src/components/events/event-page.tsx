import { Divider } from '@mui/material';
import Button from '@mui/material/Button';
import Dialog from '@mui/material/Dialog';
import DialogContent from '@mui/material/DialogContent';
import DialogTitle from '@mui/material/DialogTitle';
import { useMemo, useState } from 'react';
import { daysOfWeek, type EventCreateDTO, type EventDTO } from 'server';
import DiscordSvg from '../../assets/images/discord.svg?react';
import { useAuth, useEventRoles } from '../../lib/apis/auth-api';
import { useDiscordMembers } from '../../lib/apis/discord-api';
import {
  useCreateEventMutation,
  useDeleteEventMutation,
  useEvents,
  useUpdateEventMutation
} from '../../lib/apis/event-api';
import { useFilterString } from '../../lib/utils/use-filter-string';
import { useConfirm } from '../common/confirm-dialog';
import { ErrorMessage } from '../common/error-message';
import LoaderPage from '../common/loader-page';
import EventEntry from './event-entry';
import './event-page.scss';
import EventPosterForm from './event-poster-form';

const EventPage = () => {
  const filterString = useFilterString();

  const authQuery = useAuth();
  const eventsQuery = useEvents();
  const eventRolesQuery = useEventRoles();
  const discordQuery = useDiscordMembers();
  const deleteEventMutation = useDeleteEventMutation();
  const updateEventMutation = useUpdateEventMutation();
  const createEventMutation = useCreateEventMutation();

  const [showModal, setShowModal] = useState(false);

  const confirm = useConfirm();

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

  const deleteEvent = async (eventToDelete: EventDTO) => {
    const res = await confirm(
      `Are you sure you want to delete '${eventToDelete.title}'?`,
      'Delete Event'
    );
    if (!res) return;

    await deleteEventMutation.mutateAsync(eventToDelete.id);
  };

  const updateEvent = async (id: number, event: EventCreateDTO) => {
    await updateEventMutation.mutateAsync({ id, event });
  };

  const createEvent = async (eventToCreate: EventCreateDTO) => {
    await createEventMutation.mutateAsync(eventToCreate);
  };

  return (
    <>
      <div className="event-page">
        {sortedEvents.map(event => (
          <EventEntry
            initialData={event}
            authData={authQuery.data}
            onDelete={() => deleteEvent(event)}
            onSubmit={update => updateEvent(event.id, update)}
            possibleLeaders={leaders}
            changeOpacityWhenIgnored
            key={event.id}
          />
        ))}
        <Divider sx={{ '::before': { borderWidth: '4px' }, '::after': { borderWidth: '4px' } }}>
          Create a new event
        </Divider>
        <EventEntry
          onSubmit={createEvent}
          authData={authQuery.data}
          possibleLeaders={leaders}
          resetOnSubmit
        />
      </div>
      <div className="button-container">
        <Button
          onClick={() => setShowModal(true)}
          variant="contained"
          className="discord-button"
          startIcon={<DiscordSvg width={22} />}
          disabled={!authQuery.data.permissions.EVENTS}
        >
          Post to Discord
        </Button>
      </div>
      <Dialog open={showModal} onClose={() => setShowModal(false)} fullWidth={true} maxWidth="sm">
        <DialogTitle>Post to Discord</DialogTitle>
        <DialogContent>
          <EventPosterForm onClose={() => setShowModal(false)} />
        </DialogContent>
      </Dialog>
    </>
  );
};

export default EventPage;
