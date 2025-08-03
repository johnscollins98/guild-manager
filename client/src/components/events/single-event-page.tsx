import { Box, Table, TableCell, TableRow } from '@mui/material';
import { useParams } from 'react-router-dom';
import { useDiscordMembers } from '../../lib/apis/discord-api';
import { useEventById } from '../../lib/apis/event-api';
import NotFound from '../not-found';

export const SingleEventPage = () => {
  const { eventId } = useParams();

  if (!eventId) {
    return <NotFound />;
  }

  const eventIdNum = parseInt(eventId!);

  if (isNaN(eventIdNum)) {
    return <NotFound />;
  }

  return <Content eventId={eventIdNum} />;
};

const Content = ({ eventId }: { eventId: number }) => {
  const event = useEventById(eventId);
  const discordMembers = useDiscordMembers();

  if (!event.data) {
    return <NotFound />;
  }

  const leader = discordMembers.data.find(m => m.id === event.data?.leaderId);

  return (
    <Box>
      <h2>{event.data.title}</h2>

      <Table>
        <TableRow>
          <TableCell>
            <b>Day</b>
          </TableCell>
          <TableCell>{event.data.day}</TableCell>
        </TableRow>
        <TableRow>
          <TableCell>
            <b>Start Time</b>
          </TableCell>
          <TableCell>{event.data.startTime}</TableCell>
        </TableRow>
        <TableRow>
          <TableCell>
            <b>Duration</b>
          </TableCell>
          <TableCell>{event.data.duration}</TableCell>
        </TableRow>
        <TableRow>
          <TableCell>
            <b>Leader</b>
          </TableCell>
          <TableCell>{leader?.name ?? 'Unknown'}</TableCell>
        </TableRow>
        <TableRow>
          <TableCell>
            <b>Ignored</b>
          </TableCell>
          <TableCell>{event.data.ignore ? 'Yes' : 'No'}</TableCell>
        </TableRow>
      </Table>
    </Box>
  );
};
