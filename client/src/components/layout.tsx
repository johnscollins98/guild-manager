import { Box } from '@mui/material';
import { Outlet } from 'react-router-dom';
import NavBar from './nav-bar';

const Layout = () => {
  const maxWidth = '1500px';
  return (
    <>
      <NavBar maxWidth={maxWidth} />
      <Box className="outlet" maxWidth={maxWidth} width="100%" margin="auto">
        <Outlet />
      </Box>
    </>
  );
};

export default Layout;
