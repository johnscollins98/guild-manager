import { Button, Dialog, DialogContent, DialogTitle } from '@mui/material';
import { Box } from '@mui/system';
import { useQuery } from '@tanstack/react-query';
import { useState } from 'react';
import { type EventCreateDTO } from 'server';
import DiscordSvg from '../../assets/images/discord.svg?react';
import { authQuery } from '../../lib/apis/auth-api';
import { useCreateEventMutation } from '../../lib/apis/event-api';
import { QueryBoundary } from '../common/query-boundary';
import { EventFormDialog } from './event-form';
import EventPosterForm from './event-poster-form';

export const EventActions = () => {
  const auth = useQuery(authQuery);
  const createEventMutation = useCreateEventMutation();

  const [showPostModal, setShowPostModal] = useState(false);
  const [showCreateModal, setShowCreateModal] = useState(false);

  const createEvent = async (eventToCreate: EventCreateDTO) => {
    await createEventMutation.mutateAsync(eventToCreate);
  };

  return (
    <>
      <Box display="flex" justifyContent="space-between" alignItems="center">
        <h2>Events</h2>
        <Box display="flex" gap="8px" alignItems="center">
          <Button variant="contained" color="secondary" onClick={() => setShowCreateModal(true)}>
            Create Event
          </Button>
          <Button
            onClick={() => setShowPostModal(true)}
            variant="contained"
            className="discord-button"
            startIcon={<DiscordSvg width={22} />}
            disabled={!auth?.data?.permissions.EVENTS}
          >
            Post Events
          </Button>
        </Box>
      </Box>
      <EventFormDialog
        onSubmit={createEvent}
        isOpen={showCreateModal}
        onClose={() => setShowCreateModal(false)}
      />
      <Dialog open={showPostModal} onClose={() => setShowPostModal(false)} fullWidth maxWidth="sm">
        <DialogTitle>Post to Discord</DialogTitle>
        <DialogContent>
          <QueryBoundary>
            <EventPosterForm onClose={() => setShowPostModal(false)} />
          </QueryBoundary>
        </DialogContent>
      </Dialog>
    </>
  );
};
