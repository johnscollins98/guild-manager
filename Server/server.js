require('dotenv').config();
const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');
const session = require('express-session');
const passport = require('passport');
const discordStrategy = require('./strategies/discord.strategy');
const path = require('path');
const app = express();
app.use(cors());

const port = process.env.PORT || 5000;

app.use(express.json());
app.use(
  session({
    secret: 'some random secret',
    cookie: {
      maxAge: 60000 * 60 * 24,
    },
    resave: true,
    saveUninitialized: false,
    name: 'discord.oauth2',
  })
);
app.use(passport.initialize());
app.use(passport.session());

const uri = process.env.ATLAS_URI;
mongoose.connect(uri, {
  useNewUrlParser: true,
  useCreateIndex: true,
  useUnifiedTopology: true,
  useFindAndModify: false,
});

const connection = mongoose.connection;
connection.once('open', () => {
  console.log('MongoDB database connection established successfully.');
});

const discordRoute = require('./routes/discord');
const gw2Route = require('./routes/gw2');
const authRoute = require('./routes/auth');
const eventsRoute = require('./routes/events');
const forbiddenRoute = require('./routes/forbidden');
const { getUserAuthInfo } = require('./utils/auth');

app.use('/api/discord', discordRoute);
app.use('/api/gw2', gw2Route);
app.use('/api/events', eventsRoute);
app.use('/auth', authRoute);
app.use('/forbidden', forbiddenRoute);
app.use(async (req, res, next) => {
  if (req.user) {
    const authInfo = await getUserAuthInfo(req);
    if (authInfo.isAdmin || authInfo.isEventLeader) {
      next();
    } else {
      res.redirect('/forbidden');
    }
  } else {
    res.redirect('/auth');
  }
});
app.use(express.static(path.join(__dirname, '..', 'build')));

app.get('*', (req, res) => {
  res.redirect('/');
});

app.listen(port, () => console.info(`Listening on port ${port}`));
