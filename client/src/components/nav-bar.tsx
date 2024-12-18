import Brightness3 from '@mui/icons-material/Brightness3';
import Brightness6 from '@mui/icons-material/Brightness6';
import Logout from '@mui/icons-material/Logout';
import MenuIcon from '@mui/icons-material/Menu';
import MenuOpenIcon from '@mui/icons-material/MenuOpen';
import AppBar from '@mui/material/AppBar';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Drawer from '@mui/material/Drawer';
import IconButton from '@mui/material/IconButton';
import List from '@mui/material/List';
import ListItemButton from '@mui/material/ListItemButton';
import TextField from '@mui/material/TextField';
import Tooltip from '@mui/material/Tooltip';
import type React from 'react';
import { useState } from 'react';
import { NavLink, useSearchParams } from 'react-router-dom';
import SOStatic from '../assets/images/SO_Static.gif';
import { config } from '../lib/config';
import { useConfirm } from './common/confirm-dialog';
import { useTheme } from './common/theme/theme-context';
import './nav-bar.scss';

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
  { label: 'Events', link: '/events' },
  { label: 'Recruitment', link: '/recruitment' }
];

const NavBar = () => {
  const { theme, toggleTheme } = useTheme();
  const [searchParams, setSearchParams] = useSearchParams();
  const filterString = searchParams.get('filterString');

  const confirm = useConfirm();

  const [drawerOpen, setDrawerOpen] = useState(false);

  const filterSubmitHandler: React.FormEventHandler<HTMLFormElement> = (
    e: React.FormEvent<FilterFormElement>
  ) => {
    e.preventDefault();
    e.stopPropagation();

    const filterStringVal = e.currentTarget.elements.filter.value;

    setSearchParams(old => {
      if (filterStringVal === '') {
        old.delete('filterString');
      } else {
        old.set('filterString', filterStringVal);
      }
      return old;
    });
  };

  const linkSearchParamString = filterString
    ? new URLSearchParams({ filterString }).toString()
    : '';

  return (
    <AppBar position="static" className="my-nav" color="default">
      <Box justifyContent="space-between" alignItems="center" padding={1} display="flex">
        <Box alignItems="center" gap="16px" sx={{ display: { md: 'flex', xs: 'none' } }}>
          <img src={SOStatic} height={40} width={40} alt="logo" />
          <div>
            {LINKS.map(l => (
              <Button key={l.link} component={NavLink} to={`${l.link}?${linkSearchParamString}`}>
                {l.label}
              </Button>
            ))}
          </div>
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
          <Tooltip title="Sign Out">
            <IconButton
              onClick={async () => {
                const res = await confirm('Are you sure you want to sign out?', 'Sign Out');
                if (res) {
                  window.location.href = `${config.backEndBaseUrl}/auth/logout`;
                }
              }}
            >
              <Logout />
            </IconButton>
          </Tooltip>
        </Box>
      </Box>
      <Drawer
        anchor="left"
        classes={{
          paper: 'my-nav'
        }}
        open={drawerOpen}
        onClose={() => setDrawerOpen(false)}
      >
        <Box justifyContent="space-between" display="flex" padding={1}>
          <IconButton onClick={() => setDrawerOpen(false)}>
            <MenuOpenIcon />
          </IconButton>
          <img src={SOStatic} height={40} width={40} alt="logo" />
        </Box>
        <List sx={{ width: '200px' }} className="nav-list">
          {LINKS.map(l => (
            <ListItemButton
              key={l.link}
              component={NavLink}
              className="nav-link"
              to={`${l.link}?${searchParams}`}
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

export default NavBar;
