import Check from '@mui/icons-material/Check';
import Close from '@mui/icons-material/Close';
import DeleteForever from '@mui/icons-material/DeleteForever';
import FilterList from '@mui/icons-material/FilterList';
import ImportExport from '@mui/icons-material/ImportExport';
import Refresh from '@mui/icons-material/Refresh';
import IconButton from '@mui/material/IconButton';
import Menu from '@mui/material/Menu';
import MenuItem from '@mui/material/MenuItem';
import Paper from '@mui/material/Paper';
import Tooltip from '@mui/material/Tooltip';
import React, { useCallback, useState } from 'react';
import { useSearchParams } from 'react-router-dom';

import './roster-control.scss';

interface Props {
  refetchData: () => void;
  isFetching: boolean;

  kickMode: boolean;
  setKickMode: (v: boolean) => void;

  selection: string[];
  setSelection: (v: string[]) => void;

  onKick: () => void;
}

const RosterControl = ({
  refetchData,
  isFetching,
  kickMode,
  setKickMode,
  selection,
  setSelection,
  onKick
}: Props) => {
  const [searchParams, setSearchParams] = useSearchParams();
  const sortBy = searchParams.get('sortBy');
  const filterBy = searchParams.get('filterBy');

  const [anchorElement, setAnchorElement] = useState<(EventTarget & Element) | null>(null);
  const [sortOpen, setSortOpen] = useState(false);
  const [filterOpen, setFilterOpen] = useState(false);

  const onSortOpen = useCallback(
    (e: React.MouseEvent) => {
      setAnchorElement(e.currentTarget);
      setSortOpen(true);
    },
    [setAnchorElement, setSortOpen]
  );

  const onFilterOpen = useCallback(
    (e: React.MouseEvent) => {
      setAnchorElement(e.currentTarget);
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
    (sortBy: string) => {
      setSearchParams(old => {
        old.set('sortBy', sortBy);
        return old;
      });
      closeMenu();
    },
    [closeMenu, setSearchParams]
  );

  const filterHandler = useCallback(
    (filterBy: string) => {
      setSearchParams(old => {
        old.set('filterBy', filterBy);
        return old;
      });
      closeMenu();
    },
    [closeMenu, setSearchParams]
  );

  const cancelKickMode = useCallback(() => {
    setSelection([]);
    setKickMode(false);
  }, [setSelection, setKickMode]);

  return (
    <>
      <Paper variant="outlined" className="roster-bar">
        <span className="left">
          <Tooltip title="Filter Members">
            <IconButton size="small" onClick={onFilterOpen}>
              <FilterList />
            </IconButton>
          </Tooltip>
          <Tooltip title="Sort Members">
            <IconButton size="small" onClick={onSortOpen}>
              <ImportExport />
            </IconButton>
          </Tooltip>
        </span>
        <span className="right">
          {!kickMode && (
            <Tooltip title={'Mass kick (up to 5 members)'}>
              <span>
                <IconButton size="small" onClick={() => setKickMode(true)}>
                  <DeleteForever />
                </IconButton>
              </span>
            </Tooltip>
          )}
          {kickMode && (
            <>
              <span className="selection-length">{selection.length} selected</span>
              <Tooltip title={'Confirm Mass Kick'}>
                <span>
                  <IconButton size="small" onClick={onKick} disabled={selection.length === 0}>
                    <Check />
                  </IconButton>
                </span>
              </Tooltip>
              <Tooltip title={'Cancel Mass Kick'}>
                <span>
                  <IconButton size="small" onClick={cancelKickMode}>
                    <Close />
                  </IconButton>
                </span>
              </Tooltip>
            </>
          )}
          <Tooltip title={isFetching ? 'Refreshing...' : 'Refresh Data'}>
            <span>
              <IconButton
                size="small"
                onClick={refetchData}
                className="refresh"
                disabled={isFetching}
              >
                <Refresh />
              </IconButton>
            </span>
          </Tooltip>
        </span>
      </Paper>
      <Menu
        open={sortOpen}
        anchorEl={anchorElement}
        onClose={closeMenu}
        className="control-menu"
        anchorOrigin={{
          vertical: 'bottom',
          horizontal: 'right'
        }}
      >
        <MenuItem className="control-menu-item" onClick={() => sortHandler('rank')}>
          {sortBy === 'rank' ? <Check className="selected" /> : null}
          Rank
        </MenuItem>
        <MenuItem className="control-menu-item" onClick={() => sortHandler('name')}>
          {sortBy === 'name' ? <Check className="selected" /> : null}
          Name
        </MenuItem>
        <MenuItem className="control-menu-item" onClick={() => sortHandler('date')}>
          {sortBy === 'date' ? <Check className="selected" /> : null}
          Join Date
        </MenuItem>
        <MenuItem className="control-menu-item" onClick={() => sortHandler('warnings')}>
          {sortBy === 'warnings' ? <Check className="selected" /> : null}
          Warnings
        </MenuItem>
      </Menu>
      <Menu
        open={filterOpen}
        anchorEl={anchorElement}
        onClose={closeMenu}
        className="control-menu"
        anchorOrigin={{
          vertical: 'bottom',
          horizontal: 'right'
        }}
      >
        <MenuItem className="control-menu-item" onClick={() => filterHandler('none')}>
          {filterBy === 'none' ? <Check className="selected" /> : null}
          No filters
        </MenuItem>
        <MenuItem className="control-menu-item" onClick={() => filterHandler('has-gw2')}>
          {filterBy === 'has-gw2' ? <Check className="selected" /> : null}
          Has GW2 Account
        </MenuItem>
        <MenuItem className="control-menu-item" onClick={() => filterHandler('excess-discord')}>
          {filterBy === 'excess-discord' ? <Check className="selected" /> : null}
          Excess Discord
        </MenuItem>
        <MenuItem className="control-menu-item" onClick={() => filterHandler('issues')}>
          {filterBy === 'issues' ? <Check className="selected" /> : null}
          Any issues
        </MenuItem>
        <MenuItem className="control-menu-item" onClick={() => filterHandler('warnings')}>
          {filterBy === 'warnings' ? <Check className="selected" /> : null}
          Any warnings
        </MenuItem>
      </Menu>
    </>
  );
};

export default RosterControl;
