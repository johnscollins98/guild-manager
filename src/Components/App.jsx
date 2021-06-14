import React, { useCallback, useState } from 'react';
import 'fontsource-roboto';

import Log from './Log';
import Roster from './Roster';
import Control from './Control';

import './App.scss';
import { Paper, Snackbar, Tab, Tabs } from '@material-ui/core';
import { TabContext, TabPanel, Alert } from '@material-ui/lab';
import { MuiThemeProvider, createMuiTheme } from '@material-ui/core/styles';
import PointLog from './PointLog';
import EventPage from './EventPage';
import { QueryClient, QueryClientProvider } from 'react-query';

const queryClient = new QueryClient();

const App = () => {
  const [filterString, setFilterString] = useState('');
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

  const handleFilterChange = useCallback(
    (event) => {
      setFilterString(event.target.value);
    },
    [setFilterString]
  );

  const TABS = {
    ROSTER: 'Roster',
    LOG: 'Log',
    POINT_LOG: 'Points Log',
    EVENTS: 'Events',
  };

  return (
    <QueryClientProvider client={queryClient}>
      <MuiThemeProvider theme={darkTheme}>
        <Paper className="paper-container" square>
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
              handleFilterChange={handleFilterChange}
              theme={theme}
              toggleTheme={toggleTheme}
            />
            <TabContext value={tab}>
              <Tabs
                value={tab}
                onChange={(e, v) => setTab(v)}
                scrollButtons="auto"
                variant="scrollable"
              >
                <Tab label={TABS.ROSTER} value="roster" />
                <Tab label={TABS.LOG} value="log" />
                <Tab label={TABS.POINT_LOG} value="pointlog" />
                <Tab label={TABS.EVENTS} value="events" />
              </Tabs>
              <TabPanel value="roster">
                <Roster filterString={filterString} openToast={openToast} />
              </TabPanel>
              <TabPanel value="log">
                <Log filterString={filterString} openToast={openToast} />
              </TabPanel>
              <TabPanel value="pointlog">
                <PointLog filterString={filterString} openToast={openToast} />
              </TabPanel>
              <TabPanel value="events">
                <EventPage filterString={filterString} openToast={openToast} />
              </TabPanel>
            </TabContext>
          </div>
        </Paper>
      </MuiThemeProvider>
    </QueryClientProvider>
  );
};

export default App;
