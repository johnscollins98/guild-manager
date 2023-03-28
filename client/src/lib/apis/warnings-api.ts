import axios, { AxiosError } from 'axios';
import { useMutation, useQuery, useQueryClient } from 'react-query';
import { useToast } from '../../components/Common/ToastContext';
import Warning, { WarningPost } from '../interfaces/warning';

export const useWarnings = () => useQuery<Warning[], AxiosError>('warnings');
export const useMemberWarnings = (memberId: string) =>
  useQuery<Warning[], AxiosError>(['warnings', memberId], async () => {
    const response = await axios.get<Warning[]>(`/api/warnings/${memberId}`);
    return response.data;
  });

export const useAddWarningMutation = () => {
  const queryClient = useQueryClient();
  const openToast = useToast();

  return useMutation<Warning, AxiosError, WarningPost>({
    mutationFn(warning) {
      return axios.post(`/api/warnings`, warning);
    },
    onSuccess() {
      openToast('Successfully added warning', 'success');
      queryClient.invalidateQueries(['warnings']);
    },
    onError() {
      openToast('Failed to add warning', 'error');
    }
  });
};

export const useDeleteWarningMutation = () => {
  const queryClient = useQueryClient();
  const openToast = useToast();

  return useMutation<Warning, AxiosError, string>({
    mutationFn(warningId) {
      return axios.delete(`/api/warnings/${warningId}`);
    },
    onSuccess() {
      openToast('Successfully deleted warning', 'success');
      queryClient.invalidateQueries(['warnings']);
    },
    onError() {
      openToast('Failed to delete warning', 'error');
    }
  });
};
