import axios, { AxiosError } from 'axios';
import { useMutation, useQuery, useQueryClient } from 'react-query';
import { useToast } from '../../components/common/toast-context';
import { config } from '../config';
import { DiscordLog } from '../interfaces/discord-log';
import DiscordMember from '../interfaces/discord-member';
import DiscordRole from '../interfaces/discord-role';
import EventSettings from '../interfaces/event-settings';

export const useDiscordMembers = () => useQuery<DiscordMember[], AxiosError>('discord/members');
export const useDiscordRoles = () => useQuery<DiscordRole[], AxiosError>('discord/roles');
export const useDiscordLog = () => useQuery<DiscordLog, AxiosError>('discord/log');

export interface ChangeRoleDTO {
  memberId: string;
  role: DiscordRole;
}

export const useAddDiscordRole = () => {
  const queryClient = useQueryClient();
  const openToast = useToast();

  return useMutation<void, AxiosError, ChangeRoleDTO, DiscordMember[]>({
    mutationFn({ memberId, role }) {
      return axios.put(`/api/discord/members/${memberId}/roles/${role.id}`);
    },
    async onMutate({ role, memberId }) {
      await queryClient.cancelQueries('discord/members');

      const previousMembers = queryClient.getQueryData<DiscordMember[]>('discord/members');

      queryClient.setQueryData<DiscordMember[]>(
        'discord/members',
        old =>
          old?.map(member => {
            if (member.id !== memberId) return member;

            return { ...member, roles: [...member.roles, role] };
          }) ?? []
      );

      return previousMembers;
    },
    onError(_err, _var, previous) {
      openToast('Failed to add role', 'error');
      queryClient.setQueryData('discord/members', previous);
    },
    onSettled() {
      queryClient.invalidateQueries(['discord/members']);
    }
  });
};

export const useRemoveDiscordRole = () => {
  const queryClient = useQueryClient();
  const openToast = useToast();

  return useMutation<void, AxiosError, ChangeRoleDTO, DiscordMember[]>({
    mutationFn({ memberId, role }) {
      return axios.delete(`/api/discord/members/${memberId}/roles/${role.id}`);
    },
    async onMutate({ role, memberId }) {
      await queryClient.cancelQueries('discord/members');

      const previousMembers = queryClient.getQueryData<DiscordMember[]>('discord/members');

      queryClient.setQueryData<DiscordMember[]>(
        'discord/members',
        old =>
          old?.map(member => {
            if (member.id !== memberId) return member;

            return { ...member, roles: member.roles.filter(r => r.id !== role.id) };
          }) ?? []
      );

      return previousMembers;
    },
    onError(_err, _var, previous) {
      openToast('Failed to remove role', 'error');
      queryClient.setQueryData('discord/members', previous);
    },
    onSettled() {
      queryClient.invalidateQueries(['discord/members']);
    }
  });
};

export interface UpdateMemberDTO {
  memberId: string;
  nick: string;
}

export const useUpdateDiscordMember = () => {
  const queryClient = useQueryClient();
  const openToast = useToast();

  return useMutation<void, AxiosError, UpdateMemberDTO>({
    mutationFn({ memberId, nick }) {
      return axios.put(`/api/discord/members/${memberId}`, { nick });
    },
    onSuccess() {
      queryClient.invalidateQueries(['discord/members']);
      openToast('Successfully updated nickname.', 'success');
    },
    onError() {
      openToast('Failed to update nickname', 'error');
    }
  });
};

export interface KickMemberDTO {
  memberIds: string[];
  reinvite?: boolean;
  reason?: string;
}

export const useKickDiscordMembers = () => {
  const queryClient = useQueryClient();
  const openToast = useToast();
  const sendMessage = useSendMessage();

  return useMutation<void, AxiosError, KickMemberDTO, DiscordMember[]>({
    async mutationFn({ reinvite, reason, memberIds }) {
      const promises = memberIds.map(async memberId => {
        if (reinvite) {
          let content = 'You have been kicked from Sunspear Order';
          if (reason) {
            content += ` for the following reason: "${reason}"`;
          }

          if (config.discordReinviteUrl) {
            content += `\n\nYou are welcome to re-join at any time using the following link: ${config.discordReinviteUrl}`;
          }

          await sendMessage.mutateAsync({
            memberId,
            content
          });
        }

        return axios.delete(`/api/discord/members/${memberId}`);
      });

      await Promise.all(promises);
    },
    async onMutate({ memberIds }) {
      await queryClient.cancelQueries('discord/members');

      const previousMembers = queryClient.getQueryData<DiscordMember[]>('discord/members');

      queryClient.setQueryData<DiscordMember[]>(
        'discord/members',
        old => old?.filter(m => !memberIds.includes(m.id)) ?? []
      );

      return previousMembers;
    },
    onSuccess() {
      openToast('Successfully kicked members.', 'success');
    },
    onError(_err, _dto, context) {
      openToast('Failed to kick members.', 'error');
      queryClient.setQueryData('discord/members', context);
      queryClient.invalidateQueries('discord/members');
    }
  });
};

export interface SendMessageDTO {
  memberId: string;
  content: string;
}

export const useSendMessage = () => {
  const openToast = useToast();

  return useMutation<void, AxiosError, SendMessageDTO>({
    mutationFn({ memberId, content }) {
      return axios.post(`/api/discord/members/${memberId}/messages`, { content });
    },
    onSuccess() {
      openToast('Sent message.', 'success');
    },
    onError() {
      openToast('Failed to send message', 'error');
    }
  });
};

export const usePostEvents = () => {
  const openToast = useToast();
  const queryClient = useQueryClient();

  return useMutation<void, AxiosError, EventSettings>({
    mutationFn(settings) {
      return axios.post(`/api/discord/eventUpdate`, settings);
    },
    onSuccess() {
      openToast('Posted events to discord.', 'success');
    },
    onError() {
      openToast('Failed to post events to discord.', 'error');
    },
    onSettled() {
      queryClient.invalidateQueries('events/settings');
    }
  });
};
