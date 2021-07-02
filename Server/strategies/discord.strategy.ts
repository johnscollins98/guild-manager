import PassportDiscord from 'passport-discord';
import passport from 'passport';
import DiscordUser from '../models/user.model';

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

if (!process.env.DISCORD_CLIENT_ID) throw 'Must provide DISCORD_CLIENT_ID';
if (!process.env.DISCORD_CLIENT_SECRET) throw 'Must provide DISCORD_CLIENT_SECRET';
if (!process.env.DISCORD_AUTH_REDIRECT) throw 'Must provide DISCORD_AUTH_REDIRECT';

passport.use(
  new DiscordStrategy(
    {
      clientID: process.env.DISCORD_CLIENT_ID,
      clientSecret: process.env.DISCORD_CLIENT_SECRET,
      callbackURL: process.env.DISCORD_AUTH_REDIRECT,
      scope: ['identify', 'guilds']
    },
    async (_accessToken, _refreshToken, profile, done) => {
      try {
        const user = await DiscordUser.findOne({ id: profile.id });
        if (user) {
          user.id = profile.id;
          user.username = profile.username;
          user.guilds = profile.guilds;
          const updatedUser = await user.save();
          done(null, updatedUser);
        } else {
          const newUser = await DiscordUser.create({
            id: profile.id,
            username: profile.username,
            guilds: profile.guilds
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
