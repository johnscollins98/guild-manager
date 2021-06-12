import React from 'react';
import PropTypes from 'prop-types';

import {
  Button,
  Grid,
  IconButton,
  TextField,
  Switch,
  FormControlLabel,
} from '@material-ui/core';
import { Brightness3, Brightness6 } from '@material-ui/icons';

const Control = ({
  refresh,
  handleFilterChange,
  singleColumn,
  setSingleColumn,
  loadingData,
  theme,
  toggleTheme,
}) => {
  const onRefresh = async () => {
    await refresh();
  };

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
        <FormControlLabel
          control={
            <Switch
              checked={singleColumn}
              onChange={(e) => {
                setSingleColumn(e.target.checked);
              }}
            />
          }
          label="Full Width Members?"
        />
      </Grid>
      <Grid item>
        <Button onClick={onRefresh} disabled={loadingData}>
          Refresh
        </Button>
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
  refresh: PropTypes.func.isRequired,
  handleFilterChange: PropTypes.func.isRequired,
};

export default Control;
