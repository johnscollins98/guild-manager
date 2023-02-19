import { Brightness3, Brightness6 } from '@mui/icons-material';
import { Box, Grid, IconButton, PaletteMode, TextField, Tooltip } from '@mui/material';
import React from 'react';

interface Props {
  handleFilterChange: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => void;
  theme: PaletteMode;
  toggleTheme: () => void;
}

const Control = ({ handleFilterChange, theme, toggleTheme }: Props) => {
  return (
    <Box paddingTop={1}>
      <Grid container direction="row" justifyContent="flex-start" alignItems="center" spacing={3}>
        <Grid item xs>
          <TextField
            id="filter"
            label="Filter"
            type="text"
            size="small"
            fullWidth
            onChange={handleFilterChange}
          />
        </Grid>
        <Grid item>
          <Tooltip title="Change Theme">
            <IconButton onClick={() => toggleTheme()}>
              {theme === 'dark' ? <Brightness6 /> : <Brightness3 />}
            </IconButton>
          </Tooltip>
        </Grid>
      </Grid>
    </Box>
  );
};

export default Control;
