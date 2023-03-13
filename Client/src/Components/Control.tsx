import Brightness3 from '@mui/icons-material/Brightness3';
import Brightness6 from '@mui/icons-material/Brightness6';
import { PaletteMode } from '@mui/material';
import Box from '@mui/material/Box';
import Grid from '@mui/material/Grid';
import IconButton from '@mui/material/IconButton';
import TextField from '@mui/material/TextField';
import Tooltip from '@mui/material/Tooltip';
import React from 'react';
import { useSearchParams } from 'react-router-dom';

interface Props {
  theme: PaletteMode;
  toggleTheme: () => void;
}

interface FormElements extends HTMLFormControlsCollection {
  filter: HTMLInputElement;
}

interface FilterFormElement extends HTMLFormElement {
  readonly elements: FormElements;
}

const Control = ({ theme, toggleTheme }: Props) => {
  const [searchParams, setSearchParams] = useSearchParams();
  const filterString = searchParams.get('filterString');

  const filterSubmitHandler: React.FormEventHandler<HTMLFormElement> = (
    e: React.FormEvent<FilterFormElement>
  ) => {
    e.preventDefault();
    e.stopPropagation();

    const filterStringVal = e.currentTarget.elements.filter.value;

    setSearchParams({
      ...searchParams,
      filterString: filterStringVal
    });
  };

  return (
    <Box paddingTop={1}>
      <Grid container direction="row" justifyContent="flex-start" alignItems="center" spacing={3}>
        <Grid item xs>
          <form onSubmit={filterSubmitHandler}>
            <TextField
              id="filter"
              name="filter"
              label="Filter"
              type="text"
              size="small"
              fullWidth
              defaultValue={filterString}
            />
          </form>
        </Grid>
        <Grid item>
          <Tooltip title="Change Theme">
            <IconButton onClick={() => toggleTheme()}>
              {theme === 'dark' ? <Brightness6 /> : <Brightness3 />}
            </IconButton>
          </Tooltip>
        </Grid>
      </Grid>
    </Box>
  );
};

export default Control;
