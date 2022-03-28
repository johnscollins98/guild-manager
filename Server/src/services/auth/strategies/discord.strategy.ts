import PassportDiscord from 'passport-discord';
import passport from 'passport';
import { User } from '../../../models/user.model';
import { config } from '../../../config';
import { UserRepository } from '../../repositories/user.repository';
import { Service } from 'typedi';
import { DiscordApi } from '../../discord/api.discord.service';
import DiscordMember from '../../../models/interfaces/discordmember.interface';

const DiscordStrategy = PassportDiscord.Strategy;

@Service()
export class DiscordStrategySetup {
  constructor(userRepository: UserRepository) {
    passport.serializeUser((user, done) => {
      done(null, user._id);
    });

    passport.deserializeUser(async (id, done) => {
      const user = await userRepository.getById(id as string);
      done(null, user);
    });

    passport.use(
      new DiscordStrategy(
        {
          clientID: config.discordClientId,
          clientSecret: config.discordClientSecret,
          callbackURL: config.discordAuthRedirect,
          scope: ['identify', 'guilds.members.read']
        },
        async (_accessToken, _refreshToken, profile, done) => {
          try {
            const discordApi = new DiscordApi(_accessToken, true);
            let inGuild = false;
            let isAdmin = false;

            try {
              const guildMember = await discordApi.get<DiscordMember>(
                `users/@me/guilds/${config.discordGuildId}/member`
              );
              inGuild = true;
              isAdmin = guildMember.roles.some(r => config.adminRoles.includes(r));
            } catch (err) {} // they're not in the guild

            const userToSave = new User();
            userToSave.id = profile.id;
            userToSave.username = profile.username;
            userToSave.isAdmin = isAdmin;
            userToSave.inGuild = inGuild;
            let user = await userRepository.getByGuildId(profile.id);
            if (user) {
              user = await userRepository.update(user._id.toString(), userToSave);
            } else {
              user = await userRepository.create(userToSave);
            }
            done(null, user);
          } catch (err) {
            console.error(err);
            done(err, undefined);
          }
        }
      )
    );
  }
}
