import { type DiscordMemberDTO, type DiscordRole, type DiscordUser } from 'server';

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

export const getUserAvatar = (
  member: DiscordMemberDTO | undefined,
  user: DiscordUser | undefined
) => {
  const id = member?.id || user?.id;
  const avatar = member?.avatar || user?.avatar;

  return id && avatar
    ? `https://cdn.discordapp.com/avatars/${id}/${avatar}.png`
    : 'https://cdn.discordapp.com/embed/avatars/0.png';
};

export const getUserName = (
  member: DiscordMemberDTO | undefined,
  user: DiscordUser | undefined
) => {
  if (member?.nickname) return member.nickname;
  if (member?.name) return member.name;
  if (user?.username) return user.username;
  if (user?.global_name) return user.global_name;
  return 'Unknown User';
};
