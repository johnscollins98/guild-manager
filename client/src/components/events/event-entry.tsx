import Assignment from '@mui/icons-material/Assignment';
import CalendarToday from '@mui/icons-material/CalendarToday';
import DeleteForever from '@mui/icons-material/DeleteForever';
import HourglassFull from '@mui/icons-material/HourglassFull';
import Person from '@mui/icons-material/Person';
import Refresh from '@mui/icons-material/Refresh';
import WatchLater from '@mui/icons-material/WatchLater';
import Button from '@mui/material/Button';
import Card from '@mui/material/Card';
import IconButton from '@mui/material/IconButton';
import MenuItem from '@mui/material/MenuItem';
import TextField from '@mui/material/TextField';
import Tooltip from '@mui/material/Tooltip';
import { useTheme } from '@mui/material/styles';
import { Theme } from '@mui/material/styles/createTheme';
import React, { useCallback, useState } from 'react';
import { EventCreateDTO, EventDTO, FormattedDiscordMember } from 'server';
import { useToast } from '../common/toast-context';
import './event-entry.scss';

const emptyEvent: EventCreateDTO = {
  title: '',
  day: 'Monday',
  startTime: '',
  duration: '',
  leaderId: ''
};

const daysOfWeek = [
  'Monday',
  'Tuesday',
  'Wednesday',
  'Thursday',
  'Friday',
  'Saturday',
  'Sunday',
  'Dynamic'
];

interface Props {
  create?: boolean;
  event?: EventDTO;
  possibleLeaders: FormattedDiscordMember[];
  deleteEvent?: (e: EventDTO) => Promise<void>;
  updateEvent?: (id: number, e: EventCreateDTO) => Promise<void>;
  createEvent?: (e: EventCreateDTO) => Promise<void>;
}

const EventEntry = ({
  create = false,
  event,
  possibleLeaders,
  deleteEvent,
  updateEvent,
  createEvent
}: Props) => {
  const [localEvent, setLocalEvent] = useState<EventCreateDTO>(event ? event : emptyEvent);
  const [modified, setModified] = useState(false);
  const openToast = useToast();

  const validationHelper = useCallback((event: EventCreateDTO) => {
    if (!event.title) throw new Error('A title must be provided');
    if (!event.leaderId) throw new Error('A leader must be selected');
    if (!daysOfWeek.includes(event.day))
      throw new Error("Day field must be a capitalised day of the week. e.g. 'Monday'");
  }, []);

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
  }, [event, setLocalEvent, setModified]);

  const onUpdate = useCallback(async () => {
    try {
      validationHelper(localEvent);
    } catch (err) {
      err instanceof Error && openToast(err.message, 'warning');
      return;
    }

    if (!updateEvent) {
      throw new Error('No update event function passed in');
    }

    if (!event) {
      throw new Error('No event to update'); // TODO: this is messy and could use a refactor
    }

    if (localEvent) await updateEvent(event.id, localEvent);
    setModified(false);
  }, [updateEvent, validationHelper, localEvent, setModified, openToast, event]);

  const onCreate = useCallback(async () => {
    try {
      validationHelper(localEvent);
    } catch (err) {
      err instanceof Error && openToast(err.message, 'warning');
      return;
    }

    if (!createEvent) {
      throw new Error('No create event function passed in');
    }

    await createEvent(localEvent);
    setModified(false);
    setLocalEvent(emptyEvent);
  }, [createEvent, validationHelper, localEvent, setModified, setLocalEvent, openToast]);

  const onDelete = useCallback(() => {
    if (deleteEvent && event) {
      deleteEvent(event);
    } else {
      throw new Error('No Delete event function passed in');
    }
  }, [event, deleteEvent]);

  const onSubmit = useCallback(
    (e: React.FormEvent<HTMLFormElement>) => {
      e.preventDefault();
      create ? onCreate() : onUpdate();
    },
    [create, onCreate, onUpdate]
  );

  return (
    <Card variant="elevation" className="event-entry">
      <form onSubmit={onSubmit} className="event-form">
        <div className="field long">
          <Assignment color="secondary" className="field-label" />
          <EditField event={localEvent} onEdit={onEdit} fieldKey="title" required />
        </div>
        <div className="field">
          <CalendarToday color="secondary" className="field-label" />
          <EditField event={localEvent} onEdit={onEdit} fieldKey="day" select required>
            {daysOfWeek.map(day => (
              <MenuItem value={day} key={day}>
                {day}
              </MenuItem>
            ))}
          </EditField>
        </div>
        <div className="field">
          <WatchLater color="secondary" className="field-label" />
          <EditField event={localEvent} onEdit={onEdit} fieldKey="startTime" type="time" />
        </div>
        <div className="field">
          <HourglassFull color="secondary" className="field-label" />
          <EditField event={localEvent} onEdit={onEdit} fieldKey="duration" />
        </div>
        <div className="field long">
          <Person color="secondary" className="field-label" />
          <EditField event={localEvent} onEdit={onEdit} fieldKey="leaderId" required select>
            {possibleLeaders.map(leader => (
              <MenuItem value={leader.id} key={leader.id}>
                {leader.name}
              </MenuItem>
            ))}
          </EditField>
        </div>
        <div className="field buttons">
          {modified ? (
            <>
              <Tooltip title="Apply Changes">
                <Button
                  variant="contained"
                  color="primary"
                  size="small"
                  className="save"
                  onClick={create ? onCreate : onUpdate}
                >
                  Save
                </Button>
              </Tooltip>
              <Tooltip title="Reset Changes">
                <IconButton size="small" onClick={onReset}>
                  <Refresh />
                </IconButton>
              </Tooltip>
            </>
          ) : null}
          {create ? null : (
            <Tooltip title="Delete Event">
              <IconButton color="error" size="small" onClick={onDelete}>
                <DeleteForever />
              </IconButton>
            </Tooltip>
          )}
        </div>
      </form>
    </Card>
  );
};

interface EditFieldProps {
  event: EventCreateDTO;
  onEdit: (key: string, value: string) => void;
  fieldKey: keyof EventCreateDTO;
  children?: React.ReactNode;
  select?: boolean;
  type?: string;
  required?: boolean;
}

const EditField = ({ event, onEdit, fieldKey, children, required, ...props }: EditFieldProps) => {
  const theme = useTheme<Theme>();
  return (
    <TextField
      variant="outlined"
      size="small"
      className="entry-input"
      value={event[fieldKey]}
      onChange={e => {
        onEdit(fieldKey, e.target.value);
      }}
      style={{ colorScheme: theme.palette.mode }}
      fullWidth
      required={required}
      {...props}
    >
      {children}
    </TextField>
  );
};

export default EventEntry;
