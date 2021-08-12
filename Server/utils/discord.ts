import fetch from 'node-fetch';
import DiscordMember from '../interfaces/DiscordMember';
import DiscordRole from '../interfaces/DiscordRole';
import FormattedDiscordMember from '../interfaces/FormattedDiscordMember';
import GW2Rank from '../interfaces/GW2Rank';
import IEvent from '../interfaces/IEvent';
import DiscordEmbed from '../interfaces/DiscordEmbed';
import { config } from '../config';

export const getValidRoles = async (): Promise<string[]> => {
  const gwUrl = `https://api.guildwars2.com/v2/guild/${config.gw2guildId}`;
  const gwParams = {
    headers: {
      Authorization: `Bearer ${config.gw2apiToken}`
    }
  };

  const response = await fetch(`${gwUrl}/ranks`, gwParams);
  const guildRanks: GW2Rank[] = await response.json();
  return guildRanks.map((r) => r.id).concat(['Guest', 'Bots']);
};

export const formatMembers = async (
  members: DiscordMember[],
  roles: DiscordRole[]
): Promise<FormattedDiscordMember[]> => {
  const validRoles = await getValidRoles();
  return members.map((member) => formatMember(member, roles, validRoles));
};

export const formatMember = (
  member: DiscordMember,
  roles: DiscordRole[],
  validRoles: string[]
): FormattedDiscordMember => {
  return {
    name: member.nick ? member.nick : member?.user?.username,
    nickname: member.nick,
    id: member?.user?.id,
    roles: getRoleInfo(roles, member.roles, validRoles),
    joined: member.joined_at,
    avatar: member?.user?.avatar
      ? `https://cdn.discordapp.com/avatars/${member.user.id}/${member.user.avatar}.png`
      : undefined
  };
};

export const getRoleInfo = (
  allRoles: DiscordRole[],
  memberRoleIds: string[],
  validRoleIds: string[]
): DiscordRole[] => {
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
};

export const createEmbed = (day: string, events: IEvent[]): DiscordEmbed => {
  return {
    color: '3447003',
    title: `${day} Events`,
    fields: events.map((event, i) => {
      const timeLink = encodeURI(
        `https://www.starts-at.com/e/?t=${event.startTime}&tz=UTC&d=Next${event.day}&title=${event.title}`
      );
      return {
        name: `\u200b${i !== 0 ? '\n' : ''}📅 **${event.title}**`,
        value: `⏰ [${event.startTime} UTC](${timeLink})${`\u200b\u3000`.repeat(15)}\n⏳ ${
          event.duration
        }\n👑 <@${event.leaderId}>`
      };
    })
  };
};
