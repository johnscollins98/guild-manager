import {
  FormControlLabel,
  IconButton,
  Paper,
  Switch,
  Menu,
  MenuItem,
} from '@material-ui/core';
import { Check, FilterList, ImportExport } from '@material-ui/icons';
import React, { useCallback } from 'react';
import { useState } from 'react';

import './RosterControl.scss';

const RosterControl = ({
  singleColumn,
  setSingleColumn,
  filterBy,
  setFilterBy,
  sortBy,
  setSortBy,
}) => {
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
      setSortBy(sortBy);
      closeMenu();
    },
    [setSortBy, closeMenu]
  );

  const filterHandler = useCallback(
    (filterBy) => {
      setFilterBy(filterBy);
      closeMenu();
    },
    [setFilterBy, closeMenu]
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
        <MenuItem onClick={() => sortHandler('rank')}>
          {sortBy === 'rank' ? <Check className="selected" /> : null}
          Rank
        </MenuItem>
        <MenuItem onClick={() => sortHandler('name')}>
          {sortBy === 'name' ? <Check className="selected" /> : null}
          Name
        </MenuItem>
        <MenuItem onClick={() => sortHandler('points')}>
          {sortBy === 'points' ? <Check className="selected" /> : null}
          Points
        </MenuItem>
        <MenuItem onClick={() => sortHandler('date')}>
          {sortBy === 'date' ? <Check className="selected" /> : null}
          Join Date
        </MenuItem>
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
        <MenuItem onClick={() => filterHandler('none')}>
          {filterBy === 'none' ? <Check className="selected" /> : null}
          No filters
        </MenuItem>
        <MenuItem onClick={() => filterHandler('has-gw2')}>
          {filterBy === 'has-gw2' ? <Check className="selected" /> : null}
          Has GW2 Account
        </MenuItem>
        <MenuItem onClick={() => filterHandler('excess-discord')}>
          {filterBy === 'excess-discord' ? (
            <Check className="selected" />
          ) : null}
          Excess Discord
        </MenuItem>
        <MenuItem onClick={() => filterHandler('issues')}>
          {filterBy === 'issues' ? <Check className="selected" /> : null}
          Any issues
        </MenuItem>
      </Menu>
    </>
  );
};

export default RosterControl;
