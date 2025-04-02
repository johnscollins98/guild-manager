import { Avatar, Box, CardActionArea, type PopoverPosition, Typography } from '@mui/material';
import Tooltip from '@mui/material/Tooltip';
import { use, useMemo, useState } from 'react';
import { type EventDTO } from 'server';
import { EventLeadersContext } from './event-leaders-context';
import { EventMenu } from './event-menu';

interface Props {
  event: EventDTO;
  hasEditPermission: boolean;
}

const EventEntry = ({ event, hasEditPermission }: Props) => {
  const [menuAnchor, setMenuAnchor] = useState<undefined | PopoverPosition>(undefined);

  const possibleLeaders = use(EventLeadersContext);

  const localStartTime = useMemo(() => {
    const [hours, minutes] = event.startTime.split(':');

    if (hours && minutes) {
      const date = new Date();
      date.setUTCHours(parseInt(hours));
      date.setUTCMinutes(parseInt(minutes));

      return date.toLocaleTimeString(undefined, { hour: '2-digit', minute: '2-digit' });
    }

    return event.startTime;
  }, [event]);

  const leader = useMemo(() => {
    return possibleLeaders.find(l => event.leaderId === l.id);
  }, [possibleLeaders, event.leaderId]);

  return (
    <>
      <CardActionArea
        sx={{ flexBasis: { xs: '100%', md: 'calc(50% - 4px)' }, flexGrow: 0, borderRadius: '4px' }}
        disabled={!hasEditPermission}
        onClick={e => setMenuAnchor({ top: e.clientY, left: e.clientX })}
      >
        <Box
          sx={t => ({
            opacity: event.ignore ? '0.6' : '1',
            border: { md: `1px solid ${t.palette.divider}` },
            borderBottom: `1px solid ${t.palette.divider}`,
            borderRadius: { md: '4px' }
          })}
          display="flex"
          justifyContent="space-between"
          alignItems="center"
          padding="8px 16px"
          gap={2}
        >
          <Box display="flex" flexDirection="column">
            <Typography sx={{ fontSize: '1.1rem' }}>{event.title}</Typography>
            <Typography variant="caption">
              {event.day} {localStartTime && `at ${localStartTime}`}{' '}
              {event.duration && `for ${event.duration}`}
            </Typography>
          </Box>
          <Box display="flex" gap={1} alignItems="center">
            <Tooltip title={leader?.name}>
              <Avatar alt={leader?.id} src={leader?.avatar} sx={{ width: '32px', height: '32px' }}>
                {leader?.name}
              </Avatar>
            </Tooltip>
          </Box>
        </Box>
      </CardActionArea>
      <EventMenu event={event} anchorEl={menuAnchor} setAnchorEl={setMenuAnchor} />
    </>
  );
};

export default EventEntry;
