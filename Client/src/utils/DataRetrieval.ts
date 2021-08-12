import AuthInfo from '../Interfaces/AuthInfo';
import DiscordMember from '../Interfaces/DiscordMember';
import DiscordRole from '../Interfaces/DiscordRole';
import GW2Member from '../Interfaces/GW2Member';
import GW2Rank from '../Interfaces/GW2Rank';
import GW2LogEntry from '../Interfaces/GW2LogEntry';
import { MemberInfoPost } from '../Interfaces/MemberInfo';
import PointLogEntry from '../Interfaces/PointLogEntry';

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

export const changeDiscordMember = async (
  memberId: string,
  newNickname: string
): Promise<string> => {
  const response = await fetch(`api/discord/members/${memberId}`, {
    method: 'PUT',
    body: JSON.stringify({
      nickname: newNickname
    }),
    headers: {
      "Content-Type": "application/json"
    }
  });
  const data = await response.json();

  if (response.status === 200) {
    return data;
  }

  throw data;
};

export const kickDiscordMember = async (memberId: string): Promise<boolean> => {
  const response = await fetch(`/api/discord/members/${memberId}`, {
    method: 'DELETE'
  });
  return response.status === 204;
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

export const setGuildMember = async (newMember: MemberInfoPost) => {
  const response = await fetch(`/api/gw2/members/${newMember.memberId}`, {
    headers: {
      Accept: 'application/json',
      'Content-Type': 'application/json'
    },
    method: 'PUT',
    body: JSON.stringify(newMember)
  });

  if (response.status !== 200) {
    throw response;
  }

  const data = await response.json();
  return JSON.parse(data);
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

  return JSON.parse(data);
};

export const fetchPointLog = async (): Promise<PointLogEntry[]> => {
  const response = await fetch('/api/gw2/pointlog');
  const data = await response.json();

  if (response.status !== 200) {
    throw data;
  }

  return data.reverse();
};
