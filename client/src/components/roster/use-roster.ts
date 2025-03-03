import { useSuspenseQueries } from '@tanstack/react-query';
import { type DiscordMemberDTO, type GW2Rank, type WarningDTO } from 'server';
import { type GW2MemberResponseDTO } from 'server/src/dtos/gw2/gw2-member-response-dto';
import {
  discordBotRolesQuery,
  discordMembersQuery,
  discordRolesQuery
} from '../../lib/apis/discord-api';
import { gw2MembersQuery, gw2RanksQuery } from '../../lib/apis/gw2-api';
import { warningsQuery } from '../../lib/apis/warnings-api';
import type MemberRecord from '../../lib/interfaces/member-record';
import {
  compareRank,
  generateGW2RosterRecords,
  getExcessDiscordRecords
} from '../../lib/utils/data-processing';

export const useRoster = (sortString?: string, filterString?: string, filterBy?: string) => {
  const queries = useSuspenseQueries({
    queries: [
      discordMembersQuery,
      discordRolesQuery,
      gw2MembersQuery,
      gw2RanksQuery,
      warningsQuery,
      discordBotRolesQuery
    ]
  });

  const [discordMembers, discordRoles, gw2Members, guildRanks, warnings, botRoles] = queries;

  const refetch = () => queries.forEach(q => q.refetch());

  const isFetching = queries.some(q => q.isFetching);

  const roster = getRoster(gw2Members.data, discordMembers.data, guildRanks.data, warnings.data);

  const filteredRoster = onFilter(roster, filterBy, filterString);
  const rosterForDisplay = onSort(filteredRoster, sortString, guildRanks.data ?? []);

  return {
    isFetching,
    refetch,
    roster,
    rosterForDisplay,
    botRoles: botRoles.data,
    discordRoles: discordRoles.data
  };
};

const getRoster = (
  gw2Members: GW2MemberResponseDTO[],
  discordMembers: DiscordMemberDTO[],
  guildRanks: GW2Rank[],
  warnings: WarningDTO[]
) => {
  let roster = generateGW2RosterRecords(gw2Members, discordMembers, guildRanks, warnings);
  roster = roster.concat(getExcessDiscordRecords(gw2Members, discordMembers, guildRanks, warnings));

  return roster;
};

const onSort = (toSort: MemberRecord[], sortBy = 'default', guildRanks: GW2Rank[]) => {
  switch (sortBy) {
    case 'name':
      return toSort.sort((a, b) => {
        const aName = a.accountName || a.discordName || '';
        const bName = b.accountName || b.discordName || '';
        return aName.toLowerCase().localeCompare(bName.toLowerCase());
      });
    case 'rank':
      return toSort.sort((a, b) => {
        const aRank = a.rank || a.roles[0]?.name;
        const bRank = b.rank || b.roles[0]?.name;
        return compareRank(guildRanks, aRank, bRank);
      });
    case 'date':
      return toSort.sort((a, b) => {
        return a.joinDate.diff(b.joinDate).toMillis();
      });
    case 'warnings':
      return toSort.sort((a, b) => b.warnings.length - a.warnings.length);
    default:
      return toSort;
  }
};

const onFilter = (toFilter: MemberRecord[], filterBy = 'none', filterString = '') => {
  const filtered = toFilter.filter(
    r =>
      r.accountName.toLowerCase().includes(filterString) ||
      r.discordName?.toLowerCase().includes(filterString) ||
      r.nickname?.toLowerCase().includes(filterString) ||
      r.memberId?.toLowerCase().includes(filterString)
  );

  switch (filterBy) {
    case 'has-gw2':
      return filtered.filter(record => record.memberId);
    case 'excess-discord':
      return filtered.filter(record => !record.memberId);
    case 'issues':
      return filtered.filter(record => {
        return Object.values(record.issues).some(k => k);
      });
    case 'warnings':
      return filtered.filter(record => record.warnings.length);
    case 'manual-match':
      return filtered.filter(record => record.manualMatch);
    case 'none':
    default:
      return filtered;
  }
};
