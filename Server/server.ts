import express, { Request, Response } from 'express';
import 'reflect-metadata';
import cors from 'cors';
import mongoose from 'mongoose';
import session from 'express-session';
import passport from 'passport';
import './strategies/discord.strategy';
import path from 'path';
import discordRoute from './routes/discord';
import gw2Route from './routes/gw2';
import authRoute from './routes/auth';
import eventsRoute from './routes/events';
import { WarningsController } from './routes/warnings';
import { config } from './config';
import { setCache } from './middleware/setCache';
import { createExpressServer, useContainer } from 'routing-controllers';
import Container from 'typedi';

useContainer(Container);

const app = createExpressServer({
  controllers: [WarningsController]
});
app.use(cors());

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

mongoose.connect(config.atlasUri, {
  useNewUrlParser: true,
  useCreateIndex: true,
  useUnifiedTopology: true,
  useFindAndModify: false
});

const connection = mongoose.connection;
connection.once('open', () => {
  console.log('MongoDB database connection established successfully.');
});

app.use(setCache);
app.use('/api/discord', discordRoute);
app.use('/api/gw2', gw2Route);
app.use('/api/events', eventsRoute);
app.use('/auth', authRoute);

const dirs = [__dirname];
if (process.env.NODE_ENV === 'production') {
  dirs.push('..')
}
dirs.push('..', 'Client', 'build')
app.use(express.static(path.join(...dirs)));

app.get('*', (_req: Request, res: Response) => {
  res.redirect('/');
});

app.listen(config.port, () => console.info(`Listening on port ${config.port}`));
