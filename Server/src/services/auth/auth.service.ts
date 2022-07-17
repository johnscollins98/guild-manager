import cache from 'memory-cache';
import { Service } from 'typedi';
import { config } from '../../config';
import AuthInfo from '../../models/interfaces/authinfo.interface';
import DiscordMember from '../../models/interfaces/discordmember.interface';
import { DiscordApi } from '../discord/api.discord.service';

const notLoggedIn = {
  loggedIn: false,
  isAdmin: false,
  username: ''
};

@Service()
export class AuthService {
  constructor() {}

  async getUserAuthInfo(user?: Express.User): Promise<AuthInfo> {
    if (!user) return notLoggedIn;

    const loggedIn = true;
    const username = user.username;
    let isAdmin = false;

    try {
      const discordApi = new DiscordApi(user.accessToken, true);
      let guildMemberPromise: Promise<DiscordMember> | null = cache.get('auth-guild-member');
      if (!guildMemberPromise) {
        guildMemberPromise = discordApi.get<DiscordMember>(
          `users/@me/guilds/${config.discordGuildId}/member`
        );
        cache.put('auth-guild-member', guildMemberPromise, 60000);
      }
      const guildMember = await guildMemberPromise;
      isAdmin = guildMember.roles.some(r => config.adminRoles.includes(r));
    } catch {}

    return { loggedIn, isAdmin, username };
  }
}
