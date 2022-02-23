import PassportDiscord from 'passport-discord';
import passport from 'passport';
import { User } from '../models/user.model';
import { config } from '../config';
import { getRepository } from 'typeorm';

const DiscordStrategy = PassportDiscord.Strategy;

passport.serializeUser((user, done) => {
  done(null, user._id);
});

passport.deserializeUser(async (id, done) => {
  const userRepository = getRepository(User);
  const user = await userRepository.findOne(id as string);
  if (user) {
    done(null, user);
  }
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
      const userRepository = getRepository(User);
      try {
        const user = await userRepository.findOne({ id: profile.id });
        if (user) {
          user.id = profile.id;
          user.username = profile.username;
          await userRepository.update(user._id, user);
          const updatedUser = await userRepository.findOne(user._id);
          done(null, updatedUser);
        } else {
          const userToSave = new User();
          userToSave.id = profile.id;
          userToSave.username = profile.username;
          const newUser = await userRepository.save(userToSave);
          done(null, newUser);
        }
      } catch (err) {
        console.error(err);
        done(err, undefined);
      }
    }
  )
);
