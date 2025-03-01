import DeleteForeverIcon from '@mui/icons-material/DeleteForever';
import EditIcon from '@mui/icons-material/Edit';
import { ListItemIcon, ListItemText, Menu, MenuItem, type PopoverPosition } from '@mui/material';
import { useCallback, useState } from 'react';
import { type EventCreateDTO, type EventDTO } from 'server';
import { useDeleteEventMutation, useUpdateEventMutation } from '../../lib/apis/event-api';
import { useConfirm } from '../common/confirm-dialog';
import { EventFormDialog } from './event-form';

export interface EventMenuProps {
  event: EventDTO;
  anchorEl: PopoverPosition | undefined;
  setAnchorEl: (el: PopoverPosition | undefined) => void;
}

export const EventMenu = ({ event, anchorEl, setAnchorEl }: EventMenuProps) => {
  const closeHandler = useCallback(() => {
    setAnchorEl(undefined);
  }, [setAnchorEl]);

  return (
    <Menu
      open={!!anchorEl}
      anchorReference="anchorPosition"
      anchorPosition={anchorEl}
      onClose={closeHandler}
    >
      <EventMenuContent event={event} onClose={closeHandler} />
    </Menu>
  );
};

interface EventMenuContentProps {
  event: EventDTO;
  onClose: () => void;
}

const EventMenuContent = ({ onClose, event }: EventMenuContentProps) => {
  const confirm = useConfirm();
  const deleteMutation = useDeleteEventMutation();

  const [editOpen, setEditOpen] = useState(false);
  const editMutation = useUpdateEventMutation();

  const deleteHandler = useCallback(async () => {
    const res = await confirm('Are you sure you want to delete this event?');
    if (res) {
      await deleteMutation.mutateAsync(event.id);
    }
    onClose();
  }, [event.id, onClose, deleteMutation, confirm]);

  const editHandler = useCallback(
    async (updatedEvent: EventCreateDTO) => {
      await editMutation.mutateAsync({ event: updatedEvent, id: event.id });
      onClose();
    },
    [editMutation, event.id, onClose]
  );

  return (
    <>
      <MenuItem onClick={() => setEditOpen(true)}>
        <ListItemIcon>
          <EditIcon />
        </ListItemIcon>
        <ListItemText>Edit</ListItemText>
      </MenuItem>
      <MenuItem onClick={deleteHandler} sx={t => ({ color: t.palette.error.main })}>
        <ListItemIcon>
          <DeleteForeverIcon color="error" />
        </ListItemIcon>
        <ListItemText>Delete</ListItemText>
      </MenuItem>
      <EventFormDialog
        isOpen={editOpen}
        onClose={() => {
          setEditOpen(false);
          onClose();
        }}
        initialData={event}
        onSubmit={editHandler}
      />
    </>
  );
};
