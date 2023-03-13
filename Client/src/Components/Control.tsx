import Brightness3 from '@mui/icons-material/Brightness3';
import Brightness6 from '@mui/icons-material/Brightness6';
import { AppBar, Button, ButtonBase, PaletteMode } from '@mui/material';
import Box from '@mui/material/Box';
import IconButton from '@mui/material/IconButton';
import TextField from '@mui/material/TextField';
import Tooltip from '@mui/material/Tooltip';
import React from 'react';
import { NavLink, useSearchParams } from 'react-router-dom';
import './Control.scss';

interface Props {
  theme: PaletteMode;
  toggleTheme: () => void;
}

interface FormElements extends HTMLFormControlsCollection {
  filter: HTMLInputElement;
}

interface FilterFormElement extends HTMLFormElement {
  readonly elements: FormElements;
}

const Control = ({ theme, toggleTheme }: Props) => {
  const [searchParams, setSearchParams] = useSearchParams();
  const filterString = searchParams.get('filterString');

  const filterSubmitHandler: React.FormEventHandler<HTMLFormElement> = (
    e: React.FormEvent<FilterFormElement>
  ) => {
    e.preventDefault();
    e.stopPropagation();

    const filterStringVal = e.currentTarget.elements.filter.value;

    setSearchParams({
      ...searchParams,
      filterString: filterStringVal
    });
  };

  return (
    <AppBar position="static" color="transparent">
      <Box justifyContent="space-between" alignItems="center" padding={1} display="flex">
        <Box>
          <Button component={NavLink} to="/">
            Roster
          </Button>
          <Button component={NavLink} to="/log">
            Log
          </Button>
          <Button component={NavLink} to="/discord-log">
            Discord Log
          </Button>
          <Button component={NavLink} to="/events">
            Events
          </Button>
        </Box>
        <Box display="flex">
          <form onSubmit={filterSubmitHandler}>
            <TextField
              id="filter"
              name="filter"
              label="Filter"
              type="text"
              size="small"
              fullWidth
              defaultValue={filterString}
            />
          </form>
          <Tooltip title="Change Theme">
            <IconButton onClick={() => toggleTheme()}>
              {theme === 'dark' ? <Brightness6 /> : <Brightness3 />}
            </IconButton>
          </Tooltip>
        </Box>
      </Box>
    </AppBar>
  );
};

export default Control;
