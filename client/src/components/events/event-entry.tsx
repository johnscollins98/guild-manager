import Assignment from '@mui/icons-material/Assignment';
import CalendarToday from '@mui/icons-material/CalendarToday';
import DeleteForever from '@mui/icons-material/DeleteForever';
import HourglassFull from '@mui/icons-material/HourglassFull';
import Person from '@mui/icons-material/Person';
import Refresh from '@mui/icons-material/Refresh';
import WatchLater from '@mui/icons-material/WatchLater';
import Button from '@mui/material/Button';
import Card from '@mui/material/Card';
import Checkbox from '@mui/material/Checkbox';
import FormControlLabel from '@mui/material/FormControlLabel';
import IconButton from '@mui/material/IconButton';
import MenuItem from '@mui/material/MenuItem';
import TextField from '@mui/material/TextField';
import Tooltip from '@mui/material/Tooltip';
import { useTheme } from '@mui/material/styles';
import { type Theme } from '@mui/material/styles/createTheme';
import type React from 'react';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { daysOfWeek, type DiscordMemberDTO, type EventCreateDTO } from 'server';
import { useToast } from '../common/toast-context';
import './event-entry.scss';

const emptyEvent: EventCreateDTO = {
  title: '',
  day: 'Monday',
  startTime: '',
  duration: '',
  leaderId: '',
  ignore: false
};

interface Props {
  initialData?: EventCreateDTO;
  possibleLeaders: DiscordMemberDTO[];
  onDelete?: () => Promise<void>;
  onSubmit: (e: EventCreateDTO) => Promise<void>;
  resetOnSubmit?: boolean;
  changeOpacityWhenIgnored?: boolean;
}

const EventEntry = ({
  initialData = emptyEvent,
  possibleLeaders,
  onSubmit,
  onDelete,
  resetOnSubmit,
  changeOpacityWhenIgnored = false
}: Props) => {
  const [localEvent, setLocalEvent] = useState(initialData);
  const modified = useMemo(() => localEvent !== initialData, [localEvent, initialData]);
  const openToast = useToast();

  useEffect(() => {
    setLocalEvent(initialData);
  }, [initialData]);

  const validationHelper = useCallback((event: EventCreateDTO) => {
    if (!event.title) throw new Error('A title must be provided');
    if (!event.leaderId) throw new Error('A leader must be selected');
    if (!daysOfWeek.includes(event.day))
      throw new Error("Day field must be a capitalised day of the week. e.g. 'Monday'");
  }, []);

  const onEdit = useCallback(
    (field: string, value: string) => {
      setLocalEvent({ ...localEvent, [field]: value });
    },
    [localEvent, setLocalEvent]
  );

  const onReset = useCallback(() => {
    setLocalEvent(initialData);
  }, [setLocalEvent, initialData]);

  const submitHandler = useCallback(
    (e: React.FormEvent<HTMLFormElement>) => {
      e.preventDefault();
      e.stopPropagation();

      try {
        validationHelper(localEvent);
      } catch (err) {
        err instanceof Error && openToast(err.message, 'warning');
        return;
      }

      onSubmit(localEvent);

      if (resetOnSubmit) {
        onReset();
      }
    },
    [onSubmit, validationHelper, localEvent, openToast, onReset, resetOnSubmit]
  );

  return (
    <Card
      variant="elevation"
      className={`event-entry ${changeOpacityWhenIgnored && localEvent.ignore ? 'ignored' : ''}`}
    >
      <form onSubmit={submitHandler} onReset={onReset} className="event-form">
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
        <div className="field short">
          <FormControlLabel
            label="Ignored"
            control={
              <Checkbox
                checked={localEvent.ignore}
                onChange={e => setLocalEvent({ ...localEvent, ignore: e.target.checked })}
              />
            }
          />
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
                  type="submit"
                >
                  Save
                </Button>
              </Tooltip>
              <Tooltip title="Reset Changes">
                <IconButton size="small" type="reset">
                  <Refresh />
                </IconButton>
              </Tooltip>
            </>
          ) : null}
          {onDelete && (
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
