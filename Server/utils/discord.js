const formatMembers = (members, roles) => {
  return members.map((member) => formatMember(member, roles));
};

const formatMember = (member, roles) => {
  return {
    name: member.nick ? member.nick : member.user.username,
    id: member.user.id,
    roles: getRoleInfo(roles, member.roles),
  };
};

const getRoleInfo = (allRoles, memberRoles) => {
  const validRoles = [
    "Second Spear",
    "First Spear",
    "Commander",
    "Captain",
    "General",
    "Spearmarshal",
    "Guest",
    "Bots",
  ];

  let roles = [];

  for (const memberRoleId of memberRoles) {
    for (const discordRole of allRoles) {
      const match = memberRoleId === discordRole.id;
      const valid = validRoles.includes(discordRole.name);
      if (match && valid) roles.push({
        name: discordRole.name,
        id: discordRole.id
      });
    }
  }

  return roles;
};

module.exports.formatMembers = formatMembers;
