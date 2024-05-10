import { DateTime } from 'luxon';
import { FormattedDiscordMember, GW2Member, GW2Rank, WarningDTO } from 'server';
import MemberRecord from '../interfaces/member-record';

export const generateGW2RosterRecords = (
  gw2Members: GW2Member[],
  discordMembers: FormattedDiscordMember[],
  ranks: GW2Rank[],
  warnings: WarningDTO[]
): MemberRecord[] => {
  const records: MemberRecord[] = gw2Members
    .map(gw2Member => {
      // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
      const accountName = gw2Member.name.split('.')[0]!;
      const memberId = gw2Member.name;
      const rank = gw2Member.rank;
      const rankImage = ranks.find(r => r.id === rank)?.icon;
      const joinDate = DateTime.fromISO(gw2Member.joined, { zone: 'utc' });
      const warningsForThisMember = warnings.filter(warning => warning.givenTo === memberId);

      // special case for unique account name
      const exceptions: { [key: string]: string } = {
        Zerumii: 'Zerumi'
      };
      const exception = exceptions[accountName];
      const testName = exception ? exception.toLowerCase() : accountName.toLowerCase();

      // check for exact match
      const discordMember = discordMembers.find(m => {
        const discordName = m.name
          ?.toLowerCase()
          .replace(
            /([\u2700-\u27BF]|[\uE000-\uF8FF]|\uD83C[\uDC00-\uDFFF]|\uD83D[\uDC00-\uDFFF]|[\u2011-\u26FF]|\uD83E[\uDD10-\uDDFF])/g,
            ''
          ) // strip any emojis
          .trim(); // trim any leading/trailing whitespace (should only be present if they have an emoji at the start)

        return (
          discordName === testName ||
          discordName?.includes(`(${testName})`) ||
          discordName === memberId.toLowerCase()
        );
      });

      const discordName = discordMember?.name;
      const nickname = discordMember?.nickname;
      const discordId = discordMember?.id;
      const roles = discordMember?.roles || [];
      const avatar = discordMember?.avatar;

      const missingDiscord = rank !== 'Alt' && !discordName;
      const unmatchingRoles =
        rank !== 'Alt' && !!discordName && rank.toLowerCase() !== roles[0]?.name.toLowerCase();
      const invited = rank.toLowerCase() === 'invited';

      return {
        accountName,
        memberId,
        rank,
        rankImage,
        joinDate,
        warnings: warningsForThisMember,
        discordName,
        nickname,
        discordId,
        roles,
        avatar,
        issues: {
          missingDiscord,
          unmatchingRoles,
          invited
        }
      };
    })
    .sort((a, b) => {
      let value = 0;
      if (a.rank && b.rank) value = compareRank(ranks, a.rank, b.rank);
      if (value === 0) {
        value = a.joinDate.diff(b.joinDate).toMillis();
      }
      return value;
    });

  return records;
};

export const getExcessDiscordRecords = (
  gw2Members: GW2Member[],
  discordMembers: FormattedDiscordMember[],
  ranks: GW2Rank[],
  warnings: WarningDTO[]
): MemberRecord[] => {
  const records = generateGW2RosterRecords(gw2Members, discordMembers, ranks, warnings);
  return discordMembers
    .filter(discordMember => {
      return !records.some(record => record.discordName === discordMember.name);
    })
    .map(discordMember => {
      const missingGW2 = !discordMember.roles.find(r => r.name === 'Guest' || r.name === 'Bots');
      const joinDate = DateTime.fromISO(discordMember.joined, { zone: 'utc' });

      const twentyFourHours = 1000 * 60 * 60 * 24;
      const over24h = missingGW2 && DateTime.now().diff(joinDate).toMillis() > twentyFourHours;

      return {
        accountName: discordMember.name ?? 'Unknown',
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

export const compareRank = (
  ranks: GW2Rank[],
  aRank: string | undefined,
  bRank: string | undefined
): number => {
  ranks.push({ id: 'Guest', order: ranks.length + 1, permissions: [], icon: '' });
  ranks.push({ id: 'Bots', order: ranks.length + 1, permissions: [], icon: '' });

  const aObj = ranks.find(o => o.id === aRank) || { order: ranks.length };
  const bObj = ranks.find(o => o.id === bRank) || { order: ranks.length };

  return aObj.order - bObj.order;
};

export const getDateString = (date: DateTime): string => {
  return date.toLocal().toFormat('yyyy/LL/dd, HH:mm (ZZZZ)');
};
