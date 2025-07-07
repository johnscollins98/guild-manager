import { Box } from '@mui/system';
import { FilterMenu } from './FilterMenu';
import { SortButton } from './SortButton';

export const WarningLogBar = () => {
  return (
    <Box display="flex" justifyContent="space-between">
      <SortButton />
      <FilterMenu />
    </Box>
  );
};
