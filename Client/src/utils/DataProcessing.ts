import { DateTime } from 'luxon';
import DiscordMember from '../Interfaces/DiscordMember';
import GW2Member from '../Interfaces/GW2Member';
import GW2Rank from '../Interfaces/GW2Rank';
import MemberRecord from '../Interfaces/MemberRecord';

export const generateGW2RosterRecords = (
  gw2Members: GW2Member[],
  discordMembers: DiscordMember[],
  ranks: GW2Rank[]
): MemberRecord[] => {
  const sortedGW2Members = gw2Members.sort((a, b) => {
    let value = compareRank(ranks, a.rank, b.rank);
    if (value === 0) {
      const bDate = DateTime.fromISO(b.joined, { zone: 'utc' });
      const aDate = DateTime.fromISO(a.joined, { zone: 'utc' });
      value = aDate.toMillis() - bDate.toMillis();
    }
    return value;
  });

  const records: MemberRecord[] = sortedGW2Members.map((gw2Member) => {
    const accountName = gw2Member.name.split('.')[0];
    const memberId = gw2Member.name;
    const rank = gw2Member.rank;
    const rankImage = ranks.find((r) => r.id === rank)?.icon;
    const joinDate = DateTime.fromISO(gw2Member.joined, { zone: 'utc' });
    const warnings = gw2Member.warnings;

    // special case for unique account name
    const testName = accountName.toLowerCase();

    // check for exact match
    let discordMember = discordMembers.find((m) => {
      const discordName = m.name
        .toLowerCase()
        .replace(
          /([\u2700-\u27BF]|[\uE000-\uF8FF]|\uD83C[\uDC00-\uDFFF]|\uD83D[\uDC00-\uDFFF]|[\u2011-\u26FF]|\uD83E[\uDD10-\uDDFF])/g,
          ''
        ) // strip any emojis
        .trim(); // trim any leading/trailing whitespace (should only be present if they have an emoji at the start)

      return (
        discordName === testName ||
        discordName.includes(`(${testName})`) ||
        discordName === memberId.toLowerCase()
      );
    });

    const discordName = discordMember?.name;
    const nickname = discordMember?.nickname;
    const discordId = discordMember?.id;
    const roles = discordMember?.roles || [];
    const avatar = discordMember?.avatar;

    const missingDiscord = rank !== 'Alt' && !discordName;
    const unmatchingRoles = !!(discordName && rank !== roles[0]?.name);

    return {
      accountName,
      memberId,
      rank,
      rankImage,
      joinDate,
      warnings,
      discordName,
      nickname,
      discordId,
      roles,
      avatar,
      issues: {
        missingDiscord,
        unmatchingRoles
      }
    };
  });

  return records;
};

export const getExcessDiscordRecords = (
  gw2Members: GW2Member[],
  discordMembers: DiscordMember[],
  ranks: GW2Rank[]
): MemberRecord[] => {
  const records = generateGW2RosterRecords(gw2Members, discordMembers, ranks);
  return discordMembers
    .filter((discordMember) => {
      return !records.some((record) => record.discordName === discordMember.name);
    })
    .map((discordMember) => {
      const missingGW2 = !discordMember.roles.find((r) => r.name === 'Guest' || r.name === 'Bots');
      const joinDate = DateTime.fromISO(discordMember.joined, { zone: 'utc' });

      const twentyFourHours = 1000 * 60 * 60 * 24;
      const over24h = missingGW2 && ((DateTime.now().toMillis() - joinDate.toMillis()) > twentyFourHours);

      return {
        accountName: discordMember.name,
        nickname: discordMember.nickname,
        joinDate,
        discordName: discordMember.name,
        discordId: discordMember.id,
        roles: discordMember.roles || [],
        avatar: discordMember.avatar,
        warnings: [],
        issues: {
          missingGW2,
          over24h
        }
      };
    })
    .sort((a, b) => compareRank(ranks, a.roles[0]?.name, b.roles[0]?.name));
};

export const compareRank = (ranks: GW2Rank[], aRank: string, bRank: string): number => {
  ranks.push({ id: 'Guest', order: ranks.length + 1, permissions: [], icon: '' });
  ranks.push({ id: 'Bots', order: ranks.length + 1, permissions: [], icon: '' });

  const aObj = ranks.find((o) => o.id === aRank) || { order: ranks.length };
  const bObj = ranks.find((o) => o.id === bRank) || { order: ranks.length };

  return aObj.order - bObj.order;
};

export const getDateString = (date: DateTime): string => {
  return date.toLocal().toFormat("f (ZZZZ)");
};
