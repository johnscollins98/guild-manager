import React, { useCallback, useEffect, useState } from 'react';
import './EventPage.scss';

import Event from '../Interfaces/Event';
import DiscordMember from '../Interfaces/DiscordMember';

import EventRepo from '../utils/EventRepository';
import EventEntry from './EventEntry';
import EventPosterForm from './EventPosterForm';
import LoaderPage from './LoaderPage';
import { fetchDiscordMembers } from '../utils/DataRetrieval';

import Button from '@material-ui/core/Button';
import Dialog from '@material-ui/core/Dialog';
import DialogContent from '@material-ui/core/DialogContent';
import DialogTitle from '@material-ui/core/DialogTitle';
import { Color } from '@material-ui/lab/Alert';

import { useQuery } from 'react-query';

interface Props {
  filterString: string;
  openToast: (msg: string, status: Color) => void;
}

const EventPage = ({ filterString, openToast }: Props) => {
  const eventsQuery = useQuery('eventsData', () => EventRepo.getAll());
  const discordQuery = useQuery('discordMembers', () => fetchDiscordMembers());

  const [localEvents, setLocalEvents] = useState<Event[]>([]);
  const [sortedEvents, setSortedEvents] = useState<Event[]>([]);
  const [showModal, setShowModal] = useState(false);

  const [possibleLeaders, setPossibleLeaders] = useState<DiscordMember[]>([]);

  useEffect(() => {
    if (!discordQuery.data) return;
    setPossibleLeaders(
      discordQuery.data.filter(
        (member) =>
          !!member.roles.find(
            (r) => r.name === 'General' || r.name === 'Spearmarshal' || r.name === 'Commander'
          ) // hardcoded for now, to be improved.
      )
    );
  }, [discordQuery.data]);

  useEffect(() => {
    if (eventsQuery.data) {
      setLocalEvents(eventsQuery.data);
    }
  }, [eventsQuery.data, setLocalEvents]);

  useEffect(() => {
    const sorter = new Map<string, number>([
      ['Monday', 1],
      ['Tuesday', 2],
      ['Wednesday', 3],
      ['Thursday', 4],
      ['Friday', 5],
      ['Saturday', 6],
      ['Sunday', 7]
    ]);
    setSortedEvents(
      [...localEvents]
        .filter((event) => event.title.includes(filterString) || event.day.includes(filterString))
        .sort((a, b) => {
          const dateSort = (sorter.get(a.day) || 8) - (sorter.get(b.day) || 8);
          if (dateSort !== 0) return dateSort;

          const parseTime = (startTime: string) => {
            return Date.parse(`1970/01/01 ${startTime}`);
          };

          const aTime = parseTime(a.startTime);
          const bTime = parseTime(b.startTime);

          return aTime - bTime;
        })
    );
  }, [localEvents, setSortedEvents, filterString]);

  const deleteEvent = useCallback(
    async (eventToDelete: Event) => {
      try {
        const res = window.confirm(`Are you sure you want to delete '${eventToDelete.title}'?`);
        if (!res) return;

        const deletedEvent = await EventRepo.deleteById(eventToDelete._id);
        if (deletedEvent) {
          setLocalEvents(localEvents.filter((event) => event._id !== eventToDelete._id));
          openToast('Successfully deleted event!', 'success');
        } else {
          throw new Error('Could not delete event');
        }
      } catch (err) {
        console.error(err);
        openToast('There was an error deleting the event', 'error');
      }
    },
    [localEvents, setLocalEvents, openToast]
  );

  const updateEvent = useCallback(
    async (eventToUpdate: Event) : Promise<Event | undefined> => {
      try {
        const updatedEvent = await EventRepo.updateById(eventToUpdate._id, eventToUpdate);
        if (updatedEvent) {
          const eventsCopy = [...localEvents];
          const index = eventsCopy.findIndex((event) => event._id === updatedEvent._id);

          if (index !== null && index !== undefined) {
            eventsCopy[index] = updatedEvent;
            setLocalEvents(eventsCopy);
            openToast('Successfully updated the event!', 'success');
            return updatedEvent;
          } else {
            throw new Error('Something went wrong');
          }
        } else {
          throw new Error('Could not update event');
        }
      } catch (err) {
        console.error(err);
        openToast('There was an error updating the event', 'error');
        return undefined;
      }
    },
    [localEvents, setLocalEvents, openToast]
  );

  const createEvent = useCallback(
    async (eventToCreate: Event) : Promise<Event | undefined> => {
      try {
        const createdEvent = await EventRepo.create(eventToCreate);
        if (createdEvent) {
          setLocalEvents([...localEvents, createdEvent]);
          openToast('Successfully created the event!', 'success');
          return createdEvent;
        } else {
          throw new Error('Could not create event');
        }
      } catch (err) {
        console.error(err);
        openToast('There was an error creating the event', 'error');
        return undefined;
      }
    },
    [localEvents, setLocalEvents, openToast]
  );

  if (discordQuery.error) {
    openToast('There was an error getting discord data', 'error');
    console.error(discordQuery.error);
    return null;
  }

  if (eventsQuery.error) {
    openToast('There was an error getting event data', 'error');
    console.error(eventsQuery.error);
    return null;
  }

  if (discordQuery.isLoading || eventsQuery.isLoading) return <LoaderPage />;
  return (
    <>
      <div className="event-page">
        {sortedEvents.map((event) => (
          <EventEntry
            event={event}
            deleteEvent={deleteEvent}
            updateEvent={updateEvent}
            possibleLeaders={possibleLeaders}
            key={event._id}
            openToast={openToast}
          />
        ))}
        <EventEntry
          create={true}
          createEvent={createEvent}
          possibleLeaders={possibleLeaders}
          openToast={openToast}
        />
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
          <EventPosterForm onClose={() => setShowModal(false)} openToast={openToast} />
        </DialogContent>
      </Dialog>
    </>
  );
};

export default EventPage;
