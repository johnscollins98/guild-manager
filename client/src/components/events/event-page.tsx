import Button from '@mui/material/Button';
import Dialog from '@mui/material/Dialog';
import DialogContent from '@mui/material/DialogContent';
import DialogTitle from '@mui/material/DialogTitle';
import Divider from '@mui/material/Divider';
import { useState } from 'react';
import { ReactComponent as DiscordSvg } from '../../assets/images/discord.svg';
import { useEventRoles } from '../../lib/apis/auth-api';
import { useDiscordMembers } from '../../lib/apis/discord-api';
import {
  useCreateEventMutation,
  useDeleteEventMutation,
  useEvents,
  useUpdateEventMutation
} from '../../lib/apis/event-api';
import Event from '../../lib/interfaces/event';
import { useFilterString } from '../../lib/utils/use-filter-string';
import useConfirm from '../common/confirm-dialog/use-confirm';
import { ErrorMessage } from '../common/error-message';
import LoaderPage from '../common/loader-page';
import EventEntry from './event-entry';
import './event-page.scss';
import EventPosterForm from './event-poster-form';

const sorter = new Map<string, number>([
  ['Monday', 1],
  ['Tuesday', 2],
  ['Wednesday', 3],
  ['Thursday', 4],
  ['Friday', 5],
  ['Saturday', 6],
  ['Sunday', 7],
  ['Dynamic', 8]
]);

const EventPage = () => {
  const filterString = useFilterString();

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
    .filter(
      event =>
        event.title.toLowerCase().includes(filterString) ||
        event.day.toLowerCase().includes(filterString)
    )
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
        <Divider />
        <EventEntry create={true} createEvent={createEvent} possibleLeaders={leaders} />
      </div>
      <div className="button-container">
        <Button onClick={() => setShowModal(true)} variant="contained" className="discord-button">
          <DiscordSvg width={24} />
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
