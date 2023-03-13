import Button from '@mui/material/Button';
import Dialog from '@mui/material/Dialog';
import DialogContent from '@mui/material/DialogContent';
import DialogTitle from '@mui/material/DialogTitle';
import { useState } from 'react';
import Event from '../../Interfaces/Event';
import { useEventRoles } from '../../utils/apis/auth-api';
import { useDiscordMembers } from '../../utils/apis/discord-api';
import {
  useCreateEventMutation,
  useDeleteEventMutation,
  useEvents,
  useUpdateEventMutation
} from '../../utils/apis/event-api';
import useConfirm from '../Common/ConfirmDialog/useConfirm';
import { ErrorMessage } from '../Common/ErrorMessage';
import LoaderPage from '../LoaderPage';
import EventEntry from './EventEntry';
import './EventPage.scss';
import EventPosterForm from './EventPosterForm';

const sorter = new Map<string, number>([
  ['Monday', 1],
  ['Tuesday', 2],
  ['Wednesday', 3],
  ['Thursday', 4],
  ['Friday', 5],
  ['Saturday', 6],
  ['Sunday', 7]
]);

const EventPage = () => {
  const filterString = '';

  const eventsQuery = useEvents();
  const eventRolesQuery = useEventRoles();
  const discordQuery = useDiscordMembers();
  const deleteEventMutation = useDeleteEventMutation();
  const updateEventMutation = useUpdateEventMutation();
  const createEventMutation = useCreateEventMutation();

  const [showModal, setShowModal] = useState(false);

  const { confirm } = useConfirm();

  if (eventsQuery.error || discordQuery.error || eventRolesQuery.error) {
    return <ErrorMessage>There was an error gathering events data.</ErrorMessage>;
  }

  if (!eventRolesQuery.data || !eventsQuery.data || !discordQuery.data) return <LoaderPage />;

  // get possible leaders
  const leaders = discordQuery.data.filter(d =>
    d.roles.some(role => eventRolesQuery.data.includes(role.id))
  );

  // sort events
  const sortedEvents = eventsQuery.data
    .filter(event => event.title.includes(filterString) || event.day.includes(filterString))
    .sort((a, b) => {
      const dateSort = (sorter.get(a.day) || 8) - (sorter.get(b.day) || 8);
      if (dateSort !== 0) return dateSort;

      const parseTime = (startTime: string) => {
        return Date.parse(`1970/01/01 ${startTime}`);
      };

      const aTime = parseTime(a.startTime);
      const bTime = parseTime(b.startTime);

      return aTime - bTime;
    });

  const deleteEvent = async (eventToDelete: Event) => {
    const res = await confirm(
      `Are you sure you want to delete '${eventToDelete.title}'?`,
      'Delete Event'
    );
    if (!res) return;

    if (eventToDelete._id) {
      await deleteEventMutation.mutateAsync(eventToDelete._id);
    }
  };

  const updateEvent = async (eventToUpdate: Event) => {
    if (eventToUpdate._id) {
      await updateEventMutation.mutateAsync({ id: eventToUpdate._id, event: eventToUpdate });
    }
  };

  const createEvent = async (eventToCreate: Event) => {
    await createEventMutation.mutateAsync(eventToCreate);
  };

  return (
    <>
      <div className="event-page">
        {sortedEvents.map(event => (
          <EventEntry
            event={event}
            deleteEvent={deleteEvent}
            updateEvent={updateEvent}
            possibleLeaders={leaders}
            key={event._id}
          />
        ))}
        <EventEntry create={true} createEvent={createEvent} possibleLeaders={leaders} />
      </div>
      <Button
        onClick={() => setShowModal(true)}
        style={{ width: 'fit-content', margin: '4px' }}
        variant="contained"
      >
        Post to Discord
      </Button>
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
