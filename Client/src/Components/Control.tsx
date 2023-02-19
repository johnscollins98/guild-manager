import Brightness3 from '@mui/icons-material/Brightness3';
import Brightness6 from '@mui/icons-material/Brightness6';
import { PaletteMode } from '@mui/material';
import Box from '@mui/material/Box';
import Grid from '@mui/material/Grid';
import IconButton from '@mui/material/IconButton';
import TextField from '@mui/material/TextField';
import Tooltip from '@mui/material/Tooltip';
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
