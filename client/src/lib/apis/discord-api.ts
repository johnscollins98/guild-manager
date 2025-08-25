import { queryOptions, useMutation, useQueryClient, useSuspenseQuery } from '@tanstack/react-query';
import { AxiosError } from 'axios';
import {
  type DiscordMemberDTO,
  type DiscordRole,
  type DiscordUser,
  type EventSettingsUpsertDTO,
  type IDiscordController
} from 'server';
import { queryClient } from '../../components/common/query-provider';
import { useToast } from '../../components/common/toast/toast-context';
import { config } from '../config';
import { createApi } from './axios-wrapper';
import { eventSettingsQuery } from './event-api';

const api = createApi('/api/discord');

const discordApi: IDiscordController = {
  getRoles: () => api('roles'),
  getMembers: () => api('members'),
  getLogs: (opts?: { pageParam?: string }) => {
    const params = new URLSearchParams();
    if (opts?.pageParam) {
      params.append('before', opts.pageParam);
    }

    return api('log', { params });
  },
  getLeavers: () => api('leavers'),
  getBotRoles: () => api('bot-roles'),
  getBot: () => api('bot'),
  getUserById: userId => api(`user/${userId}`, { validateStatus: s => s === 200 || s === 404 }),
  getChannels: () => api('channels'),
  getMessages: id => api(`channels/${id}/messages`),
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

export const discordMembersQuery = {
  queryKey: ['discord/members'],
  queryFn: discordApi.getMembers
};
export const useDiscordMembers = () => useSuspenseQuery(discordMembersQuery);

export const discordRolesQuery = { queryKey: ['discord/roles'], queryFn: discordApi.getRoles };
export const useDiscordRoles = () => useSuspenseQuery(discordRolesQuery);

export const discordLogQuery = { queryKey: ['discord/log'], queryFn: discordApi.getLogs };
export const useDiscordLog = () => useSuspenseQuery(discordLogQuery);

export const discordLeaversQuery = {
  queryKey: ['discord/leavers'],
  queryFn: discordApi.getLeavers
};
export const useDiscordLeavers = () => useSuspenseQuery(discordLeaversQuery);

export const discordBotRolesQuery = {
  queryKey: ['discord/bot-roles'],
  queryFn: discordApi.getBotRoles
};
export const useDiscordBotRoles = () => useSuspenseQuery(discordBotRolesQuery);

export const discordBotQuery = queryOptions({
  queryKey: ['discord/bot'],
  queryFn: discordApi.getBot
});

export const useDiscordBot = () => useSuspenseQuery(discordBotQuery);

export const discordUserQuery = (userId: string) =>
  queryOptions({
    queryKey: [`discord/user/${userId}`],
    queryFn: () => discordApi.getUserById(userId)
  });
export const useDiscordUser = (userId: string) => useSuspenseQuery(discordUserQuery(userId));

export const discordChannelsQuery = queryOptions({
  queryKey: ['discord/channels'],
  queryFn: discordApi.getChannels
});
export const useDiscordChannels = () => useSuspenseQuery(discordChannelsQuery);

export const discordMessagesQuery = (id: string) =>
  queryOptions({
    queryKey: [`discord/channels`, id, 'messages'],
    queryFn: () => discordApi.getMessages(id)
  });

export const useDiscordMessages = (id: string) => useSuspenseQuery(discordMessagesQuery(id));

export const getMemberOrUserQuery = (id?: string, userList?: DiscordUser[]) =>
  queryOptions({
    queryKey: ['memberOrUser', id],
    queryFn: async (): Promise<{ member?: DiscordMemberDTO; user?: DiscordUser }> => {
      if (!id) return {};

      // check in list of members first
      const discordMembers = await queryClient.fetchQuery(discordMembersQuery);
      const member = discordMembers.find(m => m.id === id);
      if (member) {
        return { member };
      }

      // check in list of users
      if (userList) {
        const user = userList.find(u => u.id === id);
        if (user) {
          return { user };
        }
      }

      // get via api only if needed
      const user = await queryClient.fetchQuery(discordUserQuery(id));
      return { user };
    }
  });

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
      await queryClient.cancelQueries({ queryKey: discordMembersQuery.queryKey });

      const previousMembers = queryClient.getQueryData<DiscordMemberDTO[]>(
        discordMembersQuery.queryKey
      );

      queryClient.setQueryData<DiscordMemberDTO[]>(
        discordMembersQuery.queryKey,
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
      queryClient.setQueryData(discordMembersQuery.queryKey, previous);
    },
    onSettled() {
      queryClient.invalidateQueries({ queryKey: discordMembersQuery.queryKey });
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
      await queryClient.cancelQueries({ queryKey: discordMembersQuery.queryKey });

      const previousMembers = queryClient.getQueryData<DiscordMemberDTO[]>(
        discordMembersQuery.queryKey
      );

      queryClient.setQueryData<DiscordMemberDTO[]>(
        discordMembersQuery.queryKey,
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
      queryClient.setQueryData(discordMembersQuery.queryKey, previous);
    },
    onSettled() {
      queryClient.invalidateQueries({ queryKey: discordMembersQuery.queryKey });
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
      queryClient.invalidateQueries({ queryKey: discordMembersQuery.queryKey });
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

          try {
            await sendMessage.mutateAsync({
              memberId,
              content
            });
          } catch (err) {
            if (!(err instanceof AxiosError) || err.status !== 403) {
              throw err;
            }
          }
        }

        return discordApi.deleteMember(memberId);
      });

      await Promise.all(promises);
    },
    async onMutate({ memberIds }) {
      await queryClient.cancelQueries({ queryKey: discordMembersQuery.queryKey });

      const previousMembers = queryClient.getQueryData<DiscordMemberDTO[]>(
        discordMembersQuery.queryKey
      );

      queryClient.setQueryData<DiscordMemberDTO[]>(
        discordMembersQuery.queryKey,
        old => old?.filter(m => !(m.id && memberIds.includes(m.id))) ?? []
      );

      return previousMembers;
    },
    onSuccess() {
      openToast('Successfully kicked members.', 'success');
    },
    onError(_err, _dto, context) {
      openToast('Failed to kick members.', 'error');
      queryClient.setQueryData(discordMembersQuery.queryKey, context);
      queryClient.invalidateQueries({ queryKey: discordMembersQuery.queryKey });
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
    onError(err) {
      if (err.status === 403) {
        openToast('Failed to send message to user as they have blocked messages.', 'warning');
        return;
      }
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
      queryClient.invalidateQueries({ queryKey: eventSettingsQuery.queryKey });
    }
  });
};
