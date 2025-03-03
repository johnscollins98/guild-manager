import { Box } from '@mui/material';
import { type JSX } from 'react';
import { BrowserRouter, Route, Routes } from 'react-router-dom';
import { useAuth } from '../lib/apis/auth-api';
import { usePrefetchGW2Log } from '../lib/apis/gw2-api';
import './app.scss';
import { QueryBoundary } from './common/query-boundary';
import DiscordLog from './discord-log/discord-log';
import EventPage from './events/event-page';
import Layout from './layout';
import Log from './log/log';
import LoginPage from './login-page';
import NotFound from './not-found';
import RecruitmentPage from './recruitment/recruitment-page';
import Roster from './roster/roster';

const App = () => {
  const { data: authInfo } = useAuth();

  usePrefetchGW2Log(!!authInfo && !!authInfo.permissions.ACCESS);

  return (
    <Box className="paper-container">
      {authInfo && authInfo.loggedIn && authInfo.permissions.ACCESS ? (
        <BrowserRouter>
          <Routes>
            <Route path="/" Component={Layout}>
              <Route path="/" Component={Page(Roster)} />
              <Route path="/log" Component={Page(Log)} />
              <Route path="/discord-log" Component={Page(DiscordLog)} />
              <Route path="/events" Component={Page(EventPage)} />
              <Route path="/recruitment" Component={Page(RecruitmentPage)} />
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

const Page = (Component: () => JSX.Element) => {
  return function PageLoader() {
    return (
      <QueryBoundary>
        <Component />
      </QueryBoundary>
    );
  };
};

export default App;
