import {
  Box,
  Button,
  Checkbox,
  Dialog,
  DialogContent,
  DialogTitle,
  FormControlLabel,
  MenuItem,
  TextField
} from '@mui/material';
import { type ComponentProps, type KeyboardEvent, useCallback, useMemo, useState } from 'react';
import { daysOfWeek, type EventCreateDTO } from 'server';
import { QueryBoundary } from '../common/query-boundary';
import { useEventLeaders } from './event-leaders-context';

export interface EventFormProps {
  onSubmit: (e: EventCreateDTO) => void;
  initialData?: EventCreateDTO;
  isOpen: boolean;
  onClose: () => void;
}

export const EventFormDialog = (props: EventFormProps) => {
  const { isOpen, onClose, initialData } = props;

  const stopTabPropagation = useCallback((e: KeyboardEvent<HTMLDivElement>) => {
    if (e.key === 'Tab') e.stopPropagation();
  }, []);

  return (
    <Dialog open={isOpen} onClose={onClose} fullWidth maxWidth="sm" onKeyDown={stopTabPropagation}>
      <DialogTitle>{initialData ? 'Edit' : 'Create'} Event</DialogTitle>
      <DialogContent>
        <QueryBoundary>
          <EventForm {...props} />
        </QueryBoundary>
      </DialogContent>
    </Dialog>
  );
};

const emptyEvent: EventCreateDTO = {
  title: '',
  day: 'Monday',
  startTime: '',
  duration: '',
  leaderId: '',
  ignore: false
};

export const EventForm = ({ onSubmit, initialData, onClose }: EventFormProps) => {
  const [event, setEvent] = useState(initialData ?? emptyEvent);

  const possibleLeaders = useEventLeaders();

  const onEdit = useCallback(
    (field: keyof EventCreateDTO, value: string) => {
      setEvent({ ...event, [field]: value });
    },
    [event, setEvent]
  );

  const submitHandler = useCallback(
    (e: React.FormEvent<HTMLFormElement>) => {
      e.preventDefault();
      e.stopPropagation();

      onSubmit(event);

      onClose();
    },
    [onSubmit, event, onClose]
  );

  const timezoneString = useMemo(() => {
    return `${new Date().toLocaleDateString(undefined, { day: '2-digit', timeZoneName: 'short' }).substring(4)}, ${new Date().toLocaleDateString(undefined, { day: '2-digit', timeZoneName: 'shortOffset' }).substring(4)}`;
  }, []);

  const localStartTime = useMemo(() => {
    const [hours, minutes] = event.startTime.split(':');

    if (hours && minutes) {
      const date = new Date();
      date.setUTCHours(parseInt(hours));
      date.setUTCMinutes(parseInt(minutes));

      return date.toLocaleTimeString(undefined, {
        hour: '2-digit',
        minute: '2-digit',
        hour12: false
      });
    }

    return event.startTime;
  }, [event]);

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
            minute: '2-digit',
            hour12: false
          })
        );
      }
    },
    [onEdit]
  );

  return (
    <form onSubmit={submitHandler} onReset={onClose}>
      <Box display="flex" flexDirection="column" gap="16px">
        <EditField label="Title " onEdit={v => onEdit('title', v)} value={event.title} required />
        <EditField label="Day" onEdit={v => onEdit('day', v)} value={event.day} select required>
          {daysOfWeek.map(day => (
            <MenuItem value={day} key={day}>
              {day}
            </MenuItem>
          ))}
        </EditField>
        <EditField
          label={`Start Time (${timezoneString})`}
          onEdit={setUtcStartTimeWithLocalTime}
          value={localStartTime}
          slotProps={{ inputLabel: { shrink: true } }}
          hiddenLabel
          type="time"
        />
        <EditField label="Duration" onEdit={v => onEdit('duration', v)} value={event.duration} />
        <EditField
          label="Leader"
          onEdit={v => onEdit('leaderId', v)}
          value={event.leaderId}
          select
          required
        >
          {possibleLeaders.map(leader => (
            <MenuItem value={leader.id} key={leader.id}>
              {leader.name}
            </MenuItem>
          ))}
        </EditField>
        <FormControlLabel
          label="Ignored"
          control={
            <Checkbox
              checked={event.ignore}
              onChange={e => setEvent({ ...event, ignore: e.target.checked })}
            />
          }
        />
        <Box display="flex" justifyContent="flex-end" gap="8px">
          <Button variant="text" type="reset">
            Cancel
          </Button>
          <Button variant="contained" type="submit">
            Save
          </Button>
        </Box>
      </Box>
    </form>
  );
};

interface EditFieldProps extends ComponentProps<typeof TextField> {
  onEdit: (value: string) => void;
}

const EditField = ({ onEdit, ...props }: EditFieldProps) => {
  return (
    <TextField
      variant="outlined"
      size="small"
      onChange={e => {
        onEdit(e.target.value);
      }}
      fullWidth
      {...props}
    />
  );
};
