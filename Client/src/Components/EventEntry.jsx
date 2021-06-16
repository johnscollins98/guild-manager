import React, { useCallback, useState } from 'react';
import { Card, IconButton, MenuItem, TextField } from '@material-ui/core';
import {
  Add,
  Assignment,
  CalendarToday,
  Close,
  Create,
  HourglassFull,
  Person,
  Refresh,
  WatchLater,
} from '@material-ui/icons';
import './EventEntry.scss';

const EventEntry = ({
  create,
  event,
  possibleLeaders,
  deleteEvent,
  updateEvent,
  createEvent,
  openToast,
}) => {
  const emptyEvent = {
    title: '',
    day: 'Monday',
    startTime: '',
    duration: '',
    leaderId: '',
  };

  const [localEvent, setLocalEvent] = useState(create ? emptyEvent : event);
  const [modified, setModified] = useState(false);

  const daysOfWeek = [
    'Monday',
    'Tuesday',
    'Wednesday',
    'Thursday',
    'Friday',
    'Saturday',
    'Sunday',
  ];

  const validationHelper = useCallback(
    (event) => {
      const anyEmpty = Object.keys(event)
        .filter((k) => !k.startsWith('_'))
        .some((k) => !event[k]);
      if (anyEmpty) throw new Error('Ensure all fields have a value!');

      if (!daysOfWeek.includes(event.day))
        throw new Error(
          "Day field must be a capitalised day of the week. e.g. 'Monday'"
        );
    },

    [daysOfWeek]
  );

  const onEdit = useCallback(
    (field, value) => {
      setLocalEvent({ ...localEvent, [field]: value });
      setModified(true);
    },
    [localEvent, setLocalEvent, setModified]
  );

  const onReset = useCallback(() => {
    setLocalEvent(create ? emptyEvent : event);
    setModified(false);
  }, [event, create, emptyEvent, setLocalEvent, setModified]);

  const onUpdate = useCallback(async () => {
    try {
      validationHelper(localEvent);
    } catch (err) {
      openToast(err.message, 'warning');
      return;
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

    const createdEvent = await createEvent(localEvent);
    if (createdEvent) {
      setModified(false);
      setLocalEvent(emptyEvent);
    }
  }, [
    createEvent,
    emptyEvent,
    validationHelper,
    localEvent,
    setModified,
    setLocalEvent,
    openToast,
  ]);

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
          <EditField
            event={localEvent}
            onEdit={onEdit}
            fieldKey="startTime"
            type="time"
          />
        </div>
        <div className="field">
          <HourglassFull className="field-label" />
          <EditField event={localEvent} onEdit={onEdit} fieldKey="duration" />
        </div>
        <div className="field long">
          <Person className="field-label" />
          <EditField
            event={localEvent}
            onEdit={onEdit}
            fieldKey="leaderId"
            select
          >
            {possibleLeaders.map((leader) => (
              <MenuItem value={leader.id} key={leader.id}>
                {leader.name}
              </MenuItem>
            ))}
          </EditField>
        </div>
        <div className="field buttons">
          {create ? null : (
            <IconButton size="small" onClick={() => deleteEvent(event)}>
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

const EditField = ({ event, onEdit, fieldKey, children, ...props }) => {
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
