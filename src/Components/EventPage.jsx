import {
  Button,
  Dialog,
  DialogContent,
  DialogTitle,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
} from '@material-ui/core';
import React, { useCallback, useEffect, useState } from 'react';
import EventRepo from '../utils/EventRepository';
import EventEntry from './EventEntry';
import EventPosterForm from './EventPosterForm';
import Table from './Table';

const EventPage = ({
  events,
  eventsLoaded,
  discordMembers,
  filterString,
  openToast,
}) => {
  const [localEvents, setLocalEvents] = useState([]);
  const [sortedEvents, setSortedEvents] = useState([]);
  const [showModal, setShowModal] = useState(false);

  const [possibleLeaders, setPossibleLeaders] = useState([]);

  useEffect(() => {
    setPossibleLeaders(
      discordMembers.filter(
        (member) =>
          !!member.roles.find(
            (r) =>
              r.name === 'General' ||
              r.name === 'Spearmarshal' ||
              r.name === 'Commander'
          ) // hardcoded for now, to be improved.
      )
    );
  }, [discordMembers]);

  useEffect(() => {
    setLocalEvents(events);
  }, [events, setLocalEvents]);

  useEffect(() => {
    const sorter = {
      Monday: 1,
      Tuesday: 2,
      Wednesday: 3,
      Thursday: 4,
      Friday: 5,
      Saturday: 6,
      Sunday: 7,
    };
    setSortedEvents(
      [...localEvents]
        .filter(
          (event) =>
            event.title.includes(filterString) ||
            event.day.includes(filterString)
        )
        .sort((a, b) => {
          const dateSort = (sorter[a.day] || 8) - (sorter[b.day] || 8);
          if (dateSort !== 0) return dateSort;

          const parseTime = (startTime) => {
            return Date.parse(`1970/01/01 ${startTime}`);
          };

          const aTime = parseTime(a.startTime);
          const bTime = parseTime(b.startTime);

          return aTime - bTime;
        })
    );
  }, [localEvents, setSortedEvents, filterString]);

  const deleteEvent = useCallback(
    async (eventToDelete) => {
      try {
        const res = window.confirm(
          `Are you sure you want to delete '${eventToDelete.title}'?`
        );
        if (!res) return;

        const deletedEvent = await EventRepo.deleteById(eventToDelete._id);
        if (deletedEvent) {
          setLocalEvents(
            localEvents.filter((event) => event._id !== eventToDelete._id)
          );
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
    async (eventToUpdate) => {
      try {
        const updatedEvent = await EventRepo.updateById(
          eventToUpdate._id,
          eventToUpdate
        );
        if (updatedEvent) {
          const eventsCopy = [...localEvents];
          const index = eventsCopy.findIndex(
            (event) => event._id === updatedEvent._id
          );

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
      }
    },
    [localEvents, setLocalEvents, openToast]
  );

  const createEvent = useCallback(
    async (eventToCreate) => {
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
      }
    },
    [localEvents, setLocalEvents, openToast]
  );

  return (
    <>
      <Table>
        <colgroup>
          <col />
          <col width="150px" />
          <col width="165px" />
          <col width="120px" />
          <col />
          <col width="140px" />
        </colgroup>
        <TableHead>
          <TableRow>
            <TableCell>Title</TableCell>
            <TableCell>Day</TableCell>
            <TableCell>Start Time (UTC)</TableCell>
            <TableCell>Duration</TableCell>
            <TableCell>Leader ID</TableCell>
            <TableCell></TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
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
          {eventsLoaded ? (
            <EventEntry
              create={true}
              createEvent={createEvent}
              possibleLeaders={possibleLeaders}
              openToast={openToast}
            />
          ) : null}
        </TableBody>
      </Table>
      {eventsLoaded ? (
        <Button
          onClick={() => setShowModal(true)}
          style={{ width: 'fit-content', margin: '4px' }}
          variant="contained"
        >
          Post to Discord
        </Button>
      ) : null}
      <Dialog
        open={showModal}
        onClose={() => setShowModal(false)}
        fullWidth={true}
        maxWidth="sm"
      >
        <DialogTitle>Post to Discord</DialogTitle>
        <DialogContent>
          <EventPosterForm
            events={events}
            onClose={() => setShowModal(false)}
            openToast={openToast}
          />
        </DialogContent>
      </Dialog>
    </>
  );
};

export default EventPage;
