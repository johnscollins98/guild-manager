import { Box } from '@mui/material';
import { BrowserRouter, Route, Routes } from 'react-router-dom';
import { useAuth } from '../lib/apis/auth-api';
import { usePrefetchGW2Log } from '../lib/apis/gw2-api';
import './app.scss';
import { LogLoader } from './common/log-loader';
import { QueryBoundary } from './common/query-boundary';
import DiscordLog from './discord-log/discord-log';
import EventPage from './events/event-page';
import Layout from './layout';
import Log from './log/log';
import LoginPage from './login-page';
import NotFound from './not-found';
import RecruitmentPage from './recruitment/recruitment-page';
import Roster from './roster/roster';
import { WarningLog } from './warning-log/warning-log';

const App = () => {
  const { data: authInfo } = useAuth();

  usePrefetchGW2Log(!!authInfo && !!authInfo.permissions.ACCESS);

  return (
    <Box className="paper-container">
      {authInfo && authInfo.loggedIn && authInfo.permissions.ACCESS ? (
        <BrowserRouter>
          <Routes>
            <Route path="/" Component={Layout}>
              <Route path="/" Component={Roster} />
              <Route
                path="/log"
                element={
                  <QueryBoundary fallback={<LogLoader />}>
                    <Log />
                  </QueryBoundary>
                }
              />
              <Route
                path="/discord-log"
                element={
                  <QueryBoundary fallback={<LogLoader />}>
                    <DiscordLog />
                  </QueryBoundary>
                }
              />
              <Route
                path="/warning-log"
                element={
                  <QueryBoundary fallback={<LogLoader />}>
                    <WarningLog />
                  </QueryBoundary>
                }
              />
              <Route path="/events" Component={EventPage} />
              <Route path="/recruitment" Component={RecruitmentPage} />
              <Route path="*" Component={NotFound} />
            </Route>
          </Routes>
        </BrowserRouter>
      ) : (
        <QueryBoundary>
          <LoginPage />
        </QueryBoundary>
      )}
    </Box>
  );
};

export default App;
