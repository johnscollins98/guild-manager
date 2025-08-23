import dotenv from 'dotenv';

let _loaded = false;

const loadEnv = () => {
  if (!_loaded) {
    dotenv.config();
    _loaded = true;
  }
};

loadEnv();

const eventUpdateIntervalHours = parseFloat(process.env.EVENT_UPDATE_INTERVAL_HOURS ?? '');

export const config = {
  botToken: process.env.BOT_TOKEN,
  discordGuildId: process.env.DISCORD_GUILD_ID,
  gw2guildId: process.env.GW2_GUILD_ID,
  gw2apiToken: process.env.GW2_API_TOKEN,
  port: process.env.PORT ?? 3000,
  databaseUrl: process.env.DATABASE_URL,
  discordClientId: process.env.DISCORD_CLIENT_ID,
  discordClientSecret: process.env.DISCORD_CLIENT_SECRET,
  discordAuthRedirect: process.env.DISCORD_AUTH_REDIRECT,
  accessRoles: process.env.AUTH_ACCESS?.split(',') ?? [],
  welcomeChannelId: process.env.WELCOME_CHANNEL_ID,
  leaversChannelId: process.env.LEAVERS_CHANNEL_ID,
  recruitmentRoleId: process.env.RECRUITMENT_ROLE_ID,
  pendingRoleId: process.env.PENDING_ROLE_ID,
  manageEventsRoles: process.env.AUTH_MANAGE_EVENTS?.split(',') ?? [],
  manageMembersRoles: process.env.AUTH_MANAGE_MEMBERS?.split(',') ?? [],
  manageWarningsRoles: process.env.AUTH_MANAGE_WARNINGS?.split(',') ?? [],
  manageRecruitmentRoles: process.env.AUTH_MANAGE_RECRUITMENT?.split(',') ?? [],
  eventRoles: process.env.EVENT_ROLES?.split(',') ?? [],
  sessionSecret: process.env.SESSION_SECRET,
  frontEndBaseUrl:
    process.env.NODE_ENV === 'production'
      ? ''
      : (process.env.FRONT_END_BASE_URL ?? 'http://localhost:3001'),
  skipAuth: process.env.SKIP_AUTH === 'true',
  eventUpdateIntervalHours: Number.isNaN(eventUpdateIntervalHours) ? 6 : eventUpdateIntervalHours
} as const;
