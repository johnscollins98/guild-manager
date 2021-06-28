import React from 'react';

import './LoginPage.scss';

import LoaderPage from './LoaderPage';
import SOLogo from '../assets/images/SO_Logo.webm';
import { ReactComponent as DiscordLogo } from '../assets/images/discord.svg';

import Button from '@material-ui/core/Button';
import Alert from '@material-ui/lab/Alert';
import AlertTitle from '@material-ui/lab/AlertTitle';

const LoginPage = ({ isLoading, authInfo }) => {
  if (isLoading) {
    return <LoaderPage />;
  }
  return (
    <div className="loader-page">
      {isLoading ? (
        <LoaderPage />
      ) : (
        <>
          <video
            controls={false}
            autoPlay
            muted
            onMouseEnter={(e) => e.target.play()}
          >
            <source src={SOLogo} type="video/webm" />
          </video>
          <Button
            href={`${process.env.REACT_APP_BACKEND_BASE_URL || ''}/auth`}
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
