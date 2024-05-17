import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { type AxiosError } from 'axios';
import {
  type IRecruitmentPostController,
  type RecruitmentPostCreateDTO,
  type RecruitmentPostDTO
} from 'server';
import { useToast } from '../../components/common/toast-context';
import { createApi } from './axios-wrapper';

const api = createApi('/api/recruitment-post');

export const recruitmentApi: IRecruitmentPostController = {
  get: () => api(''),
  getGeneratedPost: isHtml => api('generate', { params: { html: isHtml } }),
  upsert: (data: RecruitmentPostCreateDTO) => api('', { method: 'PUT', data }),
  delete: () => api('', { method: 'DELETE' })
};

export const useRecruitmentPost = () =>
  useQuery({ queryKey: ['recruitment-post'], queryFn: recruitmentApi.get, retry: false });

export const useRecruitmentPostMutation = () => {
  const queryClient = useQueryClient();
  const openToast = useToast();

  return useMutation<RecruitmentPostDTO, AxiosError, RecruitmentPostCreateDTO>({
    mutationFn: post => recruitmentApi.upsert(post),
    onSuccess() {
      queryClient.invalidateQueries({ queryKey: ['recruitment-post'] });
      openToast('Saved recruitment message', 'success');
    },
    onError() {
      openToast('Failed to save message', 'error');
    }
  });
};
