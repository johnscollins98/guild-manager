import passport from 'passport';
import PassportDiscord, { Profile } from 'passport-discord';
import OAuth2Strategy from 'passport-oauth2';
import { Service } from 'typedi';
import { config } from '../../../config';
import { User } from '../../../models/user.model';
import { UserRepository } from '../../repositories/user.repository';

const DiscordStrategy = PassportDiscord.Strategy;

@Service()
export class DiscordStrategySetup {
  constructor(userRepository: UserRepository) {
    passport.serializeUser((user, done) => {
      done(null, user._id);
    });

    passport.deserializeUser(async (id, done) => {
      const user = await userRepository.getById(id as string);

      // return false if access token has expired
      if (user) {
        const currentDate = Date.now();
        if (!user.expires || currentDate >= user.expires.getTime()) {
          return done(null, false);
        }
      }

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
        async (
          accessToken: string,
          _refreshToken: string,
          params: { expires_in: number },
          profile: Profile,
          done: OAuth2Strategy.VerifyCallback
        ) => {
          try {
            const userToSave = new User();
            userToSave.id = profile.id;
            userToSave.username = profile.username;
            userToSave.accessToken = accessToken;
            userToSave.expires = new Date(Date.now() + params.expires_in * 1000);

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
