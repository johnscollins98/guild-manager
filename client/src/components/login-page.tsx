import { useState } from 'react';

import './login-page.scss';

import { config } from '../lib/config';

import Alert from '@mui/material/Alert';
import AlertTitle from '@mui/material/AlertTitle';
import Button from '@mui/material/Button';
import SOGif from '../assets/images/SO_Logo.gif';
import SOStatic from '../assets/images/SO_Static.gif';
import { useAuth } from '../lib/apis/auth-api';

const LoginPage = () => {
  const { data: authInfo } = useAuth();
  const [logo, setLogo] = useState(SOStatic);

  return (
    <div className="loader-page">
      <img
        src={logo}
        alt="logo"
        onMouseEnter={() => setLogo(SOGif)}
        onMouseLeave={() => setLogo(SOStatic)}
      />
      <Button
        href={`${config.backEndBaseUrl}/auth?returnTo=${encodeURI(window.location.href)}`}
        variant="contained"
        color="primary"
        startIcon={
          <svg height="22" width="22">
            <use href="discord.svg"></use>
          </svg>
        }
      >
        Log In
      </Button>
      {authInfo.loggedIn && !authInfo.permissions.ACCESS ? (
        <Alert className="warning" severity="warning">
          <AlertTitle>Forbidden</AlertTitle>
          You do not have permission to access this site.
        </Alert>
      ) : null}
    </div>
  );
};

export default LoginPage;
