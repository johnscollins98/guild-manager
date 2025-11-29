import FilterList from '@mui/icons-material/FilterList';
import {
  Checkbox,
  FormControlLabel,
  IconButton,
  MenuItem,
  Popover,
  type FormControlLabelProps
} from '@mui/material';
import { Box } from '@mui/system';
import { use, useState } from 'react';
import { WarningTypeLabels, type WarningType } from 'server';
import { FilterContext } from '../log-setting-context';

export const FilterMenu = () => {
  const [popoverAnchor, setPopoverAnchor] = useState<HTMLElement | null>(null);
  const { warningTypesToDisplay, setWarningTypesToDisplay } = use(FilterContext);

  const handleClick = (event: React.MouseEvent<HTMLElement>) => {
    setPopoverAnchor(popoverAnchor ? null : event.currentTarget);
  };

  return (
    <>
      <Box sx={{ display: { xs: 'block', sm: 'none' } }}>
        <IconButton onClick={handleClick}>
          <FilterList />
        </IconButton>
        <Popover
          open={!!popoverAnchor}
          onClose={() => setPopoverAnchor(null)}
          anchorEl={popoverAnchor}
          anchorOrigin={{ horizontal: 'left', vertical: 'bottom' }}
        >
          <Box sx={{ display: 'flex', flexDirection: 'column' }}>
            {Object.entries(warningTypesToDisplay).map(([key, value]) => (
              <MenuItem
                key={key}
                onClick={() =>
                  setWarningTypesToDisplay({ ...warningTypesToDisplay, [key]: !value })
                }
              >
                <FilterCheckbox warningkey={key} value={value} onClick={e => e.preventDefault()} />
              </MenuItem>
            ))}
          </Box>
        </Popover>
      </Box>
      <Box sx={{ display: { xs: 'none', sm: 'flex' } }}>
        {Object.entries(warningTypesToDisplay).map(([key, value]) => (
          <FilterCheckbox
            key={key}
            warningkey={key}
            value={value}
            onChange={() => setWarningTypesToDisplay({ ...warningTypesToDisplay, [key]: !value })}
          />
        ))}
      </Box>
    </>
  );
};

const FilterCheckbox = ({
  warningkey,
  value,
  onChange,
  onClick
}: {
  warningkey: string;
  value: boolean;
  onChange?: FormControlLabelProps['onChange'];
  onClick?: FormControlLabelProps['onClick'];
}) => {
  return (
    <FormControlLabel
      control={<Checkbox checked={value} />}
      value={value}
      onChange={onChange}
      onClick={onClick}
      name={warningkey}
      id={warningkey}
      label={WarningTypeLabels[warningkey as WarningType]}
    />
  );
};
