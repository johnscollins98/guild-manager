import { queryOptions, useMutation, useQueryClient, useSuspenseQuery } from '@tanstack/react-query';
import { type AxiosError } from 'axios';
import { type EventCreateDTO, type EventDTO, type IEventsController } from 'server';
import { useToast } from '../../components/common/toast/toast-context';
import { createApi } from './axios-wrapper';

const api = createApi('/api/events');

export const eventsApi: IEventsController = {
  getGuildSettings: () => api('settings'),
  getAll: () => api(''),
  get: id => api(`${id}`, { validateStatus: s => s === 200 || s === 404 }),
  getEventsOnADay: day => api(`day/${day}`),
  delete: id => api(`${id}`, { method: 'DELETE' }),
  create: data => api('', { method: 'POST', data }),
  update: (id, data) => api(`${id}`, { method: 'PUT', data })
};

export const eventQuery = { queryKey: ['events'], queryFn: eventsApi.getAll };
export const useEvents = () => useSuspenseQuery(eventQuery);

export const eventSettingsQuery = {
  queryKey: ['events/settings'],
  queryFn: eventsApi.getGuildSettings
};
export const useEventSettings = () => useSuspenseQuery(eventSettingsQuery);

export const eventByIdQuery = (id: number) =>
  queryOptions({
    queryKey: ['events', id],
    queryFn: () => eventsApi.get(id)
  });

export const useEventById = (id: number) => useSuspenseQuery(eventByIdQuery(id));

export const useCreateEventMutation = () => {
  const queryClient = useQueryClient();
  const openToast = useToast();

  return useMutation<EventDTO, AxiosError, EventCreateDTO>({
    mutationFn(event) {
      return eventsApi.create(event);
    },
    onSuccess() {
      openToast('Created event.', 'success');
      queryClient.invalidateQueries({ queryKey: eventQuery.queryKey });
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
      queryClient.invalidateQueries({ queryKey: eventQuery.queryKey });
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
      queryClient.invalidateQueries({ queryKey: eventQuery.queryKey });
    },
    onError() {
      openToast('Failed to update event.', 'error');
    }
  });
};
