import {
  FormControlLabel,
  IconButton,
  Paper,
  Switch,
  Menu,
  MenuItem,
} from '@material-ui/core';
import { FilterList, ImportExport } from '@material-ui/icons';
import React, { useCallback } from 'react';
import { useState } from 'react';

import './RosterControl.scss';

const RosterControl = ({ singleColumn, setSingleColumn, onSort, onFilter }) => {
  const [anchorElement, setAnchorElement] = useState(null);
  const [sortOpen, setSortOpen] = useState(false);
  const [filterOpen, setFilterOpen] = useState(false);

  const onSortOpen = useCallback(
    (e) => {
      setAnchorElement(e.target);
      setSortOpen(true);
    },
    [setAnchorElement, setSortOpen]
  );

  const onFilterOpen = useCallback(
    (e) => {
      setAnchorElement(e.target);
      setFilterOpen(true);
    },
    [setAnchorElement, setFilterOpen]
  );

  const closeMenu = useCallback(() => {
    setSortOpen(false);
    setFilterOpen(false);
    setAnchorElement(null);
  }, [setSortOpen, setFilterOpen, setAnchorElement]);

  const sortHandler = useCallback(
    (sortBy) => {
      onSort(sortBy);
      closeMenu();
    },
    [onSort, closeMenu]
  );

  const filterHandler = useCallback(
    (filterBy) => {
      onFilter(filterBy);
      closeMenu();
    },
    [onFilter, closeMenu]
  );

  return (
    <>
      <Paper variant="outlined" className="roster-bar">
        <span className="left">
          <IconButton size="small" onClick={onFilterOpen}>
            <FilterList />
          </IconButton>
          <IconButton size="small" onClick={onSortOpen}>
            <ImportExport />
          </IconButton>
        </span>
        <span className="right">
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
        </span>
      </Paper>
      <Menu
        open={sortOpen}
        anchorEl={anchorElement}
        onClose={closeMenu}
        anchorOrigin={{
          vertical: 'bottom',
          horizontal: 'right',
        }}
      >
        <MenuItem onClick={() => sortHandler('rank')}>Rank</MenuItem>
        <MenuItem onClick={() => sortHandler('name')}>Name</MenuItem>
        <MenuItem onClick={() => sortHandler('points')}>Points</MenuItem>
      </Menu>
      <Menu
        open={filterOpen}
        anchorEl={anchorElement}
        onClose={closeMenu}
        anchorOrigin={{
          vertical: 'bottom',
          horizontal: 'right',
        }}
      >
        <MenuItem onClick={() => filterHandler('none')}>No filters</MenuItem>
        <MenuItem onClick={() => filterHandler('has-gw2')}>
          Has GW2 Account
        </MenuItem>
        <MenuItem onClick={() => filterHandler('excess-discord')}>
          Excess Discord
        </MenuItem>
        <MenuItem onClick={() => filterHandler('issues')}>Any issues</MenuItem>
      </Menu>
    </>
  );
};

export default RosterControl;
