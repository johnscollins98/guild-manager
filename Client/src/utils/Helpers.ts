import DiscordRole from '../Interfaces/DiscordRole';
import GW2LogEntry from '../Interfaces/GW2LogEntry';
import MemberRecord from '../Interfaces/MemberRecord';

export const filterDataByString = (data: MemberRecord[], filterString: string): MemberRecord[] => {
  if (!filterString || filterString === '') return data;

  filterString = filterString.toLowerCase();
  return data.filter(
    (o) =>
      o.accountName?.toLowerCase().includes(filterString) ||
      o.discordName?.toLowerCase().includes(filterString)
  );
};

export const filterLogByString = (data: GW2LogEntry[], filterString: string): GW2LogEntry[] => {
  filterString = filterString.toLowerCase();
  return data.filter((entry) => entry.message.toLowerCase().includes(filterString));
};

export const getColorFromRole = (rank: string, discordRoles: DiscordRole[]): string | undefined => {
  const found = discordRoles.find((r) => r.name === rank);
  return found ? `#${found.color.toString(16)}` : undefined;
};
