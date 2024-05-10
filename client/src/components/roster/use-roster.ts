import { DiscordMemberDTO, GW2Member, GW2Rank, WarningDTO } from 'server';
import { useDiscordMembers, useDiscordRoles } from '../../lib/apis/discord-api';
import { useGW2Members, useGW2Ranks } from '../../lib/apis/gw2-api';
import { useWarnings } from '../../lib/apis/warnings-api';
import MemberRecord from '../../lib/interfaces/member-record';
import {
  compareRank,
  generateGW2RosterRecords,
  getExcessDiscordRecords
} from '../../lib/utils/data-processing';

export const useRoster = (sortString?: string, filterString?: string, filterBy?: string) => {
  const queries = [
    useDiscordMembers(),
    useDiscordRoles(),
    useGW2Members(),
    useGW2Ranks(),
    useWarnings()
  ] as const;

  const [discordMembers, discordRoles, gw2Members, guildRanks, warnings] = queries;

  const refetch = () => queries.forEach(q => q.refetch());

  const isFetching = queries.some(q => q.isFetching);
  const isLoading = queries.some(q => q.isLoading);
  const isError = queries.some(q => q.isError);

  const roster = getRoster(gw2Members.data, discordMembers.data, guildRanks.data, warnings.data);

  const filteredRoster = onFilter(roster, filterBy, filterString);
  const rosterForDisplay = onSort(filteredRoster, sortString, guildRanks.data ?? []);

  return {
    isFetching,
    isLoading,
    isError,
    refetch,
    roster,
    rosterForDisplay,
    discordRoles: discordRoles.data
  };
};

const getRoster = (
  gw2Members?: GW2Member[],
  discordMembers?: DiscordMemberDTO[],
  guildRanks?: GW2Rank[],
  warnings?: WarningDTO[]
) => {
  if (!gw2Members || !discordMembers || !guildRanks || !warnings) return undefined;

  let roster = generateGW2RosterRecords(gw2Members, discordMembers, guildRanks, warnings);
  roster = roster.concat(getExcessDiscordRecords(gw2Members, discordMembers, guildRanks, warnings));

  return roster;
};

const onSort = (toSort: MemberRecord[] | undefined, sortBy = 'default', guildRanks: GW2Rank[]) => {
  if (!toSort) return undefined;

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

const onFilter = (toFilter: MemberRecord[] | undefined, filterBy = 'none', filterString = '') => {
  if (!toFilter) return undefined;

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
    case 'none':
    default:
      return filtered;
  }
};
