declare namespace NodeJS {
  interface ProcessEnv {
    BOT_TOKEN: string;
    DISCORD_GUILD_ID: string;
    GW2_GUILD_ID: string;
    GW2_API_TOKEN: string;
    PORT: string;
    ATLAS_URI: string;
    DISCORD_CLIENT_ID: string;
    DISCORD_CLIENT_SECRET: string;
    DISCORD_AUTH_REDIRECT: string;
    ADMIN_ROLE: string;
    SESSION_SECRET: string;
    FRONT_END_BASE_URL: string;
  }
}