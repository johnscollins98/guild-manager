import Container, { Service } from 'typedi';
import { config } from '../../config';
import { AuthInfo } from '../../dtos';
import { DiscordGuildApi } from '../discord/guild-api';

const notLoggedIn = {
  loggedIn: false,
  isAdmin: false,
  username: ''
};

const skipAuth = {
  loggedIn: true,
  isAdmin: true,
  username: 'dev'
};

@Service()
export class AuthService {
  constructor() {}

  async getUserAuthInfo(user?: Express.User): Promise<AuthInfo> {
    if (process.env.NODE_ENV === 'development' && config.skipAuth) {
      return skipAuth;
    }

    if (!user) return notLoggedIn;

    const loggedIn = true;
    const username = user.username;
    let isAdmin = false;

    try {
      const guildApi = Container.get(DiscordGuildApi);
      const guildMember = await guildApi.getMemberById(user.id);
      isAdmin = !!guildMember && guildMember.roles.some(r => config.adminRoles.includes(r));
    } catch (err) {
      console.error(err);
    }

    return { loggedIn, isAdmin, username };
  }
}
