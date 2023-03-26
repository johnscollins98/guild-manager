import { useCallback, useEffect, useMemo, useState } from 'react';

import './App.scss';
import EventPage from './Events/EventPage';
import Log from './Log/Log';
import LoginPage from './LoginPage';
import Roster from './Roster/Roster';

import { CssBaseline, PaletteMode } from '@mui/material';
import Alert, { AlertColor } from '@mui/material/Alert';
import Box from '@mui/material/Box';
import Snackbar from '@mui/material/Snackbar';
import { createTheme } from '@mui/material/styles';
import ThemeProvider from '@mui/material/styles/ThemeProvider';
import useMediaQuery from '@mui/material/useMediaQuery';
import { BrowserRouter, Route, Routes } from 'react-router-dom';
import { useAuth } from '../utils/apis/auth-api';
import { ConfirmContextProvider } from './Common/ConfirmDialog/ConfirmContextProvider';
import ConfirmDialog from './Common/ConfirmDialog/ConfirmDialog';
import { ToastContext } from './Common/ToastContext';
import Control from './Control';
import DiscordLog from './DiscordLog/DiscordLog';
import RecruitmentPage from './Recruitment/RecruitmentPage';

const App = () => {
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
        typography: {
          fontFamily: ['"Lato"', 'sans-serif'].join(',')
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

  const { data: authInfo } = useAuth();

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
                  <BrowserRouter>
                    <Control theme={theme} toggleTheme={toggleTheme} />
                    <div className="outlet">
                      <Routes>
                        <Route path="/" Component={Roster} />
                        <Route path="/log" Component={Log} />
                        <Route path="/discord-log" Component={DiscordLog} />
                        <Route path="/events" Component={EventPage} />
                        <Route path="/recruitment" Component={RecruitmentPage} />
                      </Routes>
                    </div>
                  </BrowserRouter>
                </>
              ) : (
                <LoginPage />
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
