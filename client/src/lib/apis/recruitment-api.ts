import { useMutation, useQueryClient, useSuspenseQuery } from '@tanstack/react-query';
import { type AxiosError } from 'axios';
import {
  type IRecruitmentPostController,
  type RecruitmentPostCreateDTO,
  type RecruitmentPostDTO
} from 'server';
import { useToast } from '../../components/common/toast/toast-context';
import { createApi } from './axios-wrapper';

const api = createApi('/api/recruitment-post');

export const recruitmentApi: IRecruitmentPostController = {
  get: () => api('', { validateStatus: s => s === 200 || s === 404 }),
  getGeneratedPost: isHtml => api('generate', { params: { html: isHtml } }),
  upsert: (data: RecruitmentPostCreateDTO) => api('', { method: 'PUT', data }),
  delete: () => api('', { method: 'DELETE' })
};

export const recruitmentQuery = {
  queryKey: ['recruitment-post'],
  queryFn: recruitmentApi.get,
  retry: false
};
export const useRecruitmentPost = () => useSuspenseQuery(recruitmentQuery);

export const useRecruitmentPostMutation = () => {
  const queryClient = useQueryClient();
  const openToast = useToast();

  return useMutation<RecruitmentPostDTO, AxiosError, RecruitmentPostCreateDTO>({
    mutationFn: post => recruitmentApi.upsert(post),
    onSuccess() {
      queryClient.invalidateQueries({ queryKey: recruitmentQuery.queryKey });
      openToast('Saved recruitment message', 'success');
    },
    onError() {
      openToast('Failed to save message', 'error');
    }
  });
};
