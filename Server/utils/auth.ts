import fetch from 'node-fetch';
import AuthInfo from '../Interface/AuthInfo';

const getUserAuthInfo = async (req: Express.Request): Promise<AuthInfo> => {
  if (!req.user) {
    return {
      loggedIn: false,
      isAdmin: false,
      isEventLeader: false,
      username: ''
    };
  }
  const loggedIn = true;

  if (!process.env.DISCORD_GUILD_ID) throw 'Must provide DISCORD_GUILD_ID';
  if (!process.env.ADMIN_ROLE) throw 'Must provide ADMIN_ROLE';
  if (!process.env.EVENT_LEADER_ROLE) throw 'Must provide EVENT_LEADER_ROLE';

  const inGuild = req.user.guilds.some((g) => g.id === process.env.DISCORD_GUILD_ID);
  const roles = await getRoles(req.user.id);
  const isAdmin = inGuild && roles.includes(process.env.ADMIN_ROLE);
  const isEventLeader = inGuild && roles.includes(process.env.EVENT_LEADER_ROLE);

  const username = req.user.username;
  return { loggedIn, isAdmin, isEventLeader, username };
};

const getRoles = async (userId: string): Promise<string[]> => {
  const url = `http://discord.com/api/guilds/${process.env.DISCORD_GUILD_ID}/members/${userId}`;
  const params = { headers: { Authorization: `Bot ${process.env.BOT_TOKEN}` } };
  const res = await fetch(url, params);
  const user = await res.json();
  return user.roles || [];
};

module.exports = { getUserAuthInfo };
