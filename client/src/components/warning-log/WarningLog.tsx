import { Box, Checkbox, FormControlLabel } from '@mui/material';
import { useState } from 'react';
import { WarningTypeLabels, type WarningType } from 'server';
import { QueryBoundary } from '../common/query-boundary';
import DiscordLogEntry from '../discord-log/discord-log-entry';
import { LogLoader } from '../log/log-loader';
import { useWarningList } from './useWarningList';

export const WarningLog = () => {
  const [warningTypesToDisplay, setWarningTypesToDisplay] = useState<Record<WarningType, boolean>>({
    event: true,
    informal: true,
    official: true
  });

  return (
    <Box>
      <Box display="flex" justifyContent="flex-end">
        {Object.entries(warningTypesToDisplay).map(([key, value]) => (
          <FormControlLabel
            control={
              <Checkbox
                checked={value}
                onClick={() =>
                  setWarningTypesToDisplay({ ...warningTypesToDisplay, [key]: !value })
                }
              />
            }
            label={WarningTypeLabels[key as WarningType]}
            key={key}
          />
        ))}
      </Box>
      <Box sx={{ overflowX: 'hidden', overflowY: 'auto', flex: '1' }}>
        <QueryBoundary fallback={<LogLoader />}>
          <WarningList warningTypesToDisplay={warningTypesToDisplay} />
        </QueryBoundary>
      </Box>
    </Box>
  );
};

const WarningList = ({
  warningTypesToDisplay
}: {
  warningTypesToDisplay: Record<WarningType, boolean>;
}) => {
  const logEntries = useWarningList(warningTypesToDisplay);
  return logEntries.map(e => (
    <DiscordLogEntry
      date={e.date}
      key={e.id}
      displayEntry={{ summary: e.summary, details: e.details }}
    />
  ));
};
