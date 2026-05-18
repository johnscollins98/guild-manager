import cookieParser from 'cookie-parser';
import express from 'express';
import session from 'express-session';
import passport from 'passport';
import path from 'path';
import 'reflect-metadata';
import { Action, useContainer as rc_useContainer, useExpressServer } from 'routing-controllers';
import { Container } from 'typeorm-typedi-extensions';
import { init as initAxiosLogger } from './axios-logger';
import { config } from './config';
import { dataSource } from './dataSource';
import { DiscordBot } from './discord-bot/discord-bot';
import { Permission } from './dtos';
import { CustomErrorHandler } from './middleware/error-handler';
import { JWTMiddleware } from './middleware/jwt-middleware';
import { AuthService } from './services/auth/auth-service';
import { DiscordStrategySetup } from './services/auth/strategies/discord-strategy-setup';
import { EventUpdater } from './services/discord/event-updater';

rc_useContainer(Container);

initAxiosLogger();

const app = express();
app.use(express.json());
app.use(cookieParser());

// Use in-memory session store for PKCE state management only
app.use(
  session({
    secret: config.sessionSecret,
    cookie: {
      maxAge: 60000 * 10, // 10 minutes for PKCE state
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax'
    },
    resave: false,
    saveUninitialized: false,
    name: 'pkce.state',
    store: new session.MemoryStore()
  })
);
app.use(passport.initialize());

useExpressServer(app, {
  cors: true,
  controllers: [path.join(__dirname + '/controllers/*-controller.*')],
  defaultErrorHandler: false,
  middlewares: [JWTMiddleware, CustomErrorHandler],
  authorizationChecker: async (action: Action, roles: Permission[]) => {
    if (process.env.NODE_ENV === 'development' && config.skipAuth) {
      return true;
    }

    if (!action.request.user) {
      return false;
    }

    return await Container.get(AuthService).checkPermissionsWithId(action.request.user.id, roles);
  },
  currentUserChecker: (action: Action) => action.request.user
});

app.use(express.static(path.join(__dirname, '..', '..', 'client', 'dist')));
app.get('/api/*', (_req, res) => {
  if (!res.headersSent) {
    res.sendStatus(404);
  }
});
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

  console.log(`Setup event updater to run every ${config.eventUpdateIntervalHours} hours.`);
  Container.get(EventUpdater).updateEventsEvery(1000 * 60 * 60 * config.eventUpdateIntervalHours);

  const discordBot = Container.get(DiscordBot);
  discordBot.init();

  app.listen(config.port, () => console.info(`Listening on port ${config.port}`));
});
