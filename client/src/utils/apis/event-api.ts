import axios, { AxiosError } from 'axios';
import { useMutation, useQuery, useQueryClient } from 'react-query';
import { useToast } from '../../Components/Common/ToastContext';
import Event from '../../Interfaces/Event';
import EventSettings from '../../Interfaces/EventSettings';

export const useEvents = () => useQuery<Event[], AxiosError>('events');
export const useEventSettings = () => useQuery<EventSettings, AxiosError>('events/settings');

export const useCreateEventMutation = () => {
  const queryClient = useQueryClient();
  const openToast = useToast();

  return useMutation<Event, AxiosError, Event>({
    mutationFn(event) {
      return axios.post('/api/events', event);
    },
    onSuccess() {
      openToast('Created event.', 'success');
      queryClient.invalidateQueries('events');
    },
    onError() {
      openToast('Failed to create event.', 'error');
    }
  });
};

export const useDeleteEventMutation = () => {
  const queryClient = useQueryClient();
  const openToast = useToast();

  return useMutation<void, AxiosError, string>({
    mutationFn(id) {
      return axios.delete(`/api/events/${id}`);
    },
    onSuccess() {
      openToast('Deleted event.', 'success');
      queryClient.invalidateQueries('events');
    },
    onError() {
      openToast('Failed to delete event.', 'error');
    }
  });
};

export const useUpdateEventMutation = () => {
  const queryClient = useQueryClient();
  const openToast = useToast();

  return useMutation<Event, AxiosError, { id: string; event: Event }>({
    mutationFn({ id, event }) {
      return axios.put(`/api/events/${id}`, event);
    },
    onSuccess() {
      openToast('Updated event.', 'success');
      queryClient.invalidateQueries('events');
    },
    onError() {
      openToast('Failed to update event.', 'error');
    }
  });
};
