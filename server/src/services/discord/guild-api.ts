import { Service } from 'typedi';
import { config } from '../../config';
import { DiscordLog } from '../../models/interfaces/discord-log';
import DiscordMember, { DiscordMemberUpdate } from '../../models/interfaces/discord-member';
import DiscordRole from '../../models/interfaces/discord-role';
import { DiscordApi } from './discord-api';

export interface IDiscordGuildApi {
  getMembers(): Promise<DiscordMember[]>;
  getMemberById(memberId: string): Promise<DiscordMember>;
  getRoles(): Promise<DiscordRole[]>;
  getLogs(): Promise<DiscordLog>;
  kickMember(id: string): Promise<boolean>;
  removeRoleFromMember(memberId: string, roleId: string): Promise<boolean>;
  addRoleToMember(memberId: string, roleId: string): Promise<boolean>;
  updateMember(memberId: string, updates: DiscordMemberUpdate): Promise<DiscordMember>;
}

@Service()
export class DiscordGuildApi {
  private readonly baseUrl: string;
  constructor(private readonly discordApi: DiscordApi) {
    this.baseUrl = `guilds/${config.discordGuildId}`;
  }

  async getMembers(): Promise<DiscordMember[]> {
    return await this.discordApi.get(`${this.baseUrl}/members?limit=1000`);
  }

  async getMemberById(memberId: string): Promise<DiscordMember> {
    return await this.discordApi.get(`${this.baseUrl}/members/${memberId}`);
  }

  async getRoles(): Promise<DiscordRole[]> {
    return await this.discordApi.get(`${this.baseUrl}/roles`);
  }

  async getLogs(): Promise<DiscordLog> {
    return await this.discordApi.get(`${this.baseUrl}/audit-logs?limit=100`);
  }

  async kickMember(id: string): Promise<boolean> {
    return await this.discordApi.delete(`${this.baseUrl}/members/${id}`);
  }

  async removeRoleFromMember(memberId: string, roleId: string): Promise<boolean> {
    await this.discordApi.delete(`${this.baseUrl}/members/${memberId}/roles/${roleId}`);
    return true;
  }

  async addRoleToMember(memberId: string, roleId: string): Promise<boolean> {
    await this.discordApi.put(`${this.baseUrl}/members/${memberId}/roles/${roleId}`, {});
    return true;
  }

  async updateMember(memberId: string, updates: DiscordMemberUpdate): Promise<DiscordMember> {
    return await this.discordApi.patch(`${this.baseUrl}/members/${memberId}`, updates);
  }
}
