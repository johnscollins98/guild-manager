import passport from 'passport';
import PassportDiscord, { Profile } from 'passport-discord';
import OAuth2Strategy from 'passport-oauth2';
import { Service } from 'typedi';
import { config } from '../../../config';
import { SymmetricEncryption } from '../encryption-service';

const DiscordStrategy = PassportDiscord.Strategy;

@Service()
export class DiscordStrategySetup {
  constructor(symmetricEncryption: SymmetricEncryption) {
    passport.serializeUser((user, done) => {
      done(null, user);
    });

    passport.deserializeUser(async (user: Express.User, done) => {
      // return false if access token has expired
      if (user) {
        const currentDate = Date.now();
        user.expires = new Date(user.expires);
        if (!user.expires || currentDate >= user.expires.getTime()) {
          console.error('User access token has expired');
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
            const user: Express.User = {
              id: profile.id,
              username: profile.username,
              accessToken: symmetricEncryption.encrypt(accessToken),
              expires: new Date(Date.now() + params.expires_in * 1000)
            };

            done(null, user);
          } catch (err) {
            console.error(err);
            done(err instanceof Error ? err : null, undefined);
          }
        }
      )
    );
  }
}

