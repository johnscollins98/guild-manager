import { Service } from 'typedi';
import { DiscordMember, DiscordRole, FormattedDiscordMember } from '../../dtos';
import { GW2ApiFactory } from '../gw2/api-factory';
import { IGW2GuildApi } from '../gw2/guild-api';

@Service()
export class DiscordMemberFormatter {
  private readonly gw2GuildApi: IGW2GuildApi;
  constructor(gw2ApiFactory: GW2ApiFactory) {
    this.gw2GuildApi = gw2ApiFactory.guildApi();
  }

  async formatMembers(
    members: DiscordMember[],
    roles: DiscordRole[]
  ): Promise<FormattedDiscordMember[]> {
    const validRoles = await this.getValidRoles();
    return members.map(member => this.formatMember(member, roles, validRoles));
  }

  private formatMember(
    member: DiscordMember,
    roles: DiscordRole[],
    validRoles: string[]
  ): FormattedDiscordMember {
    return {
      name: member.nick ?? member.user?.global_name ?? member.user?.username,
      nickname: member.nick,
      id: member?.user?.id,
      roles: this.getRoleInfo(roles, member.roles, validRoles),
      joined: member.joined_at,
      avatar: member?.user?.avatar
        ? `https://cdn.discordapp.com/avatars/${member.user.id}/${member.user.avatar}.png`
        : undefined
    };
  }

  getRoleInfo(
    allRoles: DiscordRole[],
    memberRoleIds: string[],
    validRoleIds: string[]
  ): DiscordRole[] {
    const roles = [];

    for (const memberRoleId of memberRoleIds) {
      for (const discordRole of allRoles) {
        const match = memberRoleId === discordRole.id;
        const valid = !validRoleIds || validRoleIds.includes(discordRole.name);
        if (match && valid)
          roles.push({
            ...discordRole
          });
      }
    }

    return roles;
  }

  async getValidRoles(): Promise<string[]> {
    const gw2ranks = await this.gw2GuildApi.getRanks();
    const extraRanks = ['Guest', 'Bots', 'Invited'];

    if (gw2ranks === undefined) {
      return extraRanks;
    }
    const rankStrings = gw2ranks.map(r => r.id);
    return [...rankStrings, ...extraRanks];
  }
}
