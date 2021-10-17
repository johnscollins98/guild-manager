import fetch from 'node-fetch';
import AuthInfo from '../interfaces/AuthInfo';
import { config } from '../config';

export const getUserAuthInfo = async (req: Express.Request): Promise<AuthInfo> => {
  if (!req.user) {
    return {
      loggedIn: false,
      isAdmin: false,
      username: ''
    };
  }
  const loggedIn = true;

  const inGuild = !!(
    req.user.guilds && req.user.guilds.some((g) => g.id === config.discordGuildId)
  );
  const roles = await getRoles(req.user.id);
  const isAdmin = inGuild && roles.some((role) => config.adminRoles.includes(role));

  const username = req.user.username;
  return { loggedIn, isAdmin, username };
};

const getRoles = async (userId: string): Promise<string[]> => {
  const url = `http://discord.com/api/guilds/${config.discordGuildId}/members/${userId}`;
  const params = { headers: { Authorization: `Bot ${config.botToken}` } };
  const res = await fetch(url, params);
  const user = await res.json();
  return user.roles || [];
};
