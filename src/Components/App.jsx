import React, { useCallback, useEffect, useState } from 'react';
import 'fontsource-roboto';

import {
  fetchGW2Members,
  fetchGW2Log,
  fetchDiscordMembers,
  fetchAuthInfo,
  fetchDiscordRoles,
  fetchGW2Ranks,
  fetchPointLog,
} from '../utils/DataRetrieval';
import Log from './Log';
import Roster from './Roster';
import Control from './Control';
import ExcessDiscord from './ExcessDiscord';
import RequiredActions from './RequiredActions';
import PointsLeaderboard from './PointsLeaderboard';

import './App.scss';
import { Paper, Snackbar, Tab, Tabs } from '@material-ui/core';
import { TabContext, TabPanel, Alert } from '@material-ui/lab';
import { MuiThemeProvider, createMuiTheme } from '@material-ui/core/styles';
import { Refresh } from '@material-ui/icons';
import PointLog from './PointLog';
import EventPage from './EventPage';
import EventRepo from '../utils/EventRepository';

const App = () => {
  const [gw2Log, setGw2Log] = useState([]);
  const [gw2Members, setGw2Members] = useState([]);
  const [discordMembers, setDiscordMembers] = useState([]);
  const [discordRoles, setDiscordRoles] = useState([]);
  const [guildRanks, setGuildRanks] = useState([]);
  const [pointLog, setPointLog] = useState([]);
  const [events, setEvents] = useState([]);
  const [eventsLoaded, setEventsLoaded] = useState(false);
  const [authInfo, setAuthInfo] = useState({});
  const [filterString, setFilterString] = useState('');
  const [loadingData, setLoadingData] = useState(true);
  const [tab, setTab] = useState('roster');

  const [showToast, setShowToast] = useState(false);
  const [toastStatus, setToastStatus] = useState('info');
  const [toastMessage, setToastMessage] = useState('');

  const [theme, setTheme] = useState('dark');
  const toggleTheme = useCallback(() => {
    setTheme(theme === 'dark' ? 'light' : 'dark');
  }, [theme, setTheme]);

  const darkTheme = createMuiTheme({
    palette: {
      type: theme,
    },
  });

  const openToast = useCallback(
    (message, status = 'info') => {
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

  const fetchData = useCallback(async () => {
    let success = false;
    try {
      setLoadingData(true);
      setGw2Members([]);
      setGw2Log([]);
      setDiscordMembers([]);
      setDiscordRoles([]);
      setGuildRanks([]);
      setPointLog([]);
      setEvents([]);
      setEventsLoaded(false);

      const requests = [
        fetchGW2Members().then((r) => setGw2Members(r)),
        fetchGW2Log().then((r) => setGw2Log(r)),
        fetchDiscordMembers().then((r) => setDiscordMembers(r)),
        fetchDiscordRoles().then((r) => setDiscordRoles(r)),
        fetchGW2Ranks().then((r) => setGuildRanks(r)),
        fetchPointLog().then((r) => setPointLog(r)),
        EventRepo.getAll().then((r) => {
          setEvents(r);
          setEventsLoaded(true);
        }),
        fetchAuthInfo()
          .then((r) => setAuthInfo(r))
          .catch((e) => {
            console.error(e);
            openToast(
              'There was an error getting authorization. See console for more information.',
              'error'
            );
          }),
      ];

      await Promise.all(requests);
      success = true;
    } catch (err) {
      openToast(
        'There was an error gathering data. See console for more information.',
        'error'
      );
      console.error(err);
    } finally {
      setLoadingData(false);
      return success;
    }
  }, [setLoadingData, setGw2Members, setGw2Log, setDiscordMembers, openToast]);

  useEffect(() => {
    fetchData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const refresh = useCallback(async () => {
    const success = await fetchData();
    if (success) openToast('Successfully refreshed!', 'success');
  }, [fetchData, openToast]);

  const handleFilterChange = useCallback(
    (event) => {
      setFilterString(event.target.value);
    },
    [setFilterString]
  );

  const TABS = {
    ROSTER: 'Roster',
    EXCESS_DISCORD: 'Excess Discord',
    REQUIRED_ACTIONS: 'Required Actions',
    LEADERBOARD: 'Points Leaderboard',
    LOG: 'Log',
    POINT_LOG: 'Points Log',
    EVENTS: 'Events',
  };

  const any = (arr) => arr.length > 0;

  const getTabIcon = (tab) => {
    let loaded = !loadingData;

    if (tab === TABS.LOG) {
      loaded = any(gw2Log);
    } else if (tab === TABS.POINT_LOG) {
      loaded = any(pointLog);
    } else if (tab === TABS.EVENTS) {
      loaded = eventsLoaded;
    } else {
      loaded =
        any(gw2Members) &&
        any(discordMembers) &&
        any(guildRanks) &&
        any(discordRoles);
    }
    return loaded ? null : <Refresh />;
  };

  return (
    <MuiThemeProvider theme={darkTheme}>
      <Paper
        style={{
          height: '100vh',
          maxHeight: '100vh',
          overflow: 'hidden',
          padding: '16px',
        }}
        square
      >
        <Snackbar
          open={showToast}
          autoHideDuration={6000}
          onClose={() => closeToast()}
        >
          <Alert onClose={() => closeToast()} severity={toastStatus}>
            {toastMessage}
          </Alert>
        </Snackbar>
        <div className="content">
          <Control
            refresh={refresh}
            handleFilterChange={handleFilterChange}
            theme={theme}
            toggleTheme={toggleTheme}
            loadingData={loadingData}
          />
          <TabContext value={tab}>
            <Tabs
              value={tab}
              onChange={(e, v) => setTab(v)}
              variant="fullWidth"
            >
              <Tab
                icon={getTabIcon(TABS.ROSTER)}
                label={TABS.ROSTER}
                value="roster"
              />
              <Tab
                icon={getTabIcon(TABS.LEADERBOARD)}
                label={TABS.LEADERBOARD}
                value="leaderboard"
              />
              <Tab
                icon={getTabIcon(TABS.EXCESS_DISCORD)}
                label={TABS.EXCESS_DISCORD}
                value="excess-discord"
              />
              <Tab
                icon={getTabIcon(TABS.REQUIRED_ACTIONS)}
                label={TABS.REQUIRED_ACTIONS}
                value="required-actions"
              />
              <Tab icon={getTabIcon(TABS.LOG)} label={TABS.LOG} value="log" />
              <Tab
                icon={getTabIcon(TABS.POINT_LOG)}
                label={TABS.POINT_LOG}
                value="pointlog"
              />
              <Tab
                icon={getTabIcon(TABS.EVENTS)}
                label={TABS.EVENTS}
                value="events"
              />
            </Tabs>
            <TabPanel value="roster">
              <Roster
                gw2Members={gw2Members}
                discordMembers={discordMembers}
                discordRoles={discordRoles}
                guildRanks={guildRanks}
                filterString={filterString}
                authInfo={authInfo}
                openToast={openToast}
              />
            </TabPanel>
            <TabPanel value="leaderboard">
              <PointsLeaderboard
                gw2Members={gw2Members}
                discordMembers={discordMembers}
                discordRoles={discordRoles}
                guildRanks={guildRanks}
                filterString={filterString}
                authInfo={authInfo}
                openToast={openToast}
              />
            </TabPanel>
            <TabPanel value="excess-discord">
              <ExcessDiscord
                gw2Members={gw2Members}
                discordMembers={discordMembers}
                discordRoles={discordRoles}
                guildRanks={guildRanks}
                filterString={filterString}
                authInfo={authInfo}
                openToast={openToast}
              />
            </TabPanel>
            <TabPanel value="required-actions">
              <RequiredActions
                gw2Members={gw2Members}
                discordMembers={discordMembers}
                discordRoles={discordRoles}
                guildRanks={guildRanks}
                filterString={filterString}
                authInfo={authInfo}
                openToast={openToast}
              />
            </TabPanel>
            <TabPanel value="log">
              <Log data={gw2Log} filterString={filterString} />
            </TabPanel>
            <TabPanel value="pointlog">
              <PointLog data={pointLog} filterString={filterString} />
            </TabPanel>
            <TabPanel value="events">
              <EventPage
                events={events}
                eventsLoaded={eventsLoaded}
                discordMembers={discordMembers}
                filterString={filterString}
                openToast={openToast}
              />
            </TabPanel>
          </TabContext>
        </div>
      </Paper>
    </MuiThemeProvider>
  );
};

export default App;
