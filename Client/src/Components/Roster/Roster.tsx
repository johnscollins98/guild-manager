import React, { useCallback, useEffect, useState } from 'react';

import { generateGW2RosterRecords, getExcessDiscordRecords } from '../../utils/DataProcessing';

import RosterDisplay from './RosterDisplay';
import { useQuery } from 'react-query';
import {
  fetchAuthInfo,
  fetchDiscordMembers,
  fetchDiscordRoles,
  fetchGW2Members,
  fetchGW2Ranks
} from '../../utils/DataRetrieval';
import LoaderPage from '../LoaderPage';

import MemberRecord from '../../Interfaces/MemberRecord';
import { Color } from '@material-ui/lab/Alert';
import WarningRepository from '../../utils/WarningRepository';

interface CustomError {
  data: string;
  error: any;
}

interface Props {
  filterString: string;
  openToast: (msg: string, status: Color) => void;
  sortBy: string;
  setSortBy: (sortBy: string) => void;
  filterBy: string;
  setFilterBy: (filterBy: string) => void;
}

const Roster = ({ filterString, openToast, sortBy, filterBy, setSortBy, setFilterBy }: Props) => {
  const gw2Members = useQuery('gw2Members', () => fetchGW2Members());
  const discordMembers = useQuery('discordMembers', () => fetchDiscordMembers());
  const guildRanks = useQuery('guildRanks', () => fetchGW2Ranks());
  const discordRoles = useQuery('discordRoles', () => fetchDiscordRoles());
  const warningInfo = useQuery('warnings', WarningRepository.getWarnings);
  const authInfo = useQuery('authInfo', () => fetchAuthInfo());

  const [records, setRecords] = useState<MemberRecord[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isFetching, setIsFetching] = useState(true);
  const [error, setError] = useState<CustomError | null>(null);

  const refetchData = useCallback(() => {
    gw2Members.refetch();
    discordMembers.refetch();
    guildRanks.refetch();
    discordRoles.refetch();
    authInfo.refetch();
    warningInfo.refetch();
  }, [gw2Members, discordMembers, guildRanks, discordRoles, authInfo, warningInfo]);

  useEffect(() => {
    setIsFetching(
      gw2Members.isFetching ||
      discordMembers.isFetching ||
      guildRanks.isFetching ||
      discordRoles.isFetching ||
      authInfo.isFetching || 
      warningInfo.isFetching
    )
  }, [
    gw2Members.isFetching,
    discordMembers.isFetching,
    guildRanks.isFetching,
    discordRoles.isFetching,
    authInfo.isFetching,
    warningInfo.isFetching
  ]);

  useEffect(() => {
    const getError = () => {
      if (gw2Members.error) return { data: 'guild wars member', error: gw2Members.error };
      if (discordMembers.error) return { data: 'discord member', error: discordMembers.error };
      if (guildRanks.error) return { data: 'guild rank', error: guildRanks.error };
      if (authInfo.error) return { data: 'authorisation', error: authInfo.error };
      if (warningInfo.error) return { data: 'warning', error: warningInfo.error };
      return null;
    };
    setError(getError());
  }, [
    gw2Members.error,
    discordMembers.error,
    discordRoles.error,
    guildRanks.error,
    authInfo.error,
    warningInfo.error
  ]);

  useEffect(() => {
    const getIsLoading = () => {
      if (gw2Members.isLoading) return true;
      if (discordMembers.isLoading) return true;
      if (discordRoles.isLoading) return true;
      if (guildRanks.isLoading) return true;
      if (warningInfo.isLoading) return true;
      return false;
    };
    setIsLoading(getIsLoading());
  }, [
    gw2Members.isLoading,
    discordMembers.isLoading,
    discordRoles.isLoading,
    guildRanks.isLoading,
    warningInfo.isLoading
  ]);

  useEffect(() => {
    if (isLoading) return;
    if (error && error.data !== 'authorization') return;

    setRecords([]);
    if (gw2Members.data && discordMembers.data && guildRanks.data && warningInfo.data) {
      setRecords(
        generateGW2RosterRecords(gw2Members.data, discordMembers.data, guildRanks.data, warningInfo.data).concat(
          getExcessDiscordRecords(gw2Members.data, discordMembers.data, guildRanks.data, warningInfo.data)
        )
      );
    }
  }, [isLoading, gw2Members.data, discordMembers.data, guildRanks.data, warningInfo.data, error]);

  if (error) {
    openToast(`There was an error getting ${error.data} data`, 'error');
    console.error(error.error);
  }

  if (isLoading || !discordRoles.data || !guildRanks.data) return <LoaderPage />;
  return (
    <RosterDisplay
      records={records}
      discordRoles={discordRoles.data}
      guildRanks={guildRanks.data}
      filterString={filterString}
      authInfo={authInfo.data}
      refetchData={refetchData}
      isFetching={isFetching}
      openToast={openToast}
      sortBy={sortBy}
      setSortBy={setSortBy}
      filterBy={filterBy}
      setFilterBy={setFilterBy}
    />
  );
};

export default Roster;
