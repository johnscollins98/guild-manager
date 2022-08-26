export const config = {
  backEndBaseUrl: process.env.NODE_ENV === 'production' ? '' : process.env.REACT_APP_BACKEND_BASE_URL || '',
  discordReinviteUrl: process.env.REACT_APP_DISCORD_REINVITE_LINK
};
