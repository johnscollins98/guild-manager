import React, { useCallback, useState } from 'react';
import { IconButton, TableCell, TableRow, TextField } from '@material-ui/core';
import { Add, Close, Create, Refresh } from '@material-ui/icons';

const EventEntry = ({
  create,
  event,
  deleteEvent,
  updateEvent,
  createEvent,
  openToast,
}) => {
  const emptyEvent = {
    title: '',
    day: '',
    startTime: '',
    duration: '',
    leaderId: '',
  };

  const [localEvent, setLocalEvent] = useState(create ? emptyEvent : event);
  const [modified, setModified] = useState(false);

  const validationHelper = (event) => {
    const anyEmpty = Object.keys(event)
      .filter((k) => !k.startsWith('_'))
      .some((k) => !event[k]);
    if (anyEmpty) throw new Error('Ensure all fields have a value!');

    const daysOfWeek = [
      'Monday',
      'Tuesday',
      'Wednesday',
      'Thursday',
      'Friday',
      'Saturday',
      'Sunday',
    ];
    if (!daysOfWeek.includes(event.day))
      throw new Error(
        "Day field must be a capitalised day of the week. e.g. 'Monday'"
      );
  };

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
  }, [updateEvent, localEvent, setModified, openToast]);

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
    localEvent,
    setModified,
    setLocalEvent,
    openToast,
  ]);

  const handleSubmit = useCallback(
    (e) => {
      e.preventDefault();
      create ? onCreate() : onUpdate();
    },
    [create, onCreate, onUpdate]
  );

  return (
    <TableRow>
      {['title', 'day', 'startTime', 'duration', 'leaderId'].map((k) => (
        <TableCell key={k}>
          <form onSubmit={handleSubmit}>
            <TextField
              variant="outlined"
              size="small"
              value={localEvent[k]}
              onChange={(e) => {
                onEdit(k, e.target.value);
              }}
              required
            />
          </form>
        </TableCell>
      ))}
      <TableCell>
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
      </TableCell>
    </TableRow>
  );
};

export default EventEntry;
