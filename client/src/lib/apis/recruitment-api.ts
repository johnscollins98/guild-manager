import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import axios, { AxiosError } from 'axios';
import { useToast } from '../../components/common/toast-context';
import { RecruitmentPost } from '../interfaces/recruitment-post';

export const useRecruitmentPost = () =>
  useQuery<RecruitmentPost, AxiosError>({ queryKey: ['recruitment-post'] });

export const useRecruitmentPostMutation = () => {
  const queryClient = useQueryClient();
  const openToast = useToast();

  return useMutation<RecruitmentPost, AxiosError, RecruitmentPost>({
    mutationFn: post => axios.put('/api/recruitment-post', post),
    onSuccess() {
      queryClient.invalidateQueries({ queryKey: ['recruitment-post'] });
      openToast('Saved recruitment message', 'success');
    },
    onError() {
      openToast('Failed to save message', 'error');
    }
  });
};
