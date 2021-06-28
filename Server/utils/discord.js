const fetch = require('node-fetch');

const getValidRoles = async () => {
  const gwUrl = `https://api.guildwars2.com/v2/guild/${process.env.GW2_GUILD_ID}`;
  const gwToken = process.env.GW2_API_TOKEN;
  const gwParams = {
    headers: {
      Authorization: `Bearer ${gwToken}`
    }
  };

  const response = await fetch(`${gwUrl}/ranks`, gwParams);
  const guildRanks = await response.json();
  return guildRanks.map((r) => r.id).concat(['Guest', 'Bots']);
};

const formatMembers = async (members, roles) => {
  const validRoles = await getValidRoles();
  return members.map((member) => formatMember(member, roles, validRoles));
};

const formatMember = (member, roles, validRoles) => {
  return {
    name: member.nick ? member.nick : member.user.username,
    id: member.user.id,
    roles: getRoleInfo(roles, member.roles, validRoles),
    joined: member.joined_at,
    avatar: member.user.avatar
      ? `https://cdn.discordapp.com/avatars/${member.user.id}/${member.user.avatar}.png`
      : undefined
  };
};

const getRoleInfo = (allRoles, memberRoles, validRoles) => {
  let roles = [];

  for (const memberRoleId of memberRoles) {
    for (const discordRole of allRoles) {
      const match = memberRoleId === discordRole.id;
      const valid = !validRoles || validRoles.includes(discordRole.name);
      if (match && valid)
        roles.push({
          name: discordRole.name,
          id: discordRole.id,
          color: discordRole.color
        });
    }
  }

  return roles;
};

const createEmbed = (day, events) => {
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

module.exports.formatMembers = formatMembers;
module.exports.getRoleInfo = getRoleInfo;
module.exports.getValidRoles = getValidRoles;
module.exports.createEmbed = createEmbed;
