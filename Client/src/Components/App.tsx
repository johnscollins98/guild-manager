import React, { useCallback, useEffect, useMemo, useState } from 'react';

import './App.scss';
import Control from './Control';
import EventPage from './Events/EventPage';
import Log from './Log/Log';
import LoginPage from './LoginPage';
import Roster from './Roster/Roster';

import 'fontsource-roboto';

import TabContext from '@mui/lab/TabContext';
import TabPanel from '@mui/lab/TabPanel';
import { CssBaseline, PaletteMode } from '@mui/material';
import Alert, { AlertColor } from '@mui/material/Alert';
import Box from '@mui/material/Box';
import Snackbar from '@mui/material/Snackbar';
import { createTheme } from '@mui/material/styles';
import ThemeProvider from '@mui/material/styles/ThemeProvider';
import Tab from '@mui/material/Tab';
import Tabs from '@mui/material/Tabs';
import useMediaQuery from '@mui/material/useMediaQuery';
import { useAuth } from '../utils/apis/auth-api';
import { ConfirmContextProvider } from './Common/ConfirmDialog/ConfirmContextProvider';
import ConfirmDialog from './Common/ConfirmDialog/ConfirmDialog';
import { ToastContext } from './Common/ToastContext';
import DiscordLog from './DiscordLog/DiscordLog';

const App = () => {
  const [filterString, setFilterString] = useState('');
  const [tab, setTab] = useState('roster');

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

  const authQuery = useAuth();
  const authInfo = authQuery.data;

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
          <ToastContext.Provider value={openToast}>
            <div className="content">
              {authInfo && authInfo.loggedIn && authInfo.isAdmin ? (
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
                      <Roster filterString={filterString} />
                    </TabPanel>
                    <TabPanel value="log">
                      <Log filterString={filterString} />
                    </TabPanel>
                    <TabPanel value="discord-log">
                      <DiscordLog filterString={filterString} />
                    </TabPanel>
                    <TabPanel value="events">
                      <EventPage filterString={filterString} />
                    </TabPanel>
                  </TabContext>
                </>
              ) : (
                <LoginPage {...authQuery} />
              )}
            </div>
          </ToastContext.Provider>
        </Box>
        <ConfirmDialog />
      </ConfirmContextProvider>
    </ThemeProvider>
  );
};

export default App;
