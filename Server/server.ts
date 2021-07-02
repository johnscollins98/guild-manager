require('dotenv').config();
import express from 'express';
import cors from 'cors';
import mongoose from 'mongoose';
import session from 'express-session';
import passport from 'passport';
import './strategies/discord.strategy';
import path from 'path';
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

// TODO: swap to imports after completing other files
const discordRoute = require('./routes/discord');
const gw2Route = require('./routes/gw2');
const authRoute = require('./routes/auth');
const eventsRoute = require('./routes/events');

app.use('/api/discord', discordRoute);
app.use('/api/gw2', gw2Route);
app.use('/api/events', eventsRoute);
app.use('/auth', authRoute);

app.use(express.static(path.join(__dirname, '..', 'Client', 'build')));

app.get('*', (_, res) => {
  res.redirect('/');
});

app.listen(port, () => console.info(`Listening on port ${port}`));
