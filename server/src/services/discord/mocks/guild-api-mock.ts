/* eslint-disable @typescript-eslint/no-unused-vars */

import { APIGuildScheduledEvent, ChannelType } from 'discord.js';
import { HttpError } from 'routing-controllers';
import { Service } from 'typedi';
import {
  DiscordChannel,
  DiscordLog,
  DiscordMember,
  DiscordMemberUpdate,
  DiscordRole
} from '../../../dtos';
import { IDiscordGuildApi } from '../guild-api';

const members: DiscordMember[] = [
  {
    joined_at: '2021-10-10T10:10:00Z',
    roles: ['1'],
    user: {
      id: '1',
      username: '1',
      global_name: '1'
    }
  },
  {
    joined_at: '2021-10-10T10:10:00Z',
    roles: ['2'],
    user: {
      id: '2',
      username: '2',
      global_name: '2'
    }
  }
];

const channels: DiscordChannel[] = [
  { name: 'Channel 1', id: '1', type: ChannelType.GuildText, position: 1 },
  { name: 'Channel 2', id: '2', type: ChannelType.GuildVoice, position: 2 }
];

const roles: DiscordRole[] = [
  {
    color: 123,
    id: '1',
    name: '1',
    position: 0
  }
];

const log: DiscordLog = {
  audit_log_entries: [],
  users: []
};

@Service()
export class MockDiscordGuildApi implements IDiscordGuildApi {
  getEvents(): Promise<APIGuildScheduledEvent[]> {
    return Promise.resolve([]);
  }
  getChannels(): Promise<DiscordChannel[]> {
    return Promise.resolve(channels);
  }
  getMembers(): Promise<DiscordMember[]> {
    return Promise.resolve(members);
  }

  getMemberById(memberId: string): Promise<DiscordMember> {
    const member = members.find(m => m.user?.id === memberId);

    if (!member) throw new HttpError(500, 'Error finding member');

    return Promise.resolve(member);
  }

  getRoles(): Promise<DiscordRole[]> {
    return Promise.resolve(roles);
  }

  getLogs(): Promise<DiscordLog> {
    return Promise.resolve(log);
  }

  kickMember(id: string): Promise<boolean> {
    const member = members.findIndex(m => m.user?.id === id);

    if (member === -1) return Promise.resolve(false);

    members.splice(member, 1);

    return Promise.resolve(true);
  }

  removeRoleFromMember(memberId: string, roleId: string): Promise<boolean> {
    const member = members.find(m => m.user?.id === memberId);

    if (!member) return Promise.resolve(false);
    if (!member.roles.some(r => r === roleId)) return Promise.resolve(false);

    member.roles = member.roles.filter(r => r === roleId);

    return Promise.resolve(true);
  }

  addRoleToMember(memberId: string, roleId: string): Promise<boolean> {
    const member = members.find(m => m.user?.id === memberId);

    if (!member) return Promise.resolve(false);
    if (member.roles.some(r => r === roleId)) return Promise.resolve(false);

    member.roles.push(roleId);

    return Promise.resolve(true);
  }

  updateMember(memberId: string, updates: DiscordMemberUpdate): Promise<DiscordMember> {
    const member = members.find(m => m.user?.id === memberId);

    if (!member) throw new HttpError(500);

    if (updates.nick) {
      member.nick = updates.nick;
    }

    if (updates.roles) {
      member.roles = updates.roles;
    }

    return Promise.resolve(member);
  }
}
