import { Service } from 'typedi';
import { config } from '../../config';
import AuthInfo from '../../models/interfaces/authinfo.interface';
import { DiscordGuildApi } from '../discord/guildapi.discord.service';

const notLoggedIn = {
  loggedIn: false,
  isAdmin: false,
  username: ''
};

@Service()
export class AuthService {
  constructor(private readonly discordGuildApi: DiscordGuildApi) {}

  async getUserAuthInfo(user?: Express.User): Promise<AuthInfo> {
    if (!user) return notLoggedIn;
    const loggedIn = true;
    const discordMember = await this.discordGuildApi.getMemberById(user.id);
    if (!discordMember) return notLoggedIn;

    const roles = discordMember.roles;
    const isAdmin = roles.some(role => config.adminRoles.includes(role));
    const username = user.username;
    return { loggedIn, isAdmin, username };
  }
}
