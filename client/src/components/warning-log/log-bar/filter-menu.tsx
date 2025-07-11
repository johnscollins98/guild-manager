import FilterList from '@mui/icons-material/FilterList';
import { Checkbox, FormControlLabel, IconButton, MenuItem, Popover } from '@mui/material';
import { Box } from '@mui/system';
import { use, useRef, useState } from 'react';
import { WarningTypeLabels, type WarningType } from 'server';
import { FilterContext } from '../log-setting-context';

export const FilterMenu = () => {
  const [showPopover, setShowPopover] = useState(false);
  const buttonRef = useRef(null);
  const { warningTypesToDisplay, setWarningTypesToDisplay } = use(FilterContext);

  return (
    <>
      <IconButton onClick={() => setShowPopover(!showPopover)} ref={buttonRef}>
        <FilterList />
      </IconButton>
      <Popover
        open={showPopover}
        onClose={() => setShowPopover(false)}
        anchorEl={buttonRef.current}
        anchorOrigin={{ horizontal: 'left', vertical: 'bottom' }}
      >
        <Box sx={{ display: 'flex', flexDirection: 'column' }}>
          {Object.entries(warningTypesToDisplay).map(([key, value]) => (
            <MenuItem
              key={key}
              dense
              onClick={() => setWarningTypesToDisplay({ ...warningTypesToDisplay, [key]: !value })}
            >
              <FormControlLabel
                control={<Checkbox checked={value} />}
                value={value}
                onClick={e => e.preventDefault()}
                label={WarningTypeLabels[key as WarningType]}
              />
            </MenuItem>
          ))}
        </Box>
      </Popover>
    </>
  );
};
