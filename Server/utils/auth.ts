import AuthInfo from '../interfaces/AuthInfo';
import { config } from '../config';
import { getGuildMember } from './discord';

const notLoggedIn = {
  loggedIn: false,
  isAdmin: false,
  username: ''
};

export const getUserAuthInfo = async (req: Express.Request): Promise<AuthInfo> => {
  if (!req.user) return notLoggedIn;
  const loggedIn = true;
  const discordMember = await getGuildMember(req.user.id);
  if (!discordMember) return notLoggedIn;

  const roles = discordMember.roles;
  const isAdmin = roles.some((role) => config.adminRoles.includes(role));
  const username = req.user.username;
  return { loggedIn, isAdmin, username };
};
