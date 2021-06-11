import React, { useCallback, useState } from 'react';
import {
  IconButton,
  MenuItem,
  Select,
  TableCell,
  TableRow,
  TextField,
} from '@material-ui/core';
import { Add, Close, Create, Refresh } from '@material-ui/icons';

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
    day: '',
    startTime: '',
    duration: '',
    leaderId: '',
  };

  const daysOfWeek = [
    'Monday',
    'Tuesday',
    'Wednesday',
    'Thursday',
    'Friday',
    'Saturday',
    'Sunday',
  ];

  const [localEvent, setLocalEvent] = useState(create ? emptyEvent : event);
  const [modified, setModified] = useState(false);

  const validationHelper = (event) => {
    const anyEmpty = Object.keys(event)
      .filter((k) => !k.startsWith('_'))
      .some((k) => !event[k]);
    if (anyEmpty) throw new Error('Ensure all fields have a value!');

    if (!daysOfWeek.includes(event.day))
      throw new Error(
        "Day field must be a capitalised day of the week. e.g. 'Monday'"
      );
  };

  const onEdit = useCallback(
    (field, value) => {
      console.log(field, value);
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

  return (
    <TableRow>
      <TableCell>
        <EditField event={localEvent} onEdit={onEdit} fieldKey="title" />
      </TableCell>
      <TableCell>
        <TextField
          value={localEvent.day}
          onChange={(e) => onEdit('day', e.target.value)}
          variant="outlined"
          size="small"
          select
          fullWidth
        >
          {daysOfWeek.map((day) => (
            <MenuItem value={day}>{day}</MenuItem>
          ))}
        </TextField>
      </TableCell>
      <TableCell>
        <EditField
          event={localEvent}
          onEdit={onEdit}
          fieldKey="startTime"
          type="time"
        />
      </TableCell>
      <TableCell>
        <EditField event={localEvent} onEdit={onEdit} fieldKey="duration" />
      </TableCell>
      <TableCell>
          <TextField
          value={localEvent.leaderId}
          onChange={(e) => onEdit('leaderId', e.target.value)}
          variant="outlined"
          size="small"
          select
          fullWidth
        >
          {possibleLeaders.map((leader) => (
            <MenuItem value={leader.id}>{leader.name}</MenuItem>
          ))}
        </TextField>
      </TableCell>
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

const EditField = ({ event, onEdit, fieldKey, ...props }) => {
  return (
    <TextField
      variant="outlined"
      size="small"
      value={event[fieldKey]}
      onChange={(e) => {
        onEdit(fieldKey, e.target.value);
      }}
      fullWidth
      required
      {...props}
    />
  );
};

export default EventEntry;
