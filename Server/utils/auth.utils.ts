import AuthInfo from '../interfaces/authinfo.interface';
import { config } from '../config';
import { getGuildMember } from './discord.utils';

const notLoggedIn = {
  loggedIn: false,
  isAdmin: false,
  username: ''
};

export const getUserAuthInfo = async (user?: Express.User): Promise<AuthInfo> => {
  if (!user) return notLoggedIn;
  const loggedIn = true;
  const discordMember = await getGuildMember(user.id);
  if (!discordMember) return notLoggedIn;

  const roles = discordMember.roles;
  const isAdmin = roles.some((role) => config.adminRoles.includes(role));
  const username = user.username;
  return { loggedIn, isAdmin, username };
};
