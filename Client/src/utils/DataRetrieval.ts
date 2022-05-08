import AuthInfo from '../Interfaces/AuthInfo';
import DiscordMember from '../Interfaces/DiscordMember';
import DiscordRole from '../Interfaces/DiscordRole';
import GW2Member from '../Interfaces/GW2Member';
import GW2Rank from '../Interfaces/GW2Rank';
import GW2LogEntry from '../Interfaces/GW2LogEntry';
import { DiscordLog } from '../Interfaces/DiscordLog';
import { config } from '../Config';

export const fetchDiscordMembers = async (): Promise<DiscordMember[]> => {
  const response = await fetch(`/api/discord/members`);
  const data = await response.json();

  if (response.status !== 200) {
    throw data;
  }

  return data;
};

export const fetchDiscordRoles = async (): Promise<DiscordRole[]> => {
  const response = await fetch(`api/discord/roles`);
  const data = await response.json();

  if (response.status !== 200) {
    throw data;
  }

  return data;
};

export const fetchDiscordLog = async (): Promise<DiscordLog> => {
  const response = await fetch(`api/discord/log`);
  const data = await response.json();

  if (response.status !== 200) {
    throw data;
  }

  return data;
};

export const addDiscordRole = async (memberId: string, roleId: string): Promise<boolean> => {
  const response = await fetch(`api/discord/members/${memberId}/roles/${roleId}`, {
    method: 'PUT'
  });
  return response.status === 204;
};

export const removeDiscordRole = async (memberId: string, roleId: string): Promise<boolean> => {
  const response = await fetch(`api/discord/members/${memberId}/roles/${roleId}`, {
    method: 'DELETE'
  });
  return response.status === 204;
};

export const changeDiscordMember = async (memberId: string, newNickname: string): Promise<void> => {
  const response = await fetch(`api/discord/members/${memberId}`, {
    method: 'PUT',
    body: JSON.stringify({
      nick: newNickname
    }),
    headers: {
      'Content-Type': 'application/json'
    }
  });

  if (!response.ok) {
    throw new Error(response.statusText);
  }
};

export const kickDiscordMember = async (
  memberId: string,
  shouldSendReinviteLink: boolean,
  reason?: string
): Promise<boolean> => {
  if (shouldSendReinviteLink) {
    await sendReinviteLink(memberId, reason);
  }

  const response = await fetch(`/api/discord/members/${memberId}`, {
    method: 'DELETE'
  });
  return response.status === 204;
};

export const sendReinviteLink = async (memberId: string, reason?: string): Promise<boolean> => {
  let content = 'You have been kicked from Sunspear Order';
  if (reason) {
    content += ` for the following reason: "${reason}"`;
  }

  if (config.discordReinviteUrl) {
    content += `\n\nYou are welcome to re-join at any time using the following link: ${config.discordReinviteUrl}`;
  }

  await fetch(`/api/discord/members/${memberId}/messages`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ content })
  });

  return true;
};

export const fetchGW2Members = async (): Promise<GW2Member[]> => {
  const response = await fetch(`/api/gw2/members`);
  const data = await response.json();

  if (response.status !== 200) {
    throw data;
  }

  return data;
};

export const fetchGW2Ranks = async (): Promise<GW2Rank[]> => {
  const response = await fetch(`/api/gw2/ranks`);
  const data = await response.json();

  if (response.status !== 200) {
    throw data;
  }

  return data;
};

export const fetchGW2Log = async (): Promise<GW2LogEntry[]> => {
  const response = await fetch(`/api/gw2/log`);
  const data = await response.json();

  if (response.status !== 200) {
    throw data;
  }

  return data;
};

export const fetchAuthInfo = async (): Promise<AuthInfo> => {
  const response = await fetch('/auth/authorization');
  const data = await response.json();

  if (response.status === 303) {
    window.location.href = data.redirectUrl;
  }

  if (response.status !== 200) {
    throw data;
  }

  return data;
};

export const getAdminRoles = async (): Promise<String[]> => {
  const response = await fetch('/auth/admin_roles');
  const data = await response.json();

  if (response.status !== 200) {
    throw data;
  }

  return data;
};

export const getEventRoles = async (): Promise<String[]> => {
  const response = await fetch('/auth/event_roles');
  const data = await response.json();

  if (response.status !== 200) {
    throw data;
  }

  return data;
};
