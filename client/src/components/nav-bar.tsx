import Brightness3 from '@mui/icons-material/Brightness3';
import Logout from '@mui/icons-material/Logout';
import MenuIcon from '@mui/icons-material/Menu';
import MenuOpenIcon from '@mui/icons-material/MenuOpen';
import SearchIcon from '@mui/icons-material/Search';
import { InputAdornment, Menu, MenuItem, useColorScheme } from '@mui/material';
import AppBar from '@mui/material/AppBar';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Drawer from '@mui/material/Drawer';
import IconButton from '@mui/material/IconButton';
import ListItemButton from '@mui/material/ListItemButton';
import TextField from '@mui/material/TextField';
import Tooltip from '@mui/material/Tooltip';
import { type Mode } from '@mui/system/cssVars/useCurrentColorScheme';
import type React from 'react';
import { use, useCallback, useState } from 'react';
import { NavLink, useSearchParams } from 'react-router-dom';
import SOStatic from '../assets/images/SO_Static.gif';
import { config } from '../lib/config';
import { useConfirm } from './common/confirm-dialog';
import { FilterStringContext } from './common/filter-string-provider';
import './nav-bar.scss';

const LINKS = [
  { label: 'Roster', link: '/' },
  { label: 'GW2 Log', link: '/log' },
  { label: 'Discord Log', link: '/discord-log' },
  { label: 'Warning Log', link: '/warning-log' },
  { label: 'Audit Log', link: '/audit-log' },
  { label: 'Events', link: '/events' },
  { label: 'Recruitment', link: '/recruitment' }
];

interface Props {
  maxWidth?: string;
}

const NavBar = ({ maxWidth }: Props) => {
  const { mode, setMode } = useColorScheme();
  const [modeMenuAnchor, setModeMenuAnchor] = useState<null | HTMLElement>(null);

  const handleModeClick = useCallback(
    (mode: Mode) => {
      setMode(mode);
      setModeMenuAnchor(null);
    },
    [setMode, setModeMenuAnchor]
  );

  const [searchParams] = useSearchParams();

  const [filterString, setFilterString] = use(FilterStringContext);

  const confirm = useConfirm();

  const [drawerOpen, setDrawerOpen] = useState(false);

  const filterChangeHandler: React.ChangeEventHandler<HTMLInputElement> = e => {
    const filterStringVal = e.target.value;
    setFilterString(filterStringVal);
  };

  const linkSearchParamString = filterString
    ? new URLSearchParams({ filterString }).toString()
    : '';

  return (
    <AppBar
      position="static"
      className="my-nav"
      color="transparent"
      sx={theme => ({ borderBottom: `1px solid ${theme.palette.divider}` })}
    >
      <Box
        maxWidth={maxWidth}
        width="100%"
        margin="auto"
        justifyContent="space-between"
        alignItems="center"
        padding={1}
        display="flex"
      >
        <Box alignItems="center" gap="16px" sx={{ display: { lg: 'flex', xs: 'none' } }}>
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
          sx={{ display: { lg: 'none', xs: 'inline-flex' } }}
          onClick={() => setDrawerOpen(true)}
        >
          <MenuIcon />
        </IconButton>
        <Box display="flex" alignItems="center" gap="4px">
          <TextField
            id="filter"
            name="filter"
            label="Filter"
            hiddenLabel
            slotProps={{
              inputLabel: { sx: { display: 'none' } },
              input: {
                disableUnderline: true,
                sx: { borderRadius: '4px' },
                startAdornment: (
                  <InputAdornment position="start">
                    <SearchIcon sx={{ height: '16px', width: '16px' }} />
                  </InputAdornment>
                )
              }
            }}
            type="text"
            size="small"
            value={filterString}
            onChange={filterChangeHandler}
          />
          <Tooltip title="Change Theme">
            <IconButton onClick={e => setModeMenuAnchor(e.currentTarget)}>
              <Brightness3 />
            </IconButton>
          </Tooltip>
          <Menu
            open={!!modeMenuAnchor}
            anchorEl={modeMenuAnchor}
            onClose={() => setModeMenuAnchor(null)}
          >
            <MenuItem onClick={() => handleModeClick('system')} selected={mode === 'system'}>
              System
            </MenuItem>
            <MenuItem onClick={() => handleModeClick('dark')} selected={mode === 'dark'}>
              Dark
            </MenuItem>
            <MenuItem onClick={() => handleModeClick('light')} selected={mode === 'light'}>
              Light
            </MenuItem>
          </Menu>
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
        elevation={0}
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
        <Box sx={{ width: '200px' }} className="nav-list">
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
        </Box>
      </Drawer>
    </AppBar>
  );
};

export default NavBar;
