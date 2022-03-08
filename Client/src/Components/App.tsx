import React, { useCallback, useEffect, useState } from 'react';

import AuthInfo from '../Interfaces/AuthInfo';

import './App.scss';
import Log from './Log/Log';
import Roster from './Roster/Roster';
import Control from './Control';
import EventPage from './Events/EventPage';
import LoginPage from './LoginPage';
import {
  fetchAuthInfo,
  fetchDiscordLog,
  fetchDiscordMembers,
  fetchDiscordRoles,
  fetchGW2Log,
  fetchGW2Members,
  fetchGW2Ranks
} from '../utils/DataRetrieval';

import 'fontsource-roboto';
import Paper from '@material-ui/core/Paper';
import Snackbar from '@material-ui/core/Snackbar';
import Tab from '@material-ui/core/Tab';
import Tabs from '@material-ui/core/Tabs';
import TabContext from '@material-ui/lab/TabContext';
import TabPanel from '@material-ui/lab/TabPanel';
import Alert, { Color } from '@material-ui/lab/Alert';
import { MuiThemeProvider, createMuiTheme } from '@material-ui/core/styles';
import { PaletteType } from '@material-ui/core';

import { useQuery, useQueryClient } from 'react-query';
import EventRepository from '../utils/EventRepository';
import DiscordLog from './DiscordLog/DiscordLog';

const App = () => {
  const [filterString, setFilterString] = useState('');
  const [tab, setTab] = useState('roster');

  const [sortBy, setSortBy] = useState('rank');
  const [filterBy, setFilterBy] = useState('none');

  const [showToast, setShowToast] = useState(false);
  const [toastStatus, setToastStatus] = useState<Color>('info');
  const [toastMessage, setToastMessage] = useState('');

  const [theme, setTheme] = useState<PaletteType>('dark');
  const toggleTheme = useCallback(() => {
    setTheme(theme === 'dark' ? 'light' : 'dark');
  }, [theme, setTheme]);

  const queryClient = useQueryClient();
  useEffect(() => {
    queryClient.prefetchQuery('');
    queryClient.prefetchQuery('gw2log', fetchGW2Log);
    queryClient.prefetchQuery('eventsData', EventRepository.getAll);
    queryClient.prefetchQuery('event-settings', EventRepository.getSettings);
    queryClient.prefetchQuery('gw2Members', fetchGW2Members);
    queryClient.prefetchQuery('discordMembers', fetchDiscordMembers);
    queryClient.prefetchQuery('guildRanks', fetchGW2Ranks);
    queryClient.prefetchQuery('discordRoles', fetchDiscordRoles);
    queryClient.prefetchQuery('discordLog', fetchDiscordLog);
  }, [queryClient]);

  const darkTheme = createMuiTheme({
    palette: {
      type: theme
    }
  });

  const openToast = useCallback(
    (message: string, status: Color = 'info') => {
      setToastStatus(status);
      setToastMessage(message);
      setShowToast(true);
    },
    [setToastMessage, setShowToast, setToastStatus]
  );

  const closeToast = useCallback(() => {
    setToastMessage('');
    setShowToast(false);
  }, [setToastMessage, setShowToast]);

  const handleFilterChange = useCallback(
    (event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
      setFilterString(event.target.value);
    },
    [setFilterString]
  );

  const [authInfo, setAuthInfo] = useState<AuthInfo>({
    loggedIn: false,
    isAdmin: false,
    username: ''
  });
  const authInfoQuery = useQuery('authInfo', fetchAuthInfo);
  useEffect(() => {
    if (authInfoQuery.isLoading) return;

    if (authInfoQuery.error) {
      console.error(authInfoQuery.error);
      openToast('There was an error getting authentication info', 'error');
    }

    if (authInfoQuery.data) {
      setAuthInfo(authInfoQuery.data);
    }
  }, [authInfoQuery, openToast]);

  const TABS = {
    ROSTER: 'Roster',
    LOG: 'Log',
    DISCORD_LOG: 'Discord Log',
    EVENTS: 'Events'
  };

  return (
    <MuiThemeProvider theme={darkTheme}>
      <Paper className="paper-container" square>
        <Snackbar open={showToast} autoHideDuration={6000} onClose={() => closeToast()}>
          <Alert onClose={() => closeToast()} severity={toastStatus}>
            {toastMessage}
          </Alert>
        </Snackbar>
        <div className="content">
          {authInfo.loggedIn && authInfo.isAdmin ? (
            <>
              <Control
                handleFilterChange={handleFilterChange}
                theme={theme}
                toggleTheme={toggleTheme}
              />
              <TabContext value={tab}>
                <Tabs
                  value={tab}
                  onChange={(_, v) => setTab(v)}
                  scrollButtons="auto"
                  variant="scrollable"
                >
                  <Tab label={TABS.ROSTER} value="roster" />
                  <Tab label={TABS.LOG} value="log" />
                  <Tab label={TABS.DISCORD_LOG} value="discord-log" />
                  <Tab label={TABS.EVENTS} value="events" />
                </Tabs>
                <TabPanel value="roster">
                  <Roster
                    filterString={filterString}
                    openToast={openToast}
                    sortBy={sortBy}
                    setSortBy={setSortBy}
                    filterBy={filterBy}
                    setFilterBy={setFilterBy}
                  />
                </TabPanel>
                <TabPanel value="log">
                  <Log filterString={filterString} openToast={openToast} />
                </TabPanel>
                <TabPanel value="discord-log">
                  <DiscordLog filterString={filterString} openToast={openToast} />
                </TabPanel>
                <TabPanel value="events">
                  <EventPage filterString={filterString} openToast={openToast} />
                </TabPanel>
              </TabContext>
            </>
          ) : (
            <LoginPage isLoading={authInfoQuery.isLoading} authInfo={authInfo} />
          )}
        </div>
      </Paper>
    </MuiThemeProvider>
  );
};

export default App;
