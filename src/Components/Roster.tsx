import React, { useEffect, useState } from 'react';

import { generateGW2RosterRecords, getExcessDiscordRecords } from '../utils/DataProcessing';

import RosterDisplay from './RosterDisplay';
import { useQuery } from 'react-query';
import {
  fetchAuthInfo,
  fetchDiscordMembers,
  fetchDiscordRoles,
  fetchGW2Members,
  fetchGW2Ranks
} from '../utils/DataRetrieval';
import LoaderPage from './LoaderPage';
import MemberRecord from '../Interfaces/MemberRecord';

interface CustomError {
  data: string;
  error: any;
}

interface Props {
  filterString: string;
  openToast: (msg: string, status: string) => void;
}

const Roster = ({ filterString, openToast }: Props) => {
  const gw2Members = useQuery('gw2Members', () => fetchGW2Members());
  const discordMembers = useQuery('discordMembers', () => fetchDiscordMembers());
  const guildRanks = useQuery('guildRanks', () => fetchGW2Ranks());
  const discordRoles = useQuery('discordRoles', () => fetchDiscordRoles());
  const authInfo = useQuery('authInfo', () => fetchAuthInfo());

  const [records, setRecords] = useState<MemberRecord[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<CustomError | null>(null);

  useEffect(() => {
    const getError = () => {
      if (gw2Members.error) return { data: 'guild wars member', error: gw2Members.error };
      if (discordMembers.error) return { data: 'discord member', error: discordMembers.error };
      if (guildRanks.error) return { data: 'guild rank', error: guildRanks.error };
      if (authInfo.error) return { data: 'authorisation', error: authInfo.error };
      return null;
    };
    setError(getError());
  }, [
    gw2Members.error,
    discordMembers.error,
    discordRoles.error,
    guildRanks.error,
    authInfo.error
  ]);

  useEffect(() => {
    const getIsLoading = () => {
      if (gw2Members.isLoading) return true;
      if (discordMembers.isLoading) return true;
      if (discordRoles.isLoading) return true;
      if (guildRanks.isLoading) return true;
      return false;
    };
    setIsLoading(getIsLoading());
  }, [
    gw2Members.isLoading,
    discordMembers.isLoading,
    discordRoles.isLoading,
    guildRanks.isLoading
  ]);

  useEffect(() => {
    setRecords([]);
    if (!isLoading && gw2Members.data && discordMembers.data && guildRanks.data) {
      setRecords(
        generateGW2RosterRecords(gw2Members.data, discordMembers.data, guildRanks.data).concat(
          getExcessDiscordRecords(gw2Members.data, discordMembers.data, guildRanks.data)
        )
      );
    }
  }, [isLoading, gw2Members.data, discordMembers.data, guildRanks.data]);

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
      openToast={openToast}
    />
  );
};

export default Roster;
