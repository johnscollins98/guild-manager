import React, { useCallback, useState } from 'react';

import './EventEntry.scss';

import DiscordMember from '../Interfaces/DiscordMember';
import Event from '../Interfaces/Event';

import Card from '@material-ui/core/Card';
import IconButton from '@material-ui/core/IconButton';
import MenuItem from '@material-ui/core/MenuItem';
import TextField from '@material-ui/core/TextField';

import Add from '@material-ui/icons/Add';
import Assignment from '@material-ui/icons/Assignment';
import CalendarToday from '@material-ui/icons/CalendarToday';
import Close from '@material-ui/icons/Close';
import Create from '@material-ui/icons/Create';
import HourglassFull from '@material-ui/icons/HourglassFull';
import Person from '@material-ui/icons/Person';
import Refresh from '@material-ui/icons/Refresh';
import WatchLater from '@material-ui/icons/WatchLater';

const emptyEvent: Event = {
  title: '',
  day: 'Monday',
  startTime: '',
  duration: '',
  leaderId: '',
  _id: ''
};

const daysOfWeek = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];

interface Props {
  create?: boolean;
  event?: Event;
  possibleLeaders: DiscordMember[];
  deleteEvent?: (e: Event) => Promise<void>;
  updateEvent?: (e: Event) => Promise<Event | undefined>;
  createEvent?: (e: Event) => Promise<Event | undefined>;
  openToast: (msg: string, status: string) => void;
}

const EventEntry = ({
  create = false,
  event,
  possibleLeaders,
  deleteEvent,
  updateEvent,
  createEvent,
  openToast
}: Props) => {
  const [localEvent, setLocalEvent] = useState(event ? event : emptyEvent);
  const [modified, setModified] = useState(false);

  const validationHelper = useCallback(
    (event) => {
      const anyEmpty = Object.keys(event)
        .filter((k) => !k.startsWith('_'))
        .some((k) => !event[k]);
      if (anyEmpty) throw new Error('Ensure all fields have a value!');

      if (!daysOfWeek.includes(event.day))
        throw new Error("Day field must be a capitalised day of the week. e.g. 'Monday'");
    },

    []
  );

  const onEdit = useCallback(
    (field: string, value: string) => {
      setLocalEvent({ ...localEvent, [field]: value });
      setModified(true);
    },
    [localEvent, setLocalEvent, setModified]
  );

  const onReset = useCallback(() => {
    setLocalEvent(event ? event : emptyEvent);
    setModified(false);
  }, [event, create, setLocalEvent, setModified]);

  const onUpdate = useCallback(async () => {
    try {
      validationHelper(localEvent);
    } catch (err) {
      openToast(err.message, 'warning');
      return;
    }

    if (!updateEvent) {
      throw 'No update event function passed in';
    }

    const updatedEvent = await updateEvent(localEvent);
    if (updatedEvent) {
      setModified(false);
    }
  }, [updateEvent, validationHelper, localEvent, setModified, openToast]);

  const onCreate = useCallback(async () => {
    try {
      validationHelper(localEvent);
    } catch (err) {
      openToast(err.message, 'warning');
      return;
    }

    if (!createEvent) {
      throw 'No create event function passed in';
    }

    const createdEvent = await createEvent(localEvent);
    if (createdEvent) {
      setModified(false);
      setLocalEvent(emptyEvent);
    }
  }, [createEvent, validationHelper, localEvent, setModified, setLocalEvent, openToast]);

  const onDelete = useCallback(() => {
    if (deleteEvent) {
      deleteEvent(localEvent);
    } else {
      throw 'No Delete event function passed in';
    }
  }, [localEvent])

  const onSubmit = useCallback(
    (e) => {
      e.preventDefault();
      create ? onCreate() : onUpdate();
    },
    [create, onCreate, onUpdate]
  );

  return (
    <Card variant="outlined" className="event-entry">
      <form onSubmit={onSubmit} className="event-form">
        <div className="field long">
          <Assignment className="field-label" />
          <EditField event={localEvent} onEdit={onEdit} fieldKey="title" />
        </div>
        <div className="field">
          <CalendarToday className="field-label" />
          <EditField event={localEvent} onEdit={onEdit} fieldKey="day" select>
            {daysOfWeek.map((day) => (
              <MenuItem value={day} key={day}>
                {day}
              </MenuItem>
            ))}
          </EditField>
        </div>
        <div className="field">
          <WatchLater className="field-label" />
          <EditField event={localEvent} onEdit={onEdit} fieldKey="startTime" type="time" />
        </div>
        <div className="field">
          <HourglassFull className="field-label" />
          <EditField event={localEvent} onEdit={onEdit} fieldKey="duration" />
        </div>
        <div className="field long">
          <Person className="field-label" />
          <EditField event={localEvent} onEdit={onEdit} fieldKey="leaderId" select>
            {possibleLeaders.map((leader) => (
              <MenuItem value={leader.id} key={leader.id}>
                {leader.name}
              </MenuItem>
            ))}
          </EditField>
        </div>
        <div className="field buttons">
          {create ? null : (
            <IconButton size="small" onClick={onDelete}>
              <Close />
            </IconButton>
          )}
          {modified ? (
            <>
              <IconButton size="small" onClick={create ? onCreate : onUpdate}>
                {create ? <Add /> : <Create />}
              </IconButton>
              <IconButton size="small" onClick={onReset}>
                <Refresh />
              </IconButton>
            </>
          ) : null}
        </div>
      </form>
    </Card>
  );
};

interface EditFieldProps {
  event: Event;
  onEdit: (key: string, value: string) => void;
  fieldKey: string;
  children?: React.ReactNode;
  select?: boolean;
  type?: string;
}

const EditField = ({ event, onEdit, fieldKey, children, ...props }: EditFieldProps) => {
  return (
    <TextField
      variant="outlined"
      size="small"
      className="entry-input"
      value={event[fieldKey]}
      onChange={(e) => {
        onEdit(fieldKey, e.target.value);
      }}
      fullWidth
      required
      {...props}
    >
      {children}
    </TextField>
  );
};

export default EventEntry;
