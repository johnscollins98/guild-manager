import Brightness3 from '@mui/icons-material/Brightness3';
import Brightness6 from '@mui/icons-material/Brightness6';
import MenuIcon from '@mui/icons-material/Menu';
import { PaletteMode } from '@mui/material';
import AppBar from '@mui/material/AppBar';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Drawer from '@mui/material/Drawer';
import IconButton from '@mui/material/IconButton';
import List from '@mui/material/List';
import ListItemButton from '@mui/material/ListItemButton';
import TextField from '@mui/material/TextField';
import Tooltip from '@mui/material/Tooltip';
import React, { useState } from 'react';
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

const LINKS = [
  { label: 'Roster', link: '/' },
  { label: 'Log', link: '/log' },
  { label: 'Discord Log', link: '/discord-log' },
  { label: 'Events', link: '/events' }
];

const Control = ({ theme, toggleTheme }: Props) => {
  const [searchParams, setSearchParams] = useSearchParams();
  const filterString = searchParams.get('filterString');

  const [drawerOpen, setDrawerOpen] = useState(false);

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
        <Box sx={{ display: { md: 'block', xs: 'none' } }}>
          {LINKS.map(l => (
            <Button key={l.link} component={NavLink} to={l.link}>
              {l.label}
            </Button>
          ))}
        </Box>
        <IconButton
          sx={{ display: { md: 'none', xs: 'inline-flex' } }}
          onClick={() => setDrawerOpen(true)}
        >
          <MenuIcon />
        </IconButton>
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
      <Drawer
        anchor="left"
        open={drawerOpen}
        onClose={() => setDrawerOpen(false)}
        PaperProps={{ elevation: 0 }}
      >
        <List sx={{ width: '200px' }}>
          {LINKS.map(l => (
            <ListItemButton
              key={l.link}
              component={NavLink}
              to={l.link}
              onClick={() => setDrawerOpen(false)}
            >
              {l.label}
            </ListItemButton>
          ))}
        </List>
      </Drawer>
    </AppBar>
  );
};

export default Control;
