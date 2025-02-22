import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { type AxiosError } from 'axios';
import {
  type DiscordMemberDTO,
  type DiscordRole,
  type EventSettingsUpsertDTO,
  type IDiscordController
} from 'server';
import { useToast } from '../../components/common/toast/toast-context';
import { config } from '../config';
import { createApi } from './axios-wrapper';

const api = createApi('/api/discord');

const discordApi: IDiscordController = {
  getRoles: () => api('roles'),
  getMembers: () => api('members'),
  getLogs: () => api('log'),
  getLeavers: () => api('leavers'),
  getBotRoles: () => api('bot-roles'),
  addRoleToMember: (memberId, roleId) =>
    api(`members/${memberId}/roles/${roleId}`, { method: 'PUT' }),
  removeRoleFromMember: (memberId, roleId) =>
    api(`members/${memberId}/roles/${roleId}`, { method: 'DELETE' }),
  updateMember: (memberId, updates) => api(`members/${memberId}`, { method: 'PUT', data: updates }),
  deleteMember: memberId => api(`members/${memberId}`, { method: 'DELETE' }),
  sendMessageToMember: (memberId, messageData) =>
    api(`members/${memberId}/messages`, { method: 'POST', data: messageData }),
  postEventUpdates: settings => api('eventUpdate', { method: 'POST', data: settings })
};

export const useDiscordMembers = () =>
  useQuery({ queryKey: ['discord/members'], queryFn: discordApi.getMembers });
export const useDiscordRoles = () =>
  useQuery({ queryKey: ['discord/roles'], queryFn: discordApi.getRoles });
export const useDiscordLog = () =>
  useQuery({ queryKey: ['discord/log'], queryFn: discordApi.getLogs });
export const useDiscordLeavers = () =>
  useQuery({ queryKey: ['discord/leavers'], queryFn: discordApi.getLeavers });
export const useDiscordBotRoles = () =>
  useQuery({ queryKey: ['discord/bot-roles'], queryFn: discordApi.getBotRoles });

export interface ChangeRoleDTO {
  memberId: string;
  role: DiscordRole;
}

export const useAddDiscordRole = () => {
  const queryClient = useQueryClient();
  const openToast = useToast();

  return useMutation<void, AxiosError, ChangeRoleDTO, DiscordMemberDTO[]>({
    mutationFn({ memberId, role }) {
      return discordApi.addRoleToMember(memberId, role.id);
    },
    async onMutate({ memberId, role }) {
      await queryClient.cancelQueries({ queryKey: ['discord/members'] });

      const previousMembers = queryClient.getQueryData<DiscordMemberDTO[]>(['discord/members']);

      queryClient.setQueryData<DiscordMemberDTO[]>(
        ['discord/members'],
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
      queryClient.setQueryData(['discord/members'], previous);
    },
    onSettled() {
      queryClient.invalidateQueries({ queryKey: ['discord/members'] });
    }
  });
};

export const useRemoveDiscordRole = () => {
  const queryClient = useQueryClient();
  const openToast = useToast();

  return useMutation<void, AxiosError, ChangeRoleDTO, DiscordMemberDTO[]>({
    mutationFn({ memberId, role }) {
      return discordApi.removeRoleFromMember(memberId, role.id);
    },
    async onMutate({ role, memberId }) {
      await queryClient.cancelQueries({ queryKey: ['discord/members'] });

      const previousMembers = queryClient.getQueryData<DiscordMemberDTO[]>(['discord/members']);

      queryClient.setQueryData<DiscordMemberDTO[]>(
        ['discord/members'],
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
      queryClient.setQueryData(['discord/members'], previous);
    },
    onSettled() {
      queryClient.invalidateQueries({ queryKey: ['discord/members'] });
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
      return discordApi.updateMember(memberId, { nick });
    },
    onSuccess() {
      queryClient.invalidateQueries({ queryKey: ['discord/members'] });
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

  return useMutation<void, AxiosError, KickMemberDTO, DiscordMemberDTO[]>({
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

        return discordApi.deleteMember(memberId);
      });

      await Promise.all(promises);
    },
    async onMutate({ memberIds }) {
      await queryClient.cancelQueries({ queryKey: ['discord/members'] });

      const previousMembers = queryClient.getQueryData<DiscordMemberDTO[]>(['discord/members']);

      queryClient.setQueryData<DiscordMemberDTO[]>(
        ['discord/members'],
        old => old?.filter(m => !(m.id && memberIds.includes(m.id))) ?? []
      );

      return previousMembers;
    },
    onSuccess() {
      openToast('Successfully kicked members.', 'success');
    },
    onError(_err, _dto, context) {
      openToast('Failed to kick members.', 'error');
      queryClient.setQueryData(['discord/members'], context);
      queryClient.invalidateQueries({ queryKey: ['discord/members'] });
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
      return discordApi.sendMessageToMember(memberId, { content });
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

  return useMutation<void, AxiosError, EventSettingsUpsertDTO>({
    mutationFn(settings) {
      return discordApi.postEventUpdates(settings);
    },
    onSuccess() {
      openToast('Posted events to discord.', 'success');
    },
    onError() {
      openToast('Failed to post events to discord.', 'error');
    },
    onSettled() {
      queryClient.invalidateQueries({ queryKey: ['events/settings'] });
    }
  });
};
