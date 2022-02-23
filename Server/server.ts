import express from 'express';
import 'reflect-metadata';
import session from 'express-session';
import passport from 'passport';
import './strategies/discord.strategy';
import path from 'path';
import discordRoute from './routes/discord.route';
import gw2Route from './routes/gw2.route';
import authRoute from './routes/auth.route';
import eventsRoute from './routes/events.route';
import { WarningsController } from './routes/warnings.controller';
import { config } from './config';
import { setCache } from './middleware/setcache.middleware';
import { useContainer, useExpressServer } from 'routing-controllers';
import Container from 'typedi';
import { createConnection } from 'typeorm';

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
  entities: ['./models/*.*']
}).then(() => console.log('Connected to MongoDB'));

app.use(setCache);
app.use('/api/discord', discordRoute);
app.use('/api/gw2', gw2Route);
app.use('/api/events', eventsRoute);
app.use('/auth', authRoute);

useExpressServer(app, {
  cors: true,
  controllers: [WarningsController]
});

const dirs = [__dirname];
if (process.env.NODE_ENV === 'production') {
  dirs.push('..');
}
dirs.push('..', 'Client', 'build');
app.use(express.static(path.join(...dirs)));

app.listen(config.port, () => console.info(`Listening on port ${config.port}`));
