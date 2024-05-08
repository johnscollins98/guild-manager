import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import axios, { AxiosError } from 'axios';
import { useToast } from '../../components/common/toast-context';
import Event from '../interfaces/event';
import { EventSettings } from '../interfaces/event-settings';

export const useEvents = () => useQuery<Event[], AxiosError>({ queryKey: ['events'] });
export const useEventSettings = () =>
  useQuery<EventSettings, AxiosError>({ queryKey: ['events/settings'] });

export const useCreateEventMutation = () => {
  const queryClient = useQueryClient();
  const openToast = useToast();

  return useMutation<Event, AxiosError, Event>({
    mutationFn(event) {
      return axios.post('/api/events', event);
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
      return axios.delete(`/api/events/${id}`);
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

  return useMutation<Event, AxiosError, { id: number; event: Event }>({
    mutationFn({ id, event }) {
      return axios.put(`/api/events/${id}`, event);
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
