import { Box, Button, Typography } from '@mui/material';
import { NavLink } from 'react-router-dom';

const NotFound = () => {
  return (
    <Box
      display="flex"
      justifyContent="center"
      alignItems="center"
      flexDirection="column"
      height="100%"
      gap={2}
    >
      <Typography variant="h4">This page does not exist.</Typography>
      <Button component={NavLink} to="/">
        Go to home
      </Button>
    </Box>
  );
};

export default NotFound;
