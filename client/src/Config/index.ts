export const config = {
  backEndBaseUrl: import.meta.env.PROD ? '' : import.meta.env.VITE_BACKEND_BASE_URL || '',
  discordReinviteUrl: import.meta.env.VITE_DISCORD_REINVITE_LINK
};
