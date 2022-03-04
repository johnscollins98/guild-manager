import { Service } from 'typedi';
import DiscordMember from '../../models/interfaces/discordmember.interface';
import DiscordRole from '../../models/interfaces/discordrole.interface';
import FormattedDiscordMember from '../../models/interfaces/formatteddiscordmember.interface';
import { GW2GuildApi } from '../gw2/gw2guildapi.service';

@Service()
export class DiscordMemberFormatter {
  constructor(private readonly gw2GuildApi: GW2GuildApi) {}

  async formatMembers(
    members: DiscordMember[],
    roles: DiscordRole[]
  ): Promise<FormattedDiscordMember[]> {
    const validRoles = await this.getValidRoles();
    return members.map((member) => this.formatMember(member, roles, validRoles));
  }

  private formatMember(
    member: DiscordMember,
    roles: DiscordRole[],
    validRoles: string[]
  ): FormattedDiscordMember {
    return {
      name: member.nick ? member.nick : member?.user?.username,
      nickname: member.nick,
      id: member?.user?.id,
      roles: this.getRoleInfo(roles, member.roles, validRoles),
      joined: member.joined_at,
      avatar: member?.user?.avatar
        ? `https://cdn.discordapp.com/avatars/${member.user.id}/${member.user.avatar}.png`
        : undefined
    };
  }

  private getRoleInfo(
    allRoles: DiscordRole[],
    memberRoleIds: string[],
    validRoleIds: string[]
  ): DiscordRole[] {
    let roles = [];

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

  private async getValidRoles(): Promise<string[]> {
    const gw2ranks = await this.gw2GuildApi.getRanks();
    const extraRanks = ['Guest', 'Bots'];

    if (gw2ranks === undefined) {
      return extraRanks
    }
    const rankStrings = gw2ranks.map((r) => r.id);
    return [...rankStrings, ...extraRanks];
  }
}
