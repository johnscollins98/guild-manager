import { useSuspenseQueries } from '@tanstack/react-query';
import { useMemo } from 'react';
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

export const rosterQueries = [
  discordMembersQuery,
  discordRolesQuery,
  gw2MembersQuery,
  gw2RanksQuery,
  warningsQuery,
  discordBotRolesQuery
] as const;

export const useRoster = (
  sortString?: string,
  ascending?: boolean,
  filterString?: string,
  filterBy?: string
) => {
  const queries = useSuspenseQueries({
    queries: rosterQueries
  });

  const [discordMembers, discordRoles, gw2Members, guildRanks, warnings, botRoles] = queries;

  const roster = useMemo(
    () => getRoster(gw2Members.data, discordMembers.data, guildRanks.data, warnings.data),
    [gw2Members.data, discordMembers.data, guildRanks.data, warnings.data]
  );

  const sortedRoster = useMemo(() => {
    return onSort(roster, sortString, ascending, guildRanks.data ?? []);
  }, [roster, sortString, ascending, guildRanks.data]);

  const filteredRoster = useMemo(() => {
    return onFilter(sortedRoster, filterBy, filterString);
  }, [sortedRoster, filterBy, filterString]);

  return {
    rosterForDisplay: filteredRoster,
    roster,
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
  roster = roster.concat(getExcessDiscordRecords(roster, discordMembers, warnings));

  return roster;
};

const onSort = (
  toSort: MemberRecord[],
  sortBy = 'rank',
  ascending = true,
  guildRanks: GW2Rank[]
) => {
  switch (sortBy) {
    case 'name':
      return toSort.sort((a, b) => {
        const aName = a.accountName || a.discordName || '';
        const bName = b.accountName || b.discordName || '';

        return ascending
          ? bName.toLowerCase().localeCompare(aName.toLowerCase())
          : aName.toLowerCase().localeCompare(bName.toLowerCase());
      });
    case 'date':
      return toSort.sort((a, b) => {
        return ascending
          ? b.joinDate.diff(a.joinDate).toMillis()
          : a.joinDate.diff(b.joinDate).toMillis();
      });
    case 'warnings':
      return toSort.sort((a, b) =>
        ascending ? a.warnings.length - b.warnings.length : b.warnings.length - a.warnings.length
      );
    case 'rank':
    default:
      return toSort.sort((a, b) => {
        const aRank = a.rank || a.roles[0]?.name;
        const bRank = b.rank || b.roles[0]?.name;
        return ascending
          ? compareRank(guildRanks, bRank, aRank)
          : compareRank(guildRanks, aRank, bRank);
      });
  }
};

const onFilter = (toFilter: MemberRecord[], filterBy = 'none', filterString = '') => {
  const filtered = filterString
    ? toFilter.filter(
        r =>
          r.accountName.toLowerCase().includes(filterString) ||
          r.discordName?.toLowerCase().includes(filterString) ||
          r.nickname?.toLowerCase().includes(filterString) ||
          r.memberId?.toLowerCase().includes(filterString)
      )
    : toFilter;

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
