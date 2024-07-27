import { useCallback, useEffect, useMemo, useState } from 'react';

import './app.scss';
import EventPage from './events/event-page';
import Log from './log/log';
import LoginPage from './login-page';
import NotFound from './not-found';
import Roster from './roster/roster';

import { CssBaseline, type PaletteMode } from '@mui/material';
import Box from '@mui/material/Box';
import { createTheme } from '@mui/material/styles';
import ThemeProvider from '@mui/material/styles/ThemeProvider';
import useMediaQuery from '@mui/material/useMediaQuery';
import { BrowserRouter, Route, Routes } from 'react-router-dom';
import { useAuth } from '../lib/apis/auth-api';
import { usePrefetchGW2Log } from '../lib/apis/gw2-api';
import { ConfirmContextProvider } from './common/confirm-dialog/confirm-context-provider';
import ConfirmDialog from './common/confirm-dialog/confirm-dialog';
import { ToastProvider } from './common/toast/toast-provider';
import Control from './control';
import DiscordLog from './discord-log/discord-log';
import RecruitmentPage from './recruitment/recruitment-page';

const App = () => {
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

  const { data: authInfo } = useAuth();

  usePrefetchGW2Log(!!authInfo && !!authInfo.loggedIn);

  return (
    <ThemeProvider theme={darkTheme}>
      <CssBaseline />
      <ConfirmContextProvider>
        <ToastProvider>
          <Box className="paper-container">
            <div className="content">
              {authInfo && authInfo.loggedIn && authInfo.isAdmin ? (
                <div>
                  <BrowserRouter>
                    <Control theme={theme} toggleTheme={toggleTheme} />
                    <div className="outlet">
                      <Routes>
                        <Route path="/" Component={Roster} />
                        <Route path="/log" Component={Log} />
                        <Route path="/discord-log" Component={DiscordLog} />
                        <Route path="/events" Component={EventPage} />
                        <Route path="/recruitment" Component={RecruitmentPage} />
                        <Route path="*" Component={NotFound} />
                      </Routes>
                    </div>
                  </BrowserRouter>
                </div>
              ) : (
                <LoginPage />
              )}
            </div>
          </Box>
          <ConfirmDialog />
        </ToastProvider>
      </ConfirmContextProvider>
    </ThemeProvider>
  );
};

export default App;
