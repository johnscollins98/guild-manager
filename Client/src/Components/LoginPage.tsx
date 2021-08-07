import React, { useState } from 'react';

import './LoginPage.scss';

import AuthInfo from '../Interfaces/AuthInfo';
import { config } from '../Config';

import LoaderPage from './LoaderPage';
import SOGif from '../assets/images/SO_Logo.gif';
import SOStatic from '../assets/images/SO_Static.gif';
import { ReactComponent as DiscordLogo } from '../assets/images/discord.svg';

import Button from '@material-ui/core/Button';
import Alert from '@material-ui/lab/Alert';
import AlertTitle from '@material-ui/lab/AlertTitle';

interface Props {
  isLoading: boolean;
  authInfo: AuthInfo;
}

const LoginPage = ({ isLoading, authInfo }: Props) => {
  const [logo, setLogo] = useState(SOStatic);

  if (isLoading) {
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
          <Button
            href={`${config.backEndBaseUrl}/auth`}
            variant="contained"
            color="primary"
          >
            <DiscordLogo height="24" width="24" className="discord-logo" />
            Log In
          </Button>
          {authInfo.loggedIn && !authInfo.isAdmin && !authInfo.isEventLeader ? (
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
