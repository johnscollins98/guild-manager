import { Box } from '@mui/system';
import { FilterMenu } from './filter-menu';
import { SortButton } from './sort-button';

export const WarningLogBar = () => {
  return (
    <Box display="flex" justifyContent="space-between">
      <SortButton />
      <FilterMenu />
    </Box>
  );
};
