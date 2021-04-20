const fetch = require('node-fetch');

const formatMembers = async (members, roles) => {
  const gwUrl = `https://api.guildwars2.com/v2/guild/${process.env.GW2_GUILD_ID}`;
  const gwToken = process.env.GW2_API_TOKEN;
  const gwParams = {
    headers: {
      Authorization: `Bearer ${gwToken}`,
    },
  };
  
  const response = await fetch(`${gwUrl}/ranks`, gwParams);
  const guildRanks = await response.json();
  const validRoles = guildRanks.map(r => r.id).concat(['Guest', 'Bots']);
  return members.map((member) => formatMember(member, roles, validRoles));
};

const formatMember = (member, roles, validRoles) => {
  return {
    name: member.nick ? member.nick : member.user.username,
    id: member.user.id,
    roles: getRoleInfo(roles, member.roles, validRoles),
  };
};

const getRoleInfo = (allRoles, memberRoles, validRoles) => {
  let roles = [];

  for (const memberRoleId of memberRoles) {
    for (const discordRole of allRoles) {
      const match = memberRoleId === discordRole.id;
      const valid = validRoles.includes(discordRole.name);
      if (match && valid)
        roles.push({
          name: discordRole.name,
          id: discordRole.id,
          color: discordRole.color,
        });
    }
  }

  return roles;
};

module.exports.formatMembers = formatMembers;
module.exports.getRoleInfo = getRoleInfo;
