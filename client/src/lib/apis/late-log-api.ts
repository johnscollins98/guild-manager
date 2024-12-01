import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { type AxiosError } from 'axios';
import { type ILateLogController, type LateLogCreateDto, type LateLogDto } from 'server';
import { useToast } from '../../components/common/toast/toast-context';
import { createApi } from './axios-wrapper';

const api = createApi('api/late-log');

const lateLogApi: ILateLogController = {
  getAll: () => api(''),
  create: data => api('', { method: 'POST', data }),
  delete: (id: number) => api(`${id}`, { method: 'DELETE' })
};

export const useLateLog = () => useQuery({ queryKey: ['late-log'], queryFn: lateLogApi.getAll });

export const useAddLateLogMutation = () => {
  const queryClient = useQueryClient();
  const openToast = useToast();

  return useMutation<LateLogDto, AxiosError, LateLogCreateDto>({
    mutationFn(createDto) {
      return lateLogApi.create(createDto);
    },
    onSuccess() {
      openToast('Successfully added late log entry', 'success');
      queryClient.invalidateQueries({ queryKey: ['late-log'] });
    },
    onError() {
      openToast('Failed to add late log entry', 'error');
    }
  });
};

export const useDeleteLateLogMutation = () => {
  const queryClient = useQueryClient();
  const openToast = useToast();

  return useMutation<void, AxiosError, number>({
    mutationFn(id) {
      return lateLogApi.delete(id);
    },
    onSuccess() {
      openToast('Successfully deleted late log entry', 'success');
      queryClient.invalidateQueries({ queryKey: ['late-log'] });
    },
    onError() {
      openToast('Failed to delete entry', 'error');
    }
  });
};
