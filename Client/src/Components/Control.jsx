import React from 'react';
import PropTypes from 'prop-types';

import { Grid, IconButton, TextField } from '@material-ui/core';
import { Brightness3, Brightness6 } from '@material-ui/icons';

const Control = ({ handleFilterChange, theme, toggleTheme }) => {
  return (
    <Grid
      container
      direction="row"
      justify="flex-start"
      alignItems="center"
      spacing={3}
    >
      <Grid item xs>
        <TextField
          id="filter"
          label="Filter"
          type="text"
          fullWidth
          onChange={handleFilterChange}
        />
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
  handleFilterChange: PropTypes.func.isRequired,
};

export default Control;
