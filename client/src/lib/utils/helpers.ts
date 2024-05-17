import { type DiscordRole } from 'server';

export const getColorFromRole = (
  rank: string | undefined,
  discordRoles: DiscordRole[]
): string | undefined => {
  const found = discordRoles.find(r => r.name.toLowerCase() === rank?.toLowerCase());
  return found ? `#${found.color.toString(16)}` : undefined;
};

export const snowflakeToDate = (snowflake: string): Date => {
  const snowflakeAsInt = BigInt(snowflake);
  const discordTimestamp = snowflakeAsInt >> BigInt(22);
  const unixTimestamp = discordTimestamp + BigInt(1420070400000);
  return new Date(Number(unixTimestamp));
};
