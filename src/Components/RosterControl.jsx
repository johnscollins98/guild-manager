import React, { useCallback, useState } from 'react';

import './RosterControl.scss';

import FormControlLabel from '@material-ui/core/FormControlLabel';
import IconButton from '@material-ui/core/IconButton';
import Paper from '@material-ui/core/Paper';
import Switch from '@material-ui/core/Switch';
import Menu from '@material-ui/core/Menu';
import MenuItem from '@material-ui/core/MenuItem';

import Check from '@material-ui/icons/Check';
import FilterList from '@material-ui/icons/FilterList';
import ImportExport from '@material-ui/icons/ImportExport';

const RosterControl = ({
  singleColumn,
  setSingleColumn,
  filterBy,
  setFilterBy,
  sortBy,
  setSortBy
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
          horizontal: 'right'
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
        <MenuItem onClick={() => sortHandler('warnings')}>
          {sortBy === 'warnings' ? <Check className="selected" /> : null}
          Warnings
        </MenuItem>
      </Menu>
      <Menu
        open={filterOpen}
        anchorEl={anchorElement}
        onClose={closeMenu}
        anchorOrigin={{
          vertical: 'bottom',
          horizontal: 'right'
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
          {filterBy === 'excess-discord' ? <Check className="selected" /> : null}
          Excess Discord
        </MenuItem>
        <MenuItem onClick={() => filterHandler('issues')}>
          {filterBy === 'issues' ? <Check className="selected" /> : null}
          Any issues
        </MenuItem>
        <MenuItem onClick={() => filterHandler('warnings')}>
          {filterBy === 'warnings' ? <Check className="selected" /> : null}
          Any warnings
        </MenuItem>
      </Menu>
    </>
  );
};

export default RosterControl;
