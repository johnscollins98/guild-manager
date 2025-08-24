import { DateTime } from 'luxon';
import { type DiscordMemberDTO, type GW2Rank, type WarningDTO } from 'server';
import { type GW2MemberResponseDTO } from 'server/src/dtos/gw2/gw2-member-response-dto';
import type MemberRecord from '../interfaces/member-record';
import { getUserAvatar } from './helpers';

export const generateGW2RosterRecords = (
  gw2Members: GW2MemberResponseDTO[],
  discordMembers: DiscordMemberDTO[],
  ranks: GW2Rank[],
  warnings: WarningDTO[]
): MemberRecord[] => {
  const discordNames = discordMembers.map(d => ({
    id: d.id,
    name: d.name
      ?.normalize('NFKC')
      .replace(
        /(\u00a9|\u00ae|[\u2000-\u3300]|\ud83c[\ud000-\udfff]|\ud83d[\ud000-\udfff]|\ud83e[\ud000-\udfff])/g,
        ''
      )
  }));

  const records: MemberRecord[] = gw2Members.map(gw2Member => {
    // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
    const accountName = gw2Member.name.split('.')[0]!;
    const memberId = gw2Member.name;
    const rank = gw2Member.rank;
    const rankImage = ranks.find(r => r.id === rank)?.icon;
    const joinDate = DateTime.fromISO(gw2Member.joined, { zone: 'utc' });

    const testName = accountName.toLowerCase();
    // Name or Name.1234 but cannot be directly next to another alphabetical character
    const regex = new RegExp(`(?:^|[^a-z])(${testName})(?:$|[^a-z])`, 'ig');

    // check for exact match
    const discordMemberIndex = discordNames.findIndex(m => {
      if (gw2Member.discordId) {
        return gw2Member.discordId === m.id;
      }

      return m.name?.match(regex);
    });

    const discordMember = discordMembers[discordMemberIndex];

    const discordName = discordMember?.name;
    const nickname = discordMember?.nickname;
    const discordId = discordMember?.id;

    // this is probably already sorted this way but just incase
    const roles = discordMember?.roles?.sort((a, b) => b.position - a.position) || [];

    const avatar = getUserAvatar(discordMember, undefined);
    const warningsForThisMember = discordId
      ? warnings.filter(warning => warning.givenTo === discordId)
      : [];

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
      manualMatch: !!gw2Member.discordId,
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
  });

  return records;
};

export const getExcessDiscordRecords = (
  matchedRecords: MemberRecord[],
  discordMembers: DiscordMemberDTO[],
  warnings: WarningDTO[]
): MemberRecord[] => {
  return discordMembers
    .filter(discordMember => {
      return !matchedRecords.some(record => record.discordName === discordMember.name);
    })
    .map(discordMember => {
      const missingGW2 = !discordMember.roles.find(r => r.name === 'Bots');
      const joinDate = DateTime.fromISO(discordMember.joined, { zone: 'utc' });

      const topRole = discordMember.roles[0];
      const pending = topRole && topRole.name === 'Pending';

      const twentyFourHours = 1000 * 60 * 60 * 24;
      const over24h = missingGW2 && DateTime.now().diff(joinDate).toMillis() > twentyFourHours;

      return {
        accountName: discordMember.name ?? 'Unknown',
        nickname: discordMember.nickname,
        joinDate,
        discordName: discordMember.name,
        discordId: discordMember.id,
        roles: discordMember.roles || [],
        manualMatch: false,
        avatar: discordMember.avatar,
        warnings: warnings.filter(w => w.givenTo === discordMember.id),
        issues: {
          pending,
          missingGW2,
          over24h
        }
      };
    });
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
