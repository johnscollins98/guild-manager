import { DateTime } from 'luxon';
import { type DiscordMemberDTO, type GW2Rank, type LateLogDto, type WarningDTO } from 'server';
import { type GW2MemberResponseDTO } from 'server/src/dtos/gw2/gw2-member-response-dto';
import type MemberRecord from '../interfaces/member-record';

export const generateGW2RosterRecords = (
  gw2Members: GW2MemberResponseDTO[],
  discordMembers: DiscordMemberDTO[],
  ranks: GW2Rank[],
  warnings: WarningDTO[],
  lateLog: LateLogDto[]
): MemberRecord[] => {
  const records: MemberRecord[] = gw2Members
    .map(gw2Member => {
      // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
      const accountName = gw2Member.name.split('.')[0]!;
      const memberId = gw2Member.name;
      const rank = gw2Member.rank;
      const rankImage = ranks.find(r => r.id === rank)?.icon;
      const joinDate = DateTime.fromISO(gw2Member.joined, { zone: 'utc' });

      const testName = accountName.toLowerCase();

      // check for exact match
      const discordMember = discordMembers.find(m => {
        if (gw2Member.discordId && m.id === gw2Member.discordId) {
          return true;
        }

        const discordName = m.name
          ?.normalize('NFKC')
          .toLowerCase()
          .replace(
            /(\u00a9|\u00ae|[\u2000-\u3300]|\ud83c[\ud000-\udfff]|\ud83d[\ud000-\udfff]|\ud83e[\ud000-\udfff])/g,
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

      // this is probably already sorted this way but just incase
      const roles = discordMember?.roles?.sort((a, b) => b.position - a.position) || [];

      const avatar = discordMember?.avatar;
      const warningsForThisMember = discordId
        ? warnings.filter(warning => warning.givenTo === discordId)
        : [];
      const lateLogEntries = discordId ? lateLog.filter(entry => entry.givenTo === discordId) : [];

      const missingDiscord = !discordName;
      const unmatchingRoles = !!discordName && roles[0]?.name?.toLowerCase() !== rank.toLowerCase();

      const invited = rank.toLowerCase() === 'invited';

      const twentyFourHours = 1000 * 60 * 60 * 24;
      const oneWeek = twentyFourHours * 7;
      const overAWeek = invited && DateTime.now().diff(joinDate).toMillis() > oneWeek;

      return {
        accountName,
        memberId,
        rank,
        rankImage,
        joinDate,
        warnings: warningsForThisMember,
        lateLog: lateLogEntries,
        discordName,
        nickname,
        discordId,
        roles,
        avatar,
        issues: {
          missingDiscord,
          unmatchingRoles,
          invited,
          overAWeek
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
  gw2Members: GW2MemberResponseDTO[],
  discordMembers: DiscordMemberDTO[],
  ranks: GW2Rank[],
  warnings: WarningDTO[],
  lateLog: LateLogDto[]
): MemberRecord[] => {
  const records = generateGW2RosterRecords(gw2Members, discordMembers, ranks, warnings, lateLog);
  return discordMembers
    .filter(discordMember => {
      return !records.some(record => record.discordName === discordMember.name);
    })
    .map(discordMember => {
      const missingGW2 = !discordMember.roles.find(r => r.name === 'Bots');
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
        warnings: warnings.filter(w => w.givenTo === discordMember.id),
        lateLog: lateLog.filter(e => e.givenTo === discordMember.id),
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
