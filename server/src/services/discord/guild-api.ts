import { AxiosError } from 'axios';
import { APIGuildScheduledEvent, Routes } from 'discord.js';
import { Service } from 'typedi';
import { config } from '../../config';
import {
  DiscordChannel,
  DiscordLog,
  DiscordMember,
  DiscordMemberUpdate,
  DiscordRole
} from '../../dtos';
import { DiscordApi } from './discord-api';

export interface IDiscordGuildApi {
  getMembers(): Promise<DiscordMember[]>;
  getMemberById(memberId: string): Promise<DiscordMember | undefined>;
  getRoles(): Promise<DiscordRole[]>;
  getLogs(limit?: number, before?: string): Promise<DiscordLog>;
  getChannels(): Promise<DiscordChannel[]>;
  kickMember(id: string): Promise<boolean>;
  removeRoleFromMember(memberId: string, roleId: string): Promise<boolean>;
  addRoleToMember(memberId: string, roleId: string): Promise<boolean>;
  updateMember(memberId: string, updates: DiscordMemberUpdate): Promise<DiscordMember>;
  getEvents(): Promise<APIGuildScheduledEvent[]>;
}

@Service()
export class DiscordGuildApi implements IDiscordGuildApi {
  private readonly baseUrl: `/${string}`;
  constructor(private readonly discordApi: DiscordApi) {
    this.baseUrl = `/guilds/${config.discordGuildId}`;
  }

  async getMembers(): Promise<DiscordMember[]> {
    return await this.discordApi.get(`${this.baseUrl}/members?limit=1000`);
  }

  async getMemberById(memberId: string): Promise<DiscordMember | undefined> {
    try {
      return await this.discordApi.get(`${this.baseUrl}/members/${memberId}`);
    } catch (err: unknown) {
      if (err instanceof AxiosError && err.status === 404) {
        return undefined;
      }
      throw err;
    }
  }

  async getRoles(): Promise<DiscordRole[]> {
    return await this.discordApi.get(`${this.baseUrl}/roles`);
  }

  async getLogs(limit = 100, before?: string): Promise<DiscordLog> {
    const query = new URLSearchParams({ limit: limit.toString() });

    if (before) {
      query.append('before', before);
    }

    return await this.discordApi.get(Routes.guildAuditLog(config.discordGuildId), { query });
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

  async getChannels(): Promise<DiscordChannel[]> {
    return await this.discordApi.get(`${this.baseUrl}/channels`);
  }

  async getEvents(): Promise<APIGuildScheduledEvent[]> {
    return await this.discordApi.get(Routes.guildScheduledEvents(config.discordGuildId));
  }
}
