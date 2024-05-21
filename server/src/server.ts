import PgConnection from 'connect-pg-simple';
import { Client, GatewayIntentBits, Partials } from 'discord.js';
import express from 'express';
import session from 'express-session';
import passport from 'passport';
import path from 'path';
import 'reflect-metadata';
import { Action, useContainer as rc_useContainer, useExpressServer } from 'routing-controllers';
import { Container } from 'typeorm-typedi-extensions';
import { config } from './config';
import { dataSource } from './dataSource';
import { AuthService } from './services/auth/auth-service';
import { DiscordStrategySetup } from './services/auth/strategies/discord-strategy';
import { MemberLeftRepository } from './services/repositories/member-left-repository';

rc_useContainer(Container);

const app = express();
app.use(express.json());

const DBStore = PgConnection(session);

const store =
  process.env.NODE_ENV === 'production'
    ? new DBStore({
        conString: config.databaseUrl,
        createTableIfMissing: true
      })
    : undefined;

app.use(
  session({
    secret: config.sessionSecret,
    cookie: {
      maxAge: 60000 * 60 * 24 * 7
    },
    resave: true,
    saveUninitialized: false,
    name: 'discord.oauth2',
    store
  })
);
app.use(passport.initialize());
app.use(passport.session());

useExpressServer(app, {
  cors: true,
  controllers: [path.join(__dirname + '/controllers/*-controller.*')],
  authorizationChecker: async (action: Action) => {
    if (process.env.NODE_ENV === 'development' && config.skipAuth) {
      return true;
    }

    if (!action.request.user) {
      return false;
    }

    const info = await Container.get(AuthService).getUserAuthInfo(action.request.user);
    return info.loggedIn && info.isAdmin;
  },
  currentUserChecker: (action: Action) => action.request.user
});

app.use(express.static(path.join(__dirname, '..', '..', 'client', 'dist')));
app.get('*', (_req, res) => {
  if (!res.headersSent) {
    res.sendFile(path.resolve(__dirname, '..', '..', 'client', 'dist', 'index.html'));
  }
});

export const Manager = dataSource.manager;

dataSource.initialize().then(() => {
  console.log('Connected to Postgres');

  if (!(process.env.NODE_ENV === 'development' && config.skipAuth)) {
    Container.get(DiscordStrategySetup);
  }
  app.listen(config.port, () => console.info(`Listening on port ${config.port}`));
});

// Bot listening to member leaving to save to DB
const client = new Client({
  intents: [GatewayIntentBits.GuildPresences, GatewayIntentBits.GuildMembers],
  partials: [Partials.GuildMember]
});

client.on('ready', () => console.log('Bot listening'));

client.on('guildMemberRemove', async m => {
  const memberLeftRepo = Container.get(MemberLeftRepository);
  console.log(`Logging ${m.displayName} left`);
  memberLeftRepo.create({
    displayName: m.displayName,
    nickname: m.nickname ?? undefined,
    username: m.user.username,
    userDisplayName: m.user.displayName,
    globalName: m.user.globalName ?? undefined,
    time: new Date()
  });
});

client.login(config.botToken);
