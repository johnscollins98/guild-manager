import { useState } from 'react';

import './login-page.scss';

import { config } from '../lib/config';

import Alert from '@mui/material/Alert';
import AlertTitle from '@mui/material/AlertTitle';
import Button from '@mui/material/Button';
import { ReactComponent as DiscordLogo } from '../assets/images/discord.svg';
import SOGif from '../assets/images/SO_Logo.gif';
import SOStatic from '../assets/images/SO_Static.gif';
import { useAuth } from '../lib/apis/auth-api';
import { ErrorMessage } from './common/error-message';
import LoaderPage from './common/loader-page';

const LoginPage = () => {
  const { isError, isLoading, data: authInfo } = useAuth();
  const [logo, setLogo] = useState(SOStatic);

  if (isError) {
    return <ErrorMessage>There was an error getting authentication data.</ErrorMessage>;
  }

  if (isLoading || !authInfo) {
    return <LoaderPage />;
  }
  return (
    <div className="loader-page">
      {isLoading ? (
        <LoaderPage />
      ) : (
        <>
          <img
            src={logo}
            alt="logo"
            onMouseEnter={() => setLogo(SOGif)}
            onMouseLeave={() => setLogo(SOStatic)}
          />
          <Button href={`${config.backEndBaseUrl}/auth`} variant="contained">
            <DiscordLogo height="24" width="24" className="discord-logo" />
            Log In
          </Button>
          {authInfo.loggedIn && !authInfo.isAdmin ? (
            <Alert className="warning" severity="warning">
              <AlertTitle>Forbidden</AlertTitle>
              You do not have permission to access this site.
            </Alert>
          ) : null}
        </>
      )}
    </div>
  );
};

export default LoginPage;
