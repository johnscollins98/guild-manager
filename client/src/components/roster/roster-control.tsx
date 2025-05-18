import Check from '@mui/icons-material/Check';
import Close from '@mui/icons-material/Close';
import DeleteForever from '@mui/icons-material/DeleteForever';
import FilterList from '@mui/icons-material/FilterList';
import ImportExport from '@mui/icons-material/ImportExport';
import Refresh from '@mui/icons-material/Refresh';
import IconButton from '@mui/material/IconButton';
import Menu from '@mui/material/Menu';
import MenuItem from '@mui/material/MenuItem';
import Tooltip from '@mui/material/Tooltip';
import type React from 'react';
import { Suspense, useCallback, useMemo, useState } from 'react';
import { useSearchParams } from 'react-router-dom';

import { useQueries } from '@tanstack/react-query';
import { useAuth } from '../../lib/apis/auth-api';
import './roster-control.scss';
import { rosterQueries } from './use-roster';

interface Props {
  kickMode: boolean;
  setKickMode: (v: boolean) => void;

  selection: string[];
  setSelection: (v: string[]) => void;

  onKick: () => void;

  disabled?: boolean;
}

const RosterControl = ({
  kickMode,
  setKickMode,
  selection,
  setSelection,
  onKick,
  disabled = false
}: Props) => {
  const [searchParams, setSearchParams] = useSearchParams();
  const sortBy = searchParams.get('sortBy');
  const filterBy = searchParams.get('filterBy');

  const { data: authData } = useAuth();

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
      <div className="roster-bar">
        <span className="left">
          <Tooltip title="Filter Members">
            <IconButton size="small" onClick={onFilterOpen} disabled={disabled}>
              <FilterList />
            </IconButton>
          </Tooltip>
          <Tooltip title="Sort Members">
            <IconButton size="small" onClick={onSortOpen} disabled={disabled}>
              <ImportExport />
            </IconButton>
          </Tooltip>
        </span>
        <span className="right">
          {!kickMode && (
            <Tooltip title={'Mass kick (up to 5 members)'}>
              <span>
                <IconButton
                  disabled={!authData?.permissions.MEMBERS || disabled}
                  size="small"
                  onClick={() => setKickMode(true)}
                >
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
                  <IconButton
                    size="small"
                    onClick={onKick}
                    disabled={selection.length === 0 || disabled}
                  >
                    <Check />
                  </IconButton>
                </span>
              </Tooltip>
              <Tooltip title={'Cancel Mass Kick'}>
                <span>
                  <IconButton size="small" onClick={cancelKickMode} disabled={disabled}>
                    <Close />
                  </IconButton>
                </span>
              </Tooltip>
            </>
          )}
          <Suspense>
            <RefetchButton />
          </Suspense>
        </span>
      </div>
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
        <MenuItem
          selected={sortBy === 'rank'}
          className="control-menu-item"
          onClick={() => sortHandler('rank')}
        >
          Rank
        </MenuItem>
        <MenuItem
          selected={sortBy === 'name'}
          className="control-menu-item"
          onClick={() => sortHandler('name')}
        >
          Name
        </MenuItem>
        <MenuItem
          selected={sortBy === 'date'}
          className="control-menu-item"
          onClick={() => sortHandler('date')}
        >
          Join Date
        </MenuItem>
        <MenuItem
          selected={sortBy === 'warnings'}
          className="control-menu-item"
          onClick={() => sortHandler('warnings')}
        >
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
        <MenuItem
          className="control-menu-item"
          onClick={() => filterHandler('none')}
          selected={filterBy === 'none'}
        >
          No filters
        </MenuItem>
        <MenuItem
          className="control-menu-item"
          onClick={() => filterHandler('has-gw2')}
          selected={filterBy === 'has-gw2'}
        >
          Has GW2 Account
        </MenuItem>
        <MenuItem
          className="control-menu-item"
          onClick={() => filterHandler('excess-discord')}
          selected={filterBy === 'excess-discord'}
        >
          Excess Discord
        </MenuItem>
        <MenuItem
          className="control-menu-item"
          onClick={() => filterHandler('issues')}
          selected={filterBy === 'issues'}
        >
          Any issues
        </MenuItem>
        <MenuItem
          className="control-menu-item"
          onClick={() => filterHandler('warnings')}
          selected={filterBy === 'warnings'}
        >
          Any warnings
        </MenuItem>
        <MenuItem
          className="control-menu-item"
          onClick={() => filterHandler('manual-match')}
          selected={filterBy === 'manual-match'}
        >
          Manually associated
        </MenuItem>
      </Menu>
    </>
  );
};

const RefetchButton = () => {
  const queries = useQueries({
    queries: rosterQueries
  });

  const isFetching = useMemo(() => queries.some(q => q.isFetching), [queries]);

  const refetchData = useCallback(() => {
    queries.forEach(q => q.refetch());
  }, [queries]);

  return (
    <Tooltip title={isFetching ? 'Refreshing...' : 'Refresh Data'}>
      <span>
        <IconButton size="small" onClick={refetchData} className="refresh" disabled={isFetching}>
          <Refresh />
        </IconButton>
      </span>
    </Tooltip>
  );
};

export default RosterControl;
