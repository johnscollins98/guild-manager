import React, { useCallback, useEffect, useState } from 'react';

import './App.scss';
import Log from './Log';
import Roster from './Roster';
import Control from './Control';
import PointLog from './PointLog';
import EventPage from './EventPage';
import LoginPage from './LoginPage';
import { fetchAuthInfo } from '../utils/DataRetrieval';

import 'fontsource-roboto';
import Paper from '@material-ui/core/Paper';
import Snackbar from '@material-ui/core/Snackbar';
import Tab from '@material-ui/core/Tab';
import Tabs from '@material-ui/core/Tabs';
import TabContext from '@material-ui/lab/TabContext';
import TabPanel from '@material-ui/lab/TabPanel';
import Alert from '@material-ui/lab/Alert';
import { MuiThemeProvider, createMuiTheme } from '@material-ui/core/styles';

import { useQuery } from 'react-query';

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

  const [authInfo, setAuthInfo] = useState({
    loggedIn: false,
    isAdmin: false,
    isEventLeader: false,
    username: null,
  });
  const authInfoQuery = useQuery('authInfo', fetchAuthInfo);
  useEffect(() => {
    if (authInfoQuery.isLoading) return;

    if (authInfoQuery.error) {
      console.error(authInfoQuery.error);
      openToast('There was an error getting authentication info', 'error');
    }

    setAuthInfo(authInfoQuery.data);
  }, [authInfoQuery, openToast]);

  const TABS = {
    ROSTER: 'Roster',
    LOG: 'Log',
    POINT_LOG: 'Points Log',
    EVENTS: 'Events',
  };

  return (
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
          {authInfo.loggedIn && (authInfo.isAdmin || authInfo.isEventLeader) ? (
            <>
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
                  <EventPage
                    filterString={filterString}
                    openToast={openToast}
                  />
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
