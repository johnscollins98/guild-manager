import axios, { AxiosError } from 'axios';
import { useMutation, useQuery, useQueryClient } from 'react-query';
import { useToast } from '../../Components/Common/ToastContext';
import { config } from '../../Config';
import { DiscordLog } from '../../interfaces/DiscordLog';
import DiscordMember from '../../interfaces/DiscordMember';
import DiscordRole from '../../interfaces/DiscordRole';
import EventSettings from '../../interfaces/EventSettings';

export const useDiscordMembers = () => useQuery<DiscordMember[], AxiosError>('discord/members');
export const useDiscordRoles = () => useQuery<DiscordRole[], AxiosError>('discord/roles');
export const useDiscordLog = () => useQuery<DiscordLog, AxiosError>('discord/log');

export interface ChangeRoleDTO {
  memberId: string;
  roleId: string;
}

export const useAddDiscordRole = () => {
  const queryClient = useQueryClient();
  const openToast = useToast();

  return useMutation<void, AxiosError, ChangeRoleDTO>({
    mutationFn({ memberId, roleId }) {
      return axios.put(`/api/discord/members/${memberId}/roles/${roleId}`);
    },
    onSuccess() {
      queryClient.invalidateQueries(['discord/members']);
    },
    onError() {
      openToast('Failed to add role', 'error');
    }
  });
};

export const useRemoveDiscordRole = () => {
  const queryClient = useQueryClient();
  const openToast = useToast();

  return useMutation<void, AxiosError, ChangeRoleDTO>({
    mutationFn({ memberId, roleId }) {
      return axios.delete(`/api/discord/members/${memberId}/roles/${roleId}`);
    },
    onSuccess() {
      queryClient.invalidateQueries(['discord/members']);
    },
    onError() {
      openToast('Failed to remove role', 'error');
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
  memberId: string;
  reinvite?: boolean;
  reason?: string;
}

export const useKickDiscordMember = () => {
  const queryClient = useQueryClient();
  const openToast = useToast();
  const sendMessage = useSendMessage();

  return useMutation<void, AxiosError, KickMemberDTO>({
    async mutationFn({ reinvite, reason, memberId }) {
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
    },
    onSuccess() {
      queryClient.invalidateQueries('discord/members');
      openToast('Successfully kicked member.', 'success');
    },
    onError() {
      openToast('Failed to kick member.', 'error');
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
