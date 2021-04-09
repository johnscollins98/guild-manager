const fetch = require('node-fetch');

const getUserAuthInfo = async (req) => {
  if (!req.user) return { loggedIn: false, authorized: false, username: null };
  const loggedIn = true;

  const inGuild = req.user.guilds.some(
    (g) => g.id === process.env.DISCORD_GUILD_ID
  );
  const roles = await getRoles(req.user.id);
  const isAdmin = inGuild && roles.includes(process.env.ADMIN_ROLE);
  const isEventLeader =
    inGuild && roles.includes(process.env.EVENT_LEADER_ROLE);

  const username = req.user.username;
  return { loggedIn, isAdmin, isEventLeader, username };
};

const getRoles = async (userId) => {
  const url = `http://discord.com/api/guilds/${process.env.DISCORD_GUILD_ID}/members/${userId}`;
  const params = { headers: { Authorization: `Bot ${process.env.BOT_TOKEN}` } };
  const res = await fetch(url, params);
  const user = await res.json();
  return user.roles || [];
};

module.exports = { getUserAuthInfo };
