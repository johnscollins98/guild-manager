import PassportDiscord from 'passport-discord';
import passport from 'passport';
import DiscordUser from '../models/user.model';
import { config } from '../config';

const DiscordStrategy = PassportDiscord.Strategy;

passport.serializeUser((user, done) => {
  done(null, user._id);
});

passport.deserializeUser(async (id, done) => {
  const user = await DiscordUser.findById(id);
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
      try {
        const user = await DiscordUser.findOne({ id: profile.id });
        if (user) {
          user.id = profile.id;
          user.username = profile.username;
          const updatedUser = await user.save();
          done(null, updatedUser);
        } else {
          const newUser = await DiscordUser.create({
            id: profile.id,
            username: profile.username,
          });
          const savedUser = await newUser.save();
          done(null, savedUser);
        }
      } catch (err) {
        console.error(err);
        done(err, undefined);
      }
    }
  )
);
