import DiscordRole from '../Interfaces/DiscordRole';
import GW2LogEntry from '../Interfaces/GW2LogEntry';
import MemberRecord from '../Interfaces/MemberRecord';

export const isPromotionRequired = (
  rank: string,
  dateString: string,
  eventsAttended: number
): boolean => {
  const date = new Date(dateString);
  const diffMilliseconds = Math.abs(Date.now() - date.valueOf());
  const diffDays = Math.floor(diffMilliseconds / (1000 * 60 * 60 * 24));
  if (rank === 'Second Spear') {
    return diffDays >= 14;
  } else if (rank === 'First Spear') {
    const pointThreshold = 25; // approx 1 event per week for 6 months
    const daysThreshold = 180; // approx 6 months
    return eventsAttended >= pointThreshold && diffDays >= daysThreshold;
  } else {
    return false;
  }
};

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
