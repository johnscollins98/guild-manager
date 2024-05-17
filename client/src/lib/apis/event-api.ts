import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { type AxiosError } from 'axios';
import { type EventCreateDTO, type EventDTO, type IEventsController } from 'server';
import { useToast } from '../../components/common/toast-context';
import { createApi } from './axios-wrapper';

const api = createApi('/api/events');

const eventsApi: IEventsController = {
  getGuildSettings: () => api('settings'),
  getAll: () => api(''),
  get: id => api(`${id}`),
  getEventsOnADay: day => api(`day/${day}`),
  delete: id => api(`${id}`, { method: 'DELETE' }),
  create: data => api('', { method: 'POST', data }),
  update: (id, data) => api(`${id}`, { method: 'PUT', data })
};

export const useEvents = () => useQuery({ queryKey: ['events'], queryFn: eventsApi.getAll });
export const useEventSettings = () =>
  useQuery({ queryKey: ['events/settings'], queryFn: eventsApi.getGuildSettings });

export const useCreateEventMutation = () => {
  const queryClient = useQueryClient();
  const openToast = useToast();

  return useMutation<EventDTO, AxiosError, EventCreateDTO>({
    mutationFn(event) {
      return eventsApi.create(event);
    },
    onSuccess() {
      openToast('Created event.', 'success');
      queryClient.invalidateQueries({ queryKey: ['events'] });
    },
    onError() {
      openToast('Failed to create event.', 'error');
    }
  });
};

export const useDeleteEventMutation = () => {
  const queryClient = useQueryClient();
  const openToast = useToast();

  return useMutation<void, AxiosError, number>({
    mutationFn(id) {
      return eventsApi.delete(id);
    },
    onSuccess() {
      openToast('Deleted event.', 'success');
      queryClient.invalidateQueries({ queryKey: ['events'] });
    },
    onError() {
      openToast('Failed to delete event.', 'error');
    }
  });
};

export const useUpdateEventMutation = () => {
  const queryClient = useQueryClient();
  const openToast = useToast();

  return useMutation<EventDTO | null, AxiosError, { id: number; event: EventCreateDTO }>({
    mutationFn({ id, event }) {
      return eventsApi.update(id, event);
    },
    onSuccess() {
      openToast('Updated event.', 'success');
      queryClient.invalidateQueries({ queryKey: ['events'] });
    },
    onError() {
      openToast('Failed to update event.', 'error');
    }
  });
};
