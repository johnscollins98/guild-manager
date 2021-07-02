require('dotenv').config();
import express from 'express';
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

const app = express();
app.use(cors());

const port = process.env.PORT || 5000;

app.use(express.json());

if (!process.env.SESSION_SECRET) throw 'Must provide SESSION_SECRET';
app.use(
  session({
    secret: process.env.SESSION_SECRET,
    cookie: {
      maxAge: 60000 * 60 * 24
    },
    resave: true,
    saveUninitialized: false,
    name: 'discord.oauth2'
  })
);
app.use(passport.initialize());
app.use(passport.session());

if (!process.env.ATLAS_URI) throw 'Must provide ATLAS_URI';
const uri = process.env.ATLAS_URI;
mongoose.connect(uri, {
  useNewUrlParser: true,
  useCreateIndex: true,
  useUnifiedTopology: true,
  useFindAndModify: false
});

const connection = mongoose.connection;
connection.once('open', () => {
  console.log('MongoDB database connection established successfully.');
});

app.use('/api/discord', discordRoute);
app.use('/api/gw2', gw2Route);
app.use('/api/events', eventsRoute);
app.use('/auth', authRoute);

let dirs = [__dirname];
if (process.env.NODE_ENV == 'production') {
  dirs = [...dirs, '..'];
}
dirs = [...dirs, '..', 'Client', 'build'];
app.use(express.static(path.join(...dirs)));

app.get('*', (_, res) => {
  res.redirect('/');
});

app.listen(port, () => console.info(`Listening on port ${port}`));
