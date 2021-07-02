import fetch from 'node-fetch';
import DiscordMember from '../Interfaces/DiscordMember';
import DiscordRole from '../Interfaces/DiscordRole';
import FormattedDiscordMember from '../Interfaces/FormattedDiscordMember';
import GW2Rank from '../Interfaces/GW2Rank';
import Event from '../Interfaces/Event';
import DiscordEmbed from '../Interfaces/DiscordEmbed';

export const getValidRoles = async (): Promise<string[]> => {
  const gwUrl = `https://api.guildwars2.com/v2/guild/${process.env.GW2_GUILD_ID}`;
  const gwToken = process.env.GW2_API_TOKEN;
  const gwParams = {
    headers: {
      Authorization: `Bearer ${gwToken}`
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

export const createEmbed = (day: string, events: Event[]): DiscordEmbed => {
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
