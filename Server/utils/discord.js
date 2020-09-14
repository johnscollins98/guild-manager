const fetch = require("node-fetch");

const fetchMembers = async (baseUrl, params) => {
  try {
    const url = `${baseUrl}/members?limit=1000`;
    const response = await fetch(url, params);
    const data = await response.json();
    return data;
  } catch (error) {
    console.log(error);
  }
};

const fetchRoles = async (baseUrl, params) => {
  try {
    const url = `${baseUrl}/roles`;
    const response = await fetch(url, params);
    const data = await response.json();
    return data;
  } catch (error) {
    console.log(error);
  }
};

const formatMembers = (members, roles) => {
  return members.map((member) => formatMember(member, roles));
};

const formatMember = (member, roles) => {
  return {
    name: member.nick ? member.nick : member.user.username,
    roles: getRoleNames(roles, member.roles),
  };
};

const getRoleNames = (allRoles, memberRoles) => {
  const validRoles = [
    "Second Spear",
    "First Spear",
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
      if (match && valid) roles.push(discordRole.name);
    }
  }

  return roles;
};

module.exports.fetchMembers = fetchMembers;
module.exports.fetchRoles = fetchRoles;
module.exports.formatMembers = formatMembers;
