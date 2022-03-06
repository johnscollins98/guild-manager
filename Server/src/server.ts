import express from 'express';
import 'reflect-metadata';
import session from 'express-session';
import passport from 'passport';
import { DiscordStrategySetup } from './services/auth/strategies/discord.strategy';
import path from 'path';
import { config } from './config';
import { useExpressServer, useContainer as rc_useContainer, Action } from 'routing-controllers';
import { Container } from 'typeorm-typedi-extensions';
import { createConnection, useContainer } from 'typeorm';
import { AuthService } from './services/auth/auth.service';

rc_useContainer(Container);
useContainer(Container);

const app = express();
app.use(express.json());

app.use(
  session({
    secret: config.sessionSecret,
    cookie: {
      maxAge: 60000 * 60 * 24 * 30
    },
    resave: true,
    saveUninitialized: false,
    name: 'discord.oauth2'
  })
);
app.use(passport.initialize());
app.use(passport.session());

createConnection({
  type: 'mongodb',
  url: config.atlasUri,
  useNewUrlParser: true,
  useUnifiedTopology: true,
  synchronize: true,
  logging: true,
  entities: [path.join(__dirname, '**', '*.model.{ts,js}')]
}).then(() => {
  console.log('Connected to MongoDB');
  Container.get(DiscordStrategySetup);
});

useExpressServer(app, {
  cors: true,
  controllers: [path.join(__dirname + '/controllers/*.controller.*')],
  authorizationChecker: async (action: Action) => {
    if (!action.request.user) {
      return false;
    }

    const info = await Container.get(AuthService).getUserAuthInfo(action.request.user);
    return info.loggedIn && info.isAdmin;
  },
  currentUserChecker: (action: Action) => action.request.user
});

app.use(express.static(path.join(__dirname, '..', '..', 'Client', 'build')));
app.use('*', (_, res) => {
  if (!res.headersSent) res.redirect('/');
});

app.listen(config.port, () => console.info(`Listening on port ${config.port}`));
