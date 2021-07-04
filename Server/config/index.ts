import dotenv from 'dotenv'

let _loaded = false

const loadEnv = () => {
  if (!_loaded) {
    dotenv.config()
    _loaded = true
  }
}

loadEnv()

export const config = {
  botToken: process.env.BOT_TOKEN,
  discordGuildId: process.env.DISCORD_GUILD_ID,
  gw2guildId: process.env.GW2_GUILD_ID,
  gw2apiToken: process.env.GW2_API_TOKEN,
  port: process.env.PORT ? parseInt(process.env.PORT) : 5000,
  atlasUri: process.env.ATLAS_URI,
  discordClientId: process.env.DISCORD_CLIENT_ID,
  discordClientSecret: process.env.DISCORD_CLIENT_SECRET,
  discordAuthRedirect: process.env.DISCORD_AUTH_REDIRECT,
  adminRole: process.env.ADMIN_ROLE,
  eventLeaderRole: process.env.EVENT_LEADER_ROLE,
  sessionSecret: process.env.SESSION_SECRET,
  frontEndBaseUrl: process.env.FRONT_END_BASE_URL || '',
}

