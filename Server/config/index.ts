import { getEnvString } from "./env"

export const config = {
  botToken: getEnvString('BOT_TOKEN'),
  discordGuildId: getEnvString('DISCORD_GUILD_ID'),
  gw2apiToken: getEnvString('GW2_API_TOKEN'),
  gw2guildId: getEnvString('GW2_GUILD_ID'),
  adminRole: getEnvString('ADMIN_ROLE'),
  eventLeaderRole: getEnvString('EVENT_LEADER_ROLE')
}