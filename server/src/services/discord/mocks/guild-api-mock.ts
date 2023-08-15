/* eslint-disable @typescript-eslint/no-unused-vars */

import { HttpError } from 'routing-controllers';
import { Service } from 'typedi';
import { DiscordLog } from '../../../models/interfaces/discord-log';
import DiscordMember, { DiscordMemberUpdate } from '../../../models/interfaces/discord-member';
import DiscordRole from '../../../models/interfaces/discord-role';
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
  }
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
