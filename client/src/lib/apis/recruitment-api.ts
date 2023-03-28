import axios, { AxiosError } from 'axios';
import { useMutation, useQuery, useQueryClient } from 'react-query';
import { useToast } from '../../Components/Common/ToastContext';
import { RecruitmentPost } from '../interfaces/recruitment-post';

export const useRecruitmentPost = () => useQuery<RecruitmentPost, AxiosError>('recruitment-post');

export const useRecruitmentPostMutation = () => {
  const queryClient = useQueryClient();
  const openToast = useToast();

  return useMutation<RecruitmentPost, AxiosError, RecruitmentPost>({
    mutationFn: post => axios.put('/api/recruitment-post', post),
    onSuccess() {
      queryClient.invalidateQueries(['recruitment-post']);
      openToast('Saved recruitment message', 'success');
    },
    onError() {
      openToast('Failed to save message', 'error');
    }
  });
};
