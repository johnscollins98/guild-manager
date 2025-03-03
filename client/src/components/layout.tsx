import { Box } from '@mui/material';
import { Outlet, useLocation } from 'react-router-dom';
import { QueryBoundary } from './common/query-boundary';
import NavBar from './nav-bar';

const Layout = () => {
  const maxWidth = '1500px';
  const location = useLocation();
  return (
    <>
      <NavBar maxWidth={maxWidth} />
      <Box className="outlet" maxWidth={maxWidth} width="100%" margin="auto">
        <QueryBoundary key={location.key}>
          <Outlet />
        </QueryBoundary>
      </Box>
    </>
  );
};

export default Layout;
