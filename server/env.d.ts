declare namespace NodeJS {
  interface ProcessEnv {
    BOT_TOKEN: string;
    DISCORD_GUILD_ID: string;
    GW2_GUILD_ID: string;
    GW2_API_TOKEN: string;
    PORT: string;
    DATABASE_URL: string;
    DISCORD_CLIENT_ID: string;
    DISCORD_CLIENT_SECRET: string;
    DISCORD_AUTH_REDIRECT: string;
    ADMIN_ROLES: string;
    EVENT_ROLES: string;
    SESSION_SECRET: string;
    ACCESS_TOKEN_ENCRYPTION_KEY: string;
    FRONT_END_BASE_URL: string;
    NODE_ENV: string;
    SKIP_AUTH: string;
    EVENT_UPDATE_INTERVAL_HOURS?: string;
  }
}
