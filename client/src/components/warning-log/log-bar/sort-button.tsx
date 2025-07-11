import ArrowDownward from '@mui/icons-material/ArrowDownward';
import ArrowUpward from '@mui/icons-material/ArrowUpward';
import { Button, Tooltip } from '@mui/material';
import { use } from 'react';
import { SortContext } from '../log-setting-context';

export const SortButton = () => {
  const { sortAscending, setSortAscending } = use(SortContext);

  return (
    <Tooltip title={`Click to put ${sortAscending ? 'most recent' : 'old'} entries at the top.`}>
      <Button
        onClick={() => setSortAscending(!sortAscending)}
        startIcon={sortAscending ? <ArrowUpward /> : <ArrowDownward />}
      >
        {sortAscending ? 'Oldest at the top' : 'Newest at the top'}
      </Button>
    </Tooltip>
  );
};
