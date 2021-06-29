import React from 'react';
import PropTypes from 'prop-types';

import Grid from '@material-ui/core/Grid';
import IconButton from '@material-ui/core/IconButton';
import TextField from '@material-ui/core/TextField';

import Brightness3 from '@material-ui/icons/Brightness3';
import Brightness6 from '@material-ui/icons/Brightness6';

const Control = ({ handleFilterChange, theme, toggleTheme }) => {
  return (
    <Grid container direction="row" justify="flex-start" alignItems="center" spacing={3}>
      <Grid item xs>
        <TextField id="filter" label="Filter" type="text" fullWidth onChange={handleFilterChange} />
      </Grid>
      <Grid item>
        <IconButton onClick={() => toggleTheme()}>
          {theme === 'dark' ? <Brightness6 /> : <Brightness3 />}
        </IconButton>
      </Grid>
    </Grid>
  );
};

Control.propTypes = {
  /* Function to call when filter text changes */
  handleFilterChange: PropTypes.func.isRequired,

  /* Current selected theme */
  theme: PropTypes.string.isRequired,

  /* Function to toggle selected theme */
  toggleTheme: PropTypes.func.isRequired
};

export default Control;
