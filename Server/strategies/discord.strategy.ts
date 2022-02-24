import PassportDiscord from 'passport-discord';
import passport from 'passport';
import { User } from '../models/user.model';
import { config } from '../config';
import { Container } from 'typeorm-typedi-extensions';
import { UserRepository } from '../services/repositories/user.repository';

const DiscordStrategy = PassportDiscord.Strategy;

passport.serializeUser((user, done) => {
  done(null, user._id);
});

passport.deserializeUser(async (id, done) => {
  const userRepository = Container.get(UserRepository);
  const user = await userRepository.getById(id as string);
  done(null, user);
});

passport.use(
  new DiscordStrategy(
    {
      clientID: config.discordClientId,
      clientSecret: config.discordClientSecret,
      callbackURL: config.discordAuthRedirect,
      scope: ['identify']
    },
    async (_accessToken, _refreshToken, profile, done) => {
      const userRepository = Container.get(UserRepository);
      try {
        const userToSave = new User();
        userToSave.id = profile.id;
        userToSave.username = profile.username;
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
