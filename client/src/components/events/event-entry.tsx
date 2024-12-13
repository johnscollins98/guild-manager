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
import { type ComponentProps, useCallback, useEffect, useMemo, useState } from 'react';
import { daysOfWeek, type DiscordMemberDTO, type EventCreateDTO } from 'server';
import { useToast } from '../common/toast/toast-context';
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
    (field: keyof EventCreateDTO, value: string) => {
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
        if (err instanceof Error) {
          openToast(err.message, 'warning');
        } else {
          openToast('An unknown error occurred', 'error');
        }
        return;
      }

      onSubmit(localEvent);

      if (resetOnSubmit) {
        onReset();
      }
    },
    [onSubmit, validationHelper, localEvent, openToast, onReset, resetOnSubmit]
  );

  const timezoneString = useMemo(() => {
    return `${new Date().toLocaleDateString(undefined, { day: '2-digit', timeZoneName: 'short' }).substring(4)}, ${new Date().toLocaleDateString(undefined, { day: '2-digit', timeZoneName: 'shortOffset' }).substring(4)}`;
  }, []);

  const localStartTime = useMemo(() => {
    const [hours, minutes] = localEvent.startTime.split(':');

    if (hours && minutes) {
      const date = new Date();
      date.setUTCHours(parseInt(hours));
      date.setUTCMinutes(parseInt(minutes));

      return date.toLocaleTimeString(undefined, { hour: '2-digit', minute: '2-digit' });
    }

    return localEvent.startTime;
  }, [localEvent]);

  const setUtcStartTimeWithLocalTime = useCallback(
    (value: string) => {
      const [hours, minutes] = value.split(':');
      if (hours && minutes) {
        const date = new Date();
        date.setHours(parseInt(hours));
        date.setMinutes(parseInt(minutes));

        onEdit(
          'startTime',
          date.toLocaleTimeString(undefined, {
            timeZone: 'UTC',
            hour: '2-digit',
            minute: '2-digit'
          })
        );
      }
    },
    [onEdit]
  );

  return (
    <Card
      variant="elevation"
      className={`event-entry ${changeOpacityWhenIgnored && localEvent.ignore ? 'ignored' : ''}`}
    >
      <form onSubmit={submitHandler} onReset={onReset} className="event-form">
        <Tooltip placement="top" title="Event name">
          <div className="field long">
            <Assignment color="secondary" className="field-label" />
            <EditField onEdit={v => onEdit('title', v)} value={localEvent.title} required />
          </div>
        </Tooltip>
        <Tooltip placement="top" title="Event day">
          <div className="field">
            <CalendarToday color="secondary" className="field-label" />
            <EditField onEdit={v => onEdit('day', v)} value={localEvent.day} select required>
              {daysOfWeek.map(day => (
                <MenuItem value={day} key={day}>
                  {day}
                </MenuItem>
              ))}
            </EditField>
          </div>
        </Tooltip>
        <Tooltip placement="top" title={`Start time (${timezoneString})`}>
          <div className="field">
            <WatchLater color="secondary" className="field-label" />
            <EditField onEdit={setUtcStartTimeWithLocalTime} value={localStartTime} type="time" />
          </div>
        </Tooltip>
        <Tooltip placement="top" title="Event duration">
          <div className="field">
            <HourglassFull color="secondary" className="field-label" />
            <EditField onEdit={v => onEdit('duration', v)} value={localEvent.duration} />
          </div>
        </Tooltip>
        <Tooltip placement="top" title="Event leader">
          <div className="field long">
            <Person color="secondary" className="field-label" />
            <EditField
              onEdit={v => onEdit('leaderId', v)}
              value={localEvent.leaderId}
              select
              required
            >
              {possibleLeaders.map(leader => (
                <MenuItem value={leader.id} key={leader.id}>
                  {leader.name}
                </MenuItem>
              ))}
            </EditField>
          </div>
        </Tooltip>
        <div className="field short">
          <Tooltip placement="top" title="Ignore in recruiment/discord posts">
            <FormControlLabel
              label="Ignored"
              control={
                <Checkbox
                  checked={localEvent.ignore}
                  onChange={e => setLocalEvent({ ...localEvent, ignore: e.target.checked })}
                />
              }
            />
          </Tooltip>
        </div>
        <div className="field buttons">
          {modified ? (
            <>
              <Tooltip placement="top" title="Apply Changes">
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
              <Tooltip placement="top" title="Reset Changes">
                <IconButton size="small" type="reset">
                  <Refresh />
                </IconButton>
              </Tooltip>
            </>
          ) : null}
          {onDelete && (
            <Tooltip placement="top" title="Delete Event">
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

interface EditFieldProps extends ComponentProps<typeof TextField> {
  onEdit: (value: string) => void;
}

const EditField = ({ onEdit, ...props }: EditFieldProps) => {
  const theme = useTheme<Theme>();
  return (
    <TextField
      variant="outlined"
      size="small"
      className="entry-input"
      onChange={e => {
        onEdit(e.target.value);
      }}
      style={{ colorScheme: theme.palette.mode }}
      fullWidth
      {...props}
    />
  );
};

export default EventEntry;
