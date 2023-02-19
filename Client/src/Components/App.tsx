import React, { useCallback, useEffect, useMemo, useState } from 'react';

import AuthInfo from '../Interfaces/AuthInfo';

import { fetchAuthInfo } from '../utils/DataRetrieval';
import './App.scss';
import Control from './Control';
import EventPage from './Events/EventPage';
import Log from './Log/Log';
import LoginPage from './LoginPage';
import Roster from './Roster/Roster';

import 'fontsource-roboto';

import TabContext from '@mui/lab/TabContext';
import TabPanel from '@mui/lab/TabPanel';
import { PaletteMode } from '@mui/material';
import Alert, { AlertColor } from '@mui/material/Alert';
import Box from '@mui/material/Box';
import { CssBaseline } from '@mui/material';
import Snackbar from '@mui/material/Snackbar';
import ThemeProvider from '@mui/material/styles/ThemeProvider';
import Tab from '@mui/material/Tab';
import Tabs from '@mui/material/Tabs';
import useMediaQuery from '@mui/material/useMediaQuery';
import { createTheme } from '@mui/material/styles';
import { useQuery } from 'react-query';
import { ConfirmContextProvider } from './Common/ConfirmDialog/ConfirmContextProvider';
import ConfirmDialog from './Common/ConfirmDialog/ConfirmDialog';
import DiscordLog from './DiscordLog/DiscordLog';

const App = () => {
  const [filterString, setFilterString] = useState('');
  const [tab, setTab] = useState('roster');

  const [sortBy, setSortBy] = useState('rank');
  const [filterBy, setFilterBy] = useState('none');

  const [showToast, setShowToast] = useState(false);
  const [toastStatus, setToastStatus] = useState<AlertColor>('info');
  const [toastMessage, setToastMessage] = useState('');

  const prefersDarkMode = useMediaQuery('(prefers-color-scheme: dark)');
  const [theme, setTheme] = useState<PaletteMode>(prefersDarkMode ? 'dark' : 'light');
  useEffect(() => {
    setTheme(prefersDarkMode ? 'dark' : 'light');
  }, [prefersDarkMode]);

  const toggleTheme = useCallback(() => {
    setTheme(theme === 'dark' ? 'light' : 'dark');
  }, [theme, setTheme]);

  const [authInfo, setAuthInfo] = useState<AuthInfo>({
    loggedIn: false,
    isAdmin: false,
    username: ''
  });

  const darkTheme = useMemo(
    () =>
      createTheme({
        palette: {
          mode: theme
        },
        components: {
          MuiDialogContent: {
            styleOverrides: { root: { paddingTop: `8px !important` } }
          }
        }
      }),
    [theme]
  );

  const openToast = useCallback(
    (message: string, status: AlertColor = 'info') => {
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
    <ThemeProvider theme={darkTheme}>
      <CssBaseline />
      <ConfirmContextProvider>
        <Box className="paper-container">
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
        </Box>
        <ConfirmDialog />
      </ConfirmContextProvider>
    </ThemeProvider>
  );
};

export default App;
