import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { type AxiosError } from 'axios';
import { type IWarningsController, type WarningCreateDTO, type WarningDTO } from 'server';
import { useToast } from '../../components/common/toast/toast-context';
import { createApi } from './axios-wrapper';

const api = createApi('/api/warnings');

const warningsApi: IWarningsController = {
  getAll: () => api(''),
  get: (id: number) => api(`${id}`),
  getForMember: (id: string) => api(`member/${id}`),
  delete: (id: number) => api(`${id}`, { method: 'DELETE' }),
  create: (data: WarningCreateDTO) => api('', { method: 'POST', data }),
  update: (id: number, data: WarningCreateDTO) => api(`${id}`, { method: 'PUT', data })
};

export const useWarnings = () => useQuery({ queryKey: ['warnings'], queryFn: warningsApi.getAll });
export const useMemberWarnings = (memberId: string) =>
  useQuery({
    queryKey: ['warnings', memberId],
    queryFn: () => warningsApi.getForMember(memberId)
  });

export const useAddWarningMutation = () => {
  const queryClient = useQueryClient();
  const openToast = useToast();

  return useMutation<WarningDTO, AxiosError, WarningCreateDTO>({
    mutationFn(warning) {
      return warningsApi.create(warning);
    },
    onSuccess() {
      openToast('Successfully added warning', 'success');
      queryClient.invalidateQueries({ queryKey: ['warnings'] });
    },
    onError() {
      openToast('Failed to add warning', 'error');
    }
  });
};

export const useDeleteWarningMutation = () => {
  const queryClient = useQueryClient();
  const openToast = useToast();

  return useMutation<void, AxiosError, number>({
    mutationFn(warningId) {
      return warningsApi.delete(warningId);
    },
    onSuccess() {
      openToast('Successfully deleted warning', 'success');
      queryClient.invalidateQueries({ queryKey: ['warnings'] });
    },
    onError() {
      openToast('Failed to delete warning', 'error');
    }
  });
};
