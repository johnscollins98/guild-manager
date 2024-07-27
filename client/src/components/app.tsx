import './app.scss';
import EventPage from './events/event-page';
import Log from './log/log';
import LoginPage from './login-page';
import NotFound from './not-found';
import Roster from './roster/roster';

import Box from '@mui/material/Box';
import { BrowserRouter, Route, Routes } from 'react-router-dom';
import { useAuth } from '../lib/apis/auth-api';
import { usePrefetchGW2Log } from '../lib/apis/gw2-api';
import { ConfirmContextProvider } from './common/confirm-dialog/confirm-context-provider';
import ConfirmDialog from './common/confirm-dialog/confirm-dialog';
import { ThemeProvider } from './common/theme/theme-provider';
import { ToastProvider } from './common/toast/toast-provider';
import Control from './control';
import DiscordLog from './discord-log/discord-log';
import RecruitmentPage from './recruitment/recruitment-page';

const App = () => {
  const { data: authInfo } = useAuth();

  usePrefetchGW2Log(!!authInfo && !!authInfo.loggedIn);

  return (
    <ThemeProvider>
      <ConfirmContextProvider>
        <ToastProvider>
          <Box className="paper-container">
            <div className="content">
              {authInfo && authInfo.loggedIn && authInfo.isAdmin ? (
                <BrowserRouter>
                  <Control />
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
