import React, { useEffect, useState } from 'react';
import PropTypes from 'prop-types';

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

const Roster = ({ filterString, openToast }) => {
  const gw2Members = useQuery('gw2Members', () => fetchGW2Members());
  const discordMembers = useQuery('discordMembers', () => fetchDiscordMembers());
  const guildRanks = useQuery('guildRanks', () => fetchGW2Ranks());
  const discordRoles = useQuery('discordRoles', () => fetchDiscordRoles());
  const authInfo = useQuery('authInfo', () => fetchAuthInfo());

  const [records, setRecords] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const getError = () => {
      if (gw2Members.error) return { data: 'guild wars member', error: gw2Members.error };
      if (discordMembers.error) return { data: 'discord member', error: discordMembers.error };
      if (guildRanks.error) return { data: 'guild rank', error: guildRanks.error };
      if (authInfo.error) return { data: 'authorisation', error: authInfo.error };
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
    if (!isLoading) {
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

  if (isLoading) return <LoaderPage />;
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

Roster.propTypes = {
  /* string to filter data */
  filterString: PropTypes.string.isRequired,

  /* function to open toast */
  openToast: PropTypes.func.isRequired
};

export default Roster;
