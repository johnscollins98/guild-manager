import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { type AxiosError } from 'axios';
import { type AssociationDTO, type IGW2Controller } from 'server';
import { type GW2MemberResponseDTO } from 'server/src/dtos/gw2/gw2-member-response-dto';
import { useToast } from '../../components/common/toast/toast-context';
import { createApi } from './axios-wrapper';

const api = createApi('/api/gw2');

const gw2Api: IGW2Controller = {
  getLog: () => api('log'),
  getMembers: () => api('members'),
  getRanks: () => api('ranks'),
  removeAssociation: id => api(`association/${id}`, { method: 'DELETE' }),
  associateToDiscordAccount: (associationDto: AssociationDTO) => {
    return api('association', {
      method: 'POST',
      data: associationDto
    });
  }
};

export const useGW2Members = () =>
  useQuery({ queryKey: ['gw2/members'], queryFn: gw2Api.getMembers });
export const useGW2Log = () => useQuery({ queryKey: ['gw2/log'], queryFn: gw2Api.getLog });
export const useGW2Ranks = () => useQuery({ queryKey: ['gw2/ranks'], queryFn: gw2Api.getRanks });

export const useAssociateToDiscordAccountMutation = () => {
  const queryClient = useQueryClient();
  const openToast = useToast();

  return useMutation<void, AxiosError, AssociationDTO, GW2MemberResponseDTO[]>({
    mutationFn: gw2Api.associateToDiscordAccount,
    onMutate: async dto => {
      await queryClient.cancelQueries({ queryKey: ['gw2/members'] });

      const previousMembers = queryClient.getQueryData<GW2MemberResponseDTO[]>(['gw2/members']);

      queryClient.setQueryData<GW2MemberResponseDTO[]>(
        ['gw2/members'],
        old =>
          old?.map(member => {
            if (member.name !== dto.gw2AccountName) return member;

            return { ...member, discordId: dto.discordAccountId };
          }) ?? []
      );

      return previousMembers;
    },
    onError(_err, _var, previous) {
      openToast('Failed to associate member', 'error');
      queryClient.setQueryData(['gw2/members'], previous);
    },
    onSettled() {
      queryClient.invalidateQueries({ queryKey: ['gw2/members'] });
    }
  });
};

export const useRemoveAssociation = () => {
  const queryClient = useQueryClient();
  const openToast = useToast();

  return useMutation<void, AxiosError, string, GW2MemberResponseDTO[]>({
    mutationFn: gw2Api.removeAssociation,
    onMutate: async id => {
      await queryClient.cancelQueries({ queryKey: ['gw2/members'] });

      const previousMembers = queryClient.getQueryData<GW2MemberResponseDTO[]>(['gw2/members']);

      queryClient.setQueryData<GW2MemberResponseDTO[]>(['gw2/members'], old =>
        old?.map(member => {
          if (member.name !== id) return member;
          return { ...member, discordId: null };
        })
      );
      return previousMembers;
    },
    onError(_err, _var, previous) {
      openToast('Failed to remove association', 'error');
      queryClient.setQueryData(['gw2/members'], previous);
    },
    onSettled() {
      queryClient.invalidateQueries({ queryKey: ['gw2/members'] });
    }
  });
};

export const usePrefetchGW2Log = (isAuthenticated: boolean) => {
  const queryClient = useQueryClient();

  if (isAuthenticated) {
    queryClient.prefetchQuery({ queryKey: ['gw2/log'], queryFn: gw2Api.getLog });
  }
};
